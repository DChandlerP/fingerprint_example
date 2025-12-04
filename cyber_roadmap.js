import { createIcons, Home, BookOpen, Briefcase, ChevronDown, Cloud, Map, Fish, FileSearch, ShieldAlert, ListChecks, Activity, Lock, Fingerprint, KeyRound, Guitar, Share2, LayoutDashboard } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Page-Specific Roadmap Logic ---
    const filterVendorContainer = document.getElementById('filter-container-vendor');
    const filterLevelContainer = document.getElementById('filter-container-level');
    const filterRoleSelect = document.getElementById('filter-role-select');
    const certTriggers = document.querySelectorAll('.cert-trigger');

    let currentVendorFilter = 'all';
    let currentLevelFilter = 'all';
    let currentRoleFilter = 'all';

    function applyFilters() {
        // Add 'active' class to dropdown if it's filtering
        if (currentRoleFilter !== 'all') {
            filterRoleSelect.classList.add('active');
        } else {
            filterRoleSelect.classList.remove('active');
        }

        certTriggers.forEach(card => {
            const vendor = card.dataset.vendor;
            const level = card.dataset.level;
            const roles = card.dataset.roles ? card.dataset.roles.split(',').map(r => r.trim()) : [];

            const vendorMatch = (currentVendorFilter === 'all' || vendor === currentVendorFilter);
            const levelMatch = (currentLevelFilter === 'all' || level === currentLevelFilter);
            const roleMatch = (currentRoleFilter === 'all' || roles.includes(currentRoleFilter));

            if (vendorMatch && levelMatch && roleMatch) {
                card.classList.remove('hidden');
                card.style.display = 'flex';
            } else {
                card.classList.add('hidden');
                setTimeout(() => {
                    if (card.classList.contains('hidden')) {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
        // This timeout ensures that items being un-hidden are displayed correctly
        setTimeout(() => {
            certTriggers.forEach(card => {
                if (!card.classList.contains('hidden')) {
                    card.style.display = 'flex';
                }
            });
        }, 0);
    }

    // Vendor Filter Event
    if (filterVendorContainer) {
        filterVendorContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;

            filterVendorContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentVendorFilter = e.target.dataset.filter;
            applyFilters();
        });
    }

    // Level Filter Event
    if (filterLevelContainer) {
        filterLevelContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;

            filterLevelContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentLevelFilter = e.target.dataset.filter;
            applyFilters();
        });
    }

    // Role Filter Event
    if (filterRoleSelect) {
        filterRoleSelect.addEventListener('change', (e) => {
            currentRoleFilter = e.target.value;
            applyFilters();
        });
    }

    // Modal Logic
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const certList = document.getElementById('cert-list');
    const modalName = document.getElementById('modal-name');
    const modalPrice = document.getElementById('modal-price');
    const modalVendorTag = document.getElementById('modal-vendor-tag');
    const modalLevelTag = document.getElementById('modal-level-tag');
    const modalDescription = document.getElementById('modal-description');
    const modalNotes = document.getElementById('modal-notes');
    const modalLink = document.getElementById('modal-link');
    const modalRolesContainer = document.getElementById('modal-roles-container');

    if (certList) {
        certList.addEventListener('click', (e) => {
            const trigger = e.target.closest('.cert-trigger');
            if (!trigger) return;

            e.preventDefault();
            const data = trigger.dataset;

            modalName.textContent = data.name;
            modalPrice.textContent = data.price;
            modalDescription.textContent = data.description;
            modalNotes.textContent = data.notes;
            modalLevelTag.textContent = data.levelRaw;
            modalLink.href = data.link;

            // Clear previous dynamic content
            modalContent.className = 'modal-content';
            modalPrice.className = 'mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 rounded-full px-4 py-1 text-lg font-bold';
            modalVendorTag.className = 'inline-block rounded-full px-3 py-1 text-sm font-medium';
            modalLevelTag.className = 'inline-block rounded-full px-3 py-1 text-sm font-medium';
            modalRolesContainer.innerHTML = '';

            // Set Level Tag
            if (data.level === 'basic') { modalLevelTag.classList.add('tag-basic'); }
            else if (data.level === 'intermediate') { modalLevelTag.classList.add('tag-intermediate'); }
            else if (data.level === 'advanced') { modalLevelTag.classList.add('tag-advanced'); }

            // Set Vendor Tag & Colors
            if (data.vendor === 'comptia') {
                modalContent.classList.add('modal-comptia');
                modalPrice.classList.add('text-blue-200', 'bg-blue-900');
                modalVendorTag.classList.add('tag-comptia');
                modalVendorTag.textContent = 'CompTIA';
            } else if (data.vendor === 'isc2') {
                modalContent.classList.add('modal-isc2');
                modalPrice.classList.add('text-green-200', 'bg-green-900');
                modalVendorTag.classList.add('tag-isc2');
                modalVendorTag.textContent = '(ISC)²';
            } else if (data.vendor === 'giac') {
                modalContent.classList.add('modal-giac');
                modalPrice.classList.add('text-red-200', 'bg-red-900');
                modalVendorTag.classList.add('tag-giac');
                modalVendorTag.textContent = 'GIAC';
            } else if (data.vendor === 'isaca') {
                modalContent.classList.add('modal-isaca');
                modalPrice.classList.add('text-yellow-200', 'bg-yellow-900');
                modalVendorTag.classList.add('tag-isaca');
                modalVendorTag.textContent = 'ISACA';
            } else if (data.vendor === 'offsec') {
                modalContent.classList.add('modal-offsec');
                modalPrice.classList.add('text-gray-200', 'bg-gray-700');
                modalVendorTag.classList.add('tag-offsec');
                modalVendorTag.textContent = 'OffSec';
            } else if (data.vendor === 'platform') {
                modalContent.classList.add('modal-platform');
                modalPrice.classList.add('text-purple-200', 'bg-purple-900');
                modalVendorTag.classList.add('tag-platform');
                modalVendorTag.textContent = 'Cloud & Platform';
            }

            // Populate DoD 8140 Roles
            if (data.roles) {
                modalRolesContainer.innerHTML = '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-50">Common DoD 8140 Work Roles:</h3>';
                const tagsWrapper = document.createElement('div');
                tagsWrapper.className = 'flex flex-wrap gap-2';

                const roles = data.roles.split(',').map(r => r.trim());
                roles.forEach(role => {
                    const tag = document.createElement('span');
                    tag.textContent = role;
                    tag.className = 'inline-block rounded-full tag-role px-3 py-1 text-xs font-medium';
                    tagsWrapper.appendChild(tag);
                });
                modalRolesContainer.appendChild(tagsWrapper);
            }

            modalOverlay.classList.remove('hidden');
        });
    }

    if (modalCloseBtn) {
        const closeModal = () => { modalOverlay.classList.add('hidden'); };
        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { closeModal(); } });
    }

    applyFilters();

    // --- 2. Render ALL Icons (Nav only needed here) ---
    createIcons({
        icons: {
            // All Nav Icons
            'nav-home': Home,
            'nav-guides-trigger': BookOpen,
            'nav-tools-trigger': Briefcase,
            'nav-guides-chevron': ChevronDown,
            'nav-tools-chevron': ChevronDown,
            'nav-cloud': Cloud,
            'nav-roadmap': Map,
            'nav-phishing': Fish,
            'nav-sast': FileSearch,
            'nav-threat': ShieldAlert,
            'nav-checklist': ListChecks,
            'nav-epss': Activity,
            'nav-encryption': Lock,
            'nav-fp': Fingerprint,
            'nav-jwt': KeyRound,
            'nav-modcat': Guitar,
            'nav-shamir': Share2,
            'nav-dashboard': LayoutDashboard,
        },
        attrs: { color: "#38bdf8", size: 24, strokeWidth: 2 }
    });

    // --- 3. Add Nav Dropdown Logic ---
    const dropdownButtons = document.querySelectorAll('.group > button');
    dropdownButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const dropdownMenu = e.currentTarget.nextElementSibling;
            // Close all other open dropdowns
            document.querySelectorAll('.group .absolute').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.add('opacity-0', 'invisible');
                    menu.classList.remove('opacity-100', 'visible');
                }
            });
            // Toggle the current dropdown
            dropdownMenu.classList.toggle('opacity-0');
            dropdownMenu.classList.toggle('invisible');
            dropdownMenu.classList.toggle('opacity-100');
            dropdownMenu.classList.toggle('visible');
        });
    });

    // Close dropdowns if clicking outside
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.group')) {
            document.querySelectorAll('.group .absolute').forEach(menu => {
                menu.classList.add('opacity-0', 'invisible');
                menu.classList.remove('opacity-100', 'visible');
            });
        }
    });

});
