document.addEventListener('DOMContentLoaded', () => {
    const populationEl = document.getElementById('population');
    const confidenceEl = document.getElementById('confidence');
    const marginEl = document.getElementById('margin');
    const sampleSizeEl = document.getElementById('sample-size');

    const calculateSampleSize = () => {
        if (!populationEl || !confidenceEl || !marginEl) return;

        const N = parseInt(populationEl.value);
        const Z = parseFloat(confidenceEl.value); // Z-score
        const e = parseFloat(marginEl.value); // Margin of error
        const p = 0.5; // Use 0.5 for the most conservative sample size

        if (isNaN(N) || N <= 0) {
            if (sampleSizeEl) sampleSizeEl.textContent = "N/A";
            return;
        }
        const n0 = (Z * Z * p * (1 - p)) / (e * e);
        const n = n0 / (1 + (n0 - 1) / N);
        if (sampleSizeEl) sampleSizeEl.textContent = Math.ceil(n);
    };

    if (populationEl) populationEl.addEventListener('input', calculateSampleSize);
    if (confidenceEl) confidenceEl.addEventListener('change', calculateSampleSize);
    if (marginEl) marginEl.addEventListener('change', calculateSampleSize);
    calculateSampleSize(); // Initial calculation

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

    // --- 6. TOC Active Link Logic ---
    const tocLinks = document.querySelectorAll('.toc a');
    if (tocLinks.length > 0) {
        const tocObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const tocLink = document.querySelector(`.toc a[href="#${id}"]`);
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    if (tocLink) tocLink.classList.add('active');
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        document.querySelectorAll('section[id]').forEach(section => {
            tocObserver.observe(section);
        });
    }
});
