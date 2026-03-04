# UI 自动化测试指南

本文档介绍如何对 Password Manager 应用进行 UI 自动化测试。

## 🛠️ 测试工具

我们使用 **Playwright** 进行端到端（E2E）测试，原因：

- ✅ 现代化和快速
- ✅ 支持多浏览器（Chromium、Firefox、WebKit）
- ✅ 对 Vue 3 和 Tauri 应用支持良好
- ✅ 内置截图和视频录制
- ✅ 优秀的调试工具
- ✅ 支持并行测试

## 📦 安装依赖

### 安装 Playwright

```bash
cd LocalPassword
npm install
```

这将安装：
- `@playwright/test` - Playwright 测试框架
- `vitest` - 单元测试框架
- `@vue/test-utils` - Vue 组件测试工具

### 安装浏览器

```bash
npx playwright install
```

这将下载 Chromium、Firefox 和 WebKit 浏览器。

## 🚀 运行测试

### E2E 测试（端到端）

```bash
# 运行所有 E2E 测试（无头模式）
npm run test

# 运行测试并显示浏览器（带界面）
npm run test:headed

# 运行测试并在浏览器中查看
npm run test:ui

# 运行特定测试文件
npx playwright test tests/e2e/login.spec.js

# 运行特定测试
npx playwright test --grep "should login successfully"
```

### 单元测试

```bash
# 运行所有单元测试
npm run test:unit

# 运行测试并监听文件变化
npm run test:unit -- --watch

# 生成测试覆盖率报告
npm run test:unit -- --coverage
```

## 📁 测试结构

```
tests/
├── e2e/                      # E2E 测试
│   ├── login.spec.js       # 登录功能测试
│   ├── passwords.spec.js   # 密码管理测试
│   ├── generator.spec.js   # 密码生成器测试
│   └── settings.spec.js    # 设置功能测试
└── unit/                    # 单元测试
    └── auth.spec.js         # 认证 Store 测试
```

## 📋 测试用例说明

### E2E 测试

#### 1. login.spec.js - 登录页面测试

- ✅ 显示登录表单
- ✅ 密码为空时显示错误
- ✅ 有效密码成功登录
- ✅ 切换密码可见性
- ✅ Enter 键提交表单
- ✅ 显示加载状态

#### 2. passwords.spec.js - 密码管理测试

- ✅ 显示密码列表
- ✅ 搜索密码
- ✅ 打开添加密码对话框
- ✅ 点击取消关闭对话框
- ✅ 验证必填字段
- ✅ 使用有效数据添加密码
- ✅ 生成内联密码
- ✅ 在页面间导航
- ✅ 成功登出

#### 3. generator.spec.js - 密码生成器测试

- ✅ 显示生成器表单
- ✅ 使用默认设置生成密码
- ✅ 更改密码长度
- ✅ 在有效范围内调整长度
- ✅ 使用自定义选项生成密码
- ✅ 复制密码到剪贴板
- ✅ 显示不同字符类型

#### 4. settings.spec.js - 设置页面测试

- ✅ 显示设置表单
- ✅ 显示默认 PM 路径
- ✅ 更改 PM CLI 路径
- ✅ 选择不同日志级别
- ✅ 持久化设置到 localStorage
- ✅ 显示帮助文本

### 单元测试

#### 1. auth.spec.js - 认证 Store 测试

- ✅ 存储主密码
- ✅ 登出时清除认证
- ✅ 持久化 PM 路径到 localStorage
- ✅ 从 localStorage 加载 PM 路径

## 🔍 查看测试结果

### HTML 报告

测试运行后，HTML 报告将生成在 `test-results/` 目录：

```bash
# 在浏览器中打开报告
npx playwright show-report
```

### JUnit XML 报告

```bash
# JUnit 报告用于 CI/CD 集成
cat test-results/junit.xml
```

### 失败的测试截图

失败的测试会自动截图并保存在 `test-results/` 目录。

### 失败的测试视频

失败的测试会自动录制视频并保存在 `test-results/` 目录。

## 🎯 测试最佳实践

### 1. 编写可维护的测试

```javascript
// ✅ 好的做法：使用描述性名称
test('should login successfully with valid password', async ({ page }) => {
  // 测试代码
});

// ❌ 不好的做法：使用模糊的名称
test('test login', async ({ page }) => {
  // 测试代码
});
```

### 2. 使用合适的等待策略

```javascript
// ✅ 等待特定元素出现
await expect(page.locator('.login-page')).toBeVisible();

// ✅ 等待网络空闲
await page.waitForLoadState('networkidle');

// ✅ 等待 URL 变化
await page.waitForURL('**/passwords');

// ❌ 不好的做法：固定时间等待
await page.waitForTimeout(5000);
```

### 3. 隔离测试环境

```javascript
test.beforeEach(async ({ page }) => {
  // 每个 test 之前：清除 localStorage
  await page.evaluate(() => localStorage.clear());
  
  // 导航到页面
  await page.goto('/');
});
```

### 4. 使用 Page Object 模式

对于复杂的页面，考虑创建 Page Objects：

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
  }
  
  async goto() {
    await this.page.goto('/');
  }
  
  async login(password) {
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

// 使用
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('test123');
```

## 🔄 CI/CD 集成

### GitHub Actions 示例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
          retention-days: 30
```

## 🐛 调试测试

### 调试模式

```bash
# 使用 --debug 标志运行测试
npx playwright test --debug

# 这将：
# - 使用 headed 模式
# - 慢速执行
# - 打开调试器
```

### 查看代码覆盖率

```bash
# 安装依赖
npm install -D @vitest/coverage-v8

# 运行测试并生成覆盖率
npm run test:unit -- --coverage

# 查看覆盖率报告
npx vitest --coverage
```

## 📝 扩展测试

### 添加新的 E2E 测试

1. 在 `tests/e2e/` 创建新的 `.spec.js` 文件
2. 使用 Playwright API 编写测试
3. 运行测试验证功能

### 添加新的单元测试

1. 在 `tests/unit/` 创建新的 `.spec.js` 文件
2. 使用 Vitest API 编写测试
3. 运行测试验证逻辑

## 🎓 学习资源

- [Playwright 文档](https://playwright.dev)
- [Vitest 文档](https://vitest.dev)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [最佳实践](https://playwright.dev/docs/best-practices)

## 🚀 快速开始

```bash
# 1. 安装依赖
cd LocalPassword
npm install

# 2. 安装浏览器
npx playwright install

# 3. 运行测试
npm run test

# 4. 查看报告
npx playwright show-report
```

---

**祝测试愉快！** 🎉
