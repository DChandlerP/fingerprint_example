document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stringArtCanvas');
    const ctx = canvas.getContext('2d');

    // Get control elements
    const pointsSlider = document.getElementById('pointsSlider');
    const multiplierSlider = document.getElementById('multiplierSlider');
    const hueSlider = document.getElementById('hueSlider');
    const opacitySlider = document.getElementById('opacitySlider');
    const shapeSelect = document.getElementById('shapeSelect');
    const colorModeSelect = document.getElementById('colorModeSelect');
    const hueControlContainer = document.getElementById('hueControlContainer');

    // Get value display elements
    const pointsValue = document.getElementById('pointsValue');
    const multiplierValue = document.getElementById('multiplierValue');
    const hueValue = document.getElementById('hueValue');
    const opacityValue = document.getElementById('opacityValue');

    // Helper: Linear Interpolation
    const lerp = (a, b, t) => a + (b - a) * t;

    // Helper: Generate points for a shape
    function generatePoints(shape, numPoints, cx, cy, radius) {
        const points = [];
        const addPointsOnLine = (v1, v2, num) => {
            for (let i = 0; i < num; i++) {
                const t = num === 1 ? 0.5 : i / (num - 1);
                points.push({
                    x: lerp(v1.x, v2.x, t),
                    y: lerp(v1.y, v2.y, t)
                });
            }
        };

        switch (shape) {
            case 'circle':
                for (let i = 0; i < numPoints; i++) {
                    const angle = (i / numPoints) * 2 * Math.PI - Math.PI / 2;
                    points.push({
                        x: cx + radius * Math.cos(angle),
                        y: cy + radius * Math.sin(angle)
                    });
                }
                break;
            case 'oval':
                for (let i = 0; i < numPoints; i++) {
                    const angle = (i / numPoints) * 2 * Math.PI - Math.PI / 2;
                    points.push({
                        x: cx + (radius * 1.3) * Math.cos(angle), // Wider
                        y: cy + (radius * 0.8) * Math.sin(angle)  // Shorter
                    });
                }
                break;
            case 'square':
                const r = radius;
                const v = [
                    { x: cx - r, y: cy - r }, // Top-left
                    { x: cx + r, y: cy - r }, // Top-right
                    { x: cx + r, y: cy + r }, // Bottom-right
                    { x: cx - r, y: cy + r }  // Bottom-left
                ];
                const pps = Math.floor(numPoints / 4);
                addPointsOnLine(v[0], v[1], pps);
                addPointsOnLine(v[1], v[2], pps);
                addPointsOnLine(v[2], v[3], pps);
                addPointsOnLine(v[3], v[0], numPoints - (3 * pps)); // Remainder
                break;
            case 'triangle':
                const v_tri = [
                    { x: cx, y: cy - radius }, // Top
                    { x: cx + radius * 0.866, y: cy + radius * 0.5 }, // Bottom-right
                    { x: cx - radius * 0.866, y: cy + radius * 0.5 }  // Bottom-left
                ];
                const pps_tri = Math.floor(numPoints / 3);
                addPointsOnLine(v_tri[0], v_tri[1], pps_tri);
                addPointsOnLine(v_tri[1], v_tri[2], pps_tri);
                addPointsOnLine(v_tri[2], v_tri[0], numPoints - (2 * pps_tri)); // Remainder
                break;
        }
        return points;
    }

    // Main draw function
    function draw() {
        if (!ctx) return;

        // Get current values
        const numPoints = parseInt(pointsSlider.value);
        const multiplier = parseFloat(multiplierSlider.value);
        const baseHue = parseInt(hueSlider.value);
        const opacity = parseFloat(opacitySlider.value);
        const shape = shapeSelect.value;
        const colorMode = colorModeSelect.value;

        // Update display values
        pointsValue.textContent = numPoints;
        multiplierValue.textContent = multiplier.toFixed(1);
        hueValue.textContent = baseHue;
        opacityValue.textContent = opacity.toFixed(2);

        // Show/hide hue slider
        if (colorMode === 'single') {
            hueControlContainer.style.display = 'block';
        } else {
            hueControlContainer.style.display = 'none';
        }

        // Set canvas size
        const size = canvas.parentElement.clientWidth;
        canvas.width = size;
        canvas.height = size;

        // Clear canvas with background color
        ctx.fillStyle = 'rgb(17, 24, 39)'; // bg-gray-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.9;

        // Generate all points on the selected shape
        const points = generatePoints(shape, numPoints, centerX, centerY, radius);
        const actualNumPoints = points.length; // Use actual points generated

        if (actualNumPoints === 0) return;

        ctx.lineWidth = 1;

        // We must draw line by line to support changing colors
        for (let i = 0; i < actualNumPoints; i++) {
            const p1 = points[i];

            // Calculate the target point index
            const targetIndex = Math.floor(i * multiplier) % actualNumPoints;
            const p2 = points[targetIndex];

            // Calculate current line's hue
            let currentHue = 0;
            const progress = i / actualNumPoints;

            switch (colorMode) {
                case 'single':
                    currentHue = baseHue;
                    break;
                case 'spectrum':
                    currentHue = progress * 360;
                    break;
                case 'fire':
                    currentHue = 60 * progress; // 0 (Red) to 60 (Yellow)
                    break;
                case 'ocean':
                    currentHue = 160 + (80 * progress); // 160 (Green) to 240 (Blue)
                    break;
            }

            // Set line style for this specific line
            ctx.strokeStyle = `hsla(${currentHue}, 80%, 70%, ${opacity})`;

            // Draw the line
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    // --- Event Listeners ---

    // Redraw when any control is changed
    [pointsSlider, multiplierSlider, hueSlider, opacitySlider, shapeSelect, colorModeSelect].forEach(control => {
        control.addEventListener('input', draw);
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        // Debounce resize event
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw, 100);
    });

    // Initial draw
    // Add a small delay to ensure layout is fully settled
    setTimeout(draw, 50);
});
