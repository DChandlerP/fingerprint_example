import { test, expect } from '@playwright/test';

test.describe('Cyber Regulation Guide (US/EU) Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/regulation.html');
  });

  test('should render the EU Framework section and its key compliance cards', async ({ page }) => {
    const euSection = page.locator('h2', { hasText: 'The European Union (EU) Framework' });
    await expect(euSection).toBeVisible();

    // Verify presence of GDPR, ePrivacy, NIS2, CRA, AI Act
    const titles = [
        'General Data Protection Regulation (GDPR)',
        'ePrivacy Directive (and forthcoming Regulation)',
        'NIS2 Directive (Network and Information Systems 2)',
        'Cyber Resilience Act (CRA)',
        'EU AI Act',
        'Enforcement: Data Protection Authorities (DPAs)'
    ];

    for (const title of titles) {
        // Assert each sub-heading renders correctly with its text
        await expect(page.locator('h3', { hasText: title })).toBeVisible();
    }
  });

  test('should render the US Framework section and its key compliance cards', async ({ page }) => {
    const usSection = page.locator('h2', { hasText: 'The United States (US) Framework' });
    await expect(usSection).toBeVisible();

    const titles = [
        'California Consumer Privacy Act (CCPA / CPRA)',
        'HIPAA (Health Insurance Portability and Accountability Act)',
        'Sarbanes-Oxley Act (SOX)',
        'SEC & CISA Guidance'
    ];

    for (const title of titles) {
        await expect(page.locator('h3', { hasText: title })).toBeVisible();
    }
  });

});
