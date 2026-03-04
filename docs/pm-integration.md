# PM CLI 集成指南

本文档说明如何在前端应用中集成 PM CLI 工具。

## 🔌 使用 `@tauri-apps/plugin-shell` 插件

### 为什么不使用 `shell-open` feature

**问题：**
- `shell-open` feature 在 Tauri 2.0.3 中已弃用
- 在 Tauri 2.1.0 中完全移除
- 当前项目使用 Tauri 2.1.0

**解决方案：**
使用 `@tauri-apps/plugin-shell` 插件替代，这是官方推荐的调用系统命令的方法。

## 📦 安装依赖

### 前端（Tauri）

```json
{
  "dependencies": {
    "@tauri-apps/plugin-shell": "^2"
  }
}
```

### Rust 后端（可选）

如果 PM CLI 需要集成 Rust 代码，在 `core/Cargo.toml` 中添加：

```toml
[dependencies]
localpassword-gui = { path = "../localpassword-gui" }
```

## 🔌 使用方法

### 方法一：基本命令执行

```javascript
import { invoke } from '@tauri-apps/api/core'
import { Command } from '@tauri-apps/plugin-shell'

// 简单命令执行
const result = await invoke('plugin:shell|execute', {
  cmd: ['ls', '-la'],
  cwd: '/home/user'
})

console.log(result.code)
console.log(result.stdout)
console.log(result.stderr)
```

### 方法二：非交互式 PM CLI 集成

```javascript
import { invoke } from '@tauri-apps/api/core'

// 设置环境变量
const env = {
  PM_MASTER_PASSWORD: 'your-password'
}

// 执行 pm 命令
const result = await invoke('plugin:shell|execute', {
  cmd: ['pm', '--non-interactive', '--log-level', 'off', 'list'],
  env: env
})

// 解析输出
if (result.code === 0) {
  const entries = parsePasswords(result.stdout)
  console.log('Loaded passwords:', entries)
}
```

### 方法三：管道操作

```javascript
// 使用管道
const result = await invoke('plugin:shell|execute', {
  cmd: ['pm', 'list', '|', 'grep', 'GitHub']
})
```

## 🔍 高级用法

### 执行带复杂参数的命令

```javascript
const result = await invoke('plugin:shell|execute', {
  cmd: [
    'pm',
    'add',
    '--title', 'My Account',
    '--username', 'user@example.com',
    '--password', 'MyPassword123!'
  ]
})
```

### 处理输出

```javascript
const result = await invoke('plugin:shell|execute', {
  cmd: ['pm', '--non-interactive', '--log-level', 'off', 'list']
})

// 结果对象包含：
// {
//   code: 0,           // 退出码
//   stdout: "output",  // 标准输出
//   stderr: "errors"   // 标准错误
// }
```

### 错误处理

```javascript
try {
  const result = await invoke('plugin:shell|execute', {
    cmd: ['pm', 'list']
  })

  if (result.code !== 0) {
    throw new Error(`Command failed: ${result.stderr}`)
  }

  // 处理输出
  console.log(result.stdout)
} catch (error) {
  console.error('Failed to execute PM command:', error)
  // 显示用户友好的错误消息
}
```

## 📝 完整示例：密码管理器集成

### 服务层

