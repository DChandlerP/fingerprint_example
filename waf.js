import { createIcons, Shield, Database, Code, FileCode, Terminal, Sliders, Eye, Filter, AlertTriangle, Gauge, Globe, Bot, CheckCircle, CloudLightning, BrainCircuit, ListOrdered } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {

    // --- Data: Cloud Armor / OWASP Rules ---
    const rules = [
        {
            id: 'sqli-v33-stable',
            name: 'SQL Injection (SQLi)',
            icon: 'database',
            desc: "Detects attempts to inject malicious SQL commands into database queries. This is the most critical rule set for any application with a database.",
            regex: "(?i)(union\\s+select|select\\s+.*\\s+from|insert\\s+into|update\\s+.*\\s+set|delete\\s+from|drop\\s+table|--|#|/\\*|\\*/)",
            fps: [
                "Legitimate SQL queries sent in API bodies (e.g., a BI tool).",
                "Strings containing '--' or '#' in comments or descriptions.",
                "Cookies containing base64 encoded binary data that accidentally matches a SQL pattern."
            ]
        },
        {
            id: 'xss-v33-stable',
            name: 'Cross-Site Scripting (XSS)',
            icon: 'code',
            desc: "Blocks scripts injected into web pages. It looks for HTML tags, JavaScript events, and external script loading attempts.",
            regex: "(?i)(<script>|javascript:|onload=|onerror=|<iframe>|<object>|eval\\(|alert\\(|document\\.cookie)",
            fps: [
                "CMS admins saving raw HTML/JS content.",
                "Rich text editors sending HTML markup.",
                "JSON blobs containing HTML descriptions."
            ]
        },
        {
            id: 'lfi-v33-stable',
            name: 'Local File Inclusion (LFI)',
            icon: 'file-code',
            desc: "Prevents attackers from reading internal files on the server (like /etc/passwd) by traversing directories.",
            regex: "(?i)(\\.\\./|/etc/passwd|c:\\\\windows|/proc/self|/boot.ini|\\.\\.\\\\)",
            fps: [
                "File management apps where users select paths.",
                "API parameters using '..' for legitimate non-path purposes.",
                "Base64 encoded strings that happen to decode to file paths."
            ]
        },
        {
            id: 'rce-v33-stable',
            name: 'Remote Code Execution (RCE)',
            icon: 'terminal',
            desc: "Blocks attempts to execute OS-level commands on the server (e.g., bash, powershell).",
            regex: "(?i)(/bin/sh|cmd\\.exe|powershell|wget|curl|nc\\s+-e|\\|\\s*bash|;\\s*ls\\s+-la)",
            fps: [
                "DevOps tools or web terminals.",
                "Legitimate requests containing technical documentation about shell commands.",
                "File names containing words like 'install' or 'setup' in certain contexts."
            ]
        },
        {
            id: 'protocolattack-v33-stable',
            name: 'Protocol Attack',
            icon: 'alert-triangle',
            desc: "Validates HTTP RFC compliance. Blocks HTTP Request Smuggling, Response Splitting, and malformed headers.",
            regex: "(Content-Length.*Content-Length|Transfer-Encoding.*Content-Length|[\\r\\n]+Header:)",
            fps: [
                "Legacy HTTP clients sending non-compliant headers.",
                "Custom proxies modifying headers incorrectly.",
                "High-throughput APIs using chunked encoding in unusual ways."
            ]
        }
    ];

    const selectorContainer = document.getElementById('rule-selector');
    const titleEl = document.getElementById('rule-title');
    const idEl = document.getElementById('rule-id');
    const descEl = document.getElementById('rule-desc');
    const regexEl = document.getElementById('rule-regex');
    const fpListEl = document.getElementById('rule-fp');
    const iconContainer = document.getElementById('rule-icon');

    // --- Render Selector Buttons ---
    rules.forEach((rule, index) => {
        const btn = document.createElement('button');
        btn.className = `w-full text-left px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-blue-500 transition-all flex items-center group ${index === 0 ? 'ring-2 ring-blue-500' : ''}`;
        btn.innerHTML = `
            <span class="mr-3 text-gray-400 group-hover:text-white transition-colors"><i data-lucide="${rule.icon}" class="w-5 h-5"></i></span>
            <div>
                <div class="font-bold text-gray-200 group-hover:text-white">${rule.name}</div>
                <div class="text-xs text-gray-500 font-mono">${rule.id}</div>
            </div>
        `;

        btn.addEventListener('click', () => {
            // Update active state style
            document.querySelectorAll('#rule-selector button').forEach(b => b.classList.remove('ring-2', 'ring-blue-500'));
            btn.classList.add('ring-2', 'ring-blue-500');

            // Render content
            displayRule(rule);
        });

        selectorContainer.appendChild(btn);
    });

    function displayRule(rule) {
        titleEl.textContent = rule.name;
        idEl.textContent = `evaluatePreconfiguredWaf('${rule.id}')`;
        descEl.textContent = rule.desc;
        regexEl.textContent = rule.regex;

        // Update Icon
        iconContainer.innerHTML = `<i data-lucide="${rule.icon}" class="w-8 h-8"></i>`;

        // Update False Positives
        fpListEl.innerHTML = rule.fps.map(fp => `<li>${fp}</li>`).join('');

        // Re-init icons for the new content
        createIcons({
            icons: {
                database: Database,
                code: Code,
                'file-code': FileCode,
                terminal: Terminal,
                'alert-triangle': AlertTriangle
            },
            nameAttr: 'data-lucide'
        });
    }

    // Initial Display
    displayRule(rules[0]);

    // --- Init Static Icons ---
    createIcons({
        icons: {
            sliders: Sliders,
            eye: Eye,
            filter: Filter,
            database: Database,
            code: Code,
            'file-code': FileCode,
            terminal: Terminal,
            'alert-triangle': AlertTriangle,
            // New icons for Section 3 & 4
            gauge: Gauge,
            globe: Globe,
            bot: Bot,
            'check-circle': CheckCircle,
            'cloud-lightning': CloudLightning,
            'brain-circuit': BrainCircuit,
            'list-ordered': ListOrdered
        },
        attrs: { class: "w-6 h-6" }
    });
});