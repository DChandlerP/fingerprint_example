import { createIcons, ClipboardList, ServerCog, ScanSearch, AlertTriangle, CheckCircle, XCircle } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {

    // --- Scenarios Data ---
    const scenarios = {
        legacy: {
            id: 'legacy',
            name: "The 'Legacy' Internal App",
            manualDefaults: {
                exposure: 'internal',
                pii: 'none',
                auth: 'ldap',
                deps: 'unscanned',
                waf: 'none'
            },
            automation: {
                exposure: { val: 'external', source: 'Cloud Config', detail: 'Security Group allows 0.0.0.0/0 on Port 80.' },
                pii: { val: 'high', source: 'Data Scanner', detail: 'Found 500+ patterns matching SSN in database dump files.' },
                auth: { val: 'none', source: 'DAST Scan', detail: 'Admin endpoints accessible without session token.' },
                deps: { val: 'vuln', source: 'SCA Scanner', detail: 'Struts 2 vulnerability detected (Critical).' },
                waf: { val: 'none', source: 'Infra Scan', detail: 'Direct IP access allowed.' }
            },
            summary: "A perfect storm. The developer assumed isolation, but the app is exposed, has critical vulnerabilities, and no WAF protection."
        },
        shadow: {
            id: 'shadow',
            name: "Shadow IT Project",
            manualDefaults: {
                exposure: 'external',
                pii: 'low',
                auth: 'sso',
                deps: 'scanned',
                waf: 'none'
            },
            automation: {
                exposure: { val: 'external', source: 'DNS Monitor', detail: 'Public DNS record found.' },
                pii: { val: 'low', source: 'Data Scanner', detail: 'Email addresses found.' },
                auth: { val: 'sso', source: 'Config Check', detail: 'OIDC integration verified.' },
                deps: { val: 'scanned', source: 'Repo Scan', detail: 'Dependabot is active and clean.' },
                waf: { val: 'none', source: 'Infra Scan', detail: 'No WAF detected in front of LB.' }
            },
            summary: "Accurate assessment. The developer knew the risks (External, No WAF) and reported them honestly. Risk is moderate, but managed."
        },
        modern: {
            id: 'modern',
            name: "Modern Microservice",
            manualDefaults: {
                exposure: 'internal',
                pii: 'high',
                auth: 'mtls',
                deps: 'scanned',
                waf: 'active'
            },
            automation: {
                exposure: { val: 'internal', source: 'K8s Ingress', detail: 'Ingress restricted to cluster IP.' },
                pii: { val: 'high', source: 'Data Scanner', detail: 'Payment data detected.' },
                auth: { val: 'mtls', source: 'Service Mesh', detail: 'mTLS enforced by Istio.' },
                deps: { val: 'scanned', source: 'Container Scan', detail: 'Distroless image, no high/crit vulns.' },
                waf: { val: 'active', source: 'Cloud Armor', detail: 'Policies in blocking mode.' }
            },
            summary: "Alignment achieved. High inherent risk (PII), but mitigations (WAF, mTLS, Scanning) are verified active."
        },
        supplychain: {
            id: 'supplychain',
            name: "Supply Chain Victim",
            manualDefaults: {
                exposure: 'external',
                pii: 'none',
                auth: 'sso',
                deps: 'scanned',
                waf: 'active'
            },
            automation: {
                exposure: { val: 'external', source: 'DNS Monitor', detail: 'Publicly accessible.' },
                pii: { val: 'none', source: 'Data Scanner', detail: 'No sensitive data patterns.' },
                auth: { val: 'sso', source: 'Config Check', detail: 'OIDC verified.' },
                deps: { val: 'vuln', source: 'SCA Scanner', detail: 'Log4j (CVE-2021-44228) detected in shaded jar.' },
                waf: { val: 'active', source: 'WAF Logs', detail: 'WAF is active (but may not block 0-days).' }
            },
            summary: "The developer did everything right, but a specific dependency introduced a critical flaw. This highlights why 'Use Known Components' is a key check."
        },
        wafbypass: {
            id: 'wafbypass',
            name: "WAF Bypass Configuration",
            manualDefaults: {
                exposure: 'external',
                pii: 'high',
                auth: 'sso',
                deps: 'scanned',
                waf: 'active'
            },
            automation: {
                exposure: { val: 'external', source: 'Cloud Config', detail: 'Public IP attached to instance.' },
                pii: { val: 'high', source: 'Data Scanner', detail: 'Customer PII detected.' },
                auth: { val: 'sso', source: 'Config Check', detail: 'OIDC verified.' },
                deps: { val: 'scanned', source: 'Repo Scan', detail: 'Libraries are up to date.' },
                waf: { val: 'none', source: 'Attack Simulation', detail: 'Origin Server accepts direct connections (Bypasses Cloudflare).' }
            },
            summary: "Architecture mismatch. The developer *paid* for a WAF, but didn't restrict the origin server to only accept traffic *from* the WAF."
        }
    };

    // --- Scoring Logic ---
    const weights = {
        exposure: { internal: 10, external: 50 },
        pii: { none: 0, low: 20, high: 50 },
        auth: { mtls: 0, sso: 10, ldap: 20, none: 60 },
        deps: { scanned: 0, unscanned: 20, vuln: 60 },
        waf: { active: 0, detection: 10, none: 30 }
    };

    const maxScore = 50 + 50 + 60 + 60 + 30; // 250

    let currentScenario = scenarios.legacy;

    // --- DOM Elements ---
    const scenarioSelect = document.getElementById('scenario-select');
    const questionnaireContainer = document.getElementById('questionnaire-form');
    const telemetryContainer = document.getElementById('telemetry-feed');
    const scanOverlay = document.getElementById('scan-overlay');
    const runScanBtn = document.getElementById('run-scan-btn');
    const resultDelta = document.getElementById('result-delta');
    const deltaMessage = document.getElementById('delta-message');
    const deltaTitle = document.getElementById('delta-title');
    const deltaIconContainer = document.getElementById('delta-icon-container');
    const iconAlert = document.getElementById('icon-alert');

    // Score Elements
    const manScoreVal = document.getElementById('manual-score-val');
    const manScoreBar = document.getElementById('manual-score-bar');
    const autoScoreVal = document.getElementById('auto-score-val');
    const autoScoreBar = document.getElementById('auto-score-bar');

    // --- Render Functions ---

    function renderQuestionnaire() {
        // Updated inner HTML with 5 questions
        questionnaireContainer.innerHTML = `
            <div class="input-group">
                <label class="block text-sm font-medium text-gray-400 mb-1">Is the application internet facing?</label>
                <select id="q-exposure" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white">
                    <option value="internal">No (Internal Only)</option>
                    <option value="external">Yes (Public Internet)</option>
                </select>
            </div>
            <div class="input-group">
                <label class="block text-sm font-medium text-gray-400 mb-1">Does it store sensitive data (PII)?</label>
                <select id="q-pii" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white">
                    <option value="none">No sensitive data</option>
                    <option value="low">Low (Names, Emails)</option>
                    <option value="high">High (SSN, Credit Cards, Health)</option>
                </select>
            </div>
            <div class="input-group">
                <label class="block text-sm font-medium text-gray-400 mb-1">Authentication Mechanism</label>
                <select id="q-auth" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white">
                    <option value="sso">Modern SSO (OIDC/SAML)</option>
                    <option value="mtls">mTLS / Service Mesh</option>
                    <option value="ldap">Legacy LDAP / Basic Auth</option>
                    <option value="none">None / Anonymous</option>
                </select>
            </div>
             <div class="input-group">
                <label class="block text-sm font-medium text-gray-400 mb-1">Third-Party Dependencies</label>
                <select id="q-deps" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white">
                    <option value="scanned">Scanned & Clean</option>
                    <option value="unscanned">Unscanned / Unknown</option>
                    <option value="vuln">Known Critical Vulnerabilities</option>
                </select>
            </div>
             <div class="input-group">
                <label class="block text-sm font-medium text-gray-400 mb-1">WAF Protection</label>
                <select id="q-waf" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white">
                    <option value="active">Active Block Mode</option>
                    <option value="detection">Detection Only</option>
                    <option value="none">No WAF</option>
                </select>
            </div>
        `;

        // Update scenario selector options
        scenarioSelect.innerHTML = Object.values(scenarios).map(s =>
            `<option value="${s.id}" ${s.id === currentScenario.id ? 'selected' : ''}>${s.name}</option>`
        ).join('');

        // Set defaults based on scenario
        document.getElementById('q-exposure').value = currentScenario.manualDefaults.exposure;
        document.getElementById('q-pii').value = currentScenario.manualDefaults.pii;
        document.getElementById('q-auth').value = currentScenario.manualDefaults.auth;
        document.getElementById('q-deps').value = currentScenario.manualDefaults.deps;
        document.getElementById('q-waf').value = currentScenario.manualDefaults.waf;

        // Add listeners to update score live
        const inputs = questionnaireContainer.querySelectorAll('select');
        inputs.forEach(input => input.addEventListener('change', calculateManualScore));

        calculateManualScore();
    }

    function calculateManualScore() {
        const exp = document.getElementById('q-exposure').value;
        const pii = document.getElementById('q-pii').value;
        const auth = document.getElementById('q-auth').value;
        const deps = document.getElementById('q-deps').value;
        const waf = document.getElementById('q-waf').value;

        const score = weights.exposure[exp] + weights.pii[pii] + weights.auth[auth] + weights.deps[deps] + weights.waf[waf];

        updateScoreDisplay(manScoreVal, manScoreBar, score);
    }

    function calculateAutoScore() {
        const exp = currentScenario.automation.exposure.val;
        const pii = currentScenario.automation.pii.val;
        const auth = currentScenario.automation.auth.val;
        const deps = currentScenario.automation.deps.val;
        const waf = currentScenario.automation.waf.val;

        return weights.exposure[exp] + weights.pii[pii] + weights.auth[auth] + weights.deps[deps] + weights.waf[waf];
    }

    function updateScoreDisplay(valEl, barEl, score) {
        valEl.textContent = score;
        const pct = Math.min((score / maxScore) * 100, 100);
        barEl.style.width = `${pct}%`;

        // Color coding
        // Adjusted thresholds for new max score (250)
        // Safe: < 60, Medium: < 120, High >= 120
        barEl.className = `h-full transition-all duration-500 ${score < 60 ? 'bg-green-500' : score < 120 ? 'bg-yellow-500' : 'bg-red-500'}`;
        valEl.className = `text-3xl font-bold ${score < 60 ? 'text-green-400' : score < 120 ? 'text-yellow-400' : 'text-red-400'}`;
    }

    function runSimulation() {
        // Hide overlay
        scanOverlay.classList.add('opacity-0', 'pointer-events-none');

        telemetryContainer.innerHTML = '';

        const autoData = currentScenario.automation;
        const items = [
            { label: 'Network Exposure', ...autoData.exposure, inputId: 'q-exposure' },
            { label: 'Data Classification', ...autoData.pii, inputId: 'q-pii' },
            { label: 'Auth Configuration', ...autoData.auth, inputId: 'q-auth' },
            { label: 'Dependency Status', ...autoData.deps, inputId: 'q-deps' },
            { label: 'WAF Defense', ...autoData.waf, inputId: 'q-waf' }
        ];

        // Simulate "loading" items one by one
        items.forEach((item, index) => {
            setTimeout(() => {
                const manualVal = document.getElementById(item.inputId).value;
                const isMatch = item.val === manualVal;

                const iconColor = isMatch ? 'text-green-400' : 'text-red-400';
                const borderColor = isMatch ? 'border-gray-700' : 'border-red-900/50 bg-red-900/10';
                const icon = isMatch ? 'check-circle' : 'x-circle';

                const html = `
                    <div class="flex items-start gap-3 p-3 rounded border ${borderColor} animate-fade-in-up">
                        <div class="mt-1"><i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i></div>
                        <div>
                            <p class="text-sm font-bold text-gray-200">${item.source}</p>
                            <p class="text-xs text-gray-400">${item.detail}</p>
                            <p class="text-xs mt-1 text-gray-500">Detected: <span class="font-mono text-gray-300">${item.val.toUpperCase()}</span></p>
                        </div>
                    </div>
                `;
                telemetryContainer.insertAdjacentHTML('beforeend', html);
                createIcons({ icons: { CheckCircle, XCircle }, nameAttr: 'data-lucide', attrs: { class: "w-5 h-5 " + iconColor } });

                // If last item, show score and summary
                if (index === items.length - 1) {
                    const autoScore = calculateAutoScore();
                    updateScoreDisplay(autoScoreVal, autoScoreBar, autoScore);

                    const manualScore = parseInt(manScoreVal.textContent);
                    const diff = autoScore - manualScore;

                    resultDelta.classList.remove('hidden');

                    if (diff > 0) {
                        // Risk Gap (Underestimated) - RED
                        deltaTitle.textContent = "Risk Gap Detected";
                        deltaMessage.innerHTML = `<strong class="text-red-400">Risk Underestimated by ${diff} points.</strong><br>${currentScenario.summary}`;

                        // Styling
                        deltaIconContainer.className = "p-3 bg-red-900/30 rounded-lg border border-red-800 shrink-0";
                        iconAlert.className = "text-red-400";
                        iconAlert.innerHTML = '<i data-lucide="alert-triangle" class="w-6 h-6"></i>';

                    } else {
                        // Accurate or Overestimated - GREEN
                        const titleText = diff < 0 ? "Risk Overestimated" : "Accurate Assessment";
                        deltaTitle.textContent = titleText;

                        if (diff < 0) {
                            deltaMessage.innerHTML = `<strong class="text-green-400">Safer than expected.</strong><br>Automation proved controls are better than the developer thought.`;
                        } else {
                            deltaMessage.innerHTML = `<strong class="text-green-400">Spot on.</strong><br>Manual inputs match automated telemetry.`;
                        }

                        // Styling
                        deltaIconContainer.className = "p-3 bg-green-900/30 rounded-lg border border-green-800 shrink-0";
                        iconAlert.className = "text-green-400";
                        iconAlert.innerHTML = '<i data-lucide="check-circle" class="w-6 h-6"></i>';
                    }

                    // Re-render icons for the new content
                    createIcons({ icons: { AlertTriangle, CheckCircle }, nameAttr: 'data-lucide' });
                }
            }, index * 600); // Stagger timing
        });
    }

    function resetSimulation() {
        scanOverlay.classList.remove('opacity-0', 'pointer-events-none');
        telemetryContainer.innerHTML = '';
        resultDelta.classList.add('hidden');
        autoScoreVal.textContent = '--';
        autoScoreBar.style.width = '0%';
        renderQuestionnaire();
    }

    // --- Listeners ---
    scenarioSelect.addEventListener('change', (e) => {
        currentScenario = scenarios[e.target.value];
        resetSimulation();
    });

    runScanBtn.addEventListener('click', runSimulation);

    // --- Init ---
    renderQuestionnaire();
    createIcons({
        icons: { ClipboardList, ServerCog, ScanSearch, AlertTriangle },
        nameAttr: 'data-lucide'
    });

    // Icon overrides
    document.getElementById('icon-manual').innerHTML = '<i data-lucide="clipboard-list" class="w-6 h-6"></i>';
    document.getElementById('icon-auto').innerHTML = '<i data-lucide="server-cog" class="w-6 h-6"></i>';
    document.getElementById('icon-scan').innerHTML = '<i data-lucide="scan-search" class="w-5 h-5"></i>';
    document.getElementById('icon-alert').innerHTML = '<i data-lucide="alert-triangle" class="w-6 h-6"></i>';
    createIcons({ icons: { ClipboardList, ServerCog, ScanSearch, AlertTriangle }, nameAttr: 'data-lucide' });
});