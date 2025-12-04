import FingerprintJS from '@fingerprintjs/fingerprintjs';
import * as lucide from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    const fpLoading = document.getElementById('fp-loading');
    const fpResult = document.getElementById('fp-result');
    const fpIdDisplay = document.getElementById('fp-id');
    const fpGrid = document.getElementById('fp-grid');
    const reloadBtn = document.getElementById('reload-fp');
    const copyBtn = document.getElementById('copy-id');

    // Helper to create a card
    const createCard = (title, value, iconName, colorClass = 'text-blue-400') => {
        const card = document.createElement('div');
        card.className = 'bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-md hover:border-blue-500/50 transition duration-300 flex items-start space-x-4';

        card.innerHTML = `
      <div class="p-3 bg-gray-900 rounded-lg border border-gray-700 shrink-0">
        <i data-lucide="${iconName}" class="w-6 h-6 ${colorClass}"></i>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">${title}</p>
        <p class="text-lg font-semibold text-white truncate" title="${value}">${value}</p>
      </div>
    `;
        return card;
    };

    const getFingerprint = async () => {
        try {
            fpLoading.classList.remove('hidden');
            fpResult.classList.add('hidden');
            fpGrid.innerHTML = ''; // Clear previous results

            const fp = await FingerprintJS.load();
            const result = await fp.get();
            const components = result.components;

            // Display Visitor ID
            fpIdDisplay.textContent = result.visitorId;

            // Extract and Format Data
            const dataPoints = [
                {
                    title: 'Operating System',
                    value: components.platform?.value || 'Unknown',
                    icon: 'monitor',
                    color: 'text-blue-400'
                },
                {
                    title: 'Browser Engine',
                    value: components.vendor?.value || 'Unknown', // Often gives vendor like "Google Inc."
                    icon: 'globe',
                    color: 'text-green-400'
                },
                {
                    title: 'Screen Resolution',
                    value: components.screenResolution?.value ? `${components.screenResolution.value[0]} x ${components.screenResolution.value[1]}` : 'Unknown',
                    icon: 'maximize',
                    color: 'text-purple-400'
                },
                {
                    title: 'Timezone',
                    value: components.timezone?.value || 'Unknown',
                    icon: 'clock',
                    color: 'text-orange-400'
                },
                {
                    title: 'Language',
                    value: components.languages?.value?.[0]?.[0] || 'Unknown', // First language
                    icon: 'languages',
                    color: 'text-pink-400'
                },
                {
                    title: 'CPU Cores',
                    value: components.hardwareConcurrency?.value || 'Unknown',
                    icon: 'cpu',
                    color: 'text-red-400'
                },
                {
                    title: 'Device Memory',
                    value: components.deviceMemory?.value ? `${components.deviceMemory.value} GB` : 'Unknown',
                    icon: 'hard-drive',
                    color: 'text-cyan-400'
                },
                {
                    title: 'Color Depth',
                    value: components.colorDepth?.value ? `${components.colorDepth.value}-bit` : 'Unknown',
                    icon: 'palette',
                    color: 'text-yellow-400'
                },
                {
                    title: 'Canvas Hash',
                    // Canvas component is an object with geometry/text. We just show a hash or "Unique" status.
                    // For aesthetic purposes, we'll show a truncated hash of the value if possible, or just "Present"
                    value: 'Unique Signature Generated',
                    icon: 'image',
                    color: 'text-indigo-400'
                }
            ];

            // Render Cards
            dataPoints.forEach(point => {
                fpGrid.appendChild(createCard(point.title, point.value, point.icon, point.color));
            });

            // Re-initialize icons for the new elements
            lucide.createIcons({
                icons: lucide.icons,
                nameAttr: 'data-lucide',
                attrs: {
                    class: "w-6 h-6"
                }
            });

            fpLoading.classList.add('hidden');
            fpResult.classList.remove('hidden');

        } catch (error) {
            console.error('Error getting fingerprint:', error);
            fpLoading.innerHTML = '<span class="text-red-400">Error loading fingerprint. Check console.</span>';
        }
    };

    // Initial load
    getFingerprint();

    // Reload button
    if (reloadBtn) {
        reloadBtn.addEventListener('click', getFingerprint);
    }

    // Copy ID button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(fpIdDisplay.textContent).then(() => {
                // Visual feedback handled by CSS/Icon change could be added here
                // For now, simple alert or console log, or just rely on user knowing it copied
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-green-400"></i>';
                lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                    lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
                }, 2000);
            });
        });
    }
});
