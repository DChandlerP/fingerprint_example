import { createIcons, Info, BookOpen, ShieldAlert, X, ShieldCheck, ShieldX } from 'lucide';

// --- JWT UTILITY FUNCTIONS & DOM ELEMENTS ---
const getEl = (id) => document.getElementById(id);
const jwtInput = getEl('jwt-input');
const jwtPartsEl = getEl('jwt-parts');
const jwtErrorEl = getEl('jwt-error');
const headerTable = getEl('header-output-table');
const headerJson = getEl('header-output-json');
const payloadTable = getEl('payload-output-table');
const payloadJson = getEl('payload-output-json');
const secretInput = getEl('secret-input');
const signatureResultEl = getEl('signature-result');

// --- JWT STATE ---
let isSecretBase64 = false;

// --- JWT CONSTANTS ---
const exampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHwxMjM0NTY3ODkwIiwibmFtZSI6IkNoYW5kbGVyIFByaW5jZSIsImFkbWluIjp0cnVlLCJpYXQiOjE3MjU3Mjc2ODB9.M-22A_zHk1k-tJt2x932XQyRDYwJkU-x2bO_s6Y6s2g';

// --- JWT CORE LOGIC ---
function b64UrlDecode(str) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0: break;
        case 2: output += '=='; break;
        case 3: output += '='; break;
        default: throw 'Illegal base64url string!';
    }
    return decodeURIComponent(atob(output).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}

function createClaimsTable(data, parentEl) {
    parentEl.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'w-full text-left border-collapse';
    const tbody = document.createElement('tbody');
    Object.entries(data).forEach(([key, value]) => {
        const row = tbody.insertRow();
        const keyCell = row.insertCell();
        const valCell = row.insertCell();
        keyCell.className = 'py-2 px-3 border-b border-gray-700 text-gray-400 align-top';
        valCell.className = 'py-2 px-3 border-b border-gray-700 font-mono break-all';
        keyCell.textContent = key;
        if (['iat', 'exp', 'nbf'].includes(key) && typeof value === 'number') {
            valCell.textContent = `${value} (${new Date(value * 1000).toUTCString()})`;
        } else {
            valCell.textContent = JSON.stringify(value);
        }
    });
    table.appendChild(tbody);
    parentEl.appendChild(table);
}

function copyToClipboard(text, buttonId) {
    if (!text) return;
    // Use execCommand for broader compatibility in restricted environments
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);

        const button = getEl(buttonId);
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('text-green-400');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('text-green-400');
            }, 2000);
        }
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

async function verifySignature(encodedHeader, encodedPayload, signature, secret, useBase64) {
    if (!secret) {
        signatureResultEl.innerHTML = '';
        return;
    }
    try {
        const secretKey = useBase64 ? b64UrlDecode(secret) : secret;
        const keyData = new TextEncoder().encode(secretKey);
        const key = await crypto.subtle.importKey(
            'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        );

        const dataToSign = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataToSign);

        let base64UrlSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        if (base64UrlSignature === signature) {
            signatureResultEl.innerHTML = `<span id="valid-sig-icon" class="mr-2"></span> Signature Valid`;
            signatureResultEl.className = 'mt-4 text-sm font-semibold flex items-center text-green-400';
            createIcons({ icons: { 'valid-sig-icon': ShieldCheck }, attrs: { color: "#4ade80", size: 20 } });
        } else {
            signatureResultEl.innerHTML = `<span id="invalid-sig-icon" class="mr-2"></span> Signature Invalid`;
            signatureResultEl.className = 'mt-4 text-sm font-semibold flex items-center text-red-400';
            createIcons({ icons: { 'invalid-sig-icon': ShieldX }, attrs: { color: "#f87171", size: 20 } });
        }
    } catch (e) {
        console.error("Signature verification failed:", e);
        signatureResultEl.innerHTML = `<span id="error-sig-icon" class="mr-2"></span> Verification Error`;
        signatureResultEl.className = 'mt-4 text-sm font-semibold flex items-center text-red-400';
        createIcons({ icons: { 'error-sig-icon': ShieldX }, attrs: { color: "#f87171", size: 20 } });
    }
}

