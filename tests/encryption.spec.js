import { test, expect } from '@playwright/test';

test.describe('Encryption Playground', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/encryption.html');
  });

  test('should display AES by default and switch sections using dropdown', async ({ page }) => {
    // AES section should be visible initially
    await expect(page.locator('#aes-section')).not.toHaveClass(/hidden/);
    await expect(page.locator('#rsa-section')).toHaveClass(/hidden/);

    // Switch to RSA
    await page.locator('#crypto-select').selectOption('rsa');
    await expect(page.locator('#aes-section')).toHaveClass(/hidden/);
    await expect(page.locator('#rsa-section')).not.toHaveClass(/hidden/);

    // Switch to Hash
    await page.locator('#crypto-select').selectOption('hash');
    await expect(page.locator('#rsa-section')).toHaveClass(/hidden/);
    await expect(page.locator('#hash-section')).not.toHaveClass(/hidden/);
  });

  test('should encrypt and decrypt using AES', async ({ page }) => {
    // Generate an AES key
    await page.locator('#aes-generate-key-btn').click();
    const key = await page.locator('#aes-key').inputValue();
    expect(key.length).toBeGreaterThan(0);

    // Encrypt
    const plaintext = 'Secret Message 123';
    await page.locator('#aes-plaintext').fill(plaintext);
    await page.locator('#aes-encrypt-btn').click();

    const ciphertext = await page.locator('#aes-ciphertext').inputValue();
    expect(ciphertext).not.toBe('');
    expect(ciphertext).not.toBe(plaintext);

    // Decrypt
    await page.locator('#aes-decrypt-btn').click();
    const decryptedOutput = await page.locator('#aes-decryptedtext').inputValue();

    // Verify it reversed successfully
    expect(decryptedOutput).toBe(plaintext);
  });

  test('should compute correct SHA-256 hash', async ({ page }) => {
    // Switch to Hash
    await page.locator('#crypto-select').selectOption('hash');

    // Known test vector for SHA-256
    await page.locator('#hash-input').fill('hello');
    await page.locator('#hash-sha256-btn').click();

    const hashOutput = await page.locator('#hash-output').inputValue();
    expect(hashOutput).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  test('avalanche visualizer should update actively', async ({ page }) => {
    // Switch to Hash
    await page.locator('#crypto-select').selectOption('hash');

    // Type into avalanche input
    await page.locator('#avalanche-input1').fill('Test1');
    const hash1 = await page.locator('#avalanche-hash1').textContent();
    
    expect(hash1).toBeTruthy();
  });

  test('should generate RSA keys, sign, and verify', async ({ page }) => {
    // Switch to Sign
    await page.locator('#crypto-select').selectOption('sign');

    // Need to generate RSA keys first, so we switch back and forth 
    // Wait, let's just use RSA section to generate keys first
    await page.locator('#crypto-select').selectOption('rsa');
    await page.locator('#rsa-generate-btn').click();

    // Wait for the key to be generated (since jsencrypt generation can block for a second)
    await expect(page.locator('#rsa-public-key')).not.toBeEmpty({ timeout: 10000 });

    const privKey = await page.locator('#rsa-private-key').inputValue();
    const pubKey = await page.locator('#rsa-public-key').inputValue();

    expect(privKey).toContain('BEGIN RSA PRIVATE KEY');
    expect(pubKey).toContain('BEGIN PUBLIC KEY');

    // Now switch to Sign section
    await page.locator('#crypto-select').selectOption('sign');

    // Enter message and sign
    await page.locator('#sign-message').fill('Authorize transfer');
    await page.locator('#sign-btn').click();
    
    // Wait for signature to appear
    await expect(page.locator('#sign-signature')).not.toBeEmpty();
    
    // Verify
    await page.locator('#verify-btn').click();
    const verifyResult = page.locator('#verify-result');
    await expect(verifyResult).toHaveText('Signature is valid.');
    await expect(verifyResult).toHaveClass(/bg-green-800/);
  });

});
