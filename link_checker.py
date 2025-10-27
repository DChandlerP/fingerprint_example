#!/usr/bin/env python3
"""
link_checker.py

Scans HTML files in the directory where this script is run (or a provided directory), extracts links
with file and line number, checks if each link: renders (200), redirects (3xx), or is dead (4xx/5xx or unreachable).

Produces a timestamped report file listing dead links with the file and line where each link was found.

Usage:
    python link_checker.py [--dir PATH] [--recursive] [--workers N] [--timeout SECS] [--output FILE]

Notes and assumptions:
- By default the script checks HTTP(S) links. Non-http(s) schemes (mailto:, javascript:, tel:) are skipped
  and reported as "skipped (non-http)".
- Relative links are resolved relative to the HTML file's location. For relative/local file links the
  script checks file existence and reports missing files as dead.
- Requires the `requests` library. See `requirements.txt` in the repo.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import os
import sys
import time
from datetime import datetime
from html.parser import HTMLParser
from typing import Dict, Iterable, List, Tuple
from urllib.parse import urljoin, urlparse

import requests


class LinkExtractor(HTMLParser):
    """Extracts href/src/data-src attributes and the start line number for each tag."""

    def __init__(self) -> None:
        super().__init__()
        self.links: List[Dict] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]) -> None:
        lineno, _ = self.getpos()
        for name, value in attrs:
            if name.lower() in ("href", "src", "data-src") and value:
                self.links.append({
                    "tag": tag,
                    "attr": name,
                    "value": value,
                    "line": lineno,
                })


def find_html_files(base_dir: str, recursive: bool) -> Iterable[str]:
    if recursive:
        for root, _, files in os.walk(base_dir):
            for f in files:
                if f.lower().endswith(".html"):
                    yield os.path.join(root, f)
    else:
        for f in os.listdir(base_dir):
            if f.lower().endswith(".html") and os.path.isfile(os.path.join(base_dir, f)):
                yield os.path.join(base_dir, f)


def extract_links_from_file(path: str) -> List[Dict]:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            text = fh.read()
    except Exception as e:
        print(f"Failed to read {path}: {e}")
        return []

    parser = LinkExtractor()
    parser.feed(text)
    links = parser.links
    # annotate each link with the source file and resolved absolute info
    for l in links:
        l["file"] = path
    return links


def is_local_file_link(base_path: str, url: str) -> Tuple[bool, str]:
    # Resolve relative URLs against the containing file path
    # If url has no scheme and is a relative path, resolve to local filesystem path
    parsed = urlparse(url)
    if parsed.scheme in ("", "file"):
        # local/relative
        if parsed.path.startswith("/"):
            # absolute path on FS
            local_path = parsed.path
        else:
            local_path = os.path.normpath(os.path.join(os.path.dirname(base_path), parsed.path))
        return True, local_path
    return False, url


def check_link(session: requests.Session, link_info: Dict, timeout: float) -> Dict:
    url_raw = link_info["value"].strip()
    file_path = link_info["file"]
    line = link_info["line"]

    # Skip empty or javascript/mailto/tel links
    if not url_raw or url_raw.startswith("javascript:") or url_raw.startswith("mailto:") or url_raw.startswith("tel:"):
        return {**link_info, "result": "skipped", "reason": "non-http or empty"}

    # Protocol-relative URLs (//example.com) -> assume https
    if url_raw.startswith("//"):
        url = "https:" + url_raw
    else:
        url = url_raw

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        # maybe a relative link -> treat as local file
        is_local, resolved = is_local_file_link(file_path, url)
        if is_local:
            exists = os.path.exists(resolved)
            return {**link_info, "result": "local-file", "local_path": resolved, "exists": exists}
        else:
            return {**link_info, "result": "skipped", "reason": f"unsupported-scheme:{parsed.scheme}"}

    try:
        # Use HEAD first to save bandwidth; fall back to GET when HEAD not allowed or returns no useful info
        try:
            resp = session.head(url, allow_redirects=True, timeout=timeout)
            status = resp.status_code
            final_url = resp.url
            history = resp.history
            # Some servers reject HEAD; if 405 or 501, try GET
            if status in (405, 501):
                raise RuntimeError("HEAD not allowed")
        except Exception:
            resp = session.get(url, allow_redirects=True, timeout=timeout, stream=True)
            status = resp.status_code
            final_url = resp.url
            history = resp.history

        if status >= 400:
            return {**link_info, "result": "dead", "status": status, "final_url": final_url}
        elif history:
            codes = [r.status_code for r in history]
            return {**link_info, "result": "redirect", "status": status, "final_url": final_url, "redirects": codes}
        else:
            return {**link_info, "result": "ok", "status": status, "final_url": final_url}

    except requests.exceptions.RequestException as e:
        return {**link_info, "result": "error", "error": str(e)}


def generate_report(dead_entries: List[Dict], out_path: str) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    header = f"Link Checker report - {now}\nTotal dead/missing: {len(dead_entries)}\n\n"
    lines = [header]
    for e in dead_entries:
        file = e.get("file")
        line = e.get("line")
        val = e.get("value")
        res = e.get("result")
        extra = []
        if "status" in e:
            extra.append(f"status={e['status']}")
        if "final_url" in e:
            extra.append(f"final={e['final_url']}")
        if "error" in e:
            extra.append(f"error={e['error']}")
        if "exists" in e:
            extra.append(f"exists={e['exists']}")

        lines.append(f"{file}:{line} -> {val}  [{res}] {' '.join(extra)}\n")

    with open(out_path, "w", encoding="utf-8") as fh:
        fh.writelines(lines)

    print(f"Wrote report to {out_path}")


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check links in HTML files and report dead links.")
    parser.add_argument("--dir", "-d", default=".", help="Directory to scan (default: current directory)")
    parser.add_argument("--recursive", "-r", action="store_true", help="Scan recursively")
    parser.add_argument("--workers", "-w", type=int, default=10, help="Number of concurrent workers")
    parser.add_argument("--timeout", "-t", type=float, default=8.0, help="HTTP timeout in seconds")
    parser.add_argument("--output", "-o", default=None, help="Output report path (default: auto timestamped file)")
    args = parser.parse_args(argv)

    base_dir = args.dir
    recursive = args.recursive
    timeout = args.timeout
    workers = max(1, args.workers)

    html_files = list(find_html_files(base_dir, recursive))
    if not html_files:
        print("No HTML files found.")
        return 0

    print(f"Found {len(html_files)} HTML files. Extracting links...")

    all_links: List[Dict] = []
    for f in html_files:
        links = extract_links_from_file(f)
        all_links.extend(links)

    print(f"Extracted {len(all_links)} links. Checking HTTP(S) links with {workers} workers...")

    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=1)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    checked: List[Dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
        futures = [ex.submit(check_link, session, li, timeout) for li in all_links]
        for i, fut in enumerate(concurrent.futures.as_completed(futures), 1):
            try:
                res = fut.result()
            except Exception as e:
                # shouldn't happen, but be defensive
                res = {"result": "error", "error": f"internal: {e}"}
            checked.append(res)
            if i % 50 == 0:
                print(f"Checked {i}/{len(all_links)}...")

    # consider dead = result in (dead, error) or local-file exists==False
    dead = []
    for e in checked:
        if e.get("result") in ("dead", "error"):
            dead.append(e)
        elif e.get("result") == "local-file" and not e.get("exists", True):
            dead.append(e)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = args.output or os.path.join(base_dir, f"link_report_{timestamp}.txt")
    generate_report(dead, out_path)

    # brief console summary
    print(f"Total links: {len(all_links)}; Dead/missing: {len(dead)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
