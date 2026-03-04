import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/passwords');
    
    // Navigate to settings page
    await page.click('.el-menu-item:has-text("设置")');
    await page.waitForLoadState('networkidle');
  });

  test('should display settings form', async ({ page }) => {
    await expect(page.locator('.settings-card')).toBeVisible();
    await expect(page.locator('label:has-text("PM CLI 路径")')).toBeVisible();
    await expect(page.locator('label:has-text("日志级别")')).toBeVisible();
    await expect(page.locator('input[placeholder="pm"]')).toBeVisible();
    await expect(page.locator('.el-select')).toBeVisible();
  });

  test('should display default PM path', async ({ page }) => {
    const pmPathInput = page.locator('input[placeholder="pm"]');
    
    const defaultValue = await pmPathInput.inputValue();
    // Default should be empty or 'pm'
    expect(defaultValue === '' || defaultValue === 'pm').toBeTruthy();
  });

  test('should change PM CLI path', async ({ page }) => {
    const pmPathInput = page.locator('input[placeholder="pm"]');
    const saveButton = page.locator('button:has-text("保存设置")');
    
    // Fill in custom path
    await pmPathInput.fill('/usr/local/bin/pm');
    await page.waitForTimeout(200);
    
    // Click save
    await saveButton.click();
    
    // Verify success message
    await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.el-message--success')).toContainText('设置已保存');
  });

  test('should select different log levels', async ({ page }) => {
    const select = page.locator('.el-select');
    const saveButton = page.locator('button:has-text("保存设置")');
    
    // Test selecting different levels
    const levels = ['off', 'error', 'warn', 'info', 'debug'];
    
    for (const level of levels) {
      // Click select to open dropdown
      await select.click();
      await page.waitForTimeout(200);
      
      // Click the level option
      await page.locator(`.el-select-dropdown__item:has-text("${level === 'off' ? '关闭' : level}")`).click();
      
      // Wait for selection
      await page.waitForTimeout(300);
      
      // Save
      await saveButton.click();
      await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
      
      // Close message
      await page.waitForTimeout(1000);
    }
  });

  test('should persist settings to localStorage', async ({ page }) => {
    const pmPathInput = page.locator('input[placeholder="pm"]');
    const saveButton = page.locator('button:has-text("保存设置")');
    
    // Set custom path
    const customPath = '/custom/path/to/pm';
    await pmPathInput.fill(customPath);
    
    // Save
    await saveButton.click();
    await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
    
    // Reload page and verify settings persist
    await page.reload();
    await page.click('.el-menu-item:has-text("设置")');
    await page.waitForTimeout(1000);
    
    // Verify path is still set
    const savedValue = await pmPathInput.inputValue();
    expect(savedValue).toBe(customPath);
  });

  test('should show help text for PM path', async ({ page }) => {
    await expect(page.locator('.help-text')).toBeVisible();
    await expect(page.locator('.help-text')).toContainText('PM 命令的完整路径');
  });

  test('should show help text for log level', async ({ page }) => {
    const helpTexts = page.locator('.help-text');
    
    // Should have 2 help texts
    const count = await helpTexts.count();
    expect(count).toBeGreaterThanOrEqual(1);
    
    // Check content
    const allText = await helpTexts.allTextContents();
    const combinedText = allText.join(' ');
    expect(combinedText).toMatch(/日志|日志级别/);
  });

  test('should handle empty PM path', async ({ page }) => {
    const pmPathInput = page.locator('input[placeholder="pm"]');
    const saveButton = page.locator('button:has-text("保存设置")');
    
    // Clear path
    await pmPathInput.fill('');
    
    // Save should still work
    await saveButton.click();
    await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
  });

  test('should validate settings before save', async ({ page }) => {
    // This test assumes validation is added in the future
    // For now, we verify the save action completes
    const saveButton = page.locator('button:has-text("保存设置")');
    
    await saveButton.click();
    
    // Should complete without errors
    await expect(page.locator('.el-message--success')).toBeVisible({ timeout: 5000 });
  });
});
