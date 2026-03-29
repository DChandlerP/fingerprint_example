import { test, expect } from '@playwright/test';

const MOCK_NVD_RESPONSE = {
  vulnerabilities: [
    {
      cve: {
        id: "CVE-2022-41741",
        descriptions: [{ lang: "en", value: "Mock Description for NVD." }],
        metrics: {
          cvssMetricV31: [{
            source: 'nvd@nist.gov',
            exploitabilityScore: 3.9,
            impactScore: 5.9,
            cvssData: {
              version: "3.1",
              vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
              baseScore: 9.8,
              baseSeverity: "CRITICAL"
            }
          }]
        }
      }
    }
  ]
};

const MOCK_EPSS_RESPONSE = {
  data: [
    {
      cve: "CVE-2022-41741",
      epss: "0.8543",
      percentile: "0.9821",
      date: "2024-03-20"
    }
  ]
};

test.describe('EPSS/CVSS Comparator Page', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept NVD API calls
    await page.route('https://services.nvd.nist.gov/rest/json/cves/2.0*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_NVD_RESPONSE)
        });
    });

    // Intercept EPSS API calls
    await page.route('https://api.first.org/data/v1/epss*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_EPSS_RESPONSE)
        });
    });

    await page.goto('/epssdemo.html');
  });

  test('should automatically fetch and display mock data on load', async ({ page }) => {
    // Check if the CVE ID header is displayed
    await expect(page.locator('#results-container h2')).toHaveText('CVE-2022-41741');

    // Check CVSS column 
    await expect(page.locator('#results-container')).toContainText('Mock Description for NVD');
    const baseScoreBox = page.locator('#results-container').filter({ hasText: 'Base Score' });
    await expect(baseScoreBox).toContainText('9.8');
    await expect(baseScoreBox).toContainText('CRITICAL');

    // Check EPSS column
    const epssColumn = page.locator('#results-container').filter({ hasText: 'EPSS Exploitability' });
    // 0.8543 * 100 = 85.4%
    await expect(epssColumn).toContainText('85.4%');
    // Percentile 0.9821 * 100 = 98.2%
    await expect(epssColumn).toContainText('98.2%');
    
    // Check Chart Canvas existence
    await expect(page.locator('#comparisonChart')).toBeVisible();
  });

  test('should display validation error for improperly formatted CVEs', async ({ page }) => {
    const input = page.locator('#vulnId');
    const btn = page.locator('#fetchButton');

    // Try a completely invalid string
    await input.fill('Random-String');
    await btn.click();
    await expect(page.locator('#results-container')).toContainText("Hint: Make sure to include the 'CVE-' prefix.");

    // Try an improperly formatted CVE missing numbers
    await input.fill('CVE-2024-12');
    await btn.click();
    await expect(page.locator('#results-container')).toContainText('Hint: The format is CVE-YYYY-NNNN, with at least 4 digits after the year.');
  });

  test('should completely block malicious input without fetching', async ({ page }) => {
    // We didn't setup mock routes for this since it shouldn't fire anyway
    const input = page.locator('#vulnId');
    const btn = page.locator('#fetchButton');

    // Inject an angle bracket to trigger the security regex
    await input.fill('CVE-2024-3094<script>');
    await btn.click();

    // The malicious input regex rule should catch this and output a specific error box
    await expect(page.locator('.error-text')).toHaveText('Nice try! But this input only speaks CVE. 😉');
  });
});
