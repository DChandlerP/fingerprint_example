import { test, expect } from '@playwright/test';

const MOCK_NVD_RESPONSE = {
  totalResults: 2,
  vulnerabilities: [
    {
      cve: {
        id: "CVE-2024-0001",
        published: "2024-01-01T00:00:00.000",
        weaknesses: [{ description: [{ lang: "en", value: "CWE-79" }] }],
        metrics: {
          cvssMetricV31: [
            {
               cvssData: {
                 baseScore: 9.8,
                 vectorString: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
               }
            }
          ]
        },
        configurations: [{ nodes: [{ cpeMatch: [{ vulnerable: true, criteria: "cpe:2.3:a:mock_vendor:product:1.0:*:*:*:*:*:*:*" }] }] }]
      }
    },
    {
      cve: {
        id: "CVE-2024-0002",
        published: "2024-01-02T00:00:00.000",
        weaknesses: [{ description: [{ lang: "en", value: "CWE-89" }] }],
        metrics: {
          cvssMetricV31: [
            {
               cvssData: {
                 baseScore: 5.4,
                 vectorString: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:N"
               }
            }
          ]
        },
        configurations: [{ nodes: [{ cpeMatch: [{ vulnerable: true, criteria: "cpe:2.3:a:another_vendor:product:1.0:*:*:*:*:*:*:*" }] }] }]
      }
    }
  ]
};

test.describe('Threat Intelligence Dashboard Page', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept NVD API calls and mock the response to prevent rate-limiting and ensure deterministic tests
    await page.route('https://services.nvd.nist.gov/rest/json/cves/2.0*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_NVD_RESPONSE)
        });
    });

    await page.goto('/dashboard.html');
  });

  test('should load default dates and fetch mock data automatically', async ({ page }) => {
    // Basic structural checks to ensure page loaded
    await expect(page.locator('h1')).toHaveText('Live Threat Intelligence Dashboard');
    
    // Total vulns should be 2 based on the mock
    await expect(page.locator('#total-vulns')).toHaveText('2');
    
    // Avg CVSS should be (9.8 + 5.4) / 2 = 7.6
    await expect(page.locator('#avg-cvss')).toHaveText('7.6');
  });

  test('should populate the top findings list with mock data', async ({ page }) => {
    // Wait for the specific mock CVE to render
    const item1 = page.locator('#top-findings-list a[title="CVE-2024-0001"]');
    await expect(item1).toBeVisible();

    const item2 = page.locator('#top-findings-list a[title="CVE-2024-0002"]');
    await expect(item2).toBeVisible();

    // Check if the High score is colored appropriately (text-red-500)
    const score1 = page.locator('#top-findings-list li').filter({ hasText: 'CVE-2024-0001' }).locator('span');
    await expect(score1).toContainText('9.8');
    await expect(score1).toHaveClass(/text-red-500/);
  });

  test('should display error if dates are invalid', async ({ page }) => {
    // Clear the dates
    await page.locator('#start-date').fill('');
    await page.locator('#end-date').fill('');

    // Click fetch
    await page.locator('#fetch-btn').click();

    // Assert validation error
    await expect(page.locator('#loading-state')).toHaveText('Please select both a start and end date.');
    await expect(page.locator('#loading-state')).toHaveClass(/text-red-400/);
  });

  test('should enable download JSON button after fetch', async ({ page }) => {
    // Since fetch happens on load automatically and we returned a 200 mock, the download button should become enabled.
    const downloadBtn = page.locator('#download-btn');
    
    // We expect it NOT to be disabled once the data is fetched natively on DOMContentLoaded
    await expect(downloadBtn).not.toBeDisabled();
  });

  test('should render chart canvas elements', async ({ page }) => {
    // Chart.js uses canvas. While we can't test inside the canvas, we can verify they exist and are visible
    await expect(page.locator('#vulnScatterChart')).toBeVisible();
    await expect(page.locator('#vulnsByTypeChart')).toBeVisible();
    await expect(page.locator('#attackVectorChart')).toBeVisible();
    await expect(page.locator('#topVendorsChart')).toBeVisible();
    await expect(page.locator('#cvssMetricsRadarChart')).toBeVisible();
  });
});
