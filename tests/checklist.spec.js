import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Security Checklist Generator', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the checklist page before each test
    await page.goto('/checklist.html');
  });

  test('should display warning if generated with no categories selected', async ({ page }) => {
    // Ensure no checkboxes are checked initially
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(0);

    // Click generate
    await page.locator('#generate-btn').click();

    // Verify warning message
    const outputText = page.locator('#checklist-output');
    await expect(outputText).toContainText('Please select at least one category to generate a checklist.');

    // Ensure buttons remain hidden
    await expect(page.locator('#copy-btn')).toBeHidden();
    await expect(page.locator('#download-btn')).toBeHidden();
  });

  test('should successfully generate checklist for a single category', async ({ page }) => {
    // Select 'Web Application / API' checkbox
    await page.locator('input[data-category="webApp"]').check();

    // Click generate
    await page.locator('#generate-btn').click();

    // Verify output section contains the category title
    const outputText = page.locator('#checklist-output');
    await expect(outputText).toContainText('Web Application / API Security');

    // Verify list items generated correctly
    const listItems = outputText.locator('li');
    await expect(listItems).toHaveCount(8); // Matches the 8 items defined in checklist.js for webApp

    // Verify action buttons are now visible
    await expect(page.locator('#copy-btn')).toBeVisible();
    await expect(page.locator('#download-btn')).toBeVisible();
  });

  test('should successfully generate combined checklist for multiple categories', async ({ page }) => {
    // Enable multiple categories
    await page.locator('input[data-category="cloud"]').check();
    await page.locator('input[data-category="dev"]').check();

    // Click generate
    await page.locator('#generate-btn').click();

    // Verify both headers exist
    const outputText = page.locator('#checklist-output');
    await expect(outputText).toContainText('Cloud Infrastructure Security');
    await expect(outputText).toContainText('Secure Development Lifecycle (SDLC)');

    // Verify combined list count
    // Cloud has 6 items, dev has 6 items
    const listItems = outputText.locator('li');
    await expect(listItems).toHaveCount(12);
  });

  test('should handle copy button click UI feedback', async ({ page, context }) => {
    // Grant clipboard permissions for copy testing
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.locator('input[data-category="mobileApp"]').check();
    await page.locator('#generate-btn').click();

    const copyBtn = page.locator('#copy-btn');
    await expect(copyBtn).toBeVisible();
    
    // Check initial text
    await expect(copyBtn).toContainText('Copy');

    // Click copy button
    await copyBtn.click();

    // Verify UI swaps to "Copied!"
    await expect(copyBtn).toContainText('Copied!');

    // Wait for the timeout to reset the button text (checklist.js uses 2000ms)
    // Fast-forwarding time reliably in Playwright can be tricky depending on the setup,
    // so we'll just wait explicitly for the text to return to "Copy".
    await expect(copyBtn).toContainText('Copy', { timeout: 3000 });
  });

  test('should trigger markdown download successfully', async ({ page }) => {
    await page.locator('input[data-category="containers"]').check();
    await page.locator('#generate-btn').click();

    const downloadBtn = page.locator('#download-btn');
    await expect(downloadBtn).toBeVisible();

    // Start waiting for the download event *before* clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click download
    await downloadBtn.click();

    // Wait for the download process to complete
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toBe('security-checklist.md');
    
    // Read downloaded file stream and verify content
    const path = await download.path();
    const content = fs.readFileSync(path, 'utf-8');

    // Verify markdown headers populated correctly
    expect(content).toContain('# Custom Security Checklist');
    expect(content).toContain('## Containerization Security');
    expect(content).toContain('* [ ] Use minimal, trusted base images from official repositories.');
  });

});
