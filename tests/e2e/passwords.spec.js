import { test, expect } from '@playwright/test';

test.describe('Password Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/passwords');
  });

  test('should display password list', async ({ page }) => {
    await expect(page.locator('.password-grid')).toBeVisible();
    await expect(page.locator('.password-card')).toHaveCount(0); // Assuming empty initially
  });

  test('should search passwords', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    
    // Type search query
    await searchInput.fill('test');
    
    // Wait for filtering (debounced)
    await page.waitForTimeout(500);
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('test');
  });

  test('should open add password dialog', async ({ page }) => {
    const addButton = page.locator('button:has-text("添加密码")');
    
    await addButton.click();
    
    // Wait for modal to appear
    await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.el-dialog')).toContainText('添加密码');
  });

  test('should close dialog when clicking cancel', async ({ page }) => {
    const addButton = page.locator('button:has-text("添加密码")');
    const cancelButton = page.locator('button:has-text("取消")');
    
    await addButton.click();
    await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 5000 });
    
    await cancelButton.click();
    
    // Wait for modal to close
    await expect(page.locator('.el-dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('should validate required fields', async ({ page }) => {
    const addButton = page.locator('button:has-text("添加密码")');
    const saveButton = page.locator('button:has-text("保存")');
    
    // Open dialog
    await addButton.click();
    await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 5000 });
    
    // Try to save without filling required fields
    await saveButton.click();
    
    // Should show validation errors
    await expect(page.locator('.el-form-item__error')).toBeVisible({ timeout: 3000 });
  });

  test('should add password with valid data', async ({ page }) => {
    const addButton = page.locator('button:has-text("添加密码")');
    const saveButton = page.locator('button:has-text("保存")');
    
    // Open dialog
    await addButton.click();
    await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 5000 });
    
    // Fill in form
    await page.fill('input[placeholder="例如：GitHub"]', 'Test Account');
    await page.fill('input[placeholder="例如：user@example.com"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.fill('input[placeholder="https://"]', 'https://test.com');
    
    // Select category
    await page.click('.el-select');
    await page.click('.el-select-dropdown__item:has-text("工作")');
    
    // Save
    await saveButton.click();
    
    // Wait for modal to close
    await expect(page.locator('.el-dialog')).not.toBeVisible({ timeout: 5000 });
    
    // Verify success message
    await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.el-message--success')).toContainText('保存成功');
  });

  test('should generate inline password', async ({ page }) => {
    const generateButton = page.locator('button:has-text("🔄")');
    const passwordInput = page.locator('input[type="password"]');
    
    // Open dialog
    await page.locator('button:has-text("添加密码")').click();
    await expect(page.locator('.el-dialog')).toBeVisible({ timeout: 5000 });
    
    // Get initial password type
    const initialType = await passwordInput.getAttribute('type');
    expect(initialType).toBe('password');
    
    // Click generate button
    await generateButton.click();
    
    // Wait for password to be generated
    await page.waitForTimeout(1000);
    
    // Password should still be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should navigate between pages', async ({ page }) => {
    // Navigate to generator page
    await page.click('.el-menu-item:has-text("密码生成器")');
    await expect(page.locator('.generator-card')).toBeVisible({ timeout: 3000 });
    
    // Navigate back to passwords page
    await page.click('.el-menu-item:has-text("密码列表")');
    await expect(page.locator('.password-grid')).toBeVisible({ timeout: 3000 });
    
    // Navigate to settings
    await page.click('.el-menu-item:has-text("设置")');
    await expect(page.locator('.settings-card')).toBeVisible({ timeout: 3000 });
  });

  test('should logout successfully', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("锁定")');
    
    await logoutButton.click();
    
    // Should return to login page
    await expect(page.locator('.login-page')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.login-card')).toBeVisible();
  });
});
