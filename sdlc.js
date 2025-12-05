/**
 * Data for the Secure SDLC stages.
 * This now features "concepts" with details for the popovers.
 */
const sdlcData = [
    {
        id: 1,
        name: '1. Training & Culture',
        description: 'Establishing a security-first mindset. Developers are trained on secure coding practices, common vulnerabilities (like OWASP Top 10), and the specific security goals of the organization.',
        color: 'border-blue-500',
        bgColor: 'bg-blue-500',
        concepts: [
            {
                id: 'c1_1',
                name: 'OWASP Top 10',
                details: 'A critical resource listing the 10 most critical web application security risks. Understanding these is fundamental for all developers.'
            },
            {
                id: 'c1_2',
                name: 'Security Training',
                details: 'Interactive platforms and workshops used to train developers on secure coding practices.<br><br><strong>Examples:</strong><ul><li>Snyk Learn</li><li>Secure Code Warrior</li><li>Company Workshops</li></ul>'
            }
        ]
    },
    {
        id: 2,
        name: '2. Requirements & Design',
        description: 'Proactively planning for security. This involves creating security requirements, abuse cases, and performing threat modeling to identify and mitigate potential design flaws before code is written.',
        color: 'border-indigo-500',
        bgColor: 'bg-indigo-500',
        concepts: [
            {
                id: 'c2_1',
                name: 'Threat Modeling',
                details: 'A structured process to identify, quantify, and address potential security threats in a system\'s design.<br><br><strong>Common Models:</strong><ul><li>STRIDE</li><li>PASTA</li><li>DREAD</li></ul><strong>Tools:</strong><ul><li>OWASP Threat Dragon</li><li>Microsoft Threat Modeling Tool</li></ul>'
            },
            {
                id: 'c2_2',
                name: 'Security Requirements',
                details: 'Defining specific, testable security functional (e.g., "must use 2FA") and non-functional (e.g., "must withstand X requests/sec") requirements.'
            }
        ]
    },
    {
        id: 3,
        name: '3. Code',
        description: 'Writing secure code and catching bugs early. Developers use IDE plugins and pre-commit hooks to get real-time feedback on vulnerabilities and code quality issues as they type.',
        color: 'border-purple-500',
        bgColor: 'bg-purple-500',
        concepts: [
            {
                id: 'c3_1',
                name: 'IDE Security Plugins',
                details: 'Real-time feedback inside your editor. These plugins scan code as you write it to find vulnerabilities before they are even committed.<br><br><strong>Examples:</strong><ul><li>Snyk (IDE Plugin)</li><li>SonarLint</li></ul>'
            },
            {
                id: 'c3_2',
                name: 'Linters (Security)',
                details: 'Automated tools that analyze source code to enforce coding standards. Can be configured with security-specific rules to catch common programming errors that lead to vulnerabilities.<br><br><strong>Examples:</strong><ul><li>ESLint (with security rules)</li><li>Semgrep</li></ul>'
            },
            {
                id: 'c3_3',
                name: 'Pre-Commit Hooks',
                details: 'Automated scripts that run before code is committed. They can be used to scan for hardcoded secrets (API keys, passwords).<br><br><strong>Examples:</strong><ul><li>Git-secrets</li><li>Talisman</li></ul>'
            }
        ]
    },
    {
        id: 4,
        name: '4. Build (CI)',
        description: 'Automating security checks in the CI pipeline. When code is committed, the build server triggers Static Analysis (SAST) and Software Composition Analysis (SCA) to find bugs in the new code and vulnerabilities in third-party libraries.',
        color: 'border-green-500',
        bgColor: 'bg-green-500',
        concepts: [
            {
                id: 'c4_1',
                name: 'Static Analysis (SAST)',
                details: 'Analyzes the application\'s source code "at rest" during the build process to find in-depth security vulnerabilities, data flow issues, and weaknesses.<br><br><strong>Examples:</strong><ul><li>SonarQube</li><li>Checkmarx</li><li>Snyk Code</li><li>GitHub Advanced Security</li></ul>'
            },
            {
                id: 'c4_2',
                name: 'Composition Analysis (SCA)',
                details: 'Scans your project\'s dependencies (e.g., npm, Maven) to find known vulnerabilities (CVEs) in third-party libraries. Also helps manage open-source licenses.<br><br><strong>Examples:</strong><ul><li>OWASP Dependency-Check</li><li>Snyk Open Source</li><li>Dependabot</li></ul>'
            }
        ]
    },
    {
        id: 5,
        name: '5. Test (QA)',
        description: 'Verifying the running application. This stage involves Dynamic Analysis (DAST) which attacks the application like a hacker would. It also includes container scanning and, in mature orgs, fuzz testing.',
        color: 'border-yellow-500',
        bgColor: 'bg-yellow-500',
        concepts: [
            {
                id: 'c5_1',
                name: 'Dynamic Analysis (DAST)',
                details: 'Tests the *running* application by sending automated, malicious-looking requests to find vulnerabilities like XSS, SQL Injection, etc. It simulates an external attacker.<br><br><strong>Examples:</strong><ul><li>OWASP ZAP</li><li>Burp Suite (Automated Scan)</li></ul>'
            },
            {
                id: 'c5_2',
                name: 'Container Scanning',
                details: 'Analyzes container images (e.g., Docker) to find known vulnerabilities in the base image, operating system packages, and other installed software.<br><br><strong>Examples:</strong><ul><li>Aqua Trivy</li><li>Clair</li><li>Snyk Container</li></ul>'
            },
            {
                id: 'c5_3',
                name: 'Fuzz Testing',
                details: 'An advanced testing technique that provides invalid, unexpected, or random data as input to an application to find crashes and security loopholes.'
            }
        ]
    },
    {
        id: 6,
        name: '6. Deploy (CD)',
        description: 'Securing the release and infrastructure. This includes managing secrets (no hardcoded passwords!), scanning Infrastructure as Code (IaC) templates, and signing artifacts to ensure their integrity.',
        color: 'border-orange-500',
        bgColor: 'bg-orange-500',
        concepts: [
            {
                id: 'c6_1',
                name: 'Secret Management',
                details: 'Securely storing and managing sensitive information like API keys, database passwords, and certificates, instead of hardcoding them in code.<br><br><strong>Examples:</strong><ul><li>HashiCorp Vault</li><li>AWS Secrets Manager</li><li>Azure Key Vault</li></ul>'
            },
            {
                id: 'c6_2',
                name: 'IaC Security Scanning',
                details: 'Analyzes Infrastructure as Code (IaC) templates to find misconfigurations (e.g., public S3 buckets, open security groups) before they are deployed.<br><br><strong>Tools:</strong><ul><li>Checkov</li><li>Tfsec</li></ul><strong>Platforms:</strong><ul><li>Terraform</li><li>Pulumi</li><li>Ansible</li></ul>'
            },
            {
                id: 'c6_3',
                name: 'Artifact Signing',
                details: 'Creating a cryptographic signature for a build artifact (like a container image or binary) to prove its integrity and verify its origin. Helps prevent supply chain attacks.<br><br><strong>Tools:</strong><ul><li>Sigstore</li><li>Cosign</li></ul>'
            }
        ]
    },
    {
        id: 7,
        name: '7. Monitor & Respond',
        description: 'Actively defending the production environment. This involves real-time monitoring, logging, and alerts. Includes Web Application Firewalls (WAF), runtime protection, and SIEMs to respond to threats.',
        color: 'border-red-500',
        bgColor: 'bg-red-500',
        concepts: [
            {
                id: 'c7_1',
                name: 'Runtime Security',
                details: 'Detects and blocks threats in real-time as they happen in production. This includes container runtime security and application-level protection.<br><br><strong>Examples:</strong><ul><li>Falco</li><li>Sysdig Secure</li></ul>'
            },
            {
                id: 'c7_2',
                name: 'SIEM & Observability',
                details: 'Security Information and Event Management (SIEM) tools aggregate logs from all over the infrastructure to find patterns, alert on anomalies, and aid in incident response.<br><br><strong>Examples:</strong><ul><li>Splunk</li><li>Datadog</li><li>Elastic SIEM</li></ul>'
            },
            {
                id: 'c7_3',
                name: 'Web Application Firewall (WAF)',
                details: 'A network-level firewall that sits in front of web applications to filter and block malicious HTTP traffic, such as SQL injection and XSS attacks.<br><br><strong>Examples:</strong><ul><li>AWS WAF</li><li>Cloudflare WAF</li><li>NGINX App Protect</li></ul>'
            },
            {
                id: 'c7_4',
                name: 'Cloud Security (CSPM)',
                details: 'Cloud Security Posture Management (CSPM) tools continuously monitor cloud environments (AWS, GCP, Azure) for misconfigurations and compliance violations.<br><br><strong>Examples:</strong><ul><li>Prisma Cloud</li><li>Wiz</li></ul>'
            }
        ]
    },
    {
        id: 8, // This is our new loop card
        name: 'A Continuous Loop',
        description: 'DevSecOps isn\'t a linear process. The "Monitor & Respond" stage provides critical, real-time feedback that informs and improves every other stage, starting a new, more secure cycle. Findings from production are fed back into "Training" and "Requirements" to build a stronger security culture.',
        color: 'border-cyan-500',
        bgColor: 'bg-cyan-500',
        isLoopCard: true, // A flag to render this one differently
        concepts: [] // No concepts for this one
    }
];

