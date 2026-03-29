import { test, expect } from '@playwright/test';

test.describe('Browser Fingerprinting Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/fingerprint.html');
  });

  test('should generate and display a unique visitor ID', async ({ page }) => {
    // Wait for the loading spinner to hide
    const loading = page.locator('#fp-loading');
    await expect(loading).toHaveClass(/hidden/); // It adds hidden class when done

    // The result section should be visible
    const result = page.locator('#fp-result');
    await expect(result).not.toHaveClass(/hidden/);

    // The ID should be populated with a string
    const idDisplay = page.locator('#fp-id');
    const idText = await idDisplay.textContent();
    expect(idText?.length).toBeGreaterThan(5); // Typical fingerprint is a long hash
  });

  test('should populate the data grid with hardware and browser info', async ({ page }) => {
    // Wait for resolution of fingerprint
    await expect(page.locator('#fp-result')).not.toHaveClass(/hidden/);

    // Check that cards are generated in the grid
    const cards = page.locator('#fp-grid > div');
    const count = await cards.count();
    
    // There are 12 data points defined in fingerprint.js
    expect(count).toBe(12);

    // Verify at least some content like 'Operating System' exists
    const gridText = await page.locator('#fp-grid').textContent();
    expect(gridText).toContain('Operating System');
    expect(gridText).toContain('Browser Engine');
  });

  test('should regenerate fingerprint when button is clicked', async ({ page }) => {
    // Ensure initial load finished
    await expect(page.locator('#fp-result')).not.toHaveClass(/hidden/);
    
    const initialId = await page.locator('#fp-id').textContent();

    // Click regenerate
    const reloadBtn = page.locator('#reload-fp');
    await reloadBtn.click();

    // Since it's the same browser context, the fingerprint ID should remain the same (that's the point of fingerprinting!)
    // But we can verify it at least ran the logic again successfully
    await expect(page.locator('#fp-result')).not.toHaveClass(/hidden/);
    const newId = await page.locator('#fp-id').textContent();
    expect(newId).toBe(initialId);
  });

});
