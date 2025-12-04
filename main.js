import './style.css';
import * as lucide from 'lucide';
window.lucide = lucide;
import { createIcons, icons } from 'lucide';

// --- Web Components ---

class SiteNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <nav class="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div class="w-full flex items-center justify-center px-6 py-3">
         <!-- Main navigation container -->
         <div class="flex flex-wrap justify-center space-x-4">
          
          <!-- Home Link -->

          <a href="index.html" class="flex items-center px-3 py-1 rounded text-blue-300 hover:bg-gray-800 hover:text-white font-semibold transition">
            <i data-lucide="home" class="mr-1 w-4 h-4"></i>Home
          </a>

          <!-- Guides & Case Studies Dropdown -->
          <div class="relative group">
            <!-- Dropdown Trigger -->
            <button class="flex items-center px-3 py-1 rounded text-blue-300 hover:bg-gray-800 hover:text-white font-semibold transition">
              <i data-lucide="book-open" class="mr-1 w-4 h-4"></i>
              Guides & Case Studies
              <i data-lucide="chevron-down" class="ml-1 w-4 h-4"></i>
            </button>
            
            <!-- Dropdown Menu -->
            <div class="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="py-1" role="menu" aria-orientation="vertical">
                <a href="regulation.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="gavel" class="mr-2 w-4 h-4"></i>Regulation (US/EU)
                </a>
                <a href="usprivacytimeline.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="flag" class="mr-2 w-4 h-4"></i>US Privacy Timeline
                </a>
                <a href="euprivacytimeline.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="globe" class="mr-2 w-4 h-4"></i>EU Privacy Timeline
                </a>
                <a href="cloud.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="cloud" class="mr-2 w-4 h-4"></i>Cloud
                </a>
                <a href="cyber_roadmap.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="map" class="mr-2 w-4 h-4"></i>Cyber Roadmap
                </a>
                <a href="phishing.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="fish" class="mr-2 w-4 h-4"></i>Phishing
                </a>
                <a href="sast.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="file-search" class="mr-2 w-4 h-4"></i>SAST
                </a>
                <a href="threatmodel.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="shield-alert" class="mr-2 w-4 h-4"></i>Threat Model
                </a>
                <a href="fair.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                    <i data-lucide="scale" class="mr-2 w-4 h-4"></i>FAIR Risk Scoring
                  </a>
                  <a href="sdlc.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                      <i data-lucide="code-2" class="mr-2 w-4 h-4"></i>Secure SDLC
                  </a>
              </div>
            </div>
          </div>

          <!-- Tools & Demos Dropdown -->
          <div class="relative group">
            <!-- Dropdown Trigger -->
            <button class="flex items-center px-3 py-1 rounded text-blue-300 hover:bg-gray-800 hover:text-white font-semibold transition">
              <i data-lucide="briefcase" class="mr-1 w-4 h-4"></i>
              Tools & Demos
              <i data-lucide="chevron-down" class="ml-1 w-4 h-4"></i>
            </button>
            
            <!-- Dropdown Menu -->
            <div class="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div class="py-1" role="menu" aria-orientation="vertical">
                <a href="checklist.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="list-checks" class="mr-2 w-4 h-4"></i>Checklist
                </a>
                <a href="epssdemo.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="target" class="mr-2 w-4 h-4"></i>CVSS vs EPSS
                </a>
                <a href="encryption.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="lock" class="mr-2 w-4 h-4"></i>Encryption
                </a>
                <a href="fingerprint.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="fingerprint" class="mr-2 w-4 h-4"></i>Fingerprinting
                </a>
                <a href="jwt.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="key-round" class="mr-2 w-4 h-4"></i>JWT Decoder
                </a>
                <a href="modcat.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="guitar" class="mr-2 w-4 h-4"></i>PRS MODCAT
                </a>
                <a href="shamir.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="share-2" class="mr-2 w-4 h-4"></i>Shamir's Visualizer
                </a>
                <a href="dashboard.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                  <i data-lucide="layout-dashboard" class="mr-2 w-4 h-4"></i>Threat Intel
                </a>
                 <a href="string.html" class="flex items-center px-4 py-2 text-sm text-blue-200 hover:bg-gray-700 hover:text-white" role="menuitem">
                    <i data-lucide="palette" class="mr-2 w-4 h-4"></i>String Art
                  </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </nav>
    `;

    // Initialize icons within the component
    createIcons({
      icons,
      nameAttr: 'data-lucide',
      attrs: {
        class: "w-4 h-4"
      }
    });

    // Add event listeners for dropdowns (mobile/touch support)
    const dropdownButtons = this.querySelectorAll('.group > button');
    dropdownButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const dropdownMenu = e.currentTarget.nextElementSibling;

        // Close all other open dropdowns
        this.querySelectorAll('.group .absolute').forEach(menu => {
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
        this.querySelectorAll('.group .absolute').forEach(menu => {
          menu.classList.add('opacity-0', 'invisible');
          menu.classList.remove('opacity-100', 'visible');
        });
      }
    });
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer class="bg-gray-900 text-gray-400 text-center py-4 mt-8 rounded-t-xl shadow-inner">
      © ${new Date().getFullYear()} D. Chandler Prince
    </footer>
    `;
  }
}

customElements.define('site-nav', SiteNav);
customElements.define('site-footer', SiteFooter);

// Initialize icons for the rest of the page
createIcons({
  icons,
  nameAttr: 'data-lucide',
  attrs: {
    class: "w-6 h-6" // Default size for page icons
  }
});

// Unhide body when loaded
document.addEventListener('DOMContentLoaded', () => {
  document.body.removeAttribute('hidden');
});
