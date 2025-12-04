import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { createIcons, RefreshCw, Download } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Page-Specific Dashboard Logic ---
    const fetchBtn = document.getElementById('fetch-btn');
    const downloadBtn = document.getElementById('download-btn');
    const loadingState = document.getElementById('loading-state');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    let vulnScatterChart = null;
    let vulnsByTypeChart = null;
    let attackVectorChart = null;
    let topVendorsChart = null;
    let cvssMetricsRadarChart = null;
    let lastApiData = null;

    const commonCweMap = {
        'CWE-20': 'Improper Input Validation',
        'CWE-22': 'Path Traversal',
        'CWE-74': 'Improper Neutralization',
        'CWE-78': 'OS Command Injection',
        'CWE-79': 'Cross-site Scripting (XSS)',
        'CWE-89': 'SQL Injection',
        'CWE-94': 'Code Injection',
        'CWE-119': 'Buffer Overflow',
        'CWE-125': 'Out-of-bounds Read',
        'CWE-200': 'Information Exposure',
        'CWE-256': 'Plaintext Password',
        'CWE-269': 'Improper Privilege',
        'CWE-284': 'Improper Access Control',
        'CWE-306': 'Missing Authentication',
        'CWE-352': 'CSRF',
        'CWE-416': 'Use After Free',
        'CWE-434': 'Unrestricted Upload',
        'CWE-502': 'Deserialization',
        'CWE-787': 'Out-of-bounds Write',
        'CWE-862': 'Missing Authorization'
    };

    const getWeaknessName = (weaknessValue) => {
        if (weaknessValue === 'N/A') return 'N/A';
        // Check if it's in our map
        if (commonCweMap[weaknessValue]) {
            return commonCweMap[weaknessValue];
        }
        // If it's not an ID (e.g., it's already a full name), return it
        if (!weaknessValue.startsWith('CWE-')) {
            return weaknessValue;
        }
        // It's a CWE-ID not in our map, just return the ID
        return weaknessValue;
    };

    const setDefaultDates = () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        endDateInput.value = endDate.toISOString().split('T')[0];
        startDateInput.value = startDate.toISOString().split('T')[0];
    };

    const downloadJsonData = () => {
        if (!lastApiData) {
            console.error("No data available to download.");
            return;
        }
        const dataStr = JSON.stringify(lastApiData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nvd_vulnerabilities_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const fetchAndDisplayData = async () => {
        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;

        if (!startDateValue || !endDateValue) {
            loadingState.textContent = 'Please select both a start and end date.';
            loadingState.className = 'text-center my-4 text-red-400';
            return;
        }
        if (new Date(startDateValue) > new Date(endDateValue)) {
            loadingState.textContent = 'Start date cannot be after the end date.';
            loadingState.className = 'text-center my-4 text-red-400';
            return;
        }

        loadingState.textContent = `Fetching vulnerabilities from ${startDateValue} to ${endDateValue}... This may take a moment.`;
        loadingState.className = 'text-center my-4 text-blue-300 animate-pulse';
        fetchBtn.disabled = true;
        downloadBtn.disabled = true;

        const allVulnerabilities = [];
        let startIndex = 0;
        const resultsPerPage = 2000;
        const maxResults = 5000;
        let totalResults = 0;
        let hasMorePages = true;

        const startDateISO = new Date(startDateValue).toISOString();
        const endDateISO = new Date(new Date(endDateValue).setUTCHours(23, 59, 59, 999)).toISOString();

        try {
            while (hasMorePages && allVulnerabilities.length < maxResults) {
                const apiUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDateISO}&pubEndDate=${endDateISO}&resultsPerPage=${resultsPerPage}&startIndex=${startIndex}`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`NVD API returned status: ${response.status}`);
                const data = await response.json();

                if (startIndex === 0) totalResults = data.totalResults;

                allVulnerabilities.push(...data.vulnerabilities);
                startIndex += resultsPerPage;

                if (startIndex >= totalResults || allVulnerabilities.length >= maxResults) {
                    hasMorePages = false;
                }
            }

            const finalVulnerabilities = allVulnerabilities.slice(0, maxResults);

            lastApiData = {
                resultsPerPage: finalVulnerabilities.length,
                startIndex: 0,
                totalResults: totalResults > maxResults ? maxResults : totalResults,
                format: "NVD_CVE",
                version: "2.0",
                timestamp: new Date().toISOString(),
                vulnerabilities: finalVulnerabilities
            };
            downloadBtn.disabled = false;

            if (finalVulnerabilities.length === 0) {
                loadingState.textContent = `No vulnerabilities found in the selected date range.`;
                loadingState.className = 'text-center my-4 text-yellow-400';
                return;
            }

            const scoredVulnerabilities = finalVulnerabilities
                .map(item => {
                    const cve = item.cve;
                    const cvssV31 = cve.metrics.cvssMetricV31?.[0];
                    // The 'type' here is the raw value from the API (e.g., "CWE-79" or "Improper Neutralization...")
                    const weakness = cve.weaknesses?.[0]?.description.find(d => d.lang === 'en')?.value || 'N/A';
                    return { id: cve.id, date: cve.published, cvss: cvssV31 ? cvssV31.cvssData.baseScore : null, type: weakness, original: item };
                })
                .filter(item => item.cvss !== null);

            const fullVulnerabilitiesForCharts = scoredVulnerabilities.map(item => item.original);

            updateDashboard(fullVulnerabilitiesForCharts, scoredVulnerabilities);

            loadingState.textContent = `Displaying ${scoredVulnerabilities.length} vulnerabilities with CVSS scores from ${finalVulnerabilities.length} total found (limit 5000).`;
            loadingState.className = 'text-center my-4 text-green-400';

        } catch (error) {
            console.error("Failed to fetch NVD data:", error);
            loadingState.textContent = 'Failed to load data. The NVD API might be busy. Please try again later.';
            loadingState.className = 'text-center my-4 text-red-400';
            lastApiData = null;
            downloadBtn.disabled = true;
        } finally {
            fetchBtn.disabled = false;
        }
    };

    const updateDashboard = (vulnerabilities, transformedData) => {
        // --- 1. DATA PROCESSING ---
        const totalVulns = transformedData.length;
        const avgCvss = totalVulns > 0 ? (transformedData.reduce((acc, v) => acc + v.cvss, 0) / totalVulns).toFixed(1) : 'N/A';

        // --- UPDATED: Use helper to get clean names for typeCounts ---
        const typeCounts = transformedData.reduce((acc, v) => {
            const weaknessName = getWeaknessName(v.type); // Use the helper here
            if (weaknessName !== 'N/A') acc[weaknessName] = (acc[weaknessName] || 0) + 1;
            return acc;
        }, {});

        const topWeakness = Object.keys(typeCounts).length > 0 ? Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b) : 'N/A';

        document.getElementById('total-vulns').textContent = totalVulns;
        document.getElementById('avg-cvss').textContent = avgCvss;
        document.getElementById('top-weakness').textContent = topWeakness; // This now uses the clean name

        const scatterData = {
            critical: transformedData.filter(v => v.cvss >= 9.0),
            high: transformedData.filter(v => v.cvss >= 7.0 && v.cvss < 9.0),
            medium: transformedData.filter(v => v.cvss >= 4.0 && v.cvss < 7.0),
            low: transformedData.filter(v => v.cvss < 4.0),
        };

        // This now uses keys from typeCounts, which are the clean names
        const sortedTypes = Object.entries(typeCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

        const attackVectorCounts = vulnerabilities.reduce((acc, { cve }) => {
            const vector = cve.metrics.cvssMetricV31?.[0]?.cvssData?.vectorString?.match(/AV:([N|A|L|P])/);
            if (vector) { acc[vector[1]] = (acc[vector[1]] || 0) + 1; }
            return acc;
        }, {});
        const attackVectorData = { 'N': 'Network', 'A': 'Adjacent', 'L': 'Local', 'P': 'Physical' };

        const vendorCounts = vulnerabilities.reduce((acc, { cve }) => {
            if (cve.configurations) {
                cve.configurations.forEach(conf => {
                    conf.nodes.forEach(node => {
                        node.cpeMatch.forEach(cpe => {
                            if (cpe.vulnerable) {
                                const vendor = cpe.criteria.split(':')[3];
                                if (vendor) acc[vendor] = (acc[vendor] || 0) + 1;
                            }
                        });
                    });
                });
            }
            return acc;
        }, {});
        const topVendors = Object.entries(vendorCounts).sort(([, a], [, b]) => b - a).slice(0, 10);

        const radarMetrics = vulnerabilities.reduce((acc, { cve }) => {
            const vector = cve.metrics.cvssMetricV31?.[0]?.cvssData?.vectorString;
            if (vector) {
                if (vector.includes('AC:L')) acc['AC:L'] = (acc['AC:L'] || 0) + 1;
                if (vector.includes('AC:H')) acc['AC:H'] = (acc['AC:H'] || 0) + 1;
                if (vector.includes('PR:N')) acc['PR:N'] = (acc['PR:N'] || 0) + 1;
                if (vector.includes('PR:L')) acc['PR:L'] = (acc['PR:L'] || 0) + 1;
                if (vector.includes('PR:H')) acc['PR:H'] = (acc['PR:H'] || 0) + 1;
                if (vector.includes('UI:N')) acc['UI:N'] = (acc['UI:N'] || 0) + 1;
                if (vector.includes('UI:R')) acc['UI:R'] = (acc['UI:R'] || 0) + 1;
            }
            return acc;
        }, {});

        // --- NEW: Process data for Top 10 Findings card ---
        const topFindings = transformedData
            .sort((a, b) => {
                if (a.cvss !== b.cvss) {
                    return b.cvss - a.cvss; // Primary sort: CVSS score descending
                }
                return new Date(b.date) - new Date(a.date); // Secondary sort: Date descending
            })
            .slice(0, 10);

        // --- REMOVED: Word cloud data processing ---

        // Pass new `topFindings` data to render function
        renderCharts({ scatterData, sortedTypes, attackVectorData, attackVectorCounts, topVendors, radarMetrics, topFindings });
    };

    const renderCharts = (chartData) => {
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.borderColor = '#374151';
        Chart.defaults.font.family = "'Inter', sans-serif";

        if (vulnScatterChart) vulnScatterChart.destroy();
        if (vulnsByTypeChart) vulnsByTypeChart.destroy();
        if (attackVectorChart) attackVectorChart.destroy();
        if (topVendorsChart) topVendorsChart.destroy();
        if (cvssMetricsRadarChart) cvssMetricsRadarChart.destroy();

        const ctxScatter = document.getElementById('vulnScatterChart').getContext('2d');
        vulnScatterChart = new Chart(ctxScatter, {
            type: 'scatter',
            data: {
                datasets: [
                    { label: 'Critical (9.0+)', data: chartData.scatterData.critical, backgroundColor: '#ef4444' },
                    { label: 'High (7.0-8.9)', data: chartData.scatterData.high, backgroundColor: '#f97316' },
                    { label: 'Medium (4.0-6.9)', data: chartData.scatterData.medium, backgroundColor: '#eab308' },
                    { label: 'Low (0.1-3.9)', data: chartData.scatterData.low, backgroundColor: '#22c55e' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, parsing: { xAxisKey: 'date', yAxisKey: 'cvss' }, scales: { x: { type: 'time', time: { unit: 'day', tooltipFormat: 'MMM dd, yyyy' }, title: { display: true, text: 'Publication Date' } }, y: { min: 0, max: 10, title: { display: true, text: 'CVSS Score' } } }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }, tooltip: { callbacks: { label: (c) => `${c.raw.id}: CVSS ${c.raw.cvss}` } } } }
        });

        const ctxType = document.getElementById('vulnsByTypeChart').getContext('2d');
        vulnsByTypeChart = new Chart(ctxType, {
            type: 'doughnut',
            // Labels are now the clean names from chartData.sortedTypes
            data: { labels: chartData.sortedTypes.map(t => t[0]), datasets: [{ data: chartData.sortedTypes.map(t => t[1]), backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'], borderColor: '#111827' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { padding: 15 } } } }
        });

        const ctxAttackVector = document.getElementById('attackVectorChart').getContext('2d');
        attackVectorChart = new Chart(ctxAttackVector, {
            type: 'pie',
            data: {
                labels: Object.keys(chartData.attackVectorCounts).map(k => chartData.attackVectorData[k]),
                datasets: [{ data: Object.values(chartData.attackVectorCounts), backgroundColor: ['#f97316', '#eab308', '#22c55e', '#3b82f6'], borderColor: '#111827' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { padding: 15 } } } }
        });

        const ctxTopVendors = document.getElementById('topVendorsChart').getContext('2d');
        topVendorsChart = new Chart(ctxTopVendors, {
            type: 'bar',
            data: {
                labels: chartData.topVendors.map(v => v[0]),
                datasets: [{ label: 'Vulnerability Count', data: chartData.topVendors.map(v => v[1]), backgroundColor: '#3b82f6' }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { beginAtZero: true } } } }
        });

        const ctxRadar = document.getElementById('cvssMetricsRadarChart').getContext('2d');
        cvssMetricsRadarChart = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['Complexity: Low', 'Complexity: High', 'Privileges: None', 'Privileges: Low', 'Privileges: High', 'User Interaction: None', 'User Interaction: Required'],
                datasets: [{
                    label: 'Frequency',
                    data: [
                        chartData.radarMetrics['AC:L'], chartData.radarMetrics['AC:H'],
                        chartData.radarMetrics['PR:N'], chartData.radarMetrics['PR:L'], chartData.radarMetrics['PR:H'],
                        chartData.radarMetrics['UI:N'], chartData.radarMetrics['UI:R']
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { pointLabels: { font: { size: 10 } }, ticks: { display: false } } } }
        });

        // --- NEW: Render Top 10 Findings List ---
        const findingsListEl = document.getElementById('top-findings-list');
        findingsListEl.innerHTML = ''; // Clear previous/default content
        if (chartData.topFindings.length > 0) {
            chartData.topFindings.forEach(cve => {
                const score = cve.cvss.toFixed(1);
                let scoreColor = 'text-green-400';
                if (score >= 9.0) scoreColor = 'text-red-500';
                else if (score >= 7.0) scoreColor = 'text-orange-500';
                else if (score >= 4.0) scoreColor = 'text-yellow-400';

                const itemHtml = `
                <li class="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
                  <div class="flex-1 min-w-0">
                    <a href="https://nvd.nist.gov/vuln/detail/${cve.id}" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-blue-300 hover:underline truncate" title="${cve.id}">
                      ${cve.id}
                    </a>
                    <p class="text-xs text-gray-400">${new Date(cve.date).toLocaleDateString()}</p>
                  </div>
                  <span class="text-lg font-bold ml-4 ${scoreColor}">${score}</span>
                </li>
              `;
                findingsListEl.innerHTML += itemHtml;
            });
        } else {
            findingsListEl.innerHTML = '<li class="text-gray-500">No findings to display.</li>';
        }
    };

    // Event Listeners (Page Specific)
    fetchBtn.addEventListener('click', fetchAndDisplayData);
    downloadBtn.addEventListener('click', downloadJsonData);

    // Initial Setup
    setDefaultDates();
    fetchAndDisplayData();

    // --- 2. Render Page Specific Icons ---
    createIcons({
        icons: {
            'refresh-icon': RefreshCw,
            'download-icon': Download
        },
        attrs: { color: "#38bdf8", size: 24, strokeWidth: 2 }
    });

    // Override color for specific button icons
    document.querySelector('#refresh-icon > svg')?.setAttribute('color', 'white');
    document.querySelector('#download-icon > svg')?.setAttribute('color', 'white');

});
