import { test, expect } from '@playwright/test';

test.describe('Interactive Threat Model Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/threatmodel.html');
  });

  test('should render Interactive Threat Model sections and comparison cards', async ({ page }) => {
    // Check main headings
    await expect(page.locator('h2').filter({ hasText: 'STRIDE Threat Model Example' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'PASTA Threat Model Example' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Choosing the Right Methodology' })).toBeVisible();

    // Verification of comparison links
    const methodologies = page.locator('.grid a, .grid > div.bg-gray-800');
    // Ensure all 6 comparison cards rendered
    await expect(methodologies).toHaveCount(6);
  });

  test('should display default message in the STRIDE diagram output area', async ({ page }) => {
    const outputArea = page.locator('#threat-output');
    
    // Assure empty state is present
    await expect(outputArea).toContainText('Click a diagram component to view its threats.');
    
    // There should be no specific threat type tags rendered yet
    const threatTag = outputArea.locator('.font-mono');
    await expect(threatTag).toHaveCount(0);
  });

  test('should display User threats when the User component is clicked in the SVG', async ({ page }) => {
    const userComponent = page.locator('g#user');
    const outputArea = page.locator('#threat-output');

    // Click SVG group
    await userComponent.click();

    // The output area updates
    await expect(outputArea).toContainText('Threats for: User');

    // Wait and check for specific threat cards spawned
    const threatTags = outputArea.locator('.bg-gray-800');
    // The threatData for user has 3 threats: Spoofing, Tampering, Repudiation
    await expect(threatTags).toHaveCount(3);
    
    // Validate one specific threat scenario string
    await expect(outputArea).toContainText('An attacker impersonates a legitimate user by stealing their credentials through a phishing attack');
  });

  test('should display Database threats when the Database component is clicked in the SVG', async ({ page }) => {
    const dbComponent = page.locator('g#database');
    const outputArea = page.locator('#threat-output');

    // Click DB group
    await dbComponent.click();

    await expect(outputArea).toContainText('Threats for: Database');

    // Has 3 threats as well
    const threatTags = outputArea.locator('.bg-gray-800');
    await expect(threatTags).toHaveCount(3);
    
    // Ensure that 'parameterized queries (prepared statements)' mitigation is displayed 
    await expect(outputArea).toContainText('Use parameterized queries (prepared statements) for all database interactions.');
  });

});
