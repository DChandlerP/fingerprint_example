import Chart from 'chart.js/auto';
import { createIcons, ShieldAlert, CalendarDays, Target, Search, ExternalLink } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const CISA_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
    const PROXY_URL = 'kev_data.json';
    const CACHE_KEY = 'cisa_kev_data_v2'; // Bumped version to invalidate old cache
    const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 Hours

    const tableBody = document.getElementById('kev-table-body');
    const searchInput = document.getElementById('search-input');
    const resetBtn = document.getElementById('reset-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const showingCountEl = document.getElementById('showing-count');

    let allVulns = [];
    let filteredVulns = [];
    let currentPage = 1;
    const itemsPerPage = 15;

    // Charts
    let vendorChartInstance = null;
    let cweChartInstance = null;

    // --- Fetch Data (With Caching) ---
    async function fetchData() {
        const now = new Date().getTime();
        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
            try {
                const { timestamp, data } = JSON.parse(cached);
                if (now - timestamp < CACHE_DURATION) {
                    console.log('Serving from cache');
                    processData(data);
                    return;
                }
            } catch (e) {
                console.warn('Cache corrupted, fetching fresh');
            }
        }

        console.log('Fetching fresh data');
        try {
            const response = await fetch(PROXY_URL);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: now,
                data: data
            }));

            processData(data);
        } catch (error) {
            console.error('Fetch error:', error);
            if (cached) {
                console.warn('Network failed, serving expired cache');
                const { data } = JSON.parse(cached);
                processData(data);
            } else {
                renderError();
            }
        }
    }

    function processData(data) {
        allVulns = data.vulnerabilities;
        console.log('Sample Data (First Item):', allVulns[0]); // Debug logging

        allVulns.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        filteredVulns = [...allVulns];

        updateStats(data);
        initCharts();
        renderTable();
    }

    function renderError() {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="p-8 text-center text-red-400">
                    <p class="font-bold text-lg mb-2">Error loading data</p>
                    <p class="text-sm">Could not fetch the CISA catalog. Please try again later.</p>
                </td>
            </tr>
        `;
    }

    // --- Stats Logic ---
    function updateStats(data) {
        document.getElementById('total-count').textContent = data.count;
        document.getElementById('last-updated').textContent = `Catalog Last Updated: ${new Date(data.dateReleased).toLocaleDateString()}`;

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const newCount = allVulns.filter(v => {
            const d = new Date(v.dateAdded);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;
        document.getElementById('new-count').textContent = newCount;

        const vendorCounts = allVulns.reduce((acc, v) => {
            acc[v.vendorProject] = (acc[v.vendorProject] || 0) + 1;
            return acc;
        }, {});

        const topVendor = Object.keys(vendorCounts).reduce((a, b) => vendorCounts[a] > vendorCounts[b] ? a : b);
        document.getElementById('top-vendor').textContent = topVendor;
    }

    // --- Chart Logic ---
    function initCharts() {
        // 1. Process Top Vendors
        const vendorCounts = allVulns.reduce((acc, v) => {
            acc[v.vendorProject] = (acc[v.vendorProject] || 0) + 1;
            return acc;
        }, {});

        const topVendors = Object.entries(vendorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        // 2. Process Top CWEs (Excluding Unknown/N/A)
        const cweCounts = allVulns.reduce((acc, v) => {
            if (v.cwes && Array.isArray(v.cwes) && v.cwes.length > 0) {
                v.cwes.forEach(cwe => {
                    if (cwe && cwe !== "N/A" && cwe !== "Unknown") {
                        acc[cwe] = (acc[cwe] || 0) + 1;
                    }
                });
            }
            return acc;
        }, {});

        const topCwes = Object.entries(cweCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        // Global Chart Defaults
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.borderColor = '#374151';
        Chart.defaults.font.family = "'Inter', sans-serif";

        // Render Vendor Chart
        const ctxVendor = document.getElementById('vendorChart').getContext('2d');
        if (vendorChartInstance) vendorChartInstance.destroy();

        vendorChartInstance = new Chart(ctxVendor, {
            type: 'bar',
            data: {
                labels: topVendors.map(v => v[0]),
                datasets: [{
                    label: 'Vulnerabilities',
                    data: topVendors.map(v => v[1]),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    title: { display: true, text: 'Top 10 Affected Vendors', color: 'white', font: { size: 16 } },
                    legend: { display: false }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const vendorName = topVendors[index][0];
                        applyFilter(vendorName, 'vendor');
                    }
                }
            }
        });

        // Render CWE Chart
        const ctxCwe = document.getElementById('cweChart').getContext('2d');
        if (cweChartInstance) cweChartInstance.destroy();

        cweChartInstance = new Chart(ctxCwe, {
            type: 'bar',
            data: {
                labels: topCwes.map(v => v[0]),
                datasets: [{
                    label: 'Count',
                    data: topCwes.map(v => v[1]),
                    backgroundColor: '#ef4444',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Top 10 Weaknesses (CWE)', color: 'white', font: { size: 16 } },
                    legend: { display: false }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const cweId = topCwes[index][0];
                        applyFilter(cweId, 'cwe');
                    }
                }
            }
        });
    }

    // --- Interaction Logic ---

    function applyFilter(value, type) {
        searchInput.value = value;
        resetBtn.classList.remove('hidden');

        if (type === 'vendor') {
            filteredVulns = allVulns.filter(v => v.vendorProject === value);
        } else if (type === 'cwe') {
            filteredVulns = allVulns.filter(v => v.cwes && v.cwes.includes(value));
        }

        currentPage = 1;
        renderTable();
        document.getElementById('search-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function resetFilters() {
        searchInput.value = '';
        resetBtn.classList.add('hidden');
        filteredVulns = [...allVulns];
        currentPage = 1;
        renderTable();
    }

    // --- Render Table ---
    function renderTable() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filteredVulns.slice(start, end);

        if (pageData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">No results found.</td></tr>`;
            showingCountEl.textContent = '0';
            return;
        }

        tableBody.innerHTML = pageData.map(v => {
            const isRansomware = v.knownRansomwareCampaignUse === 'Known';
            const alertClass = isRansomware ? 'border-l-2 border-red-500 bg-red-900/10' : '';

            // Format CWEs for display with MITRE Links
            let cweDisplay = '';
            // Robust check: Ensure array, or handle single string if API structure differs
            let cwes = v.cwes;
            if (cwes && !Array.isArray(cwes)) cwes = [cwes]; // normalize to array if it's a string

            if (cwes && cwes.length > 0) {
                cweDisplay = cwes.map(cwe => {
                    const cweStr = String(cwe); // Ensure string
                    return `<span class="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded mr-1 mb-1 border border-gray-600">${cweStr}</span>`;
                }).join('');
            } else {
                cweDisplay = `<span class="text-xs text-gray-500 italic">No CWE Linked</span>`;
            }

            return `
            <tr class="hover:bg-gray-800 transition-colors ${alertClass}">
                <td class="p-4 border-b border-gray-800 whitespace-nowrap text-gray-400 font-mono text-xs">
                    ${v.dateAdded}
                </td>
                <td class="p-4 border-b border-gray-800">
                    <a href="https://nvd.nist.gov/vuln/detail/${v.cveID}" target="_blank" class="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                        ${v.cveID} 
                        <i data-lucide="external-link" class="w-3 h-3"></i>
                    </a>
                </td>
                <td class="p-4 border-b border-gray-800">
                    <div class="font-semibold text-white">${v.vendorProject}</div>
                    <div class="text-xs text-gray-400">${v.product}</div>
                </td>
                <td class="p-4 border-b border-gray-800 text-gray-300 leading-relaxed">
                    <div class="font-medium mb-1 text-gray-200">${v.vulnerabilityName}</div>
                    <div class="text-xs text-gray-400 line-clamp-2 mb-2" title="${v.shortDescription}">${v.shortDescription}</div>
                    <div>${cweDisplay}</div>
                </td>
                <td class="p-4 border-b border-gray-800 text-xs">
                    <div class="font-mono text-orange-300 mb-1">Due: ${v.dueDate}</div>
                    <div class="text-gray-400 text-[10px] uppercase tracking-wide">${v.requiredAction}</div>
                </td>
            </tr>
        `}).join('');

        showingCountEl.textContent = `${start + 1}-${Math.min(end, filteredVulns.length)} of ${filteredVulns.length}`;

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = end >= filteredVulns.length;

        createIcons({
            icons: { 'external-link': ExternalLink },
            nameAttr: 'data-lucide',
            attrs: { class: "w-3 h-3" }
        });
    }

    // --- Event Listeners ---

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (term === '') {
            resetBtn.classList.add('hidden');
        } else {
            resetBtn.classList.remove('hidden');
        }

        filteredVulns = allVulns.filter(v =>
            v.cveID.toLowerCase().includes(term) ||
            v.vendorProject.toLowerCase().includes(term) ||
            v.product.toLowerCase().includes(term) ||
            v.vulnerabilityName.toLowerCase().includes(term) ||
            (v.cwes && v.cwes.some(c => c.toLowerCase().includes(term)))
        );
        currentPage = 1;
        renderTable();
    });

    resetBtn.addEventListener('click', resetFilters);

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn.addEventListener('click', () => {
        if ((currentPage * itemsPerPage) < filteredVulns.length) {
            currentPage++;
            renderTable();
        }
    });

    // Initialize
    fetchData();

    // Static Icons
    createIcons({
        icons: {
            'icon-alert': ShieldAlert,
            'icon-calendar': CalendarDays,
            'icon-target': Target,
            'icon-search': Search
        },
        attrs: { class: "w-6 h-6" }
    });
});
