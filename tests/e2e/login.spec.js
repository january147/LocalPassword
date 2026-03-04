import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('.login-card')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error when password is empty', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    
    await loginButton.click();
    
    // Wait for error message
    await expect(page.locator('.el-message--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.el-message--error')).toContainText('请输入主密码');
  });

  test('should login successfully with valid password', async ({ page }) => {
    // Enter password
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Click login button
    await page.locator('button[type="submit"]').click();
    
    // Wait for navigation to main page
    await page.waitForURL('**/passwords', { timeout: 10000 });
    
    // Verify main interface is visible
    await expect(page.locator('.main-layout')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('.toggle-password');
    
    // Initial state - password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await toggleButton.click();
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click toggle button again
    await toggleButton.click();
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle Enter key to submit form', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    
    // Enter password
    await passwordInput.fill('testpassword123');
    
    // Press Enter key
    await passwordInput.press('Enter');
    
    // Wait for navigation
    await page.waitForURL('**/passwords', { timeout: 10000 });
    
    // Verify successful login
    await expect(page.locator('.main-layout')).toBeVisible();
  });

  test('should display loading state during login', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    
    // Enter password
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Click login button
    await loginButton.click();
    
    // Check for loading state
    await expect(loginButton).toHaveText(/解锁中/);
    
    // Wait for completion
    await page.waitForURL('**/passwords', { timeout: 10000 });
  });
});
