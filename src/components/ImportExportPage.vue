<template>
  <div class="import-export-page">
    <el-row :gutter="24">
      <el-col :span="12">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="28" color="#10b981"><Download /></el-icon>
              <h3>导出密码</h3>
            </div>
          </template>
          
          <div class="card-content">
            <p class="description">将所有密码导出为 JSON 文件备份</p>
            
            <el-button
              type="success"
              size="large"
              :icon="Download"
              :loading="exporting"
              @click="handleExport"
              class="action-btn"
            >
              {{ exporting ? '导出中...' : '导出密码' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="28" color="#409eff"><Upload /></el-icon>
              <h3>导入密码</h3>
            </div>
          </template>
          
          <div class="card-content">
            <p class="description">从 JSON 文件导入密码到数据库</p>
            
            <el-button
              type="primary"
              size="large"
              :icon="Upload"
              :loading="importing"
              @click="triggerImport"
              class="action-btn"
            >
              {{ importing ? '导入中...' : '导入密码' }}
            </el-button>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              style="display: none"
              @change="handleImport"
            >
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import { invoke } from '@tauri-apps/api/core'
import { info, error } from '../utils/logger'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref(null)

// 导出密码
const handleExport = async () => {
  try {
    exporting.value = true
    
    const result = await invoke('run_command', {
      command: authStore.pmPath,
      args: ['--non-interactive', 'export', 'passwords.json', '--log-level', 'off'],
      env: {
        PM_MASTER_PASSWORD: authStore.masterPassword
      }
    })

    if (result.code === 0) {
      // 创建下载链接
      const blob = new Blob([result.stdout], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'passwords.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      ElMessage.success('导出成功')
      info('Passwords exported successfully')
    } else {
      ElMessage.error('导出失败')
    }
  } catch (err) {
    error('Failed to export passwords:', err)
    ElMessage.error('导出失败：' + err.message)
  } finally {
    exporting.value = false
  }
}

// 触发导入
const triggerImport = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 导入密码
const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    importing.value = true
    
    // 读取文件内容
    const content = await file.text()
    
    // 将文件保存到临时路径（使用 Tauri 的文件系统 API）
    const result = await invoke('save_temp_file', {
      content: content
    })

    if (result.success) {
      const importResult = await invoke('run_command', {
        command: authStore.pmPath,
        args: ['--non-interactive', 'import', result.path, '--log-level', 'off'],
        env: {
          PM_MASTER_PASSWORD: authStore.masterPassword
        }
      })

      if (importResult.code === 0) {
        ElMessage.success('导入成功')
        info('Passwords imported successfully')
      } else {
        ElMessage.error('导入失败')
      }
    } else {
      ElMessage.error('保存文件失败')
    }
  } catch (err) {
    error('Failed to import passwords:', err)
    ElMessage.error('导入失败：' + err.message)
  } finally {
    importing.value = false
    // 清空 input
    event.target.value = ''
  }
}
</script>

<style scoped>
.import-export-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.action-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

.description {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.action-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .import-export-page {
    padding: 16px;
  }
  
  .el-col {
    margin-bottom: 24px;
  }
}
</style>
