import { test, expect } from '@playwright/test';

test.describe('Secure SDLC Interactive Guide', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/sdlc.html');
  });

  test('should render all 8 SDLC stages', async ({ page }) => {
    // There are 7 standard stages and 1 "loop" card
    const cards = page.locator('#infographic-container > div.bg-gray-800');
    await expect(cards).toHaveCount(8);

    // Verify first and last card titles
    await expect(cards.first()).toContainText('Training & Culture');
    await expect(cards.last()).toContainText('A Continuous Loop');
  });

  test('should open concept popover when a chip is clicked', async ({ page }) => {
    // Click the first concept button ("OWASP Top 10")
    const owaspButton = page.locator('button[data-concept-id="c1_1"]');
    await expect(owaspButton).toBeVisible();
    await owaspButton.click();

    // Verify popover appears
    const popover = page.locator('.concept-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('A critical resource listing the 10 most critical web application security risks.');

    // Click the close button inside the popover
    const closeBtn = popover.locator('.popover-close');
    await closeBtn.click();
    await expect(popover).not.toBeVisible(); // or check count = 0 class/DOM
  });

  test('should switch popovers automatically when a different concept is clicked', async ({ page }) => {
    // Find buttons
    const btn1 = page.locator('button[data-concept-id="c1_2"]'); // Security Training
    const btn2 = page.locator('button[data-concept-id="c2_1"]'); // Threat Modeling

    // Click first
    await btn1.click();
    const popover = page.locator('.concept-popover');
    await expect(popover).toContainText('Interactive platforms and workshops');

    // Click second
    await btn2.click();
    // Verify content switched smoothly
    await expect(popover).toContainText('A structured process to identify, quantify, and address');
    
    // There should still only be exactly 1 popover active
    await expect(popover).toHaveCount(1);
  });

  test('should close popover when clicking outside', async ({ page }) => {
    const btn = page.locator('button[data-concept-id="c3_1"]'); 
    await btn.click();

    const popover = page.locator('.concept-popover');
    await expect(popover).toBeVisible();

    // Click on the main header (which is outside the popover)
    await page.locator('header h1').click();
    
    // Assure popover is destroyed
    await expect(popover).toHaveCount(0);
  });

});
