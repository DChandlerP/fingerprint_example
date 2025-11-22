import os
import re
from pathlib import Path

def update_html_file(file_path):
    """
    Reads an HTML file, adds missing privacy timeline links to the navbar,
    and updates the lucide icon script if necessary.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Could not read {file_path}: {e}")
        return

    original_content = content
    
    # --- 1. Define the HTML snippets for the new links ---
    us_privacy_link = '''<a href="usprivacytimeline.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <span id="nav-privacy" class="mr-2"></span>US Privacy Timeline
                </a>'''
    eu_privacy_link = '''<a href="euprivacytimeline.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <span id="nav-eu-privacy" class="mr-2"></span>EU Privacy Timeline
                </a>'''

    # --- 2. Locate the anchor link to insert after ---
    # We will insert the new links after the "Regulation (US/EU)" link.
    anchor_link_pattern = re.compile(r'(<a href="regulation.html".*?</a>)', re.DOTALL)
    match = anchor_link_pattern.search(content)

    if not match:
        # If the anchor isn't found, we can't safely modify the nav.
        # This might happen on pages without the standard navbar.
        return

    anchor_html = match.group(1)
    modified_nav = anchor_html
    made_nav_change = False

    # --- 3. Add missing links idempotently ---
    if 'usprivacytimeline.html' not in content:
        modified_nav += '\n                ' + us_privacy_link
        made_nav_change = True
        print(f"  -> Adding US Privacy link to {file_path.name}")

    if 'euprivacytimeline.html' not in content:
        modified_nav += '\n                ' + eu_privacy_link
        made_nav_change = True
        print(f"  -> Adding EU Privacy link to {file_path.name}")

    if made_nav_change:
        content = content.replace(anchor_html, modified_nav)

    # --- 4. Update the lucide icon script ---
    lucide_script_pattern = re.compile(r"lucide\.createIcons\({([\s\S]*?)}\);", re.DOTALL)
    lucide_match = lucide_script_pattern.search(content)
    made_icon_change = False

    if lucide_match:
        lucide_script_content = lucide_match.group(1)
        modified_lucide_script = lucide_script_content

        # Check for 'nav-privacy' and add if missing
        if "'nav-privacy':" not in modified_lucide_script:
            modified_lucide_script = re.sub(r"('nav-regulation': lucide\.Gavel,)", r"\1\n                'nav-privacy': lucide.Flag,", modified_lucide_script, 1)
            made_icon_change = True
            print(f"  -> Adding 'nav-privacy' icon to {file_path.name}")

        # Check for 'nav-eu-privacy' and add if missing
        if "'nav-eu-privacy':" not in modified_lucide_script:
            # Insert after nav-privacy if it exists, otherwise after nav-regulation
            if "'nav-privacy':" in modified_lucide_script:
                 modified_lucide_script = re.sub(r"('nav-privacy': lucide\.Flag,)", r"\1\n                'nav-eu-privacy': lucide.Globe,", modified_lucide_script, 1)
            else:
                 modified_lucide_script = re.sub(r"('nav-regulation': lucide\.Gavel,)", r"\1\n                'nav-eu-privacy': lucide.Globe,", modified_lucide_script, 1)
            made_icon_change = True
            print(f"  -> Adding 'nav-eu-privacy' icon to {file_path.name}")

        if made_icon_change:
            content = content.replace(lucide_script_content, modified_lucide_script)

    # --- 5. Write changes back to the file if any were made ---
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Successfully updated {file_path.name}\n")
        except Exception as e:
            print(f"Could not write to {file_path}: {e}")

if __name__ == "__main__":
    # Get the directory where the script is located
    project_dir = Path(__file__).parent
    print(f"Scanning for HTML files in: {project_dir}\n")

    # Find all .html files in the directory
    html_files = list(project_dir.glob('*.html'))

    for file in html_files:
        print(f"Processing {file.name}...")
        update_html_file(file)

    print("Navigation update process complete.")
