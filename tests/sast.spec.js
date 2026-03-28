import { test, expect } from '@playwright/test';

test.describe('SAST False Positives Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/sast.html');
  });

  test('should compute default statistical sampling size accurately', async ({ page }) => {
    // Defaults: Population 1000, 95% Confidence (Z=1.96), 5% Margin (0.05)
    const result = page.locator('#sample-size');
    await expect(result).toHaveText('278');
  });

  test('should update sample size calculation when inputs change', async ({ page }) => {
    const populationInput = page.locator('#population');
    const confidenceSelect = page.locator('#confidence');
    const marginSelect = page.locator('#margin');
    const result = page.locator('#sample-size');

    // Change population to 10000
    await populationInput.fill('10000');
    // For 10,000 at 95% conf and 5% margin, size is ~370
    await expect(result).toHaveText('370');

    // Change margin to 1% (0.01)
    await marginSelect.selectOption('0.01');
    // Wait for auto-calc
    const newText = await result.textContent();
    expect(parseInt(newText ?? '0')).toBeGreaterThan(1000); // Usually around 4899 for 95% at 1% MoE on 10k
  });

  // Not systematically testing the copy clipboard functionality directly natively in headless 
  // because it requires granting clipboard bypass permissions heavily inside playwright configs
  // and is notoriously flaky in CI. But we test basic math engine instead.
});
