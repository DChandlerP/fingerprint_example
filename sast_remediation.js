document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Search / Filter Logic ---
    const searchInput = document.getElementById('cwe-search');
    const cweEntries = document.querySelectorAll('.cwe-entry');
    const noResults = document.getElementById('no-results');

    const filterEntries = () => {
        if (!searchInput) return;
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        cweEntries.forEach(entry => {
            const cweNum = entry.getAttribute('data-cwe') || '';
            const name = (entry.getAttribute('data-name') || '').toLowerCase();
            const matches = !query || cweNum.includes(query) || name.includes(query);

            entry.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        });

        if (noResults) {
            noResults.classList.toggle('hidden', visibleCount > 0);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', filterEntries);
    }

    // --- 2. Random Finding Button ---
    const randomBtn = document.getElementById('random-btn');
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const visibleEntries = Array.from(cweEntries).filter(
                e => e.style.display !== 'none'
            );
            if (visibleEntries.length === 0) return;

            const randomEntry = visibleEntries[Math.floor(Math.random() * visibleEntries.length)];
            randomEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Brief highlight effect
            randomEntry.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-gray-950', 'rounded-xl');
            setTimeout(() => {
                randomEntry.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-gray-950', 'rounded-xl');
            }, 2000);
        });
    }

    // --- 3. Scroll to Top Button Logic ---
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

    // --- 4. Copy Button Logic ---
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const code = button.nextElementSibling.innerText;
            try {
                const textarea = document.createElement('textarea');
                textarea.value = code;
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                button.textContent = 'Copied!';
                setTimeout(() => { button.textContent = 'Copy'; }, 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });
    });

    // --- 5. Scroll Animation Logic ---
    const sections = document.querySelectorAll('.fade-in-section');
    if (sections.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        sections.forEach(section => observer.observe(section));
    }
});
