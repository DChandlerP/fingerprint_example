import { createIcons, icons, Home, BookOpen, Briefcase, ChevronDown, Fish, Cloud, FileSearch, ShieldAlert, ListChecks, KeyRound, Lock, Fingerprint, Activity, LayoutDashboard, Guitar, Map, Share2, Gavel, Flag, Globe, Banknote, IterationCcw, GalleryVertical } from 'lucide';

export function initTimeline(timelineData) {
    // --- DOM Elements ---
    const timelineContainer = document.getElementById('timeline-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('detailsModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalPanel = document.getElementById('modalPanel');
    const modalYear = document.getElementById('modalYear');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalImpact = document.getElementById('modalImpact');
    const modalIcon = document.getElementById('modalIcon');
    const modalType = document.getElementById('modalType');

    // --- Logic ---
    function renderTimeline(filter = 'all') {
        if (!timelineContainer) return;
        timelineContainer.innerHTML = '';
        const sortedData = timelineData.sort((a, b) => a.year - b.year);
        const filteredData = filter === 'all' ? sortedData : sortedData.filter(item => item.type === filter);

        const emptyState = document.getElementById('empty-state');
        if (filteredData.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        } else {
            if (emptyState) emptyState.classList.add('hidden');
        }

        filteredData.forEach((item, index) => {
            const isLeft = index % 2 === 0;
            const sideClass = isLeft ? 'md:flex-row-reverse' : 'md:flex-row';
            const textAlignment = isLeft ? 'md:text-right' : 'md:text-left';
            const alignStart = isLeft ? 'md:items-end' : 'md:items-start';
            const colorClass = item.type === 'law' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
            const btnClass = item.type === 'law' ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-indigo-400 hover:bg-indigo-500/20';
            const dotColor = item.type === 'law' ? 'bg-emerald-500' : 'bg-indigo-500';

            const el = document.createElement('div');
            el.className = `timeline-item flex flex-row ${sideClass} items-center justify-between w-full mb-8`;
            el.innerHTML = `
                <div class="hidden md:block w-5/12"></div>
                <div class="z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-700 shadow-lg shrink-0 mx-4 md:mx-0 relative">
                    <div class="w-3 h-3 rounded-full ${dotColor}"></div>
                </div>
                <div class="w-[calc(100%-4rem)] md:w-5/12 bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg hover:border-gray-700 transition-all group">
                    <div class="flex flex-col ${alignStart}">
                        <span class="text-xs font-bold tracking-widest uppercase ${colorClass} px-2 py-1 rounded mb-2 inline-block">${item.year}</span>
                        <div class="flex items-center gap-2 mb-1 ${isLeft ? 'md:flex-row-reverse' : ''}">
                            <i data-lucide="${item.icon}" class="w-5 h-5 ${item.type === 'law' ? 'text-emerald-500' : 'text-indigo-500'}"></i>
                            <h3 class="text-lg font-bold text-white">${item.title}</h3>
                        </div>
                        <p class="text-gray-400 text-sm mb-4 ${textAlignment}">${item.shortDesc}</p>
                        <button data-id="${item.id}" class="details-btn text-xs font-semibold uppercase tracking-wider ${btnClass} py-1 px-2 rounded transition-colors flex items-center gap-1">
                            View Details <i data-lucide="arrow-right" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>
            `;
            timelineContainer.appendChild(el);
        });
        createIcons({ icons: icons });
        observeItems();

        // Add event listeners to new buttons
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                openDetails(id);
            });
        });
    }

    function filterTimeline(type) {
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === type) {
                btn.classList.add('bg-indigo-600', 'text-white', 'shadow-md');
                btn.classList.remove('bg-transparent', 'text-gray-400');
            } else {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
                btn.classList.add('bg-transparent', 'text-gray-400');
            }
        });
        renderTimeline(type);
    }

    // Expose filterTimeline to window for the HTML buttons to call
    window.filterTimeline = filterTimeline;

    function observeItems() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.timeline-item').forEach(item => observer.observe(item));
    }

    function openDetails(id) {
        const item = timelineData.find(d => d.id === id);
        if (!item) return;
        modalYear.innerText = item.year;
        modalTitle.innerText = item.title;
        modalDesc.innerText = item.fullDesc;
        modalImpact.innerText = item.impact;
        modalIcon.setAttribute('data-lucide', item.icon);
        modalType.innerText = item.type === 'law' ? 'Legislation' : 'Enforcement / Case';
        if (item.type === 'law') {
            modalType.className = "text-sm font-medium uppercase tracking-wide text-emerald-400";
            modalIcon.className = "w-5 h-5 text-emerald-400";
        } else {
            modalType.className = "text-sm font-medium uppercase tracking-wide text-indigo-400";
            modalIcon.className = "w-5 h-5 text-indigo-400";
        }
        modal.classList.remove('hidden');
        createIcons({ icons: icons });
        setTimeout(() => {
            modalBackdrop.classList.remove('opacity-0');
            modalPanel.classList.remove('opacity-0', 'translate-y-4', 'sm:translate-y-0', 'sm:scale-95');
        }, 10);
    }

    // Expose openDetails to window if needed
    window.openDetails = openDetails;

    function closeModal() {
        modalBackdrop.classList.add('opacity-0');
        modalPanel.classList.add('opacity-0', 'translate-y-4', 'sm:translate-y-0', 'sm:scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    // Expose closeModal to window for HTML buttons
    window.closeModal = closeModal;

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modalBackdrop || e.target.closest('.fixed.inset-0') === e.target) closeModal();
        });
    }

    renderTimeline('all');

    // --- Nav Icons & Dropdown Logic ---
    createIcons({
        icons: {
            'nav-home': Home, 'nav-guides-trigger': BookOpen, 'nav-tools-trigger': Briefcase,
            'nav-guides-chevron': ChevronDown, 'nav-tools-chevron': ChevronDown, 'nav-phishing': Fish,
            'nav-cloud': Cloud, 'nav-sast': FileSearch, 'nav-threat': ShieldAlert,
            'nav-checklist': ListChecks, 'nav-jwt': KeyRound, 'nav-encryption': Lock,
            'nav-fp': Fingerprint, 'nav-epss': Activity, 'nav-dashboard': LayoutDashboard,
            'nav-modcat': Guitar, 'nav-roadmap': Map, 'nav-shamir': Share2,
            'nav-regulation': Gavel, 'nav-privacy': Flag, 'nav-eu-privacy': Globe,
            'nav-fair': Banknote, 'nav-sdlc': IterationCcw, 'nav-stringart': GalleryVertical,
        },
        attrs: { color: "#38bdf8", size: 20, strokeWidth: 2 }
    });

    const dropdownButtons = document.querySelectorAll('.group > button');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const dropdownMenu = e.currentTarget.nextElementSibling;
            document.querySelectorAll('.group .absolute').forEach(menu => {
                if (menu !== dropdownMenu) menu.classList.add('opacity-0', 'invisible');
            });
            dropdownMenu.classList.toggle('opacity-0');
            dropdownMenu.classList.toggle('invisible');
        });
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('.group')) document.querySelectorAll('.group .absolute').forEach(menu => menu.classList.add('opacity-0', 'invisible'));
    });
}
