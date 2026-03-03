# Password Manager Raw

基于 Tauri 2.x 的密码管理器桌面应用，提供安全的密码存储和管理功能。

## 功能特性

- 🔒 安全的密码存储和管理
- 🔐 强密码生成器
- 📤 数据导出/导入功能
- 🎯 跨平台支持 (Windows, Linux, macOS)
- 💻 现代化的用户界面

## 开发环境

### 前置要求

- Node.js 18+
- Rust 1.70+
- WebView2 Runtime (仅 Windows)

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run tauri dev
```

### 构建应用

#### Linux

```bash
npm run tauri build
```

生成的文件：
- DEB 包：`src-tauri/target/release/bundle/deb/`
- AppImage：`src-tauri/target/release/bundle/appimage/`
- RPM 包：`src-tauri/target/release/bundle/rpm/`

#### Windows

```bash
npm run tauri build
```

生成的文件：
- NSIS 安装程序：`src-tauri/target/release/bundle/nsis/`
- MSI 安装程序：`src-tauri/target/release/bundle/msi/`

#### macOS

```bash
npm run tauri build
```

生成的文件：
- DMG 文件：`src-tauri/target/release/bundle/dmg/`
- APP 文件：`src-tauri/target/release/bundle/macos/`

## 使用 GitHub Actions 自动构建

项目已配置 GitHub Actions，会自动构建所有平台的发布包：

### 获取构建产物

1. 访问项目的 **Actions** 页面
2. 选择最近的 **Build Tauri App** workflow
3. 在 **Artifacts** 部分下载对应平台的安装包：
   - `linux-bundle` - Linux 安装包
   - `windows-bundle` - Windows 安装包

### 创建发布版本

推送 git tag 会自动创建 GitHub Release：

```bash
git tag v1.0.0
git push origin v1.0.0
```

这将触发自动发布流程，包含所有平台的安装包。

## 系统架构

- **前端**：HTML/CSS/JavaScript + Vite
- **后端**：Rust + Tauri 2.x
- **密码管理**：调用外部 `pm` 命令

## 命令接口

应用通过 Tauri invoke 调用以下命令：

- `list_passwords` - 列出所有密码
- `add_password` - 添加新密码
- `update_password` - 更新密码
- `delete_password` - 删除密码
- `generate_password` - 生成强密码
- `export_passwords` - 导出密码数据
- `import_passwords` - 导入密码数据
- `init_database` - 初始化数据库
- `cleanup_database` - 清理数据库

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
