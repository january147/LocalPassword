<template>
  <div class="generator-page">
    <el-card class="generator-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="32" color="#409eff"><Key /></el-icon>
          <h2>密码生成器</h2>
        </div>
      </template>
      
      <div class="generator-content">
        <!-- 生成的密码 -->
        <div class="generated-section">
          <label>生成的密码</label>
          <div class="password-display">
            <el-input
              v-model="generatedPassword"
              size="large"
              readonly
              class="password-input"
            >
              <template #append>
                <el-button :icon="CopyDocument" @click="handleCopy" />
              </template>
            </el-input>
          </div>
        </div>
        
        <!-- 长度设置 -->
        <div class="length-section">
          <label>密码长度: {{ passwordLength }}</label>
          <el-slider
            v-model="passwordLength"
            :min="8"
            :max="64"
            :step="1"
            @change="handleLengthChange"
          />
        </div>
        
        <!-- 选项 -->
        <div class="options-section">
          <label>字符选项</label>
          <el-checkbox-group v-model="options">
            <el-checkbox label="包含大写字母 (A-Z)" value="uppercase" />
            <el-checkbox label="包含小写字母 (a-z)" value="lowercase" />
            <el-checkbox label="包含数字 (0-9)" value="numbers" />
            <el-checkbox label="包含特殊字符 (!@#$%)" value="symbols" />
          </el-checkbox-group>
        </div>
        
        <!-- 操作按钮 -->
        <div class="actions">
          <el-button
            type="primary"
            size="large"
            :icon="Refresh"
            @click="handleGenerate"
            class="generate-btn"
          >
            生成新密码
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Key, CopyDocument, Refresh } from '@element-plus/icons-vue'
import { invoke } from '@tauri-apps/api/core'
import { info, error } from 'tauri-plugin-log-api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const generatedPassword = ref('')
const passwordLength = ref(20)
const options = ref(['uppercase', 'lowercase', 'numbers', 'symbols'])

// 生成密码
const handleGenerate = async () => {
  try {
    const args = ['generate', '--length', passwordLength.value.toString()]
    
    if (!options.value.includes('uppercase')) args.push('--no-uppercase')
    if (!options.value.includes('lowercase')) args.push('--no-lowercase')
    if (!options.value.includes('numbers')) args.push('--no-numbers')
    if (!options.value.includes('symbols')) args.push('--no-symbols')

    const result = await invoke('run_command', {
      command: authStore.pmPath,
      args: ['--non-interactive', ...args],
      env: {
        PM_MASTER_PASSWORD: authStore.masterPassword
      }
    })

    if (result.code === 0) {
      // 解析生成的密码
      for (const line of result.stdout.split('\n')) {
        if (line.trim() && !line.includes('Generated') && !line.includes('Strength')) {
          generatedPassword.value = line.trim()
          info('Password generated successfully')
          break
        }
      }
    } else {
      ElMessage.error('生成密码失败')
    }
  } catch (err) {
    error('Failed to generate password:', err)
    ElMessage.error('生成密码失败：' + err)
  }
}

// 复制密码
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    ElMessage.success('密码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 长度变化
const handleLengthChange = () => {
  handleGenerate()
}

// 初始化
onMounted(() => {
  handleGenerate()
})
</script>

<style scoped>
.generator-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.generator-card {
  width: 100%;
  max-width: 600px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.generator-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.generated-section label,
.length-section label,
.options-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.password-display {
  margin-bottom: 8px;
}

.password-input :deep(.el-input__inner) {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  letter-spacing: 2px;
  background: #f5f7fa;
}

.length-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.options-section .el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actions {
  margin-top: 8px;
}

.generate-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 480px) {
  .generator-page {
    padding: 16px;
  }
  
  .generator-card {
    max-width: 100%;
  }
}
</style>
