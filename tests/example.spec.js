import { test, expect } from '@playwright/test';

test('has title and loads navigation', async ({ page }) => {
  // Go to the local site
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Chandler Prince/);

  // Verify the Home button in the navigation is visible
  const homeLink = page.locator('nav a', { hasText: 'Home' });
  await expect(homeLink).toBeVisible();
  
  // Verify heading
  await expect(page.locator('h1').first()).toHaveText('D. Chandler Prince');
});

test('can navigate to threat model page', async ({ page }) => {
  await page.goto('/');

  // Find the "View the Case Study" link for the Threat Model card
  const threatModelLink = page.getByRole('link', { name: 'View the Case Study' });
  await expect(threatModelLink).toBeVisible();

  // Click the link
  await threatModelLink.click();

  // Verify that the URL changed to the threat model page
  await expect(page).toHaveURL(/.*threatmodel\.html/);

  // Check the title of the new page
  await expect(page.locator('h2').first()).toHaveText('STRIDE Threat Model Example');
});
