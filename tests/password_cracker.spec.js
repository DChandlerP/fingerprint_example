import { test, expect } from '@playwright/test';

test.describe('Password Entropy & Cracking Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/password_cracker.html');
  });

  test('should toggle password visibility on eye icon click', async ({ page }) => {
    const pwdInput = page.locator('#password-input');
    const toggleBtn = page.locator('#toggle-visibility');

    // Starts as password type
    await expect(pwdInput).toHaveAttribute('type', 'password');

    // Click to reveal
    await toggleBtn.click();
    await expect(pwdInput).toHaveAttribute('type', 'text');

    // Click to hide
    await toggleBtn.click();
    await expect(pwdInput).toHaveAttribute('type', 'password');
  });

  test('should calculate entropy dynamically when user types', async ({ page }) => {
    const pwdInput = page.locator('#password-input');
    const entropyVal = page.locator('#entropy-value');
    
    // Type a weak password (e.g. "password")
    await pwdInput.fill('password');
    // all lowercase length 8 => 8 * log2(26) = 8 * 4.7 = ~37 bits
    const weakBits = parseInt(await entropyVal.textContent() ?? '0');
    expect(weakBits).toBeGreaterThan(30);
    expect(weakBits).toBeLessThan(45);
    await expect(page.locator('#entropy-text')).toHaveText('Weak');

    // Type a very strong password
    await pwdInput.fill('S0m3$up3rL0ng&C0mpl3xP@ssw0rd123!!');
    const strongBits = parseInt(await entropyVal.textContent() ?? '0');
    expect(strongBits).toBeGreaterThan(120);
    await expect(page.locator('#entropy-text')).toHaveText('Excellent');
  });

  test('should generate a complex password when clicking Generate Button', async ({ page }) => {
    const pwdInput = page.locator('#password-input');
    const generateBtn = page.locator('#btn-generate');

    // Should be empty initial state
    await expect(pwdInput).toBeEmpty();

    // Generate complex password based on default sliders (16 length)
    await generateBtn.click();

    const generatedValue = await pwdInput.inputValue();
    expect(generatedValue.length).toBe(16);
    await expect(pwdInput).toHaveAttribute('type', 'text'); // Expected behavioral auto-reveal
    
    // Check that entropy is updated
    const entropyVal = parseInt(await page.locator('#entropy-value').textContent() ?? '0');
    expect(entropyVal).toBeGreaterThan(80); // Should be very strong
  });

  test('should switch cleanly to Passphrase generation tab and generate', async ({ page }) => {
    const tabPassphrase = page.locator('#tab-passphrase');
    const panelComplex = page.locator('#panel-complex');
    const panelPassphrase = page.locator('#panel-passphrase');
    const generateBtn = page.locator('#btn-generate');
    const pwdInput = page.locator('#password-input');

    // Click Passphrase tab
    await tabPassphrase.click();

    // Verify UI switched
    await expect(panelComplex).toHaveClass(/hidden/);
    await expect(panelPassphrase).not.toHaveClass(/hidden/);

    // Generate phrase (default 4 words, hypen separated)
    await generateBtn.click();
    
    const generatedValue = await pwdInput.inputValue();
    // Verify it generated 4 words (3 hyphens assuming default separation)
    const hyphenCount = (generatedValue.match(/-/g) || []).length;
    expect(hyphenCount).toBe(3);
  });

});
