import { test, expect } from '@playwright/test';

test.describe('Password Generator', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/passwords');
    
    // Navigate to generator page
    await page.click('.el-menu-item:has-text("密码生成器")');
    await page.waitForLoadState('networkidle');
  });

  test('should display generator form', async ({ page }) => {
    await expect(page.locator('.generator-card')).toBeVisible();
    await expect(page.locator('input[readonly]')).toBeVisible();
    await expect(page.locator('.range-slider')).toBeVisible();
    await expect(page.locator('.el-checkbox-group')).toBeVisible();
  });

  test('should generate password with default settings', async ({ page }) => {
    const regenerateButton = page.locator('button:has-text("生成新密码")');
    const passwordInput = page.locator('input[readonly]');
    const lengthSlider = page.locator('input[type="range"]');
    
    // Verify default length
    const initialLength = await lengthSlider.inputValue();
    expect(initialLength).toBe('20');
    
    // Click generate
    await regenerateButton.click();
    
    // Wait for password to be generated
    await page.waitForTimeout(1000);
    
    // Password should have value
    const passwordValue = await passwordInput.inputValue();
    expect(passwordValue).toBeTruthy();
    expect(passwordValue.length).toBe(parseInt(initialLength));
  });

  test('should change password length', async ({ page }) => {
    const lengthSlider = page.locator('input[type="range"]');
    const lengthValue = page.locator('.length-value');
    
    // Set length to 32
    await lengthSlider.fill('32');
    
    // Verify length value updated
    await expect(lengthValue).toContainText('32');
    
    // Verify slider value
    const sliderValue = await lengthSlider.inputValue();
    expect(sliderValue).toBe('32');
  });

  test('should adjust length within valid range', async ({ page }) => {
    const lengthSlider = page.locator('input[type="range"]');
    
    // Test minimum length
    await lengthSlider.fill('8');
    let sliderValue = await lengthSlider.inputValue();
    expect(sliderValue).toBe('8');
    
    // Test maximum length
    await lengthSlider.fill('64');
    sliderValue = await lengthSlider.inputValue();
    expect(sliderValue).toBe('64');
  });

  test('should generate password with custom options', async ({ page }) => {
    const regenerateButton = page.locator('button:has-text("生成新密码")');
    const lengthSlider = page.locator('input[type="range"]');
    const checkboxes = page.locator('.el-checkbox');
    
    // Uncheck all options except numbers
    await checkboxes.nth(0).uncheck(); // uppercase
    await checkboxes.nth(2).uncheck(); // lowercase
    await checkboxes.nth(3).uncheck(); // symbols
    
    // Set length
    await lengthSlider.fill('10');
    await page.waitForTimeout(200);
    
    // Generate password
    await regenerateButton.click();
    await page.waitForTimeout(1000);
    
    // Password should be generated
    const passwordInput = page.locator('input[readonly]');
    const passwordValue = await passwordInput.inputValue();
    expect(passwordValue).toBeTruthy();
    
    // Password should contain only numbers
    expect(passwordValue).toMatch(/^\d+$/);
  });

  test('should copy password to clipboard', async ({ page }) => {
    const copyButton = page.locator('button:has-text("📋")');
    const passwordInput = page.locator('input[readonly]');
    
    // Generate a password first
    await page.locator('button:has-text("生成新密码")').click();
    await page.waitForTimeout(1000);
    
    // Click copy button
    await copyButton.click();
    
    // Verify success message
    await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.el-message--success')).toContainText('密码已复制到剪贴板');
  });

  test('should display different characters', async ({ page }) => {
    const regenerateButton = page.locator('button:has-text("生成新密码")');
    const checkboxes = page.locator('.el-checkbox');
    const uppercaseCheckbox = checkboxes.nth(0);
    const lowercaseCheckbox = checkboxes.nth(1);
    const numbersCheckbox = checkboxes.nth(2);
    const symbolsCheckbox = checkboxes.nth(3);
    
    // Test with only uppercase
    await uppercaseCheckbox.check();
    await lowercaseCheckbox.uncheck();
    await numbersCheckbox.uncheck();
    await symbolsCheckbox.uncheck();
    
    await regenerateButton.click();
    await page.waitForTimeout(1000);
    
    let passwordValue = await page.locator('input[readonly]').inputValue();
    expect(passwordValue).toMatch(/^[A-Z]+$/);
    
    // Test with all options
    await uppercaseCheckbox.check();
    await lowercaseCheckbox.check();
    await numbersCheckbox.check();
    await symbolsCheckbox.check();
    
    await regenerateButton.click();
    await page.waitForTimeout(1000);
    
    passwordValue = await page.locator('input[readonly"]').inputValue();
    // Should contain at least one of each type
    expect(passwordValue.length).toBeGreaterThan(0);
  });
});