```javascript
// services/pm-service.js
import { invoke } from '@tauri-apps/api/core'

export const PmService = {
  /**
   * 执行 PM 命令
   */
  async executeCommand(args, options = {}) {
    const cmd = ['pm', '--non-interactive', '--log-level', 'off', ...args]

    const result = await invoke('plugin:shell|execute', {
      cmd,
      env: {
        PM_MASTER_PASSWORD: options.masterPassword || ''
      },
      cwd: options.cwd
    })

    if (result.code !== 0) {
      throw new Error(`PM command failed: ${result.stderr}`)
    }

    return result.stdout
  },

  /**
   * 列出所有密码
   */
  async listPasswords(masterPassword) {
    return this.executeCommand(['list'], { masterPassword })
  },

  /**
   * 添加密码
   */
  async addPassword(masterPassword, passwordData) {
    const args = ['add', '--title', passwordData.title]
    args.push('--username', passwordData.username)
    args.push('--password', passwordData.password)

    if (passwordData.url) {
      args.push('--url', passwordData.url)
    }

    if (passwordData.category) {
      args.push('--category', passwordData.category)
    }

    if (passwordData.notes) {
      args.push('--notes', passwordData.notes)
    }

    return this.executeCommand(args, { masterPassword })
  },

  /**
   * 删除密码
   */
  async deletePassword(masterPassword, title) {
    return this.executeCommand(['delete', title, '--force'], { masterPassword })
  },

  /**
   * 生成密码
   */
  async generatePassword(length = 20) {
    const result = await invoke('plugin:shell|execute', {
      cmd: ['pm', 'generate', '--length', length.toString()]
    })

    // 解析生成的密码
    for (const line of result.stdout.split('\n')) {
      if (line.trim() && !line.includes('Generated') && !line.includes('Strength')) {
        return line.trim()
      }
    }

    return ''
  },

  /**
   * 导出密码
   */
  async exportPasswords(masterPassword, filepath) {
    const result = await invoke('plugin:shell|execute', {
      cmd: ['pm', 'export', filepath, '--log-level', 'off'],
      env: {
        PM_MASTER_PASSWORD: masterPassword
      }
    })

    if (result.code !== 0) {
      throw new Error(`Export failed: ${result.stderr}`)
    }

    return true
  },

  /**
   * 导入密码
   */
  async importPasswords(masterPassword, filepath) {
    const result = await invoke('plugin:shell|execute', {
      cmd: ['pm', 'import', filepath, '--log-level', 'off'],
      env: {
        PM_MASTER_PASSWORD: masterPassword
      }
    })

    if (result.code !== 0) {
      throw new Error(`Import failed: ${result.stderr}`)
    }

    return true
  }
}
```

### Vue 组件中使用

```javascript
// 在 Vue 组件中导入服务
import { PmService } from './services/pm-service'
import { useAuthStore } from '../stores/auth'

// 使用服务
const authStore = useAuthStore()

const passwords = await PmService.listPasswords(authStore.masterPassword)
const result = await PmService.addPassword(authStore.masterPassword, {
  title: 'GitHub',
  username: 'user@example.com',
  password: 'password123!'
})
```

## 🔐 安全注意事项

### 1. 环境变量

**PM_MASTER_PASSWORD**
- **必须**：通过环境变量传递主密码
- **不要**：在命令行参数中传递
- **原因**：环境变量不会出现在进程列表或命令历史中

### 2. 日志控制

**PM_LOG_LEVEL**
- **推荐**：生产环境使用 `off` 或 `warn`
- **开发环境**：可以使用 `debug`
- **不要**：使用日志记录敏感信息

### 3. 非交互式模式

**--non-interactive**
- **必须**：所有 PM CLI 命令都必须使用此参数
- **原因**：避免命令阻塞和交互提示
- **实现**：通过环境变量或状态管理传递所有必需参数

### 4. 错误处理

- **必须**：捕获所有命令执行错误
- **必须**：向用户显示友好的错误消息
- **不要**：暴露内部实现细节或堆栈跟踪

## 🐛 故障排除

### 问题：命令未找到

**错误信息：**
```
Command failed: pm: not found
```

**解决方案：**
1. 确保 PM CLI 已编译：`cargo build --release`
2. 将 pm 添加到系统 PATH
3. 或在应用设置中配置完整路径

### 问题：权限错误

**错误信息：**
```
Command failed: Permission denied
```

**解决方案：**
1. 检查 pm 文件的执行权限
2. 确保用户有权限执行命令
3. 检查目标文件/目录的访问权限

### 问题：认证失败

**错误信息：**
```
Failed to decrypt database. Check your master password.
```

**解决方案：**
1. 检查主密码是否正确
2. 确认没有额外的空格或换行符
3. 尝试使用 `--log-level debug` 查看详细错误

## 📚 参考资源

- [Tauri Shell Plugin 文档](https://github.com/tauri-apps/tauri-plugin-shell)
- [Tauri 文档](https://tauri.app/)
- [PM CLI 文档](../README.md)
- [最佳实践](../docs/best-practices.md)

## 🚀 快速开始

### 1. 安装依赖

```bash
cd localpassword-gui
npm install
```

### 2. 创建服务文件

在 `src/services/` 目录创建 `pm-service.js`。

### 3. 在组件中使用

在需要调用 PM CLI 的 Vue 组件中导入并使用服务。

### 4. 测试集成

```bash
npm run tauri:dev
```

---

**重要提示：** 确保 PM CLI 支持 `--non-interactive` 和 `--log-level` 参数，这是实现安全集成的基础。
