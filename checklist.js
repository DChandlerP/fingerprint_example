import { createIcons, Copy, Download } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Page-Specific Checklist Logic ---
    const checklistData = {
        webApp: {
            title: "Web Application / API Security",
            items: [
                "Implement a strong Content Security Policy (CSP).",
                "Sanitize all user inputs on both client and server sides to prevent XSS.",
                "Use parameterized queries or prepared statements to prevent SQL injection.",
                "Set secure, HTTPOnly, and SameSite attributes on all session cookies.",
                "Implement security headers (e.g., HSTS, X-Frame-Options, X-Content-Type-Options).",
                "Enforce HTTPS across the entire application.",
                "Protect against Cross-Site Request Forgery (CSRF) with anti-CSRF tokens.",
                "Implement rate limiting and throttling on authentication and API endpoints.",
            ]
        },
        mobileApp: {
            title: "Mobile Application Security",
            items: [
                "Verify server certificates (certificate pinning) to prevent MITM attacks.",
                "Use secure, standard APIs for cryptography; avoid custom implementations.",
                "Store sensitive data (tokens, keys) in secure storage (e.g., Android Keystore, iOS Keychain).",
                "Implement root/jailbreak detection to protect against compromised devices.",
                "Obfuscate application code to make reverse-engineering more difficult.",
                "Request only the minimum necessary permissions.",
            ]
        },
        cloud: {
            title: "Cloud Infrastructure Security",
            items: [
                "Enforce Multi-Factor Authentication (MFA) on the root/admin account and for all privileged users.",
                "Follow the principle of least privilege for all IAM roles and policies.",
                "Implement network segmentation using VPCs, subnets, and security groups/firewall rules.",
                "Encrypt data at rest (e.g., S3, EBS, RDS) and in transit (using TLS).",
                "Enable and centralize logging (e.g., CloudTrail, CloudWatch, Azure Monitor) for all services.",
                "Regularly audit for and remediate publicly exposed resources (e.g., S3 buckets, storage accounts).",
            ]
        },
        containers: {
            title: "Containerization Security",
            items: [
                "Use minimal, trusted base images from official repositories.",
                "Regularly scan container images for vulnerabilities at build and in the registry.",
                "Run containers with non-root users.",
                "Use read-only filesystems for containers where possible.",
                "Define resource limits (CPU, memory) to prevent DoS attacks.",
                "Implement network policies in Kubernetes to restrict pod-to-pod communication.",
                "Secure the container runtime and orchestrator (e.g., Docker daemon, Kubelet).",
            ]
        },
        dev: {
            title: "Secure Development Lifecycle (SDLC)",
            items: [
                "Perform threat modeling during the design phase of new features.",
                "Integrate Static Application Security Testing (SAST) into the CI/CD pipeline.",
                "Integrate Software Composition Analysis (SCA) to find vulnerable dependencies.",
                "Implement secret scanning to prevent hardcoded credentials.",
                "Conduct peer code reviews with a focus on security.",
                "Maintain a secure coding standard and provide regular developer training."
            ]
        },
        deployment: {
            title: "Pre-Deployment",
            items: [
                "Conduct a final penetration test or dynamic application security test (DAST).",
                "Verify all production environment variables and secrets are securely managed (e.g., using a vault).",
                "Ensure logging, monitoring, and alerting are configured for production.",
                "Disable debugging features and remove non-essential services.",
                "Confirm rollback procedures are in place and have been tested."
            ]
        },
        maintenance: {
            title: "Ongoing Maintenance",
            items: [
                "Establish a patch management process for operating systems and applications.",
                "Regularly review and rotate all credentials, API keys, and certificates.",
                "Periodically review IAM policies and user access rights.",
                "Conduct regular vulnerability scans of production infrastructure.",
                "Develop and regularly test an incident response plan."
            ]
        }
    };

    const generateBtn = document.getElementById('generate-btn');
    const outputDiv = document.getElementById('checklist-output');
    const optionsDiv = document.getElementById('checklist-options');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const selectedCategories = Array.from(optionsDiv.querySelectorAll('input[type="checkbox"]:checked'))
                .map(cb => cb.dataset.category);

            if (selectedCategories.length === 0) {
                outputDiv.innerHTML = `<p class="text-center py-8 text-gray-500">Please select at least one category to generate a checklist.</p>`;
                copyBtn.classList.add('hidden');
                downloadBtn.classList.add('hidden');
                return;
            }

            let htmlOutput = '';
            selectedCategories.forEach(cat => {
                if (checklistData[cat]) {
                    htmlOutput += `<h4 class="text-lg font-semibold text-blue-300 mt-4 mb-2">${checklistData[cat].title}</h4>`;
                    htmlOutput += '<ul>';
                    checklistData[cat].items.forEach(item => {
                        htmlOutput += `<li class="checklist-item flex items-start mb-2"><span class="mr-3 text-blue-400 mt-0.5 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg></span><span>${item}</span></li>`;
                    });
                    htmlOutput += '</ul>';
                }
            });

            outputDiv.innerHTML = htmlOutput;
            copyBtn.classList.remove('hidden');
            downloadBtn.classList.remove('hidden');
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            let textToCopy = '';
            const sections = outputDiv.querySelectorAll('h4');
            sections.forEach(section => {
                textToCopy += `\n## ${section.innerText}\n\n`;
                const items = section.nextElementSibling.querySelectorAll('li');
                items.forEach(item => {
                    textToCopy += `- ${item.innerText}\n`;
                });
            });

            navigator.clipboard.writeText(textToCopy.trim())
                .then(() => {
                    copyBtn.innerHTML = '<span id="copy-icon" class="mr-1"></span>Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<span id="copy-icon" class="mr-1"></span>Copy';
                        createIcons({ icons: { 'copy-icon': Copy }, attrs: { color: "#fff", size: 16, strokeWidth: 2.5 } });
                    }, 2000);
                })
                .catch(err => console.error('Failed to copy: ', err));
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            let markdownContent = '# Custom Security Checklist\n\n';
            const sections = outputDiv.querySelectorAll('h4');
            sections.forEach(section => {
                markdownContent += `## ${section.innerText}\n\n`;
                const items = section.nextElementSibling.querySelectorAll('li');
                items.forEach(item => {
                    markdownContent += `* [ ] ${item.innerText}\n`;
                });
                markdownContent += `\n`;
            });

            const blob = new Blob([markdownContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'security-checklist.md';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Override styles for copy/download buttons
    createIcons({
        icons: { 'copy-icon': Copy, 'download-icon': Download },
        attrs: { color: "#fff", size: 16, strokeWidth: 2.5 }
    });

    // --- 3. Add Nav Dropdown Logic ---
    // Note: This logic might be redundant if main.js handles it, but keeping it for safety if checklist.js is used standalone or if main.js logic doesn't cover this specific page's needs (though it should).
    // However, main.js handles .group > button logic.
    // I will remove the redundant dropdown logic if I am sure main.js covers it.
    // main.js has the exact same logic. I'll comment it out or remove it to reduce size.
    // Actually, let's keep it but use the cleaner implementation if needed.
    // But since main.js is a module and this is a module, they run independently.
    // If main.js attaches listeners to .group > button, and this does too, we get double listeners.
    // I will remove the dropdown logic from here as it should be in main.js.
});
