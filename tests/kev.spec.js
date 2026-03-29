import { test, expect } from '@playwright/test';

// Mocked response for KEV Data (similar structure to CISA feed)
const MOCK_KEV_RESPONSE = {
  count: 3,
  dateReleased: "2024-03-24T00:00:00.000Z",
  vulnerabilities: [
    {
      cveID: "CVE-2024-1111",
      vendorProject: "MockVendor Alpha",
      product: "Alpha Product",
      vulnerabilityName: "Test Vuln 1",
      dateAdded: "2024-03-20",
      shortDescription: "First mock description.",
      requiredAction: "Apply patch immediately.",
      dueDate: "2024-04-10",
      knownRansomwareCampaignUse: "Known",
      cwes: ["CWE-79"]
    },
    {
      cveID: "CVE-2023-2222",
      vendorProject: "MockVendor Beta",
      product: "Beta Product",
      vulnerabilityName: "Test Vuln 2",
      dateAdded: "2023-11-15",
      shortDescription: "Second mock description.",
      requiredAction: "Apply mitigations.",
      dueDate: "2023-12-05",
      knownRansomwareCampaignUse: "Unknown",
      cwes: ["CWE-89"]
    },
    {
      cveID: "CVE-2022-3333",
      vendorProject: "MockVendor Alpha",
      product: "Alpha Product 2",
      vulnerabilityName: "Test Vuln 3",
      dateAdded: "2022-05-10",
      shortDescription: "Third mock description.",
      requiredAction: "Update firmware.",
      dueDate: "2022-06-01",
      knownRansomwareCampaignUse: "Unknown",
      cwes: ["CWE-79", "CWE-20"]
    }
  ]
};

test.describe('CISA KEV Explorer', () => {

  test.beforeEach(async ({ page }) => {
    // Inject localStorage manipulation to force bypass cache
    // Playwright evaluates this before navigation
    await page.addInitScript(() => {
        window.localStorage.removeItem('cisa_kev_data_v2');
    });

    // We must mock the local proxy route that kev.js fetches ('kev_data.json')
    await page.route('*/**/kev_data.json', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_KEV_RESPONSE)
        });
    });

    await page.goto('/kev.html');
  });

  test('should fetch and display correct summary stats from mock data', async ({ page }) => {
    // Total should be 3 from the mock payload
    const totalCount = page.locator('#total-count');
    await expect(totalCount).toHaveText('3');

    // Most targeted vendor should be 'MockVendor Alpha' (it has 2 entries)
    const topVendor = page.locator('#top-vendor');
    await expect(topVendor).toHaveText('MockVendor Alpha');

    // The table should have 3 rows initially (plus header)
    const rows = page.locator('#kev-table-body tr');
    await expect(rows).toHaveCount(3);
  });

  test('should render ransomware campaigns with special visual alert classes', async ({ page }) => {
    // CVE-2024-1111 was set as "Known" for ransomware in our mock
    const row = page.locator('#kev-table-body tr').filter({ hasText: 'CVE-2024-1111' });
    
    // Check if the specialized alert classes are attached to the row
    await expect(row).toHaveClass(/border-red-500/);
    await expect(row).toHaveClass(/bg-red-900\/10/);
  });

  test('should filter the table when searching', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    
    // Search for Beta Vendor
    await searchInput.fill('MockVendor Beta');

    const rows = page.locator('#kev-table-body tr');
    // Only 1 row should be left matching 'Beta'
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('CVE-2023-2222');

    // Check showing string updated
    await expect(page.locator('#showing-count')).toHaveText('1-1 of 1');
  });

  test('should return to un-filtered state when clear button is clicked', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const resetBtn = page.locator('#reset-btn');

    // Initial search
    await searchInput.fill('CWE-89');
    await expect(page.locator('#kev-table-body tr')).toHaveCount(1);
    
    // The reset button should now be visible
    await expect(resetBtn).toBeVisible();

    // Click it
    await resetBtn.click();

    // Input should be empty and table returned to size 3
    await expect(searchInput).toBeEmpty();
    await expect(page.locator('#kev-table-body tr')).toHaveCount(3);
    await expect(resetBtn).toHaveClass(/hidden/);
  });

});
