import { test, expect } from '@playwright/test';

test.describe('Shamir Secret Sharing Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/shamir.html');
  });

  test('should generate default shares successfully on load (via auto-click)', async ({ page }) => {
    // The page auto-clicks generate on load
    const sharesDiv = page.locator('#sharesContainer > button');
    
    // By default totalShares is 6
    await expect(sharesDiv).toHaveCount(6);
    
    // Assert reconstruction button is enabled
    await expect(page.locator('#reconstructBtn')).toBeEnabled();
  });

  test('should toggle share selection', async ({ page }) => {
    const firstShare = page.locator('#sharesContainer > button').nth(0);
    const status = page.locator('#selectionStatus');

    // Verify starting state
    await expect(status).toHaveText('Selected: 0');
    await expect(firstShare).not.toHaveClass(/bg-blue-900/);

    // Select share
    await firstShare.click();
    await expect(status).toHaveText('Selected: 1');
    await expect(firstShare).toHaveClass(/bg-blue-900/);

    // Unselect share
    await firstShare.click();
    await expect(status).toHaveText('Selected: 0');
    await expect(firstShare).not.toHaveClass(/bg-blue-900/);
  });

  test('should fail reconstruction if insufficient shares are met', async ({ page }) => {
    // Select 2 shares (threshold is 3 initially)
    await page.locator('#sharesContainer > button').nth(0).click();
    await page.locator('#sharesContainer > button').nth(1).click();

    // Reconstruct
    await page.locator('#reconstructBtn').click();

    const result = page.locator('#reconstructionResult');
    await expect(result).toHaveText('Need at least 3 shares.');
    await expect(result).toHaveClass(/text-red-300/);
  });

  test('should accurately reconstruct the secret with enough shares', async ({ page }) => {
    // Start with clicking 4 shares to exceed threshold strictly safely
    const shares = page.locator('#sharesContainer > button');
    await shares.nth(0).click();
    await shares.nth(1).click();
    await shares.nth(4).click();

    // Reconstruct
    await page.locator('#reconstructBtn').click();

    const result = page.locator('#reconstructionResult');
    // Default secret is 150
    await expect(result).toHaveText('Reconstructed Secret: 150');
    await expect(result).toHaveClass(/text-green-300/);
  });

  test('should recalculate when inputs change', async ({ page }) => {
    await page.locator('#secret').fill('999');
    await page.locator('#threshold').fill('4');
    await page.locator('#totalShares').fill('8');

    await page.locator('#generateBtn').click();

    // Output visual update
    await expect(page.locator('#thresholdDisplay')).toHaveText('4');
    await expect(page.locator('#sharesContainer > button')).toHaveCount(8);

    // Select 4
    const shares = page.locator('#sharesContainer > button');
    for (let i = 0; i < 4; i++) {
        await shares.nth(i).click();
    }
    
    // Verify math still holds
    await page.locator('#reconstructBtn').click();
    await expect(page.locator('#reconstructionResult')).toHaveText('Reconstructed Secret: 999');
  });

});
