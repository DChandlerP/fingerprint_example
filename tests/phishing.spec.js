import { test, expect } from '@playwright/test';

test.describe('Phishing Awareness Training Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/phishing.html');
  });

  test('should render general phishing scenarios on load', async ({ page }) => {
    // The general scenarios section
    const generalGallery = page.locator('#email-gallery > div.email-container');
    
    // As per phishing.js data source, there are 2 scenarios
    await expect(generalGallery).toHaveCount(2);

    // Verify first scenario title
    const title = generalGallery.nth(0).locator('h3');
    await expect(title).toContainText('Scenario 1: The Urgent Password Reset');
  });

  test('should reveal feedback and highlight element when a suspicious general element is clicked', async ({ page }) => {
    const firstScenario = page.locator('.email-container').nth(0);
    const feedbackArea = page.locator('#feedback-area-0');
    
    // Initially the feedback area prompts the user to click
    await expect(feedbackArea).toContainText('Click on suspicious elements');

    // Click the malicious link
    const suspiciousLink = firstScenario.locator('#email-0-link');
    await suspiciousLink.click();

    // The element should gain the highlight classes
    await expect(suspiciousLink).toHaveClass(/bg-blue-600/);
    await expect(suspiciousLink).toHaveClass(/text-white/);

    // Feedback area should update with the explanation
    await expect(feedbackArea).toContainText('malicious-site.net');
    await expect(feedbackArea).toHaveClass(/bg-blue-900\/50/); // Feedback colored visually
  });

  test('should render tailored phishing scenarios correctly', async ({ page }) => {
    const tailoredGallery = page.locator('#tailored-examples-gallery > div.tailored-container');
    await expect(tailoredGallery).toHaveCount(2);

    // Check Brenda's profile rendered
    const name = tailoredGallery.nth(0).locator('h3').first();
    await expect(name).toHaveText('Brenda, HR Manager');
  });

  test('should update feedback safely when a tailored element is clicked', async ({ page }) => {
    const firstTailored = page.locator('.tailored-container').nth(0);
    const feedbackArea = page.locator('#tailored-feedback-area-0');

    // Setup: click the name parameter
    const nameMention = firstTailored.locator('#tailored-0-name');
    await nameMention.click();

    // Verify highlighting works
    await expect(nameMention).toHaveClass(/bg-blue-600/);
    await expect(feedbackArea).toContainText('Using your first name');

    // Setup: click another tailored parameter (context)
    const contextMention = firstTailored.locator('#tailored-0-context');
    await contextMention.click();

    // Focus shifts to new element, previous element loses focus
    await expect(contextMention).toHaveClass(/bg-blue-600/);
    await expect(nameMention).not.toHaveClass(/bg-blue-600/);
    await expect(feedbackArea).toContainText('creates a false sense of shared context');
  });

});
