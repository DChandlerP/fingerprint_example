import CryptoJS from 'crypto-js';
import { JSEncrypt } from 'jsencrypt';
import { createIcons, FlaskConical, ShieldOff, Sparkles, Key, Hash, Waves, WifiOff, RouteOff, BrainCircuit, Dices } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Page-Specific Encryption Logic ---
    const getEl = (id) => document.getElementById(id);

    const cryptoSelect = getEl('crypto-select');
    const cryptoSections = document.querySelectorAll('.crypto-section');

    // AES Elements
    const aesPlaintext = getEl('aes-plaintext');
    const aesCiphertext = getEl('aes-ciphertext');
    const aesKey = getEl('aes-key');
    const aesEncryptBtn = getEl('aes-encrypt-btn');
    const aesDecryptBtn = getEl('aes-decrypt-btn');
    const aesDecryptedtext = getEl('aes-decryptedtext');
    const aesGenerateKeyBtn = getEl('aes-generate-key-btn');

    // RSA Elements
    const rsaGenerateBtn = getEl('rsa-generate-btn');
    const rsaPublicKey = getEl('rsa-public-key');
    const rsaPrivateKey = getEl('rsa-private-key');
    const rsaPlaintext = getEl('rsa-plaintext');
    const rsaCiphertext = getEl('rsa-ciphertext');
    const rsaEncryptBtn = getEl('rsa-encrypt-btn');
    const rsaDecryptBtn = getEl('rsa-decrypt-btn');
    const rsaResult = getEl('rsa-result');

    // Hashing Elements
    const hashInput = getEl('hash-input');
    const hashOutput = getEl('hash-output');
    const hashMd5Btn = getEl('hash-md5-btn');
    const hashSha1Btn = getEl('hash-sha1-btn');
    const hashSha256Btn = getEl('hash-sha256-btn');
    const hashSha512Btn = getEl('hash-sha512-btn');

    // Avalanche Elements
    const avalancheInput1 = getEl('avalanche-input1');
    const avalancheHash1 = getEl('avalanche-hash1');
    const avalancheInput2 = getEl('avalanche-input2');
    const avalancheHash2 = getEl('avalanche-hash2');

    // Digital Signature Elements
    const signMessage = getEl('sign-message');
    const signSignature = getEl('sign-signature');
    const signBtn = getEl('sign-btn');
    const verifyBtn = getEl('verify-btn');
    const verifyResult = getEl('verify-result');

    // Section Switching Logic
    cryptoSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        cryptoSections.forEach(section => {
            if (section.id === `${selectedValue}-section`) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    });

    // AES Functions
    const aesEncrypt = (text, key) => {
        try {
            const salt = CryptoJS.lib.WordArray.random(128 / 8);
            const key256 = CryptoJS.PBKDF2(key, salt, { keySize: 256 / 32, iterations: 1000 });
            const iv = CryptoJS.lib.WordArray.random(128 / 8);
            const encrypted = CryptoJS.AES.encrypt(text, key256, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
            return salt.toString() + "::" + iv.toString() + "::" + encrypted.toString();
        } catch (e) {
            console.error("AES Encryption Error:", e);
            return "Encryption failed.";
        }
    };

    const aesDecrypt = (transitmessage, key) => {
        try {
            const parts = transitmessage.split('::');
            if (parts.length !== 3) return "Decryption Failed: Invalid format.";
            const salt = CryptoJS.enc.Hex.parse(parts[0]);
            const iv = CryptoJS.enc.Hex.parse(parts[1]);
            const ciphertext = parts[2];
            const key256 = CryptoJS.PBKDF2(key, salt, { keySize: 256 / 32, iterations: 1000 });
            const decrypted = CryptoJS.AES.decrypt(ciphertext, key256, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            return decryptedText || 'Decryption Failed. Please check your key.';
        } catch (e) {
            console.error("AES Decryption Error:", e);
            return "Decryption failed. Ensure format is correct.";
        }
    };

    const generateAesKey = () => {
        const rawKey = CryptoJS.lib.WordArray.random(256 / 8);
        return CryptoJS.enc.Hex.stringify(rawKey);
    }

    // RSA Functions
    const rsaGenerateKeys = () => {
        const crypt = new JSEncrypt({ default_key_size: 2048 });
        rsaPublicKey.value = crypt.getPublicKey();
        rsaPrivateKey.value = crypt.getPrivateKey();
    };

    const rsaEncrypt = (text, publicKey) => {
        if (!publicKey) return "Please generate a key pair first.";
        const crypt = new JSEncrypt();
        crypt.setPublicKey(publicKey);
        const encrypted = crypt.encrypt(text);
        return encrypted || "Encryption failed. Message may be too long for RSA key size.";
    };

    const rsaDecrypt = (ciphertext, privateKey) => {
        if (!privateKey) return "Please generate a key pair first.";
        const crypt = new JSEncrypt();
        crypt.setPrivateKey(privateKey);
        const decrypted = crypt.decrypt(ciphertext);
        return decrypted || "Decryption failed. Check ciphertext and private key.";
    };

    // Hashing Functions
    const hash = (text, algo) => {
        return algo(text).toString();
    };

    // Avalanche Effect Logic
    const updateAvalanche = () => {
        const text1 = avalancheInput1.value;
        const text2 = avalancheInput2.value;
        const hash1 = CryptoJS.SHA256(text1).toString();
        const hash2 = CryptoJS.SHA256(text2).toString();

        avalancheHash1.textContent = hash1;

        let diffHtml = '';
        for (let i = 0; i < hash2.length; i++) {
            if (i >= hash1.length || hash1[i] !== hash2[i]) {
                diffHtml += `<span class="hash-diff">${hash2[i]}</span>`;
            } else {
                diffHtml += hash2[i];
            }
        }
        avalancheHash2.innerHTML = diffHtml;
    };

    // Digital Signature Functions
    const signMessageFunc = (message, privateKey) => {
        if (!privateKey) {
            alert("Please generate an RSA key pair in the RSA tab first.");
            return "";
        }
        const crypt = new JSEncrypt();
        crypt.setPrivateKey(privateKey);
        const signature = crypt.sign(message, CryptoJS.SHA256, "sha256");
        return signature || "Signing failed.";
    };

    const verifyMessageFunc = (message, signature, publicKey) => {
        if (!publicKey) return { valid: false, message: "Please generate an RSA key pair in the RSA tab first." };
        const crypt = new JSEncrypt();
        crypt.setPublicKey(publicKey);
        const isValid = crypt.verify(message, signature, CryptoJS.SHA256);
        return {
            valid: isValid,
            message: isValid ? "Signature is valid." : "Signature is INVALID."
        };
    };

    // Event Listeners (Page Specific)
    aesEncryptBtn.addEventListener('click', () => {
        const plaintext = aesPlaintext.value;
        const key = aesKey.value;
        if (plaintext && key) aesCiphertext.value = aesEncrypt(plaintext, key);
    });
    aesDecryptBtn.addEventListener('click', () => {
        const ciphertext = aesCiphertext.value;
        const key = aesKey.value;
        if (ciphertext && key) aesDecryptedtext.value = aesDecrypt(ciphertext, key);
    });
    aesGenerateKeyBtn.addEventListener('click', () => aesKey.value = generateAesKey());
    rsaGenerateBtn.addEventListener('click', rsaGenerateKeys);
    rsaEncryptBtn.addEventListener('click', () => rsaCiphertext.value = rsaEncrypt(rsaPlaintext.value, rsaPublicKey.value));
    rsaDecryptBtn.addEventListener('click', () => rsaResult.value = rsaDecrypt(rsaCiphertext.value, rsaPrivateKey.value));
    hashMd5Btn.addEventListener('click', () => hashOutput.value = hash(hashInput.value, CryptoJS.MD5));
    hashSha1Btn.addEventListener('click', () => hashOutput.value = hash(hashInput.value, CryptoJS.SHA1));
    hashSha256Btn.addEventListener('click', () => hashOutput.value = hash(hashInput.value, CryptoJS.SHA256));
    hashSha512Btn.addEventListener('click', () => hashOutput.value = hash(hashInput.value, CryptoJS.SHA512));
    avalancheInput1.addEventListener('input', updateAvalanche);
    avalancheInput2.addEventListener('input', updateAvalanche);
    signBtn.addEventListener('click', () => signSignature.value = signMessageFunc(signMessage.value, rsaPrivateKey.value));
    verifyBtn.addEventListener('click', () => {
        const result = verifyMessageFunc(signMessage.value, signSignature.value, rsaPublicKey.value);
        verifyResult.textContent = result.message;
        verifyResult.className = `p-4 rounded-md text-center font-bold ${result.valid ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`;
    });

    // Initial Calls
    updateAvalanche();

    // --- 2. Render Page Specific Icons ---
    createIcons({
        icons: {
            'playground-icon': FlaskConical,
            'shield-off-icon': ShieldOff,
            'future-icon': Sparkles,
            'des-icon': Key,
            'hash-icon': Hash,
            'rc4-icon': Waves,
            'ssl-icon': ShieldOff,
            'wep-icon': WifiOff,
            'pptp-icon': RouteOff,
            'quantum-icon': BrainCircuit,
            'prng-icon': Dices
        },
        attrs: { color: "#38bdf8", size: 24, strokeWidth: 2 }
    });

});
