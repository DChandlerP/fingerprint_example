import { test, expect } from '@playwright/test';

test.describe('String Art Generator Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/string.html');
  });

  test('should render canvas and properly initialize default values', async ({ page }) => {
    // Canvas dimensions should exist
    const canvas = page.locator('canvas#stringArtCanvas');
    await expect(canvas).toBeVisible();

    // Defaults Check
    await expect(page.locator('#pointsValue')).toHaveText('200');
    await expect(page.locator('#multiplierValue')).toHaveText('2.0'); // 2 is formatted to 1 decimal JS side dynamically but sometimes it's text '2' in HTMl so we check JS side execution text content
    
    const multVal = await page.locator('#multiplierValue').innerText();
    expect(['2.0', '2']).toContain(multVal); // Handle floating conversions
    
    await expect(page.locator('#opacityValue')).toHaveText('0.10');
    
    // Selects
    await expect(page.locator('#shapeSelect')).toHaveValue('circle');
    await expect(page.locator('#colorModeSelect')).toHaveValue('single');

    // Single mode hue container is visible
    const hueContainer = page.locator('#hueControlContainer');
    await expect(hueContainer).toBeVisible();
    await expect(page.locator('#hueValue')).toHaveText('180');
  });

  test('should hide hue slider when a spectrum color mode is selected', async ({ page }) => {
    const colorModeSelect = page.locator('#colorModeSelect');
    const hueContainer = page.locator('#hueControlContainer');

    // Initially visible because of 'single' mode
    await expect(hueContainer).toBeVisible();

    // Change to spectrum
    await colorModeSelect.selectOption('spectrum');

    // Container should hide (display: none applied by JS)
    await expect(hueContainer).not.toBeVisible();

    // Change to fire
    await colorModeSelect.selectOption('fire');
    await expect(hueContainer).not.toBeVisible();

    // Change back to single
    await colorModeSelect.selectOption('single');
    await expect(hueContainer).toBeVisible();
  });

  test('should update UI numeric display when sliders are adjusted', async ({ page }) => {
    const pointsSlider = page.locator('#pointsSlider');
    const pointsValue = page.locator('#pointsValue');

    // Change to 10
    await pointsSlider.fill('10');
    
    // Verify that the span text dynamically syncs
    await expect(pointsValue).toHaveText('10');
  });

});
