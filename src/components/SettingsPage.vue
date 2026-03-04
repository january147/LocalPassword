<template>
  <div class="settings-page">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="28" color="#409eff"><Setting /></el-icon>
          <h3>设置</h3>
        </div>
      </template>
      
      <el-form :model="settings" label-width="120px" class="settings-form">
        <el-form-item label="PM CLI 路径">
          <el-input
            v-model="settings.pmPath"
            placeholder="pm"
            clearable
          >
            <template #prepend>
              <el-icon><FolderOpened /></el-icon>
            </template>
          </el-input>
          <div class="help-text">
            PM 命令的完整路径。留空使用系统默认的 'pm' 命令。
          </div>
        </el-form-item>
        
        <el-form-item label="日志级别">
          <el-select v-model="settings.logLevel" placeholder="选择日志级别">
            <el-option label="关闭" value="off" />
            <el-option label="错误" value="error" />
            <el-option label="警告" value="warn" />
            <el-option label="信息" value="info" />
            <el-option label="调试" value="debug" />
          </el-select>
          <div class="help-text">
            控制日志输出的详细程度。生产环境建议使用 '警告' 或 '关闭'。
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSave" size="large">
            保存设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, FolderOpened } from '@element-plus/icons-vue'
import { info } from 'tauri-plugin-log-api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const settings = reactive({
  pmPath: localStorage.getItem('pmPath') || 'pm',
  logLevel: localStorage.getItem('logLevel') || 'warn'
})

const handleSave = () => {
  try {
    localStorage.setItem('pmPath', settings.pmPath)
    localStorage.setItem('logLevel', settings.logLevel)
    
    // 更新 store
    authStore.pmPath = settings.pmPath
    
    ElMessage.success('设置已保存')
    info('Settings saved:', settings)
  } catch (err) {
    ElMessage.error('保存设置失败')
  }
}
</script>

<style scoped>
.settings-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.settings-card {
  width: 100%;
  max-width: 600px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.settings-form {
  padding: 24px;
}

.help-text {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 480px) {
  .settings-page {
    padding: 16px;
  }
  
  .settings-card {
    max-width: 100%;
  }
}
</style>
