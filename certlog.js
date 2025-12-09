import Chart from 'chart.js/auto';
import { createIcons, Search, Eye, AlertTriangle, Copy } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    const domainInput = document.getElementById('domain-input');
    const scanBtn = document.getElementById('scan-btn');
    const statusMsg = document.getElementById('status-message');
    const resultsArea = document.getElementById('results-area');
    const tableBody = document.getElementById('ct-table-body');
    const resetChartBtn = document.getElementById('reset-chart-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const showingCount = document.getElementById('showing-count');

    let allRecords = [];
    let filteredRecords = [];
    let currentPage = 1;
    const itemsPerPage = 15;
    let issuerChart = null;

    function setLoadingState(domain) {
        resultsArea.classList.add('hidden');
        statusMsg.classList.remove('hidden');
        statusMsg.innerHTML = `<div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mb-2"></div><p class="text-violet-300">Scanning CT logs for <strong>${domain}</strong>...</p>`;
    }

    function setErrorState(message, subtext = '') {
        statusMsg.innerHTML = `<p class="text-red-400 font-bold">${message}</p><p class="text-gray-500 text-sm">${subtext}</p>`;
    }

    function setNoResultsState(domain) {
        statusMsg.innerHTML = `<p class="text-yellow-400">No records found for ${domain}.</p>`;
    }

    function cleanIssuerName(issuer) {
        const cnMatch = issuer.match(/CN=([^,]+)/);
        return cnMatch ? cnMatch[1] : issuer;
    }

    function deduplicateRecords(data) {
        const uniqueMap = new Map();

        data.forEach(item => {
            const key = item.name_value + item.entry_timestamp;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, {
                    date: item.entry_timestamp.split('T')[0],
                    subdomain: item.name_value,
                    issuer: cleanIssuerName(item.issuer_name)
                });
            }
        });

        return Array.from(uniqueMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function updateCurlCommand(domain) {
        const cmd = `curl "https://crt.sh/?q=%.${domain}&output=json" | jq .`;
        const codeBlock = document.getElementById('curl-cmd');
        if (codeBlock) codeBlock.textContent = cmd;
    }

    async function runScan() {
        const domain = domainInput.value.trim().replace(/https?:\/\//, '').replace(/\/$/, '');
        if (!domain) return;

        updateCurlCommand(domain);
        setLoadingState(domain);

        const targetUrl = `https://crt.sh/?q=%.${domain}&output=json`;
        const proxyUrl = `https://corsproxy.io/?` + encodeURIComponent(targetUrl);

        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('crt.sh unavailable');

            const rawData = await response.json();

            if (rawData.length === 0) {
                setNoResultsState(domain);
                return;
            }

            allRecords = deduplicateRecords(rawData);
            filteredRecords = [...allRecords];

            statusMsg.classList.add('hidden');
            resultsArea.classList.remove('hidden');

            updateStats();
            renderChart();
            currentPage = 1;
            renderTable();

        } catch (error) {
            console.error(error);
            setErrorState('Scan Failed', 'crt.sh might be timed out or blocking requests.');
        }
    }

    function updateStats() {
        document.getElementById('total-certs').textContent = allRecords.length.toLocaleString();

        const uniqueSubs = new Set(allRecords.map(r => r.subdomain)).size;
        document.getElementById('unique-subs').textContent = uniqueSubs.toLocaleString();

        document.querySelector('#avg-days').previousElementSibling.textContent = "Latest Issue";
        document.getElementById('avg-days').textContent = allRecords[0]?.date || '--';
    }

    function renderChart() {
        const issuerCounts = {};
        allRecords.forEach(r => {
            issuerCounts[r.issuer] = (issuerCounts[r.issuer] || 0) + 1;
        });

        const sortedIssuers = Object.entries(issuerCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const ctx = document.getElementById('issuerChart').getContext('2d');
        if (issuerChart) issuerChart.destroy();

        Chart.defaults.color = '#9ca3af';
        Chart.defaults.borderColor = '#374151';

        issuerChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedIssuers.map(i => i[0]),
                datasets: [{
                    label: 'Certificates Issued',
                    data: sortedIssuers.map(i => i[1]),
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        filterByIssuer(sortedIssuers[index][0]);
                    }
                }
            }
        });
    }

    function filterByIssuer(issuer) {
        filteredRecords = allRecords.filter(r => r.issuer === issuer);
        resetChartBtn.textContent = `Filter: ${issuer} (X)`;
        resetChartBtn.classList.remove('hidden');
        currentPage = 1;
        renderTable();
    }

    function resetFilter() {
        filteredRecords = [...allRecords];
        resetChartBtn.classList.add('hidden');
        renderTable();
    }

    function renderTable() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filteredRecords.slice(start, end);

        if (pageData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="p-6 text-center text-gray-500">No results found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = pageData.map(r => `
            <tr class="hover:bg-gray-800 transition-colors border-b border-gray-800">
                <td class="p-4 whitespace-nowrap text-gray-400 font-mono text-xs">${r.date}</td>
                <td class="p-4 font-semibold text-violet-200 break-all">${r.subdomain}</td>
                <td class="p-4 text-gray-400 text-xs">${r.issuer}</td>
            </tr>
        `).join('');

        showingCount.textContent = `${Math.min(end, filteredRecords.length)} of ${filteredRecords.length}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = end >= filteredRecords.length;
    }

    function initialize() {
        scanBtn.addEventListener('click', runScan);
        domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') runScan();
        });

        const copyBtn = document.getElementById('copy-curl-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = document.getElementById('curl-cmd').textContent;
                navigator.clipboard.writeText(text);

                // Temp visual feedback
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span class="text-green-400 font-bold">Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    createIcons({ icons: { Copy }, nameAttr: 'data-lucide' }); // Re-init icon
                    document.getElementById('icon-copy').innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
                    createIcons({ icons: { Copy }, nameAttr: 'data-lucide' });
                }, 2000);
            });
        }

        prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
        nextBtn.addEventListener('click', () => { if ((currentPage * itemsPerPage) < filteredRecords.length) { currentPage++; renderTable(); } });
        resetChartBtn.addEventListener('click', resetFilter);

        // Icons
        const iconAlert = document.getElementById('icon-alert');
        if (iconAlert) iconAlert.innerHTML = '<i data-lucide="alert-triangle" class="w-5 h-5"></i>';

        const iconCopy = document.getElementById('icon-copy');
        if (iconCopy) iconCopy.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';

        createIcons({
            icons: { 'icon-search': Search, 'alert-triangle': AlertTriangle, 'copy': Copy },
            attrs: { class: "w-5 h-5" },
            nameAttr: 'data-lucide'
        });
    }

    initialize();
});
