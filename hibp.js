import CryptoJS from 'crypto-js';
import { createIcons, Eye, EyeOff, Lock, ShieldCheck, ShieldAlert, Server, Hash } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const toggleBtn = document.getElementById('toggle-visibility');
    const iconEye = document.getElementById('icon-eye');
    const vizArea = document.getElementById('visualization-area');

    const hashPrefixEl = document.getElementById('hash-prefix');
    const hashSuffixEl = document.getElementById('hash-suffix');
    const apiPrefixEl = document.getElementById('api-prefix');

    const resultCard = document.getElementById('result-card');
    const resultTitle = document.getElementById('result-title');
    const resultDesc = document.getElementById('result-desc');
    const resultIcon = document.getElementById('result-icon');
    const resultCount = document.getElementById('result-count');

    let debounceTimer;

    function resetUI() {
        vizArea.classList.add('opacity-50');
        hashPrefixEl.textContent = '-----';
        hashSuffixEl.textContent = '-----------------------------------';
        apiPrefixEl.textContent = '-----';
        resultCard.classList.add('hidden');
    }

    function updateVisualization(prefix, suffix) {
        vizArea.classList.remove('opacity-50');
        hashPrefixEl.textContent = prefix;
        hashSuffixEl.textContent = suffix;
        apiPrefixEl.textContent = prefix;
    }

    function processInput() {
        const password = passwordInput.value;

        if (!password) {
            resetUI();
            return;
        }

        const sha1Hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
        const prefix = sha1Hash.substring(0, 5);
        const suffix = sha1Hash.substring(5);

        updateVisualization(prefix, suffix);

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => checkBreach(prefix, suffix), 500);
    }

    async function checkBreach(prefix, suffix) {
        resultCard.className = 'hidden p-8 rounded-xl border-2 text-center transition-all duration-500';

        try {
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            if (!response.ok) throw new Error('API Error');

            const text = await response.text();
            const regex = new RegExp(`^${suffix}:([0-9]+)`, 'm');
            const match = text.match(regex);

            resultCard.classList.remove('hidden');

            if (match) {
                const count = parseInt(match[1]).toLocaleString();
                showResult(
                    'Oh no — pwned!',
                    `This password has appeared in <strong>${count}</strong> known data breaches. You should never use this password.`,
                    'border-red-500 bg-red-900/20',
                    'text-red-400',
                    'shield-alert',
                    `Found ${count} times`
                );
            } else {
                showResult(
                    'Good news — no pwnage found!',
                    'This password was not found in the database of breached passwords.',
                    'border-emerald-500 bg-emerald-900/20',
                    'text-emerald-400',
                    'shield-check',
                    '0 matches found'
                );
            }

        } catch (error) {
            console.error(error);
            resultCard.classList.remove('hidden');
            showResult('Error', 'Could not reach the Pwned Passwords API.', 'border-gray-700 bg-gray-800', 'text-gray-400', 'server', 'Network Error');
        }
    }

    function showResult(title, desc, borderClass, textClass, iconName, countText) {
        resultCard.className = `p-8 rounded-xl border-2 text-center transition-all duration-500 ${borderClass}`;
        resultTitle.textContent = title;
        resultTitle.className = `text-3xl font-bold mb-2 ${textClass}`;
        resultDesc.innerHTML = desc;
        resultCount.textContent = countText;

        resultIcon.innerHTML = `<i data-lucide="${iconName}" class="w-12 h-12 ${textClass}"></i>`;
        createIcons({ icons: { ShieldCheck, ShieldAlert, Server }, nameAttr: 'data-lucide' });
    }

    function toggleVisibility() {
        const isVisible = passwordInput.type === 'text';
        passwordInput.type = isVisible ? 'password' : 'text';
        iconEye.innerHTML = `<i data-lucide="${isVisible ? 'eye' : 'eye-off'}" class="w-6 h-6"></i>`;
        createIcons({ icons: { Eye, EyeOff }, nameAttr: 'data-lucide' });
    }

    function initialize() {
        passwordInput.addEventListener('input', processInput);
        toggleBtn.addEventListener('click', toggleVisibility);

        iconEye.innerHTML = '<i data-lucide="eye" class="w-6 h-6"></i>';
        document.getElementById('icon-lock').innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i>';

        createIcons({
            icons: { Eye, EyeOff, Lock, Hash },
            nameAttr: 'data-lucide'
        });
    }

    initialize();
});
