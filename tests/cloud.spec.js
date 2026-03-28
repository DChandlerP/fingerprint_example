import { test, expect } from '@playwright/test';

test.describe('Cloud Misconfiguration Explorer', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/cloud.html');
  });

  test('should load the initial page and show the expected starting message', async ({ page }) => {
    // Assert the page title or header
    await expect(page.locator('h1')).toContainText('Interactive Cloud Misconfiguration Explorer');
    
    // Assert the initial message is visible and diagram container exists
    await expect(page.locator('#diagram-container')).toBeVisible();
    await expect(page.locator('#initial-message')).toBeVisible();
    await expect(page.locator('#initial-message')).toContainText('Click an interactive component');
    
    // The analysis content header shouldn't be populated yet
    await expect(page.locator('#analysis-content h4')).toHaveCount(0);
  });

  const components = [
    { id: '#component-igw', expectedTitle: 'Internet Gateway' },
    { id: '#component-sg', expectedTitle: 'Security Group' },
    { id: '#component-s3', expectedTitle: 'S3 Bucket' },
    { id: '#component-iam', expectedTitle: 'IAM Role' },
    { id: '#component-ec2', expectedTitle: 'EC2 Instance' }
  ];

  for (const { id, expectedTitle } of components) {
    test(`should display correctly when clicking the ${expectedTitle} component`, async ({ page }) => {
      const component = page.locator(id);
      
      // Click the SVG component
      await component.click();
      
      // The initial message should now be missing from the DOM entirely due to innerHTML override
      await expect(page.locator('#initial-message')).toHaveCount(0);

      // The analysis content should be updated with the right title
      await expect(page.locator('#analysis-content h4')).toHaveText(expectedTitle);
      
      // Ensure the clicked component has the 'active' class
      await expect(component).toHaveClass(/active/);
    });
  }

  test('should remove active class from previously clicked elements', async ({ page }) => {
    const s3Component = page.locator('#component-s3');
    const iamComponent = page.locator('#component-iam');

    // Click S3 first
    await s3Component.click();
    await expect(s3Component).toHaveClass(/active/);
    await expect(page.locator('#analysis-content h4')).toHaveText('S3 Bucket');

    // Click IAM next
    await iamComponent.click();
    await expect(iamComponent).toHaveClass(/active/);
    await expect(page.locator('#analysis-content h4')).toHaveText('IAM Role');

    // S3 should no longer have the active class
    await expect(s3Component).not.toHaveClass(/active/);
  });
});
