import { test, expect } from '@playwright/test';

test.describe('US Privacy Timeline Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/usprivacytimeline.html');
  });

  test('should render all timeline items on load', async ({ page }) => {
    // 14 items exist in the US dataset
    const items = page.locator('.timeline-item');
    await expect(items).toHaveCount(14);
  });

  test('should filter timeline items when buttons are clicked', async ({ page }) => {
    const items = page.locator('.timeline-item');

    // Click 'US Legislation'
    await page.locator('button[data-filter="law"]').click();
    // 8 laws (Privacy Act, FISA, ECPA, HIPAA, COPPA, Patriot, Freedom, CCPA)
    await expect(items).toHaveCount(8);

    // Click 'Court Cases'
    await page.locator('button[data-filter="case"]').click();
    // 6 court cases (Olmstead, Katz, Smith, Jones, Riley, Carpenter)
    await expect(items).toHaveCount(6);

    // Click 'All'
    await page.locator('button[data-filter="all"]').click();
    await expect(items).toHaveCount(14);
  });

  test('should open details modal with correct data', async ({ page }) => {
    // Look for Olmstead v US (ID 1), or any. Let's click the first 'View Details' button in the timeline.
    // Ensure the timeline rendered
    const firstButton = page.locator('.details-btn').first();
    await expect(firstButton).toBeVisible();
    await firstButton.click();

    // Verify modal becomes visible
    const modal = page.locator('#detailsModal');
    await expect(modal).not.toHaveClass(/hidden/);

    // It should have populated the title 
    const modalTitle = page.locator('#modalTitle');
    
    // The first one chronologically in the data is Olmstead v. United States (1928)
    await expect(modalTitle).toHaveText('Olmstead v. United States');
    await expect(page.locator('#modalYear')).toHaveText('1928');

    // Close Modal via top right X button
    await page.locator('button[onclick="closeModal()"]').first().click();

    // The modal should be hidden again 
    // It transitions with opacity timeout, so we wait for the hidden class to be applied
    await expect(modal).toHaveClass(/hidden/, { timeout: 1000 });
  });

});
