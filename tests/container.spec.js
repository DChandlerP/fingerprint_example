import { test, expect } from '@playwright/test';

test.describe('Container Security Primer Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the container page
    await page.goto('/container.html');
  });

  test('should load the page and display the main header', async ({ page }) => {
    // Check the main header text
    const header = page.locator('h1');
    await expect(header).toHaveText('Container Security Primer');
    
    // Check the sub-header text
    const p = page.locator('header p');
    await expect(p).toContainText('Moving beyond "scan your images."');
  });

  test('should display all main structural sections', async ({ page }) => {
    // Ensure all 4 core sections are properly rendered in the DOM
    await expect(page.locator('h2', { hasText: 'The Mechanics of Isolation' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Anatomy of a Breakout' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'The Dockerfile Rules' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Supply Chain & The "Golden" Pipeline' })).toBeVisible();
  });

  test('should display the anatomy of a breakout vulnerabilities', async ({ page }) => {
    // Verify specific breakout cards are present
    await expect(page.locator('h3', { hasText: 'The "Privileged" Flag' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'The Docker Socket' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Leaky Vessels' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Capabilities' })).toBeVisible();
  });

  test('should display Dockerfile Rule comparisons (BAD vs GOOD)', async ({ page }) => {
    // Look for bad/good rule spans
    const badLabels = page.locator('span', { hasText: 'BAD:' });
    const goodLabels = page.locator('span', { hasText: 'GOOD:' });
    
    // There should be exactly 6 rules with BAD/GOOD variants
    await expect(badLabels).toHaveCount(6);
    await expect(goodLabels).toHaveCount(6);
  });

});
