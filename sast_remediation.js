document.addEventListener('DOMContentLoaded', () => {

    // --- DOM References ---
    const searchInput = document.getElementById('cwe-search');
    const noResults = document.getElementById('no-results');
    const randomBtn = document.getElementById('random-btn');
    const cardGrid = document.getElementById('cwe-card-grid');
    const detailView = document.getElementById('cwe-detail-view');
    const detailHeader = document.getElementById('cwe-detail-header');
    const detailContent = document.getElementById('cwe-detail-content');
    const backBtn = document.getElementById('back-to-grid-btn');

    let cweIndex = []; // populated from index.json
    const contentCache = {}; // cache fetched partials: { "676": "<html>..." }

    // --- 1. Load CWE Index & Render Cards ---
    fetch('/cwe/index.json')
        .then(res => res.json())
        .then(data => {
            cweIndex = data;
            renderCards(cweIndex);
            // If URL has a hash like #cwe-315, auto-open that entry
            const hash = window.location.hash.replace('#cwe-', '');
            if (hash) {
                const entry = cweIndex.find(e => e.cwe === hash);
                if (entry) openDetail(entry);
            }
        })
        .catch(err => console.error('Failed to load CWE index:', err));

    // --- 2. Render Card Grid ---
    function renderCards(entries) {
        cardGrid.innerHTML = '';
        entries.forEach(entry => {
            const card = document.createElement('button');
            card.className = 'cwe-card bg-gray-900 p-5 rounded-xl border border-gray-800 hover:border-blue-600 text-left transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/20 group flex flex-col gap-3';
            card.setAttribute('data-cwe', entry.cwe);
            card.setAttribute('data-name', entry.name);
            card.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="inline-block bg-red-900/60 text-red-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">CWE-${entry.cwe}</span>
                    <span class="inline-block bg-blue-900/40 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">${entry.owasp}</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">${entry.name}</h3>
                <span class="text-sm text-gray-500 group-hover:text-gray-300 transition-colors flex items-center mt-auto">
                    View details
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </span>
            `;
            card.addEventListener('click', () => openDetail(entry));
            cardGrid.appendChild(card);
        });
    }

    // --- 3. Open Detail View ---
    async function openDetail(entry) {
        // Update URL hash
        window.location.hash = `cwe-${entry.cwe}`;

        // Show detail, hide grid
        cardGrid.classList.add('hidden');
        noResults.classList.add('hidden');
        detailView.classList.remove('hidden');

        // Render header
        detailHeader.innerHTML = `
            <span class="inline-block bg-red-900/60 text-red-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider w-max">CWE-${entry.cwe}</span>
            <h2 class="text-3xl font-semibold text-blue-400">${entry.name}</h2>
        `;

        // Fetch & inject content (with cache)
        if (contentCache[entry.cwe]) {
            detailContent.innerHTML = contentCache[entry.cwe];
        } else {
            detailContent.innerHTML = `
                <div class="flex items-center justify-center py-20 text-gray-400">
                    <svg class="animate-spin mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Loading…
                </div>
            `;
            try {
                const res = await fetch(`/cwe/cwe-${entry.cwe}.html`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const html = await res.text();
                contentCache[entry.cwe] = html;
                detailContent.innerHTML = html;
            } catch (err) {
                console.error(`Failed to load CWE-${entry.cwe}:`, err);
                detailContent.innerHTML = `<p class="text-red-400 py-10 text-center">Failed to load content for CWE-${entry.cwe}. Please try again.</p>`;
            }
        }

        // Re-bind copy buttons for the newly injected content
        bindCopyButtons(detailContent);

        // Trigger fade-in
        detailContent.classList.remove('is-visible');
        requestAnimationFrame(() => detailContent.classList.add('is-visible'));

        // Scroll to top of detail
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- 4. Back to Grid ---
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            detailView.classList.add('hidden');
            cardGrid.classList.remove('hidden');
            window.location.hash = '';
            // Re-run filter in case search has text
            filterCards();
        });
    }

    // --- 5. Search / Filter Cards ---
    function filterCards() {
        if (!searchInput) return;
        const query = searchInput.value.trim().toLowerCase();
        const cards = cardGrid.querySelectorAll('.cwe-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const cweNum = card.getAttribute('data-cwe') || '';
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const matches = !query || cweNum.includes(query) || name.includes(query);

            card.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        });

        if (noResults) {
            noResults.classList.toggle('hidden', visibleCount > 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            // If we're in detail view, go back to grid first
            if (!detailView.classList.contains('hidden')) {
                detailView.classList.add('hidden');
                cardGrid.classList.remove('hidden');
                window.location.hash = '';
            }
            filterCards();
        });
    }

    // --- 6. Random Finding Button ---
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            // If in detail view, use full index; if in grid, use visible cards
            if (!detailView.classList.contains('hidden')) {
                // Pick from all entries
                const entry = cweIndex[Math.floor(Math.random() * cweIndex.length)];
                openDetail(entry);
            } else {
                const visibleCards = Array.from(cardGrid.querySelectorAll('.cwe-card')).filter(
                    c => c.style.display !== 'none'
                );
                if (visibleCards.length === 0) return;
                const card = visibleCards[Math.floor(Math.random() * visibleCards.length)];
                const cweNum = card.getAttribute('data-cwe');
                const entry = cweIndex.find(e => e.cwe === cweNum);
                if (entry) openDetail(entry);
            }
        });
    }

    // --- 7. Copy Button Logic ---
    function bindCopyButtons(container) {
        (container || document).querySelectorAll('.copy-btn').forEach(button => {
            // Remove existing listeners by cloning
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);

            newBtn.addEventListener('click', () => {
                const code = newBtn.nextElementSibling.innerText;
                try {
                    const textarea = document.createElement('textarea');
                    textarea.value = code;
                    textarea.style.position = 'absolute';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);

                    newBtn.textContent = 'Copied!';
                    setTimeout(() => { newBtn.textContent = 'Copy'; }, 2000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            });
        });
    }

    // --- 8. Scroll to Top Button Logic ---
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                scrollTopBtn.style.display = 'block';
                requestAnimationFrame(() => {
                    scrollTopBtn.style.transform = 'translateY(0)';
                    scrollTopBtn.style.opacity = '1';
                });
            } else {
                scrollTopBtn.style.transform = 'translateY(100px)';
                scrollTopBtn.style.opacity = '0';
                setTimeout(() => {
                    if (window.scrollY <= 200) scrollTopBtn.style.display = 'none';
                }, 300);
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 9. Handle browser back/forward with hash ---
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#cwe-', '');
        if (hash && cweIndex.length > 0) {
            const entry = cweIndex.find(e => e.cwe === hash);
            if (entry) openDetail(entry);
        } else {
            // No hash = back to grid
            detailView.classList.add('hidden');
            cardGrid.classList.remove('hidden');
            filterCards();
        }
    });
});
