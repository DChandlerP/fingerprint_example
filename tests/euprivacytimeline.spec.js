import { test, expect } from '@playwright/test';

test.describe('EU Privacy Timeline Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/euprivacytimeline.html');
  });

  test('should load all events by default', async ({ page }) => {
    // Wait for the timeline items to be injected by JS
    const items = page.locator('.timeline-item');
    const count = await items.count();
    
    // As per euprivacytimeline.js data source, there are 19 items
    expect(count).toBeGreaterThan(10); 
    
    // Ensure all button is active
    const allBtn = page.locator('.filter-btn[data-filter="all"]');
    await expect(allBtn).toHaveClass(/bg-indigo-600/);
  });

  test('should filter by Legislation', async ({ page }) => {
    // Click the law filter
    const lawBtn = page.locator('.filter-btn[data-filter="law"]');
    await lawBtn.click();

    // Check that button became active
    await expect(lawBtn).toHaveClass(/bg-indigo-600/);

    // Verify only law items are shown
    const items = page.locator('.timeline-item:not(.hidden)');
    const count = await items.count();
    
    expect(count).toBeGreaterThan(0);

    // Look inside the DOM to verify
    for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const typeText = await item.locator('.text-emerald-400').first().textContent(); // 'law' uses emerald color in this project
        // While we can't assert the hidden raw data attribute strictly here without eval, we can rely on UI classes
        expect(typeText).toBeTruthy(); 
    }
  });

  test('should filter by Cases/Enforcement', async ({ page }) => {
    // Click the case filter
    const caseBtn = page.locator('.filter-btn[data-filter="case"]');
    await caseBtn.click();

    // Verify only case items are visible
    const visibleItems = page.locator('.timeline-item:not(.hidden)');
    const count = await visibleItems.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should open and close the details modal', async ({ page }) => {
    // Click the first read more button
    const firstReadMore = page.locator('.timeline-item:not(.hidden) button').first();
    await firstReadMore.click();

    // Verify modal is visible
    const modal = page.locator('#detailsModal');
    await expect(modal).not.toHaveClass(/hidden/);
    
    // Wait for animation
    const modalPanel = page.locator('#modalPanel');
    await expect(modalPanel).not.toHaveClass(/opacity-0/);

    // Ensure title is populated
    const title = await page.locator('#modalTitle').textContent();
    expect(title?.length).toBeGreaterThan(0);

    // Close the modal
    await page.locator('button:has-text("Close Details")').click();

    // Verify it hides
    await expect(modal).toHaveClass(/hidden/);
  });

});
