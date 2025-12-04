document.addEventListener('DOMContentLoaded', () => {
    // Get all the DOM elements
    const tefInput = document.getElementById('tef');
    const vulnSlider = document.getElementById('vuln');
    const vulnValue = document.getElementById('vuln-value');
    const primaryLossInput = document.getElementById('primary-loss');
    const secondaryLossInput = document.getElementById('secondary-loss');

    const lefResult = document.getElementById('result-lef');
    const plmResult = document.getElementById('result-plm');
    const riskResult = document.getElementById('result-risk');

    // Function to format numbers as currency
    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    }

    // Main calculation function
    function calculateRisk() {
        // 1. Get values from inputs
        const tef = parseFloat(tefInput.value) || 0;
        const vuln = parseFloat(vulnSlider.value) || 0;
        const primaryLoss = parseFloat(primaryLossInput.value) || 0;
        const secondaryLoss = parseFloat(secondaryLossInput.value) || 0;

        // 2. Perform FAIR calculations
        // Loss Event Frequency = Threat Event Frequency * Vulnerability
        const lef = tef * (vuln / 100);

        // Probable Loss Magnitude = Primary Loss + Secondary Loss
        const plm = primaryLoss + secondaryLoss;

        // Annualized Risk (or Annualized Loss Expectancy - ALE) = LEF * PLM
        const risk = lef * plm;

        // 3. Update the UI
        // Update slider value text
        vulnValue.textContent = `${vuln.toFixed(0)}%`;

        // Update results display
        lefResult.textContent = `LEF: ${lef.toFixed(1)} events/year`;
        plmResult.textContent = `PLM: ${formatCurrency(plm)} per event`;
        riskResult.textContent = formatCurrency(risk);
    }

    // Add event listeners to all inputs
    const inputs = [tefInput, vulnSlider, primaryLossInput, secondaryLossInput];
    inputs.forEach(input => {
        input.addEventListener('input', calculateRisk);
    });

    // Run the calculation on initial page load
    calculateRisk();
});
