import { test, expect } from '@playwright/test';

test.describe('Risk Scoring: Manual vs Automated Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/risk_scoring.html');
  });

  test('should render default "Legacy App" manual score correctly on load', async ({ page }) => {
    // The "Legacy" default has values: internal (10), none (0), ldap (20), unscanned (20), none (30) = 80
    const manualScore = page.locator('#manual-score-val');
    await expect(manualScore).toHaveText('80');
    // Ensure it's yellow (score < 120)
    await expect(manualScore).toHaveClass(/text-yellow-400/);
  });

  test('should update manual score dynamically as dropdowns are changed', async ({ page }) => {
    // Current is 80. Let's change Exposure from Internal (10) to External (50). Diff is +40. Total should be 120.
    await page.locator('#q-exposure').selectOption('external');
    
    const manualScore = page.locator('#manual-score-val');
    await expect(manualScore).toHaveText('120');
    // Score >= 120 should be red
    await expect(manualScore).toHaveClass(/text-red-400/);
  });

  test('should execute automated assessment and show gap analysis', async ({ page }) => {
    // The Auto score is blank initially
    const autoScore = page.locator('#auto-score-val');
    await expect(autoScore).toHaveText('--');

    // Click Run Assessment
    await page.locator('#run-scan-btn').click();

    // Since the simulation uses setTimeouts (~3000ms total for all 5 to render), wait for the delta box
    const deltaBox = page.locator('#result-delta');
    await expect(deltaBox).not.toHaveClass(/hidden/, { timeout: 6000 });

    // The automated score for Legacy scenario should be computed
    // external(50) + high(50) + none(60) + vuln(60) + none(30) = 250
    await expect(autoScore).toHaveText('250');
    
    // The Delta message should declare a risk gap (Underestimated by 170 points)
    const deltaTitle = page.locator('#delta-title');
    await expect(deltaTitle).toHaveText('Risk Gap Detected');
  });

  test('should reset simulation when scenario is changed', async ({ page }) => {
    // Run simulation first
    await page.locator('#run-scan-btn').click();
    await expect(page.locator('#result-delta')).not.toHaveClass(/hidden/, { timeout: 6000 });

    // Change scenario to "Modern Microservice"
    await page.locator('#scenario-select').selectOption('modern');

    // Delta should be hidden again
    await expect(page.locator('#result-delta')).toHaveClass(/hidden/);

    // Auto score should reset to --
    await expect(page.locator('#auto-score-val')).toHaveText('--');

    // Manual score should match Modern (internal(10) + high(50) + mtls(0) + scanned(0) + active(0) = 60)
    await expect(page.locator('#manual-score-val')).toHaveText('60');
  });

});
