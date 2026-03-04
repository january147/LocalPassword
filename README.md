# LocalPassword GUI - Modern Password Manager

一个基于 Vue 3 + Element Plus 的现代化密码管理器。

## ✨ 特性

### 界面设计
- 🎨 **现代化 UI** - 基于 Element Plus 组件库
- 🌓 **渐变主题** - 漂亮的紫色渐变背景
- 📱 **响应式设计** - 完美适配桌面和移动端
- 🎭 **动画效果** - 流畅的过渡和悬停效果
- 💫 **卡片式布局** - 清晰的视觉层次

### 核心功能
- 🔐 **安全登录** - 主密码加密保护
- 📋 **密码管理** - 添加、编辑、删除密码
- 🔍 **实时搜索** - 即时过滤密码列表
- 📋 **一键复制** - 快速复制密码到剪贴板
- 🔢 **密码生成器** - 可自定义强度和字符类型
- 💾 **导入/导出** - JSON 格式数据备份
- ⚙️ **灵活配置** - PM CLI 路径和日志级别设置

### 技术特性
- 🚀 **Vue 3** - 响应式框架
- 🧩 **Element Plus** - 企业级 UI 组件库
- 📦 **Pinia** - 状态管理
- 🔒 **非交互式集成** - 安全地使用 PM CLI
- 📝 **日志系统** - 完整的操作日志记录

## 🚀 快速开始

### 前置要求

1. **Node.js 18+**
2. **Rust 编译的 pm CLI**
3. **Tauri CLI** (桌面应用)

### 安装依赖

```bash
cd LocalPassword
npm install
```

### 开发模式

```bash
npm run tauri:dev
```

### 构建

```bash
npm run build
npm run tauri build
```

## 📖 使用指南

### 登录

1. 输入主密码
2. 点击 "解锁" 按钮
3. 成功解锁后进入主界面

### 主界面

#### 侧边栏导航
- 📋 **密码列表** - 查看和管理所有密码
- 🔑 **密码生成器** - 生成强密码
- 📁 **导入/导出** - 备份和恢复数据
- ⚙️ **设置** - 配置 PM CLI 路径和日志级别
- 🔒 **锁定** - 锁定应用返回登录页

#### 密码列表
- **搜索框** - 顶部搜索，实时过滤
- **添加按钮** - 快速添加新密码
- **密码卡片** - 网格布局，悬停显示操作菜单
- **快速操作** - 点击卡片复制密码

### 添加/编辑密码

点击 "添加密码" 按钮或点击密码卡片菜单中的 "编辑"：

1. **标题** (Title) - 密码条目标题（必填）
2. **用户名** (Username) - 登录用户名（必填）
3. **密码** (Password) - 登录密码（必填）
   - 点击生成按钮自动生成
   - 支持显示/隐藏密码
4. **网站 URL** (Website URL) - 网站 URL（可选）
5. **分类** (Category) - 选择分类标签（可选）
6. **备注** (Notes) - 添加备注信息（可选）

### 密码生成器

1. **长度滑块** (Length Slider) - 设置密码长度（8-64）
2. **字符选项** (Character Options) - 勾选要包含的字符类型：
   - 大写字母 (Uppercase, A-Z)
   - 小写字母 (Lowercase, a-z)
   - 数字 (Numbers, 0-9)
   - 特殊字符 (Symbols, !@#$%)
3. **生成按钮** (Generate) - 点击生成新密码
4. **复制按钮** (Copy) - 一键复制到剪贴板

### 导入/导出

#### 导出
1. 点击 "导出密码" 卡片
2. 选择保存位置
3. 密码导出为 JSON 文件

#### 导入
1. 点击 "导入密码" 卡片
2. 选择 JSON 文件
3. 密码导入到数据库

### 设置

#### PM CLI 路径配置
在设置中配置 pm 命令的完整路径：

**Linux/Mac:**
```
/usr/local/bin/pm
```

**Windows:**
```
C:\Program Files\pm.exe
```

留空则使用系统 PATH 中的 `pm` 命令。

#### 日志级别配置
在设置中选择日志级别：

```javascript
// 开发环境
logLevel: 'debug'

// 生产环境
logLevel: 'warn'
```

生产环境建议使用 "警告" (Warn) 或 "关闭" (Off)。

## 🎨 界面预览

### 登录页
- 紫色渐变背景
- 浮动动画圆圈
- 现代化卡片设计
- 显示/隐藏密码切换

### 主界面
- 深色侧边栏
- 浅色内容区
- 渐变卡片悬停效果
- 响应式网格布局

### 密码卡片
- 渐变图标
- 悬停显示操作菜单
- 顶部渐变条动画
- 圆角阴影设计

### 密码生成器
- 大号密码显示
- 滑块长度控制
- 字符选项复选框
- 醒目生成按钮

## 🔧 配置

### PM CLI 路径配置

在设置中配置 pm 命令的完整路径：

**Linux/Mac:**
```
/usr/local/bin/pm
```

**Windows:**
```
C:\Program Files\pm.exe
```

留空则使用系统 PATH 中的 `pm` 命令。

### 日志配置

在设置中选择日志级别：

```javascript
// 开发环境
logLevel: 'debug'

// 生产环境
logLevel: 'warn'
```

## 🐛 故障排除

### 问题：PM 命令未找到

**解决方案：**
1. 确保 pm 已编译：`cargo build --release`
2. 将 pm 添加到系统 PATH
3. 或在设置中配置完整路径

### 问题：无法连接到后端

**解决方案：**
1. 检查主密码是否正确
2. 检查 PM CLI 路径配置
3. 查看日志获取错误信息

### 问题：密码未显示

**解决方案：**
1. 刷新密码列表
2. 检查搜索过滤条件
3. 查看日志确认数据加载

## 📝 开发

### 项目结构

```
localpassword-gui/
├── src/
│   ├── main.js              # Vue 应用入口
│   ├── App.vue              # 主应用组件
│   ├── components/           # 子组件
│   │   ├── LoginPage.vue
│   │   ├── PasswordsPage.vue
│   │   ├── GeneratorPage.vue
│   │   ├── ImportExportPage.vue
│   │   ├── SettingsPage.vue
│   │   └── PasswordDialog.vue
│   └── stores/              # Pinia 状态管理
│       └── auth.js
├── tests/                  # 测试文件
│   ├── e2e/                 # E2E 测试
│   │   ├── login.spec.js
│   │   ├── passwords.spec.js
│   │   ├── generator.spec.js
│   │   └── settings.spec.js
│   ├── unit/                # 单元测试
│   │   └── auth.spec.js
│   └── README.md            # 测试指南
├── index.html              # HTML 模板
├── package.json            # 项目配置
└── vite.config.ts         # Vite 配置
```

### 技术栈

- **框架**: Vue 3.4.0
- **UI 库**: Element Plus 2.5.0
- **状态管理**: Pinia 2.1.0
- **构建工具**: Vite 5.0.0
- **桌面框架**: Tauri 2.1
- **后端**: PM CLI (Rust)

## 🚧 未来计划

- [ ] 主题切换（深色/浅色）
- [ ] 密码强度可视化
- [ ] 快捷键支持
- [ ] 密码分类标签
- [ ] 密码过期提醒
- [ ] 浏览器扩展
- [ ] 云同步功能
- [ ] 两步验证 (2FA)

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

## 📞 联系方式

- **项目主页**: https://github.com/january147/LocalPassword
- **问题反馈**: https://github.com/january147/LocalPassword/issues

---

**享受安全的密码管理体验！** 🔐
