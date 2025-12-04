document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Page-Specific Shamir Logic ---
    document.documentElement.classList.remove('invisible');

    const secretInput = document.getElementById('secret');
    const thresholdInput = document.getElementById('threshold');
    const totalSharesInput = document.getElementById('totalShares');
    const generateBtn = document.getElementById('generateBtn');
    const reconstructBtn = document.getElementById('reconstructBtn');
    const reconstructionResult = document.getElementById('reconstructionResult');
    const explanationLog = document.getElementById('explanationLog');
    const canvas = document.getElementById('polynomialCanvas');
    const ctx = canvas.getContext('2d');

    let state = { secret: null, coefficients: [], allShares: [], selectedShares: [], threshold: 0 };

    function generatePolynomial(secret, k) {
        const coeffs = [secret];
        for (let i = 1; i < k; i++) { coeffs.push(Math.floor(Math.random() * 21) - 10); }
        return coeffs;
    }

    function evaluatePolynomial(x, coeffs) {
        return coeffs.reduce((acc, coeff, i) => acc + coeff * Math.pow(x, i), 0);
    }

    function reconstructSecret(shares) {
        let sum = 0;
        for (let i = 0; i < shares.length; i++) {
            const xi = shares[i].x; const yi = shares[i].y;
            let product = 1;
            for (let j = 0; j < shares.length; j++) {
                if (i !== j) { const xj = shares[j].x; product *= xj / (xj - xi); }
            }
            sum += yi * product;
        }
        return Math.round(sum);
    }

    generateBtn.addEventListener('click', () => {
        const secret = parseInt(secretInput.value, 10);
        const k = parseInt(thresholdInput.value, 10);
        const n = parseInt(totalSharesInput.value, 10);
        if (isNaN(secret) || isNaN(k) || isNaN(n) || k < 2 || n < k) { alert('Please enter valid numbers. Ensure n >= k and k >= 2.'); return; }
        state.secret = secret; state.threshold = k; state.coefficients = generatePolynomial(secret, k); state.allShares = [];
        for (let i = 1; i <= n; i++) { state.allShares.push({ x: i, y: evaluatePolynomial(i, state.coefficients) }); }
        state.selectedShares = [];
        explanationLog.innerHTML = `<strong class="text-indigo-100">Generated!</strong> A random polynomial of degree <strong>${k - 1}</strong> was created. The secret (${secret}) is hidden as the y-intercept. Now, select at least <strong>${k}</strong> shares to try and find it.`;

        // Update threshold display
        const thresholdDisplay = document.getElementById('thresholdDisplay');
        if (thresholdDisplay) thresholdDisplay.textContent = k;

        updateUI();
    });

    reconstructBtn.addEventListener('click', () => {
        if (state.selectedShares.length < state.threshold) {
            reconstructionResult.textContent = `Need at least ${state.threshold} shares.`;
            reconstructionResult.className = 'mt-4 text-lg text-center font-bold p-3 rounded-lg bg-red-900/50 text-red-300';
            explanationLog.innerHTML = `<strong class="text-red-200">Failed.</strong> You only selected <strong>${state.selectedShares.length}</strong> shares, but the threshold is <strong>${state.threshold}</strong>. With too few points, the original curve cannot be uniquely determined, so the secret is safe!`;
            return;
        }
        const reconstructed = reconstructSecret(state.selectedShares);
        reconstructionResult.textContent = `Reconstructed Secret: ${reconstructed}`;
        const success = reconstructed === state.secret;
        reconstructionResult.className = `mt-4 text-lg text-center font-bold p-3 rounded-lg ${success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`;
        explanationLog.innerHTML = success ? `<strong class="text-green-200">Success!</strong> With <strong>${state.selectedShares.length}</strong> shares (which is >= k), you were able to perfectly reconstruct the original polynomial and find the secret at x=0.` : `<strong class="text-red-200">Error.</strong> Reconstruction failed. This can happen due to floating-point precision issues with large numbers.`;
    });

    function updateUI() {
        renderShares();
        drawCanvas();
        reconstructBtn.disabled = false;
        reconstructionResult.textContent = 'Result will be shown here.';
        reconstructionResult.className = 'mt-4 text-lg text-center font-bold p-3 rounded-lg bg-gray-700 text-gray-200';

        // Update status text
        const statusEl = document.getElementById('selectionStatus');
        if (statusEl) statusEl.textContent = `Selected: ${state.selectedShares.length}`;
    }

    function renderShares() {
        const container = document.getElementById('sharesContainer');
        if (!container) return;

        container.innerHTML = '';

        if (state.allShares.length === 0) {
            container.innerHTML = '<p class="col-span-full text-gray-500 text-sm text-center py-10">Generate a polynomial to see shares.</p>';
            return;
        }

        state.allShares.forEach(share => {
            const isSelected = state.selectedShares.find(s => s.x === share.x);
            const card = document.createElement('button');
            card.className = `flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${isSelected
                ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
                }`;

            card.innerHTML = `
                <span class="text-xs text-gray-400 mb-1">Share x=${share.x}</span>
                <span class="font-mono font-bold ${isSelected ? 'text-blue-300' : 'text-gray-200'}">${share.y}</span>
            `;

            card.addEventListener('click', () => toggleShare(share));
            container.appendChild(card);
        });
    }

    function toggleShare(share) {
        const index = state.selectedShares.findIndex(s => s.x === share.x);
        if (index === -1) {
            state.selectedShares.push(share);
        } else {
            state.selectedShares.splice(index, 1);
        }
        state.selectedShares.sort((a, b) => a.x - b.x);
        updateUI();
    }

    function drawCanvas() {
        const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect(); canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr);
        const width = rect.width; const height = rect.height; ctx.clearRect(0, 0, width, height);
        if (state.secret === null) return;
        const allPoints = [...state.allShares, { x: 0, y: state.secret }]; const xCoords = allPoints.map(p => p.x); const yCoords = allPoints.map(p => p.y);
        const xMin = Math.min(...xCoords) - 1; const xMax = Math.max(...xCoords) + 1; const yMin = Math.min(...yCoords); const yMax = Math.max(...yCoords);
        const yRange = yMax - yMin; const yPadding = yRange * 0.2 || 10; const view = { xMin, xMax, yMin: yMin - yPadding, yMax: yMax + yPadding };
        const mapX = (x) => (x - view.xMin) / (view.xMax - view.xMin) * width; const mapY = (y) => height - (y - view.yMin) / (view.yMax - view.yMin) * height;
        ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mapX(view.xMin), mapY(0)); ctx.lineTo(mapX(view.xMax), mapY(0)); ctx.moveTo(mapX(0), mapY(view.yMin)); ctx.lineTo(mapX(0), mapY(view.yMax)); ctx.stroke();
        if (state.coefficients.length > 0) {
            ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 2; ctx.beginPath();
            for (let px = 0; px < width; px++) { const x = (px / width) * (view.xMax - view.xMin) + view.xMin; const y = evaluatePolynomial(x, state.coefficients); if (px === 0) ctx.moveTo(mapX(x), mapY(y)); else ctx.lineTo(mapX(x), mapY(y)); }
            ctx.stroke();
        }
        const drawPoint = (x, y, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(mapX(x), mapY(y), 5, 0, Math.PI * 2); ctx.fill(); };
        const available = state.allShares.filter(s => !state.selectedShares.find(ss => ss.x === s.x));
        available.forEach(p => drawPoint(p.x, p.y, '#3b82f6')); state.selectedShares.forEach(p => drawPoint(p.x, p.y, '#22c55e')); drawPoint(0, state.secret, '#ef4444');
    }
    window.addEventListener('resize', drawCanvas);
    generateBtn.click();

}); // End DOMContentLoaded
