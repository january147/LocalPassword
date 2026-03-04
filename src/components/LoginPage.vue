<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <el-icon :size="64" color="#409eff"><Lock /></el-icon>
          <h1>密码管理器</h1>
          <p>安全 • 简单 • 高效</p>
        </div>
        
        <el-form :model="loginForm" class="login-form" @submit.prevent="handleLogin">
          <el-form-item>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入主密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '解锁中...' : '解锁' }}
          </el-button>
        </el-form>
        
        <div class="login-footer">
          <p>使用 pm CLI 作为后端引擎</p>
          <el-link type="primary" @click="showSettings">配置 PM 路径</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Key } from '@element-plus/icons-vue'
import { invoke } from '@tauri-apps/api/core'
import { info } from 'tauri-plugin-log-api'

const emit = defineEmits(['login'])

const loading = ref(false)
const loginForm = reactive({
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.password) {
    ElMessage.warning('请输入主密码')
    return
  }

  loading.value = true
  
  try {
    // 测试密码是否正确
    const result = await invoke('run_command', {
      command: localStorage.getItem('pmPath') || 'pm',
      args: ['--non-interactive', '--log-level', 'off', 'list'],
      env: {
        PM_MASTER_PASSWORD: loginForm.password
      }
    })

    if (result.code === 0) {
      info('Login successful')
      emit('login', loginForm.password)
      ElMessage.success('解锁成功')
    } else {
      ElMessage.error('主密码错误，请重试')
    }
  } catch (error) {
    info('Login failed:', error)
    ElMessage.error('登录失败：' + error)
  } finally {
    loading.value = false
  }
}

const showSettings = () => {
  ElMessage.info('设置功能开发中...')
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.login-container {
  position: relative;
  z-index: 1;
}

.login-card {
  background: white;
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-section h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 16px 0 8px 0;
  color: #1f2937;
}

.logo-section p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
}

.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 8px 0;
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    margin: 24px;
  }
  
  .logo-section h1 {
    font-size: 24px;
  }
}
</style>
