import { createIcons, Target, ClipboardList, Scaling, GitMerge, ShieldQuestion, GitFork, Calculator } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Page-Specific Logic ---
    const threatData = {
        user: {
            name: 'User',
            threats: [
                { type: 'Spoofing', scenario: 'An attacker impersonates a legitimate user by stealing their credentials through a phishing attack.', mitigation: 'Implement Multi-Factor Authentication (MFA). Educate users on phishing.' },
                { type: 'Tampering', scenario: 'A malicious user attempts to tamper with data sent from their client, such as changing their user ID in a hidden form field.', mitigation: 'Perform all validation and authorization checks on the server-side, never trust client-side data.' },
                { type: 'Repudiation', scenario: 'A user performs a critical action (e.g., deleting data) and later claims they never did it.', mitigation: 'Implement comprehensive audit logging for all sensitive actions, including user ID, timestamp, and IP address.' },
            ]
        },
        webapp: {
            name: 'Web App',
            threats: [
                { type: 'Information Disclosure', scenario: 'An error message reveals sensitive system information, such as a database schema or internal file paths.', mitigation: 'Configure the server to show generic error messages to users and log detailed errors internally.' },
                { type: 'Denial of Service', scenario: 'An attacker floods the login endpoint with requests, overwhelming the server and preventing legitimate users from logging in.', mitigation: 'Implement rate limiting and consider a Web Application Firewall (WAF) to block malicious IPs.' },
                { type: 'Elevation of Privilege', scenario: 'A flaw in session management allows a regular user to access administrative endpoints by guessing URLs.', mitigation: 'Enforce strict, role-based access control (RBAC) on all server-side endpoints.' },
            ]
        },
        database: {
            name: 'Database',
            threats: [
                { type: 'Spoofing', scenario: 'An attacker uses stolen application credentials from a configuration file to connect to the database directly.', mitigation: 'Use a secrets management system (e.g., AWS Secrets Manager, HashiCorp Vault) instead of hardcoding credentials.' },
                { type: 'Tampering', scenario: 'A SQL Injection vulnerability allows an attacker to modify or delete records in the database.', mitigation: 'Use parameterized queries (prepared statements) for all database interactions.' },
                { type: 'Information Disclosure', scenario: 'The database is not encrypted at rest, and an attacker who gains access to the server\'s file system can read the raw data files.', mitigation: 'Enable Transparent Data Encryption (TDE) on the database server.' },
            ]
        }
    };

    const diagram = document.getElementById('diagram');
    const threatOutput = document.getElementById('threat-output');

    function displayThreats(componentId) {
        const data = threatData[componentId];
        if (!data) return;

        let html = `<h4 class="text-lg font-semibold text-blue-300 mb-3">Threats for: ${data.name}</h4>`;

        data.threats.forEach(threat => {
            html += `
                <div class="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-3">
                    <p class="font-bold text-blue-300"><span class="font-mono bg-blue-900 px-2 py-1 rounded text-sm">${threat.type[0]}</span> ${threat.type}</p>
                    <p class="mt-2 text-gray-300"><span class="font-semibold text-gray-100">Scenario:</span> ${threat.scenario}</p>
                    <p class="mt-2 text-gray-300"><span class="font-semibold text-gray-100">Mitigation:</span> ${threat.mitigation}</p>
                </div>
            `;
        });
        threatOutput.innerHTML = html;
    }

    if (diagram) {
        diagram.addEventListener('click', (e) => {
            const component = e.target.closest('.diagram-component');
            if (component) {
                displayThreats(component.id);
            }
        });
    }

    // --- 2. Render Page-Specific Icons ---
    createIcons({
        icons: {
            'stride-icon': Target,
            'pasta-icon': ClipboardList,
            'compare-icon': Scaling,
            'stride-icon2': Target,
            'pasta-icon2': ClipboardList,
            'vast-icon': GitMerge,
            'linddun-icon': ShieldQuestion,
            'attacktree-icon': GitFork,
            'dread-icon': Calculator
        },
        attrs: { color: "#38bdf8", size: 24, strokeWidth: 2 }
    });
});