// --- MAIN DECODE FUNCTION ---
function decodeJwt() {
    const token = jwtInput.value;
    if (!token.trim()) {
        jwtPartsEl.innerHTML = '';
        headerTable.innerHTML = '';
        payloadTable.innerHTML = '';
        headerJson.textContent = '';
        payloadJson.textContent = '';
        signatureResultEl.innerHTML = '';
        jwtErrorEl.classList.add('hidden');
        return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        jwtErrorEl.textContent = 'Invalid JWT structure. A JWT must have three parts separated by dots.';
        jwtErrorEl.classList.remove('hidden');
        jwtPartsEl.innerHTML = '';
        return;
    }

    jwtErrorEl.classList.add('hidden');
    const [encodedHeader, encodedPayload, signature] = parts;

    jwtPartsEl.innerHTML = `<span class="jwt-part-header">${encodedHeader}</span>.<span class="jwt-part-payload">${encodedPayload}</span>.<span class="jwt-part-signature">${signature}</span>`;

    try {
        const header = JSON.parse(b64UrlDecode(encodedHeader));
        const payload = JSON.parse(b64UrlDecode(encodedPayload));

        headerJson.textContent = JSON.stringify(header, null, 2);
        createClaimsTable(header, headerTable);
        payloadJson.textContent = JSON.stringify(payload, null, 2);
        createClaimsTable(payload, payloadTable);

        verifySignature(encodedHeader, encodedPayload, signature, secretInput.value, isSecretBase64);
    } catch (e) {
        jwtErrorEl.textContent = 'Failed to decode Base64Url or parse JSON. Check token formatting.';
        jwtErrorEl.classList.remove('hidden');
        console.error(e);
    }
}

// --- EVENT LISTENERS & SETUP ---
jwtInput.addEventListener('input', decodeJwt);
secretInput.addEventListener('input', decodeJwt);

// View Toggles
function setupViewToggle(tableBtnId, jsonBtnId, tableId, jsonId) {
    const tableBtn = getEl(tableBtnId);
    const jsonBtn = getEl(jsonBtnId);
    const table = getEl(tableId);
    const json = getEl(jsonId);

    tableBtn.addEventListener('click', () => {
        table.classList.remove('hidden');
        json.classList.add('hidden');
        tableBtn.classList.replace('view-toggle-inactive', 'view-toggle-active');
        jsonBtn.classList.replace('view-toggle-active', 'view-toggle-inactive');
    });
    jsonBtn.addEventListener('click', () => {
        json.classList.remove('hidden');
        table.classList.add('hidden');
        jsonBtn.classList.replace('view-toggle-inactive', 'view-toggle-active');
        tableBtn.classList.replace('view-toggle-active', 'view-toggle-inactive');
    });
}

// Secret encoding toggle
const utf8Btn = getEl('secret-utf8-btn');
const b64Btn = getEl('secret-b64-btn');
utf8Btn.addEventListener('click', () => {
    isSecretBase64 = false;
    utf8Btn.classList.replace('view-toggle-inactive', 'view-toggle-active');
    b64Btn.classList.replace('view-toggle-active', 'view-toggle-inactive');
    decodeJwt();
});
b64Btn.addEventListener('click', () => {
    isSecretBase64 = true;
    b64Btn.classList.replace('view-toggle-inactive', 'view-toggle-active');
    utf8Btn.classList.replace('view-toggle-active', 'view-toggle-inactive');
    decodeJwt();
});

// Button listeners
getEl('copy-header-btn').addEventListener('click', () => copyToClipboard(headerJson.textContent, 'copy-header-btn'));
getEl('copy-payload-btn').addEventListener('click', () => copyToClipboard(payloadJson.textContent, 'copy-payload-btn'));
getEl('copy-secret-btn').addEventListener('click', () => copyToClipboard(secretInput.value, 'copy-secret-btn'));
getEl('clear-secret-btn').addEventListener('click', () => {
    secretInput.value = '';
    decodeJwt();
});
getEl('clear-jwt-btn').addEventListener('click', () => {
    jwtInput.value = '';
    decodeJwt();
});

// --- INITIALIZATION (Combined) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Run JWT Page Logic ---
    setupViewToggle('header-table-btn', 'header-json-btn', 'header-output-table', 'header-output-json');
    setupViewToggle('payload-table-btn', 'payload-json-btn', 'payload-output-table', 'payload-output-json');

    jwtInput.value = exampleJwt;
    decodeJwt();

    // --- 2. Render Page-Specific Icons ---
    createIcons({
        icons: {
            'info-icon': Info,
            'tutorial-icon': BookOpen,
            'warning-icon': ShieldAlert,
            'clear-jwt-icon': X
        },
        attrs: { color: "#38bdf8", size: 24, strokeWidth: 2 } // Default color blue
    });

    // --- 3. Run JWT Icon Color Overrides ---
    // Override colors for *specific* page icons (not nav icons)
    const infoIcon = getEl('info-icon');
    if (infoIcon) infoIcon.setAttribute('color', '#38bdf8');
    const tutorialIcon = getEl('tutorial-icon');
    if (tutorialIcon) tutorialIcon.setAttribute('color', '#38bdf8');
    const warningIcon = getEl('warning-icon');
    if (warningIcon) warningIcon.setAttribute('color', '#facc15'); // Set warning to yellow
    const clearJwtIcon = getEl('clear-jwt-icon');
    if (clearJwtIcon) {
        clearJwtIcon.setAttribute('color', '#f87171'); // Set clear to red
        clearJwtIcon.setAttribute('size', 16);
    }
});
