import { test, expect } from '@playwright/test';

test.describe('SAST Remediation Subagent Component', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept the API fetches from sast_remediation.js
    await page.route('*/**/cwe/index.json', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { cwe: "111", name: "Mock Vuln One", owasp: "A1" },
              { cwe: "222", name: "Mock Vuln Two", owasp: "A2" },
            ])
        });
    });

    // Mock individual CWE requests
    await page.route('*/**/cwe/cwe-111.html', async (route) => {
        await route.fulfill({ status: 200, contentType: 'text/html', body: '<div id="mock-content-1">This is CWE 111</div>' });
    });
    
    await page.goto('/sast_remediation.html');
  });

  test('should fetch index.json and render CWE cards to the grid', async ({ page }) => {
    // Check loading complete
    const cards = page.locator('#cwe-card-grid > button.cwe-card');
    
    // We mocked the JSON to return 2 items
    await expect(cards).toHaveCount(2);

    // Validate card structural generation
    await expect(cards.nth(0)).toContainText('Mock Vuln One');
    await expect(cards.nth(1)).toContainText('Mock Vuln Two');
  });

  test('should open detail view when card is clicked, fetching and rendering specific HTML content', async ({ page }) => {
    const card = page.locator('#cwe-card-grid > button').nth(0);
    const detailView = page.locator('#cwe-detail-view');
    const displayGrid = page.locator('#cwe-card-grid');

    // Click the "Mock Vuln One" card
    await card.click();

    // Ensure it hid the grid and revealed the detail component
    await expect(displayGrid).toHaveClass(/hidden/);
    await expect(detailView).not.toHaveClass(/hidden/);

    // Verify injected DOM node from mocked HTML
    await expect(page.locator('#mock-content-1')).toContainText('This is CWE 111');
    
    // Assert Header is built properly inside the detail layout
    await expect(page.locator('#cwe-detail-header')).toContainText('Mock Vuln One');
    await expect(page.locator('#cwe-detail-header')).toContainText('CWE-111');
  });

  test('should properly filter grid cards via search bar', async ({ page }) => {
    const searchInput = page.locator('#cwe-search');
    const cards = page.locator('#cwe-card-grid > button');

    // Searching "Two" should remove card 1, leave card 2
    await searchInput.fill('Two');

    // We can't use toHaveCount(1) direct locator matches easily since display : none is used
    // But we can check visibility
    await expect(cards.nth(0)).not.toBeVisible();
    await expect(cards.nth(1)).toBeVisible();
  });

});
