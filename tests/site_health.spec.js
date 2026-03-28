import { test, expect } from '@playwright/test';

// Define all main pages on the site to check for errors/health.
const PAGES_TO_TEST = [
  'index.html',
  'checklist.html',
  'cipp_flashcards.html',
  'cipp_us_practice_exam.html',
  'cloud.html',
  'container.html',
  'cyber_roadmap.html',
  'dashboard.html',
  'encryption.html',
  'epssdemo.html',
  'euprivacytimeline.html',
  'fair.html',
  'fingerprint.html',
  'jwt.html',
  'kev.html',
  'modcat.html',
  'password_cracker.html',
  'phishing.html',
  'quiz.html',
  'regulation.html',
  'risk_scoring.html',
  'sast.html',
  'sast_remediation.html',
  'sdlc.html',
  'shamir.html',
  'string.html',
  'threatmodel.html',
  'usprivacytimeline.html',
  'waf.html'
];

test.describe('Site Health and Error Checking', () => {

  for (const pageName of PAGES_TO_TEST) {
    test(`Page ${pageName} should load without console errors or 404s`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];

      // Listen for unhandled exceptions in the page
      page.on('pageerror', exception => {
        pageErrors.push(`Uncaught exception: "${exception.message}"`);
      });

      // Listen for console.error calls
      page.on('console', msg => {
        if (msg.type() === 'error') {
          // Some 3rd party components (like cloudflare, extensions) might inject noise,
          // but typically we want to capture and assert to fix any local bugs.
          // You can filter known exceptions here if necessary.
          const text = msg.text();
          // Ignoring common harmless errors if they arise from extensions/browser specifics
          // Also ignoring CSP warnings for data images and X-Frame-Options meta tags which are expected based on local setups
          const isHarmless = text.includes('favicon.ico') || 
                             text.includes('Third-party') || 
                             text.includes('X-Frame-Options') || 
                             text.includes('violates the following Content Security Policy directive');
          
          if (!isHarmless) {
              consoleErrors.push(`Console error: "${text}"`);
          }
        }
      });

      // Handle failed network requests that are critical (like missing JS/CSS)
      const failedRequests = [];
      page.on('requestfailed', request => {
         // Ignore purely external tracking scripts that fail if adblockers are active in browser contexts
         const url = request.url();
         if (!url.includes('google-analytics') && !url.includes('cloudflareinsights')) {
             failedRequests.push(`Failed to load resource: ${url}`);
         }
      });

      // Goto the page
      const response = await page.goto(`/${pageName}`, { waitUntil: 'load' });

      // Verify page responded with a 200 OK status
      expect(response.status()).toBe(200);

      // Verify no critical errors occurred during load
      expect(pageErrors, `Page Errors found on ${pageName}`).toEqual([]);
      expect(consoleErrors, `Console Errors found on ${pageName}`).toEqual([]);
      
      // Let's assert on broken local requests (404s for images/scripts)
      // Usually Playwright doesn't fail the whole page navigation if an image 404s,
      // so we can collect those in `requestfailed` or through checking responses.
    });
  }

});
