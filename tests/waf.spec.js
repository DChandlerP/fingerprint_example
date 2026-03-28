import { test, expect } from '@playwright/test';

test.describe('Google Cloud Armor WAF Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/waf.html');
  });

  test('should render rule selector buttons', async ({ page }) => {
    const buttons = page.locator('#rule-selector button');
    
    // Check that there are 5 OWASP rules rendered by default from waf.js array
    await expect(buttons).toHaveCount(5);
    
    // Check the first one is selected (has the ring-2 tracking via Tailwind)
    await expect(buttons.first()).toHaveClass(/ring-blue-500/);
    await expect(buttons.first()).toContainText('SQL Injection');
  });

  test('should update detail view when a new rule is selected', async ({ page }) => {
    const xssButton = page.locator('#rule-selector button').nth(1);
    
    // Ensure the default is SQLi text
    const title = page.locator('#rule-title');
    await expect(title).toHaveText('SQL Injection (SQLi)');
    
    // Click XSS button
    await xssButton.click();
    
    // Title should update
    await expect(title).toHaveText('Cross-Site Scripting (XSS)');
    
    // Function signature display should update
    const idDisplay = page.locator('#rule-id');
    await expect(idDisplay).toHaveText("evaluatePreconfiguredWaf('xss-v33-stable')");
    
    // Description text updates
    await expect(page.locator('#rule-desc')).toContainText('Blocks scripts injected into web pages');
  });

});
