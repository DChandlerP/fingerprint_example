import { createIcons, Github, Linkedin, Usb, ChevronDown, ChevronUp, BadgeCheck, Puzzle, ShieldAlert, ExternalLink, ListChecks, KeyRound, Fingerprint, Activity, Guitar, LayoutDashboard, FileSearch, Cloud, Award, ServerCog, BookOpenCheck } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize Icons ---
    createIcons({
        icons: {
            github: Github,
            linkedin: Linkedin,
            usb: Usb,
            'chevron-down': ChevronDown,
            'chevron-up': ChevronUp,
            'badge-check': BadgeCheck,
            puzzle: Puzzle,
            'shield-alert': ShieldAlert,
            'external-link': ExternalLink,
            'list-checks': ListChecks,
            'key-round': KeyRound,
            fingerprint: Fingerprint,
            activity: Activity,
            guitar: Guitar,
            'layout-dashboard': LayoutDashboard,
            'file-search': FileSearch,
            cloud: Cloud,
            award: Award,
            'server-cog': ServerCog,
            'book-open-check': BookOpenCheck
        },
        attrs: {
            class: "w-6 h-6"
        }
    });

    // --- Expandable Cards Logic ---
    const toggleButtons = document.querySelectorAll('.expand-toggle');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('[data-expandable-card]'); // Find the parent card
            const fullText = card.querySelector('.full-text');
            const buttonText = button.querySelector('span:first-child');
            const iconDown = card.querySelector('.expand-icon-down');
            const iconUp = card.querySelector('.expand-icon-up');

            const isExpanded = fullText.classList.contains('max-h-screen'); // Check for expansion class

            if (isExpanded) {
                // Collapse
                fullText.classList.remove('max-h-screen', 'opacity-100');
                fullText.classList.add('max-h-0', 'opacity-0');
                buttonText.textContent = 'Read more';
                iconDown.classList.remove('hidden');
                iconUp.classList.add('hidden');
            } else {
                // Expand
                fullText.classList.remove('max-h-0', 'opacity-0');
                // Use max-h-screen as a simple "auto" equivalent for animation
                fullText.classList.add('max-h-screen', 'opacity-100');
                buttonText.textContent = 'Show less';
                iconDown.classList.add('hidden');
                iconUp.classList.remove('hidden');
            }
        });
    });
});
