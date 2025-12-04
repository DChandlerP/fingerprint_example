import { createIcons, icons, Home, BookOpen, Briefcase, ChevronDown, Fish, Cloud, FileSearch, ShieldAlert, ListChecks, KeyRound, Lock, Fingerprint, Activity, LayoutDashboard, Guitar, Map, Share2, Gavel, Flag, Globe, Banknote, IterationCcw, GalleryVertical } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- EU Specific Data Source ---
    const timelineData = [
        {
            id: 1, year: 2002, title: 'ePrivacy Directive', type: 'law', icon: 'cookie',
            shortDesc: 'The "cookie law" governing electronic communications confidentiality.',
            fullDesc: 'This directive, still in effect, governs the confidentiality of electronic communications, tracking technologies (like cookies), and metadata processing for users within the EU. It is stricter than GDPR in some areas, such as requiring opt-in consent for most B2C email marketing.',
            impact: 'The reason for cookie consent banners across the web. It establishes that storing or accessing information on a user\'s device requires their prior consent.',
            color: 'emerald'
        },
        {
            id: 2, year: 2018, title: 'GDPR Enforced', type: 'law', icon: 'shield',
            shortDesc: 'The General Data Protection Regulation becomes enforceable.',
            fullDesc: 'The GDPR harmonized data privacy laws across Europe, empowering citizens with data rights and imposing strict obligations on organizations that handle their data, regardless of where those organizations are located.',
            impact: 'Set a global standard for data privacy. Introduced concepts like "Privacy by Design," data subject rights (e.g., right to erasure), and massive fines (up to 4% of global turnover).',
            color: 'emerald'
        },
        {
            id: 3, year: 2020, title: 'Schrems II Ruling', type: 'case', icon: 'gavel',
            shortDesc: 'CJEU invalidates the EU-US Privacy Shield framework.',
            fullDesc: 'The Court of Justice of the European Union (CJEU) ruled that the EU-US Privacy Shield did not adequately protect EU citizens\' data from US government surveillance, making it an invalid mechanism for transferring personal data to the US.',
            impact: 'Caused massive disruption for thousands of companies relying on Privacy Shield for data transfers. It forced a reliance on more complex mechanisms like Standard Contractual Clauses (SCCs) and highlighted the conflict between EU privacy rights and US surveillance laws.',
            color: 'indigo'
        },
        {
            id: 4, year: 2023, title: 'Meta Fined €1.2 Billion', type: 'case', icon: 'landmark',
            shortDesc: 'Record GDPR fine for illegal data transfers to the US.',
            fullDesc: 'Ireland\'s Data Protection Commission (DPC) imposed a record-breaking €1.2 billion fine on Meta for continuing to transfer EU user data to the US following the Schrems II ruling, finding it did not have a valid legal basis for the transfers.',
            impact: 'The largest GDPR fine to date, demonstrating the serious financial consequences of non-compliance, particularly regarding international data transfers.',
            color: 'indigo'
        },
        {
            id: 5, year: 2023, title: 'Switzerland: New FADP', type: 'law', icon: 'flag',
            shortDesc: 'Switzerland\'s updated Federal Act on Data Protection (nFADP) takes effect.',
            fullDesc: 'Switzerland\'s "GDPR-lite" modernization of its data protection law. It aligns closely with GDPR principles like Privacy by Design but has unique features, such as the ability to impose criminal fines on individuals (managers/directors) for intentional violations.',
            impact: 'Introduces personal liability for executives. While its breach reporting threshold is higher ("high risk" only), it solidifies Switzerland\'s status as a country with adequate data protection.',
            color: 'emerald'
        },
        {
            id: 6, year: 2024, title: 'Digital Markets Act (DMA)', type: 'law', icon: 'scale',
            shortDesc: 'The DMA becomes fully applicable, targeting "gatekeeper" tech platforms.',
            fullDesc: 'This law imposes strict obligations on Big Tech "gatekeepers" (like Google, Meta, Apple) to ensure fair and open digital markets. It sits alongside GDPR to regulate how these specific companies can use data.',
            impact: 'Bans gatekeepers from combining personal data across their different core services without explicit consent, creating a data "firewall" between platforms like Facebook and WhatsApp.',
            color: 'emerald'
        },
        {
            id: 7, year: 2024, title: 'Digital Services Act (DSA)', type: 'law', icon: 'users',
            shortDesc: 'The DSA becomes fully applicable to all online intermediaries.',
            fullDesc: 'A broad law regulating online platforms to combat illegal content, disinformation, and protect users\' rights. It introduces transparency requirements for algorithms and advertising.',
            impact: 'Bans targeted advertising to minors and ads based on sensitive data (religion, sexual orientation). It also forces platforms to offer recommender systems not based on profiling (e.g., a chronological feed).',
            color: 'emerald'
        },
        {
            id: 8, year: 2025, title: 'EU AI Act', type: 'law', icon: 'brain-circuit',
            shortDesc: 'The world\'s first comprehensive AI law begins to apply.',
            fullDesc: 'This act uses a risk-based approach to regulate AI. It bans "unacceptable risk" systems (like social scoring) and imposes strict data governance, accuracy, and security rules on "high-risk" systems (e.g., in hiring or credit scoring).',
            impact: 'Prohibits biometric categorization and untargeted scraping of facial images for databases (like Clearview AI). It sets a global precedent for regulating artificial intelligence.',
            color: 'emerald'
        },
        {
            id: 9, year: 2025, title: 'EU Data Act', type: 'law', icon: 'database-zap',
            shortDesc: 'The Data Act focuses on data generated by IoT and connected devices.',
            fullDesc: 'This law aims to create a fairer data economy by regulating access to data from connected devices. It gives users and businesses the right to access and port data generated by their smart products.',
            impact: 'Breaks the manufacturer\'s data monopoly on IoT devices. A car owner, for example, can now legally access their vehicle\'s data and share it with a third-party repair shop.',
            color: 'emerald'
        },
        {
            id: 10, year: 2025, title: 'UK: Data Act 2025', type: 'law', icon: 'file-cog',
            shortDesc: 'The UK\'s first major divergence from EU GDPR.',
            fullDesc: 'Passed in June 2025, this act updates the UK GDPR with several business-friendly relaxations. It aims to reduce compliance burdens while maintaining a high standard of data protection.',
            impact: 'Removes the need for a "balancing test" for some legitimate interests (like direct marketing), relaxes cookie consent for analytics, and allows refusal of "disproportionate" DSARs.',
            color: 'emerald'
        },
        {
            id: 11, year: 2023, title: 'NIS2 Directive', type: 'law', icon: 'shield-alert',
            shortDesc: 'Cybersecurity law for critical infrastructure with strict reporting.',
            fullDesc: 'This directive mandates robust cybersecurity risk management for "essential and important" entities (e.g., energy, transport, digital providers). It aims to increase the overall level of cybersecurity in the EU.',
            impact: 'Imposes a strict 24-hour incident reporting timeline. Since many security incidents are also data breaches, this creates a dual-reporting burden alongside GDPR.',
            color: 'emerald'
        },
        {
            id: 12, year: 2024, title: 'Uber Fined €290 Million', type: 'case', icon: 'landmark',
            shortDesc: 'Dutch DPA fines Uber for legacy data transfers to the US.',
            fullDesc: 'The Dutch DPA fined Uber for transferring driver data to US servers without adequate safeguards before the new EU-US Data Privacy Framework was in place.',
            impact: 'Serves as a warning that companies are liable for "legacy" transfers. Even if you fix non-compliance later, you can be fined for the period you were non-compliant.',
            color: 'indigo'
        },
        {
            id: 13, year: 2024, title: 'LinkedIn Fined €310 Million', type: 'case', icon: 'landmark',
            shortDesc: 'Irish DPC invalidates "legitimate interest" for behavioral ads.',
            fullDesc: 'The Irish DPC ruled that LinkedIn\'s use of "legitimate interest" for behavioral advertising was invalid, a major blow to the ad-tech industry.',
            impact: 'This effectively kills "legitimate interest" as a legal basis for tracking ads. Regulators are signaling that behavioral targeting must be based on explicit consent, not a company\'s self-assessed interest.',
            color: 'indigo'
        },
        {
            id: 14, year: 2025, title: 'Meta Fined €200M for "Pay or Consent"', type: 'case', icon: 'landmark',
            shortDesc: 'European Commission fines Meta under the Digital Markets Act (DMA).',
            fullDesc: 'The European Commission fined Meta under the DMA, ruling that forcing users to pay to avoid tracking does not constitute "freely given" consent. The Commission argued that privacy cannot be a luxury good.',
            impact: 'A direct challenge to the "free service in exchange for data" business model. It sets a precedent that consent must be a genuine choice, not a transaction under pressure.',
            color: 'indigo'
        },
        {
            id: 15, year: 2025, title: 'TikTok Fined €530 Million', type: 'case', icon: 'landmark',
            shortDesc: 'Irish DPC fines TikTok for illegal data transfers to China.',
            fullDesc: 'The Irish Data Protection Commission (DPC) fined TikTok for transferring EU user data to China, in a definitive "Schrems II" enforcement action.',
            impact: 'Confirmed that merely having "standard contractual clauses" (paperwork) is not enough if the recipient country (like China) has laws allowing state surveillance without redress for EU citizens.',
            color: 'indigo'
        },
        {
            id: 16, year: 2025, title: 'CJEU: Dun & Bradstreet Ruling', type: 'case', icon: 'gavel',
            shortDesc: 'CJEU rules against "black box" AI for credit scoring.',
            fullDesc: 'The Court of Justice of the European Union (CJEU) ruled that companies using automated algorithms for credit scoring or risk assessment cannot hide behind "trade secrets." They must provide a sufficient explanation of the logic for a user to challenge it.',
            impact: 'A major blow to "black box" AI and credit scoring agencies, reinforcing the GDPR\'s right to an explanation for automated decisions.',
            color: 'indigo'
        },
        {
            id: 17, year: 2025, title: 'CJEU: SRB vs. EDPS Ruling', type: 'case', icon: 'gavel',
            shortDesc: 'CJEU clarifies the status of pseudonymized data.',
            fullDesc: 'In a surprising "win" for businesses, the CJEU clarified that pseudonymized data is not considered Personal Data in the hands of a recipient IF that recipient has no legal or technical means to re-identify it.',
            impact: 'Reverses a previous trend that treated almost all data as "personal." It makes data sharing for research or analytics slightly safer, provided the re-identification key is strictly separated.',
            color: 'indigo'
        },
        {
            id: 18, year: 2025, title: 'Spanish Media vs. Meta (€551M)', type: 'case', icon: 'landmark',
            shortDesc: 'Spanish court orders Meta to pay media outlets for unfair competition.',
            fullDesc: 'A Spanish court ordered Meta to pay €551 million to Spanish media outlets, finding that Meta committed "unfair competition" by using illegally obtained user data to sell ads, thereby undercutting traditional media.',
            impact: 'Opens a new front for litigation: competitors suing for privacy violations, not just regulators. It links privacy compliance directly to fair market competition.',
            color: 'indigo'
        },
        {
            id: 19, year: 2025, title: 'Clearview AI: Executive Liability', type: 'case', icon: 'user-x',
            shortDesc: 'Dutch DPA investigates Clearview AI directors personally.',
            fullDesc: 'After fining Clearview AI €30.5 million for its illegal facial recognition database, the Dutch regulator took the unprecedented step of investigating the directors personally for their role in approving the illegal data practices.',
            impact: 'Signals a new trend where regulators are losing patience with "corporate shell" defenses and are looking to hold C-level executives personally liable for intentional privacy violations.',
            color: 'indigo'
        }
    ];

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

    // Expose openDetails to window if needed, but we are using event listeners now
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
});
