<template>
  <div class="passwords-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索密码..."
        size="large"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleAdd"
      >
        添加密码
      </el-button>
    </div>
    
    <!-- 密码卡片网格 -->
    <div class="password-grid">
      <div
        v-for="password in filteredPasswords"
        :key="password.title"
        class="password-card"
        @click="handleCardClick(password)"
      >
        <div class="card-header">
          <div class="icon">{{ password.title?.charAt(0)?.toUpperCase() || '?' }}</div>
          <div class="info">
            <div class="title">{{ password.title }}</div>
            <div class="username">👤 {{ password.username }}</div>
          </div>
          <el-dropdown trigger="click" @command="handleCardAction($event, password)">
            <el-button :icon="More" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="CopyDocument" @click="handleCopy(password)">
                  复制密码
                </el-dropdown-item>
                <el-dropdown-item :icon="Edit" @click="handleEdit(password)">
                  编辑
                </el-dropdown-item>
                <el-dropdown-item :icon="Delete" @click="handleDelete(password)" divided>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div v-if="password.category" class="category">
          {{ password.category }}
        </div>
        
        <div class="password-mask">
          <span class="dots">••••••••••••</span>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <el-empty
      v-if="filteredPasswords.length === 0 && !loading"
      description="暂无密码"
      :image-size="200"
    />
    
    <!-- 添加密码对话框 -->
    <PasswordDialog
      v-model:visible="dialogVisible"
      :password="currentPassword"
      @save="handleSave"
    />
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除密码 "{{ deletePassword?.title }}" 吗？</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, More, CopyDocument, Edit, Delete } from '@element-plus/icons-vue'
import { invoke } from '@tauri-apps/api/core'
import { info, error } from '../utils/logger'
import { useAuthStore } from '../stores/auth'
import PasswordDialog from './PasswordDialog.vue'

const authStore = useAuthStore()
const searchQuery = ref('')
const passwords = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentPassword = ref(null)
const deleteDialogVisible = ref(false)
const deletePassword = ref(null)

// 过滤后的密码列表
const filteredPasswords = computed(() => {
  if (!searchQuery.value) {
    return passwords.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return passwords.value.filter(pwd => 
    pwd.title?.toLowerCase().includes(query) ||
    pwd.username?.toLowerCase().includes(query) ||
    pwd.url?.toLowerCase().includes(query)
  )
})

// 加载密码
const loadPasswords = async () => {
  loading.value = true
  try {
    const result = await invoke('run_command', {
      command: authStore.pmPath,
      args: ['--non-interactive', '--log-level', 'off', 'list'],
      env: {
        PM_MASTER_PASSWORD: authStore.masterPassword
      }
    })
    
    if (result.code === 0) {
      passwords.value = parsePasswords(result.stdout)
      info('Passwords loaded:', passwords.value.length)
    } else {
      ElMessage.error('加载密码失败')
    }
  } catch (err) {
    error('Failed to load passwords:', err)
    ElMessage.error('加载密码失败：' + err)
  } finally {
    loading.value = false
  }
}

// 解析密码
const parsePasswords = (output) => {
  const entries = []
  let currentEntry = {}
  
  const patterns = {
    title: /📌\s+(.+)/,
    username: /Username:\s+(.+)/,
    password: /Password:\s+(.+)/,
    url: /URL:\s+(.+)/,
    category: /Category:\s+(.+)/,
    notes: /Notes:\s+(.+)/,
  }

  for (const line of output.split('\n')) {
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = line.match(pattern)
      if (match) {
        const value = match[1].trim()
        if (key === 'title') {
          if (Object.keys(currentEntry).length > 0) {
            entries.push(currentEntry)
          }
          currentEntry = { title: value }
        } else {
          currentEntry[key] = value
        }
      }
    }
  }

  if (Object.keys(currentEntry).length > 0) {
    entries.push(currentEntry)
  }

  return entries
}

// 搜索
const handleSearch = () => {
  // 自动通过 computed 处理
}

// 添加密码
const handleAdd = () => {
  currentPassword.value = null
  dialogVisible.value = true
}

// 编辑密码
const handleEdit = (password) => {
  currentPassword.value = password
  dialogVisible.value = true
}

// 删除密码
const handleDelete = (password) => {
  deletePassword.value = password
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    const result = await invoke('run_command', {
      command: authStore.pmPath,
      args: ['--non-interactive', 'delete', deletePassword.value.title, '--force'],
      env: {
        PM_MASTER_PASSWORD: authStore.masterPassword
      }
    })

    if (result.code === 0) {
      ElMessage.success('删除成功')
      deleteDialogVisible.value = false
      await loadPasswords()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (err) {
    error('Failed to delete password:', err)
    ElMessage.error('删除失败：' + err)
  }
}

// 复制密码
const handleCopy = async (password) => {
  try {
    await navigator.clipboard.writeText(password.password)
    ElMessage.success('密码已复制到剪贴板')
    info(`Password copied: ${password.title}`)
  } catch (err) {
    error('Failed to copy password:', err)
    ElMessage.error('复制失败')
  }
}

// 保存密码
const handleSave = async (passwordData) => {
  try {
    const args = ['add', '--title', passwordData.title, '--username', passwordData.username, '--password', passwordData.password]
    
    if (passwordData.url) args.push('--url', passwordData.url)
    if (passwordData.category) args.push('--category', passwordData.category)
    if (passwordData.notes) args.push('--notes', passwordData.notes)

    const result = await invoke('run_command', {
      command: authStore.pmPath,
      args: ['--non-interactive', ...args],
      env: {
        PM_MASTER_PASSWORD: authStore.masterPassword
      }
    })

    if (result.code === 0) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      await loadPasswords()
    } else {
      ElMessage.error('保存失败')
    }
  } catch (err) {
    error('Failed to save password:', err)
    ElMessage.error('保存失败：' + err)
  }
}

// 卡片点击
const handleCardClick = (password) => {
  handleCopy(password)
}

// 卡片操作
const handleCardAction = (command, password) => {
  switch (command) {
    case 'copy':
      handleCopy(password)
      break
    case 'edit':
      handleEdit(password)
      break
    case 'delete':
      handleDelete(password)
      break
  }
}

// 暴露方法给父组件
defineExpose({
  loadPasswords
})

// 初始化
onMounted(() => {
  loadPasswords()
})
</script>

<style scoped>
.passwords-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-bar .el-input {
  flex: 1;
}

.password-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
}

.password-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.password-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #8b5cf6, #ec4899);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.password-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.password-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.username {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 12px;
}

.password-mask {
  font-family: 'Courier New', monospace;
  background: #f5f7fa;
  padding: 10px 12px;
  border-radius: 8px;
  margin-top: 12px;
  letter-spacing: 2px;
  color: #9ca3af;
}

.dots {
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .password-grid {
    grid-template-columns: 1fr;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .search-bar .el-input {
    width: 100%;
  }
}
</style>
