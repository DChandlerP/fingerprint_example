import { test, expect } from '@playwright/test';

test.describe('FAIR Risk Scoring Guide Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/fair.html');
  });

  test('should load default calculation correctly', async ({ page }) => {
    // Default values: TEF=10, Vuln=50%, Primary=$25,000, Secondary=$75,000
    // LEF = 10 * 0.5 = 5.0
    // PLM = 25000 + 75000 = 100000
    // Risk = 5 * 100000 = 500,000

    await expect(page.locator('#result-lef')).toHaveText('LEF: 5.0 events/year');
    await expect(page.locator('#result-plm')).toHaveText('PLM: $100,000 per event');
    await expect(page.locator('#result-risk')).toHaveText('$500,000');
  });

  test('should update LEF and Risk dynamically when TEF changes', async ({ page }) => {
    // Change TEF to 20
    await page.locator('#tef').fill('20');
    
    // Vuln is still 50%, so new LEF = 20 * 0.5 = 10.0
    // Risk = 10 * 100000 = 1,000,000

    await expect(page.locator('#result-lef')).toHaveText('LEF: 10.0 events/year');
    await expect(page.locator('#result-risk')).toHaveText('$1,000,000');
  });

  test('should update PLM and Risk dynamically when losses change', async ({ page }) => {
    // Change Primary to 50000 and Secondary to 0
    await page.locator('#primary-loss').fill('50000');
    await page.locator('#secondary-loss').fill('0');

    // Default LEF is 5.0
    // New PLM = 50000
    // Risk = 5.0 * 50000 = $250,000

    await expect(page.locator('#result-plm')).toHaveText('PLM: $50,000 per event');
    await expect(page.locator('#result-risk')).toHaveText('$250,000');
  });

  test('should correctly parse slider data', async ({ page }) => {
    // Move the slider for vulnerability to 100%
    await page.locator('#vuln').fill('100');
    
    // Verify slider text updated
    await expect(page.locator('#vuln-value')).toHaveText('100%');

    // Default TEF is 10, Vuln is 100%, LEF = 10
    // Default PLM is 100k, Risk = 10 * 100k = 1,000,000
    await expect(page.locator('#result-lef')).toHaveText('LEF: 10.0 events/year');
    await expect(page.locator('#result-risk')).toHaveText('$1,000,000');
  });

});
