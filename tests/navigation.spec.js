import { test, expect } from '@playwright/test';

const DROPDOWNS = {
  'Guides & Case Studies': [
    { name: 'Cloud', href: 'cloud.html' },
    { name: 'Container Security', href: 'container.html' },
    { name: 'Cyber Roadmap', href: 'cyber_roadmap.html' },
    { name: 'FAIR Risk Scoring', href: 'fair.html' },
    { name: 'Google Cloud Armor WAF', href: 'waf.html' },
    { name: 'Phishing', href: 'phishing.html' },
    { name: 'SAST', href: 'sast.html', exact: true },
    { name: 'SAST Remediation', href: 'sast_remediation.html' },
    { name: 'Secure SDLC', href: 'sdlc.html' },
    { name: 'Threat Model', href: 'threatmodel.html' }
  ],
  'Law & Regulations': [
    { name: 'Regulation (US/EU)', href: 'regulation.html' },
    { name: 'CIPP/US Quiz (By Topic)', href: 'quiz.html' },
    { name: 'CIPP US Practice Exam', href: 'cipp_us_practice_exam.html' },
    { name: 'CIPP/US Flashcards', href: 'cipp_flashcards.html' },
    { name: 'EU Privacy Timeline', href: 'euprivacytimeline.html' },
    { name: 'US Privacy Timeline', href: 'usprivacytimeline.html' }
  ],
  'Tools & Demos': [
    { name: 'Checklist', href: 'checklist.html' },
    { name: 'CISA KEV Explorer', href: 'kev.html' },
    { name: 'CVSS vs EPSS', href: 'epssdemo.html' },
    { name: 'Encryption', href: 'encryption.html' },
    { name: 'Fingerprinting', href: 'fingerprint.html' },
    { name: 'JWT Decoder', href: 'jwt.html' },
    { name: 'Password Cracker', href: 'password_cracker.html' },
    { name: 'PRS MODCAT', href: 'modcat.html' },
    { name: 'Risk Scoring', href: 'risk_scoring.html' },
    { name: 'Shamir\'s Visualizer', href: 'shamir.html' },
    { name: 'String Art', href: 'string.html' },
    { name: 'Threat Intel', href: 'dashboard.html' }
  ]
};

test.describe('Navigation Bar Verification', () => {

  test('should render the navigation bar properly on index.html', async ({ page }) => {
    await page.goto('/index.html');
    
    // Verify Home link
    const homeLink = page.locator('nav a', { hasText: 'Home' });
    await expect(homeLink).toBeVisible();

    // Verify Dropdown buttons are visible
    for (const dropdownName of Object.keys(DROPDOWNS)) {
      const dropdownBtn = page.locator('nav button', { hasText: dropdownName });
      await expect(dropdownBtn).toBeVisible();
    }
  });

  // Automatically generate tests for each dropdown group
  for (const [groupName, links] of Object.entries(DROPDOWNS)) {
    test(`Dropdown "${groupName}" should navigate to all subpages correctly`, async ({ page }) => {
      // We will perform actions sequentially to assure the dropdown works for every single link.
      for (const linkObj of links) {
        await page.goto('/index.html');

        // Locate the trigger button and click it to open the dropdown
        const groupContainer = page.locator('nav .group').filter({ has: page.locator('button', { hasText: groupName }) }).first();
        const dropdownBtn = groupContainer.locator('button');
        await expect(dropdownBtn).toBeVisible();
        await dropdownBtn.click();

        // Ensure the dropdown menu becomes visible after click
        const dropdownMenu = groupContainer.locator('.absolute');
        await expect(dropdownMenu).toBeVisible();

        // Click the precise link
        const navLink = dropdownMenu.locator(`a[href="${linkObj.href}"]`);
        await expect(navLink).toBeVisible();
        await navLink.click();

        // Verify the URL changed successfully to the destination
        await expect(page).toHaveURL(new RegExp(`.*${linkObj.href.replace('.', '\\.')}`));
        
        // Wait a tiny bit to assure 404s/errors don't occur (Vite serves them seamlessly if valid)
        // If the page loaded successfully, its <site-nav> should be present
        await expect(page.locator('site-nav')).toBeAttached();
      }
    });
  }
});
