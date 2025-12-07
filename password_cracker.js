import { createIcons, Eye, EyeOff, Smartphone, Monitor, Network, Server, LassoSelect, RefreshCw, Copy } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {

    // --- Wordlist (Expanded subset of EFF Short List) ---
    const wordlist = [
        "acid", "acorn", "acre", "acts", "afar", "affix", "aged", "agent", "agile", "aging", "agony", "ahead", "aide", "aids", "aim", "ajar", "alarm", "alias", "alibi", "alien", "alike", "alive", "aloe", "aloft", "aloha", "alone", "amend", "amino", "ample", "amuse", "angel", "anger", "angle", "ankle", "apple", "april", "apron", "aqua", "area", "arena", "argue", "arise", "armed", "armor", "army", "aroma", "array", "arrow", "arson", "art", "ash", "asset", "atom", "audit", "august", "aunt", "auto", "avid", "avoid", "await", "awake", "award", "aware", "awoke", "axis", "bacon", "badge", "bagel", "baggy", "baked", "baker", "balmy", "banjo", "barge", "barn", "bash", "basil", "bask", "batch", "bath", "baton", "bats", "batt", "bayou", "beach", "beads", "beam", "bean", "bear", "beard", "beast", "beat", "beep", "beer", "beet", "begun", "bend", "bent", "berm", "berry", "beryl", "bet", "bias", "bib", "bicep", "bid", "big", "bike", "bill", "bin", "bind", "bingo", "birch", "bird", "birth", "bison", "bit", "bite", "black", "blade", "blame", "blank", "blast", "bleak", "blend", "bless", "blimp", "blind", "blink", "blip", "bliss", "blitz", "block", "blond", "blood", "bloom", "blot", "blow", "blue", "bluff", "blur", "blush", "boar", "boat", "body", "boil", "bok", "bolt", "bomb", "bond", "bone", "bong", "bonus", "book", "boom", "boot", "booth", "booty", "booze", "bop", "border", "bore", "borrow", "boss", "botch", "both", "bottle", "bottom", "bounce", "bound", "bow", "bowl", "box", "boy", "braid", "brain", "brake", "brand", "brass", "brave", "bread", "break", "brems", "brew", "brick", "bride", "brief", "bright", "brim", "bring", "brisk", "broad", "broil", "broke", "broken", "bronze", "brook", "broom", "brown", "bruise", "brush", "brute", "bubble", "buck", "buddy", "budge", "buff", "buggy", "bugle", "build", "bulb", "bulge", "bulk", "bull", "bully", "bump", "bun", "bunch", "bunk", "bunny", "bunt", "buoy", "burg", "buried", "burn", "burp", "burst", "bus", "bush", "bust", "busy", "butler", "butter", "button", "buy", "buyer", "buzz", "cab", "cabin", "cable", "cache", "cacti", "caddy", "cadet", "cage", "cake", "calm", "camel", "camp", "canal", "candy", "cane", "cannon", "canoe", "canopy", "cap", "cape", "car", "carbon", "card", "care", "cargo", "carl", "carp", "cart",
        "cash", "cask", "cast", "cat", "catch", "cause", "cedar", "cello", "cement", "cent", "cereal", "chafe", "chain", "chair", "chalk", "champ", "chant", "chaos", "chap", "charge", "charm", "chart", "chase", "chat", "cheap", "cheat", "check", "cheek", "cheer", "chef", "chess", "chest", "chew", "chic", "chief", "child", "chill", "chime", "chin", "chip", "chirp", "chive", "choir", "choke", "chomp", "choose", "chop", "chore", "chosen", "chow", "chrome", "chunk", "churn", "chute", "cider", "cigar", "cinch", "circa", "civic", "civil", "clad", "claim", "clam", "clamp", "clan", "clank", "clap", "clarity", "clash", "clasp", "class", "claw", "clay", "clean", "clear", "cleat", "cleft", "clerk", "click", "cliff", "climb", "cling", "clink", "clip", "cloak", "clock", "clone", "cloth", "cloud", "clump", "coach", "coal", "coast", "coat", "cobweb", "cocoa"
    ];

    // --- Elements ---
    const passwordInput = document.getElementById('password-input');
    const toggleBtn = document.getElementById('toggle-visibility');
    const iconEye = document.getElementById('icon-eye');
    const entropyValue = document.getElementById('entropy-value');
    const entropyText = document.getElementById('entropy-text');
    const entropyBar = document.getElementById('entropy-bar');
    const crackTimes = document.querySelectorAll('.crack-time');
    const hardwareCards = document.querySelectorAll('.hardware-card');

    // Generator UI
    const tabComplex = document.getElementById('tab-complex');
    const tabPassphrase = document.getElementById('tab-passphrase');
    const panelComplex = document.getElementById('panel-complex');
    const panelPassphrase = document.getElementById('panel-passphrase');
    const complexLen = document.getElementById('complex-len');
    const complexLenVal = document.getElementById('complex-len-val');
    const useUpper = document.getElementById('use-upper');
    const useNum = document.getElementById('use-num');
    const useSymbol = document.getElementById('use-symbol');
    const phraseLen = document.getElementById('phrase-len');
    const phraseLenVal = document.getElementById('phrase-len-val');
    const phraseSep = document.getElementById('phrase-sep');
    const btnGenerate = document.getElementById('btn-generate');
    const btnCopy = document.getElementById('btn-copy');

    // --- Init Icons ---
    createIcons({
        icons: { Eye, EyeOff, Smartphone, Monitor, Network, Server, LassoSelect, RefreshCw, Copy },
        nameAttr: 'data-lucide'
    });
    iconEye.innerHTML = '<i data-lucide="eye" class="w-6 h-6"></i>';
    createIcons({ icons: { Eye }, nameAttr: 'data-lucide' });


    // --- Toggle Visibility ---
    let isVisible = false;
    toggleBtn.addEventListener('click', () => {
        isVisible = !isVisible;
        passwordInput.type = isVisible ? 'text' : 'password';
        iconEye.innerHTML = `<i data-lucide="${isVisible ? 'eye-off' : 'eye'}" class="w-6 h-6"></i>`;
        createIcons({ icons: { Eye, EyeOff }, nameAttr: 'data-lucide' });
    });

    // --- Tab Switching ---
    let currentMode = 'complex';

    function switchTab(mode) {
        currentMode = mode;
        if (mode === 'complex') {
            tabComplex.classList.replace('text-gray-400', 'text-purple-400');
            tabComplex.classList.add('border-b-2', 'border-purple-400');
            tabPassphrase.classList.replace('text-purple-400', 'text-gray-400');
            tabPassphrase.classList.remove('border-b-2', 'border-purple-400');

            panelComplex.classList.remove('hidden');
            panelPassphrase.classList.add('hidden');
        } else {
            tabPassphrase.classList.replace('text-gray-400', 'text-purple-400');
            tabPassphrase.classList.add('border-b-2', 'border-purple-400');
            tabComplex.classList.replace('text-purple-400', 'text-gray-400');
            tabComplex.classList.remove('border-b-2', 'border-purple-400');

            panelPassphrase.classList.remove('hidden');
            panelComplex.classList.add('hidden');
        }
    }

    tabComplex.addEventListener('click', () => switchTab('complex'));
    tabPassphrase.addEventListener('click', () => switchTab('passphrase'));

    // --- Sliders Update ---
    complexLen.addEventListener('input', (e) => complexLenVal.textContent = e.target.value);
    phraseLen.addEventListener('input', (e) => phraseLenVal.textContent = e.target.value);


    // --- Generator Logic ---
    function generateComplex() {
        const length = parseInt(complexLen.value);
        const hasUpper = useUpper.checked;
        const hasNum = useNum.checked;
        const hasSymbol = useSymbol.checked;

        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let pool = lower;
        if (hasUpper) pool += upper;
        if (hasNum) pool += nums;
        if (hasSymbol) pool += symbols;

        let result = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            result += pool[array[i] % pool.length];
        }
        return result;
    }

    function generatePassphrase() {
        const count = parseInt(phraseLen.value);
        const sep = phraseSep.value;
        const result = [];

        const array = new Uint32Array(count);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < count; i++) {
            result.push(wordlist[array[i] % wordlist.length]);
        }
        return result.join(sep);
    }

    function doGenerate() {
        const password = currentMode === 'complex' ? generateComplex() : generatePassphrase();
        passwordInput.value = password;
        updateCalculations();

        // Auto-show password when generated
        isVisible = true;
        passwordInput.type = 'text';
        iconEye.innerHTML = '<i data-lucide="eye-off" class="w-6 h-6"></i>';
        createIcons({ icons: { EyeOff }, nameAttr: 'data-lucide' });
    }

    btnGenerate.addEventListener('click', doGenerate);

    btnCopy.addEventListener('click', () => {
        if (passwordInput.value) {
            navigator.clipboard.writeText(passwordInput.value);
            // Visual feedback could go here
        }
    });

    // --- Analysis Logic ---

    // We update this function to handle basic passphrases slightly better by detecting space/sep
    // But standard entropy math is mostly character based. For high accuracy passphrase entropy,
    // we'd need to detect dictionary words, but character math is a decent "strong/weak" proxy.
    function calculateEntropy(password) {
        if (!password) return 0;

        let poolSize = 0;
        if (/[a-z]/.test(password)) poolSize += 26;
        if (/[A-Z]/.test(password)) poolSize += 26;
        if (/[0-9]/.test(password)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33; // Special chars

        // Entropy = Length * log2(poolSize)
        return Math.floor(password.length * Math.log2(Math.max(poolSize, 1)));
    }

    function formatTime(seconds) {
        if (seconds < 1) return "Instant";
        if (seconds < 60) return `${Math.floor(seconds)} seconds`;

        const minutes = seconds / 60;
        if (minutes < 60) return `${Math.floor(minutes)} minutes`;

        const hours = minutes / 60;
        if (hours < 24) return `${Math.floor(hours)} hours`;

        const days = hours / 24;
        if (days < 365) return `${Math.floor(days)} days`;

        const years = days / 365;
        if (years < 1000) return `${Math.floor(years)} years`;
        if (years < 1000000) return `${(years / 1000).toFixed(1)}k years`;
        if (years < 1000000000) return `${(years / 1000000).toFixed(1)}m years`;

        return "Centuries";
    }

    function updateCalculations() {
        const password = passwordInput.value;
        const entropy = calculateEntropy(password);
        const combinations = Math.pow(2, entropy);

        // Update Entropy Display
        entropyValue.textContent = entropy;

        // Color & Text Logic based on bits
        let colorClass = 'bg-red-500';
        let textMsg = "Very Weak";

        if (entropy > 120) { colorClass = 'bg-green-500'; textMsg = "Excellent"; }
        else if (entropy > 80) { colorClass = 'bg-green-400'; textMsg = "Strong"; }
        else if (entropy > 50) { colorClass = 'bg-yellow-500'; textMsg = "Moderate"; }
        else if (entropy > 30) { colorClass = 'bg-orange-500'; textMsg = "Weak"; }

        if (password.length === 0) {
            colorClass = 'bg-gray-700';
            textMsg = "Start typing...";
        }

        entropyText.textContent = textMsg;
        entropyBar.className = `absolute bottom-0 left-0 h-1 transition-all duration-500 ${colorClass}`;
        entropyBar.style.width = password.length > 0 ? '100%' : '0%';

        // Update Cracking Times
        crackTimes.forEach((el, index) => {
            const rate = parseFloat(el.dataset.rate);
            const seconds = combinations / rate;
            el.textContent = formatTime(seconds);

            // Card coloring
            const card = hardwareCards[index];
            card.classList.remove('border-red-800', 'bg-red-900/20', 'border-yellow-800', 'bg-yellow-900/20', 'border-green-800', 'bg-green-900/20', 'border-gray-800', 'bg-gray-900');

            // Default gray
            let border = 'border-gray-800';
            let bg = 'bg-gray-900';

            if (password.length > 0) {
                if (seconds < 60) { // < 1 minute (Danger)
                    border = 'border-red-800';
                    bg = 'bg-red-900/20';
                } else if (seconds < 31536000) { // < 1 year (Weak)
                    border = 'border-yellow-800';
                    bg = 'bg-yellow-900/20';
                } else { // > 1 year (Good)
                    border = 'border-green-800';
                    bg = 'bg-green-900/20';
                }
            }

            card.className = `rounded-xl p-5 border hardware-card transition-colors duration-300 ${border} ${bg}`;
        });
    }

    // --- Listeners ---
    passwordInput.addEventListener('input', updateCalculations);
});
