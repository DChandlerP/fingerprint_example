import { test, expect } from '@playwright/test';

test.describe('JWT Decoder Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/jwt.html');
  });

  test('should decode the default example JWT on load', async ({ page }) => {
    // Check header table for generic values
    const headerTable = await page.locator('#header-output-table').textContent();
    expect(headerTable).toContain('alg');
    expect(headerTable).toContain('"HS256"');

    // Check payload table for user info
    const payloadTable = await page.locator('#payload-output-table').textContent();
    expect(payloadTable).toContain('Chandler Prince');
    expect(payloadTable).toContain('admin');
  });

  test('should toggle between Table and JSON views', async ({ page }) => {
    const tableBtn = page.locator('#payload-table-btn');
    const jsonBtn = page.locator('#payload-json-btn');
    const tableDiv = page.locator('#payload-output-table');
    const jsonPre = page.locator('#payload-output-json');

    // Initially Table is visible, JSON is hidden
    await expect(jsonPre).toHaveClass(/hidden/);
    await expect(tableDiv).not.toHaveClass(/hidden/);

    // Click JSON
    await jsonBtn.click();
    await expect(tableDiv).toHaveClass(/hidden/);
    await expect(jsonPre).not.toHaveClass(/hidden/);

    // Verify JSON content has the payload
    const jsonContent = await jsonPre.textContent();
    expect(jsonContent).toContain('"name": "Chandler Prince"');

    // Click Table back
    await tableBtn.click();
    await expect(jsonPre).toHaveClass(/hidden/);
    await expect(tableDiv).not.toHaveClass(/hidden/);
  });

  test('should display error message for invalid JWT structure', async ({ page }) => {
    // Enter an invalid JWT
    const jwtInput = page.locator('#jwt-input');
    await jwtInput.fill('invalid.token.here.extra');

    const errorEl = page.locator('#jwt-error');
    await expect(errorEl).not.toHaveClass(/hidden/);
    await expect(errorEl).toHaveText('Invalid JWT structure. A JWT must have three parts separated by dots.');
  });

  test('should clear inputs using the clear button', async ({ page }) => {
    const clearBtn = page.locator('#clear-jwt-btn');
    await clearBtn.click();

    // Input should be empty
    const jwtInput = page.locator('#jwt-input');
    await expect(jwtInput).toBeEmpty();

    // Outputs should be empty
    await expect(page.locator('#header-output-table')).toBeEmpty();
    await expect(page.locator('#payload-output-table')).toBeEmpty();
  });

  test('should verify signature successfully when correct secret is provided', async ({ page }) => {
    const secretInput = page.locator('#secret-input');
    
    // The example JWT in jwt.js was signed with a specific secret. Notice we don't know the exact secret word naturally in tests unless we inspect your other code, but we can verify how the UI behaves.
    // Instead of guessing the default, let's inject a newly forged JWT signed with standard HS256 for test.
    // This is a valid token signed with 'secret123' (HS256)
    // Header: {"alg":"HS256","typ":"JWT"}
    // Payload: {"sub":"123"}
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.xaPX301k_07JVMe88KxqPyCWKHES90zKzQyQjdghOTI';

    await page.locator('#jwt-input').fill(testToken);
    
    // Input incorrect secret
    await secretInput.fill('wrong_secret');
    await expect(page.locator('#signature-result')).toContainText('Signature Invalid');
    await expect(page.locator('#signature-result')).toHaveClass(/text-red-400/);

    // Input correct secret
    await secretInput.fill('secret123');
    await expect(page.locator('#signature-result')).toContainText('Signature Valid');
    await expect(page.locator('#signature-result')).toHaveClass(/text-green-400/);
  });
});