// Global variable to track the currently open popover
let currentPopover = null;

/**
 * Renders all the SDLC stage cards on page load.
 */
function renderCards() {
    const container = document.getElementById('infographic-container');
    if (!container) return;

    // Clear any existing content
    container.innerHTML = `
        <div class="absolute left-1/2 -translate-x-1/2 w-1 bg-gray-700 h-full hidden md:block" aria-hidden="true"></div>
    `;

    for (const stage of sdlcData) {
        // Check if it's the special loop card
        if (stage.isLoopCard) {
            const loopCardHtml = `
            <div class="bg-gray-800 rounded-xl shadow-2xl overflow-hidden w-full mx-auto relative border-t-4 ${stage.color}">
                <div class="p-6 text-center">
                    <div class="flex items-center justify-center mb-4">
                        <!-- Loop/Refresh Icon SVG -->
                        <svg class="flex-shrink-0 w-10 h-10 text-cyan-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <h2 class="text-2xl md:text-3xl font-bold text-white">${stage.name}</h2>
                    </div>
                    <p class="text-gray-300 text-base md:text-lg">
                        ${stage.description}
                    </p>
                </div>
            </div>
            `;
            container.insertAdjacentHTML('beforeend', loopCardHtml);
        } else {
            // Render the normal card
            // Create concept buttons HTML
            const conceptsHtml = stage.concepts.map(concept => `
                <button 
                    class="concept-button inline-block bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-colors"
                    data-stage-id="${stage.id}"
                    data-concept-id="${concept.id}"
                >
                    ${concept.name}
                </button>
            `).join('');

            // Create the full card HTML
            const cardHtml = `
                <div class="bg-gray-800 rounded-xl shadow-2xl overflow-hidden w-full mx-auto relative border-t-4 ${stage.color}">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <span class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${stage.bgColor}">
                                ${stage.id}
                            </span>
                            <h2 class="text-2xl md:text-3xl font-bold text-white">${stage.name}</h2>
                        </div>
                        <p class="text-gray-300 mb-6 text-base md:text-lg">
                            ${stage.description}
                        </p>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-100 mb-3">Key Concepts:</h3>
                            <div class="flex flex-wrap gap-2">
                                ${conceptsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            // Add the new card to the container
            container.insertAdjacentHTML('beforeend', cardHtml);
        }
    }
}

/**
 * Creates and displays a popover for a clicked concept button.
 */
function showPopover(button) {
    // Get data from the button's attributes
    const stageId = parseInt(button.dataset.stageId);
    const conceptId = button.dataset.conceptId;

    // Find the corresponding data
    const stage = sdlcData.find(s => s.id === stageId);
    if (!stage) return;
    const concept = stage.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    // Create the popover element
    const popover = document.createElement('div');
    popover.className = 'concept-popover absolute z-10 w-72 p-4 bg-gray-700 text-gray-200 rounded-lg shadow-xl border border-gray-600';
    popover.dataset.popoverId = concept.id; // For tracking

    popover.innerHTML = `
        <h4 class="font-bold text-lg mb-2 text-white">${concept.name}</h4>
        <div class="text-sm space-y-2 popover-content">${concept.details}</div>
        <button class="popover-close absolute top-2 right-2 p-1 text-gray-400 hover:text-white" aria-label="Close">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        </button>
    `;

    // Position the popover
    const rect = button.getBoundingClientRect();
    document.body.appendChild(popover);

    // Set initial position
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.top = `${rect.bottom + window.scrollY + 8}px`; // 8px below the button

    // Adjust position if it's off-screen
    const popoverRect = popover.getBoundingClientRect();
    if (popoverRect.right > window.innerWidth - 16) { // 16px padding
        popover.style.left = 'auto';
        popover.style.right = '1rem';
    }
    if (popoverRect.left < 16) {
        popover.style.left = '1rem';
    }

    // Set this as the currently open popover
    currentPopover = popover;

    // Add listener for its close button
    popover.querySelector('.popover-close').addEventListener('click', () => {
        closeCurrentPopover();
    });
}

/**
 * Closes the currently open popover, if one exists.
 */
function closeCurrentPopover() {
    if (currentPopover) {
        currentPopover.remove();
        currentPopover = null;
    }
}

// --- Main Event Listener ---

// Listen for clicks on the entire document
document.addEventListener('click', (event) => {
    const target = event.target;

    // Check if the click was on a concept button
    const conceptButton = target.closest('.concept-button');
    // Check if the click was inside the popover
    const isPopoverClick = target.closest('.concept-popover');

    // 1. If click is inside a popover, do nothing
    // This allows selecting text or clicking links inside
    if (isPopoverClick) {
        return;
    }

    // 2. If click is on a concept button
    if (conceptButton) {
        // If a popover is open...
        if (currentPopover) {
            const popoverId = currentPopover.dataset.popoverId;
            // ...and it's for a *different* button, close the old one
            if (popoverId !== conceptButton.dataset.conceptId) {
                closeCurrentPopover();
                showPopover(conceptButton); // and show the new one
            } else {
                // ...and it's for the *same* button, just close it
                closeCurrentPopover();
            }
        } else {
            // If no popover is open, just show one
            showPopover(conceptButton);
        }
        return;
    }

    // 3. If click is anywhere else (and not a button or popover)
    // Close any open popover
    closeCurrentPopover();
});

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', renderCards);
