import { chromium } from '@playwright/test';
import fs from 'fs';

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

const BASE_URL = 'https://chandlerprince.com';

(async () => {
  console.log(`Checking ${PAGES_TO_TEST.length} pages on ${BASE_URL}...`);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  let markdown = `# Production Console Errors (${BASE_URL})\n\n`;
  let totalErrors = 0;

  for (const pageName of PAGES_TO_TEST) {
    const page = await context.newPage();
    const errors = [];
    
    // Capture unhandled exceptions
    page.on('pageerror', exception => {
      errors.push(`Uncaught exception: ${exception.message}`);
    });

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
          // We won't filter anything heavily since you want to see all production errors,
          // except maybe ignore the favicon 404s to reduce noise.
          const text = msg.text();
          if (!text.includes('favicon.ico')) {
              errors.push(text);
          }
      }
    });

    // Capture failed network requests natively as well
    page.on('requestfailed', request => {
      const url = request.url();
      if (!url.includes('google-analytics') && !url.includes('cloudflareinsights')) {
        errors.push(`Failed to load resource: ${url}`);
      }
    });

    try {
      await page.goto(`${BASE_URL}/${pageName}`, { waitUntil: 'load', timeout: 30000 });
      // Wait a brief moment to catch any async errors after load
      await page.waitForTimeout(1000); 
    } catch (e) {
      errors.push(`Navigation failed or timed out: ${e.message}`);
    }

    if (errors.length > 0) {
      console.log(`[${pageName}] Found ${errors.length} errors.`);
      markdown += `## [${pageName}](${BASE_URL}/${pageName})\n\n`;
      errors.forEach(e => markdown += `- \`${e.replace(/\n/g, ' ')}\`\n`);
      markdown += '\n';
      totalErrors += errors.length;
    } else {
      console.log(`[${pageName}] Clean.`);
    }

    await page.close();
  }

  if (totalErrors === 0) {
    markdown += 'No console errors found!\n';
  }

  fs.writeFileSync('production_errors_report.md', markdown);
  console.log(`\nFinished. Found ${totalErrors} errors total. Saved to production_errors_report.md`);
  await browser.close();
})();
