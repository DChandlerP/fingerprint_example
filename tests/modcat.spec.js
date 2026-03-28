import { test, expect } from '@playwright/test';

test.describe('PRS MODCAT Decoder', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/modcat.html');
  });

  test('should decode the default example MODCAT on load', async ({ page }) => {
    // Check that the input has the expected default
    await expect(page.locator('#modcat-input')).toHaveValue('5MM2F-HVIB2_CC_NS-SK');

    // Result grid should be populated
    const results = page.locator('#results-grid > div');
    
    // specMap in modcat.js has 16 items
    await expect(results).toHaveCount(16);

    // Verify some text for the decoded parts
    const resultsText = await page.locator('#results-grid').textContent();
    expect(resultsText).toContain('Model');
    expect(resultsText).toContain('McCarty 594'); // "5M"
    expect(resultsText).toContain('Color');
    expect(resultsText).toContain('Custom Color'); // "CC"
  });

  test('should display an error when submitting an empty input', async ({ page }) => {
    const input = page.locator('#modcat-input');
    await input.fill('');

    // Trigger calculation
    const decodeBtn = page.locator('#decode-btn');
    await decodeBtn.click();

    // Check for error element and empty results
    await expect(page.locator('#modcat-error')).toHaveText('Please enter a MODCAT value.');
    await expect(page.locator('#results-grid > div')).toHaveCount(0);
  });

  test('should decode a new MODCAT successfully via enter key', async ({ page }) => {
    const input = page.locator('#modcat-input');
    // M3 is Studio model (from prsData.modelM3)
    await input.fill('M3M2F-HVI_BL_NS-SK'); 
    
    // Press Enter to trigger event listener
    await input.press('Enter');

    // Wait for the results to populate and check for Studio model
    await expect(page.locator('#results-grid > div')).toHaveCount(16);
    
    const resultsText = await page.locator('#results-grid').textContent();
    expect(resultsText).toContain('Studio');
  });

});
