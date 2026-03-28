import { test, expect } from '@playwright/test';

test.describe('Cybersecurity Certification Roadmap Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/cyber_roadmap.html');
  });

  test('should load all certifications by default', async ({ page }) => {
    // Wait for the cert list to render
    const certs = page.locator('.cert-trigger');
    expect(await certs.count()).toBeGreaterThan(10); // There are roughly 20+

    // Check that none of them have the 'hidden' class by default
    for (let i = 0; i < await certs.count(); i++) {
        await expect(certs.nth(i)).not.toHaveClass(/hidden/);
    }
  });

  test('should filter correctly by vendor (CompTIA)', async ({ page }) => {
    // Click the CompTIA filter button
    await page.locator('#filter-container-vendor button[data-filter="comptia"]').click();

    // Check that CompTIA certs are visible and non-CompTIA are hidden
    const certs = page.locator('.cert-trigger');
    const count = await certs.count();

    for (let i = 0; i < count; i++) {
        const cert = certs.nth(i);
        const vendor = await cert.getAttribute('data-vendor');
        if (vendor === 'comptia') {
            await expect(cert).not.toHaveClass(/hidden/);
        } else {
            await expect(cert).toHaveClass(/hidden/);
        }
    }
  });

  test('should filter correctly by level (Advanced)', async ({ page }) => {
    // Click the Advanced filter button
    await page.locator('#filter-container-level button[data-filter="advanced"]').click();

    // Check that Advanced certs are visible and non-Advanced are hidden
    const certs = page.locator('.cert-trigger');
    const count = await certs.count();

    for (let i = 0; i < count; i++) {
        const cert = certs.nth(i);
        const level = await cert.getAttribute('data-level');
        if (level === 'advanced') {
            await expect(cert).not.toHaveClass(/hidden/);
        } else {
            await expect(cert).toHaveClass(/hidden/);
        }
    }
  });

  test('should filter correctly by DoD 8140 Role (511)', async ({ page }) => {
    // Select role 511 from dropdown
    await page.locator('#filter-role-select').selectOption('511');

    const certs = page.locator('.cert-trigger');
    const count = await certs.count();

    for (let i = 0; i < count; i++) {
        const cert = certs.nth(i);
        const rolesAttr = await cert.getAttribute('data-roles');
        const roles = rolesAttr ? rolesAttr.split(',').map(r => r.trim()) : [];
        
        if (roles.includes('511')) {
            await expect(cert).not.toHaveClass(/hidden/);
        } else {
            await expect(cert).toHaveClass(/hidden/);
        }
    }
  });

  test('should open cert details modal and close it successfully', async ({ page }) => {
    // Find CompTIA Security+ and click it
    const secPlus = page.locator('.cert-trigger[data-name="CompTIA Security+"]');
    await secPlus.click();

    // Verify modal appears and has the correct title
    const modal = page.locator('#modal-overlay');
    await expect(modal).not.toHaveClass(/hidden/);
    
    // Verify it populated the data attributes correctly
    await expect(page.locator('#modal-name')).toHaveText('CompTIA Security+');
    await expect(page.locator('#modal-price')).toContainText('$425');

    // Click the close button
    await page.locator('#modal-close-btn').click();

    // Verify modal hides
    await expect(modal).toHaveClass(/hidden/);
  });

  test('cross filtering using multiple filters works', async ({ page }) => {
    // Select Vendor 'GIAC' and Level 'Intermediate'
    await page.locator('#filter-container-vendor button[data-filter="giac"]').click();
    await page.locator('#filter-container-level button[data-filter="intermediate"]').click();

    const certs = page.locator('.cert-trigger');
    const count = await certs.count();

    let visibleCount = 0;
    for (let i = 0; i < count; i++) {
        const cert = certs.nth(i);
        const vendor = await cert.getAttribute('data-vendor');
        const level = await cert.getAttribute('data-level');
        const classes = await cert.getAttribute('class');

        if (vendor === 'giac' && level === 'intermediate') {
            expect(classes).not.toContain('hidden');
            visibleCount++;
        } else {
            expect(classes).toContain('hidden');
        }
    }
    
    // GIAC Security Essentials (GSEC) should be the only one visible, or at least 1
    expect(visibleCount).toBeGreaterThanOrEqual(1);
  });
});
