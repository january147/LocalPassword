<template>
  <div id="app" class="password-manager">
    <!-- 登录页面 -->
    <LoginPage v-if="!isAuthenticated" @login="handleLogin" />
    
    <!-- 主应用 -->
    <div v-else class="main-layout">
      <!-- 侧边栏 -->
      <el-aside class="sidebar" width="240px">
        <div class="logo">
          <el-icon :size="32" color="#409eff"><Lock /></el-icon>
          <span>Password Manager</span>
        </div>
        
        <el-menu
          :default-active="currentPage"
          class="nav-menu"
          background-color="#1f2937"
          text-color="#9ca3af"
          active-text-color="#409eff"
          @select="handleMenuSelect"
        >
          <el-menu-item index="passwords">
            <el-icon><List /></el-icon>
            <span>密码列表</span>
          </el-menu-item>
          <el-menu-item index="generator">
            <el-icon><Key /></el-icon>
            <span>密码生成器</span>
          </el-menu-item>
          <el-menu-item index="import-export">
            <el-icon><FolderOpened /></el-icon>
            <span>导入/导出</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
        
        <div class="sidebar-footer">
          <el-button
            type="danger"
            plain
            :icon="Lock"
            @click="handleLogout"
          >
            锁定
          </el-button>
        </div>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 密码列表页面 -->
        <PasswordsPage v-if="currentPage === 'passwords'" ref="passwordsPage" />
        
        <!-- 密码生成器页面 -->
        <GeneratorPage v-else-if="currentPage === 'generator'" />
        
        <!-- 导入导出页面 -->
        <ImportExportPage v-else-if="currentPage === 'import-export'" />
        
        <!-- 设置页面 -->
        <SettingsPage v-else-if="currentPage === 'settings'" />
      </el-main>
    </div>
    
    <!-- Toast 通知容器 -->
    <div class="toast-container"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Lock, List, Key, FolderOpened, Setting
} from '@element-plus/icons-vue'
import LoginPage from './components/LoginPage.vue'
import PasswordsPage from './components/PasswordsPage.vue'
import GeneratorPage from './components/GeneratorPage.vue'
import ImportExportPage from './components/ImportExportPage.vue'
import SettingsPage from './components/SettingsPage.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const isAuthenticated = ref(false)
const currentPage = ref('passwords')
const passwordsPage = ref(null)

// 检查认证状态
const checkAuth = () => {
  isAuthenticated.value = authStore.isAuthenticated
}

// 处理登录
const handleLogin = (password) => {
  authStore.setMasterPassword(password)
  isAuthenticated.value = true
  ElNotification({
    title: '成功',
    message: '已成功解锁密码管理器',
    type: 'success',
    duration: 3000
  })
}

// 处理登出
const handleLogout = () => {
  authStore.logout()
  isAuthenticated.value = false
  ElNotification({
    title: '已锁定',
    message: '密码管理器已锁定',
    type: 'info',
    duration: 3000
  })
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  currentPage.value = index
}

// 初始化
checkAuth()
</script>

<style scoped>
.password-manager {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

/* 侧边栏 */
.sidebar {
  background: #1f2937;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border-bottom: 1px solid #374151;
}

.nav-menu {
  flex: 1;
  border: none;
}

.nav-menu :deep(.el-menu-item) {
  color: #9ca3af;
  transition: all 0.3s ease;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: #374151;
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #374151;
}

/* 主内容区 */
.main-content {
  flex: 1;
  background: #f5f7fa;
  padding: 24px;
  overflow-y: auto;
}

/* Toast 容器 */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-bottom: 1px solid #374151;
  }
  
  .nav-menu {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .sidebar-footer {
    display: none;
  }
}
</style>
