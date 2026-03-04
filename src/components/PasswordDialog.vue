<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑密码' : '添加密码'"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="例如：GitHub"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="例如：user@example.com"
          clearable
        >
          <template #prepend>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="输入密码"
          show-password
          clearable
        >
          <template #append>
            <el-button :icon="Refresh" @click="handleGenerate" />
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="网站 URL">
        <el-input
          v-model="form.url"
          placeholder="https://"
          clearable
        >
          <template #prepend>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="分类">
        <el-select v-model="form.category" placeholder="选择分类" clearable>
          <el-option label="社交" value="social" />
          <el-option label="工作" value="work" />
          <el-option label="金融" value="finance" />
          <el-option label="购物" value="shopping" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="添加备注信息..."
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Link, Refresh } from '@element-plus/icons-vue'
import { invoke } from '@tauri-apps/api/core'
import { info, error } from 'tauri-plugin-log-api'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  visible: Boolean,
  password: Object
})

const emit = defineEmits(['update:visible', 'save'])

const authStore = useAuthStore()
const formRef = ref(null)
const saving = ref(false)

const isEdit = computed(() => props.password && Object.keys(props.password).length > 0)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const form = reactive({
  title: '',
  username: '',
  password: '',
  url: '',
  category: 'other',
  notes: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 监听 password prop 变化
watch(() => props.password, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    form.title = newVal.title || ''
    form.username = newVal.username || ''
    form.password = newVal.password || ''
    form.url = newVal.url || ''
    form.category = newVal.category || 'other'
    form.notes = newVal.notes || ''
  }
}, { immediate: true })

// 生成密码
const handleGenerate = async () => {
  try {
    const result = await invoke('run_command', {
      command: authStore.pmPath,
      args: ['--non-interactive', 'generate', '--length', '20'],
      env: {
        PM_MASTER_PASSWORD: authStore.masterPassword
      }
    })

    if (result.code === 0) {
      // 解析生成的密码
      for (const line of result.stdout.split('\n')) {
        if (line.trim() && !line.includes('Generated') && !line.includes('Strength')) {
          form.password = line.trim()
          info('Password generated successfully')
          ElMessage.success('密码已生成')
          break
        }
      }
    }
  } catch (err) {
    error('Failed to generate password:', err)
    ElMessage.error('生成密码失败')
  }
}

// 保存
const handleSave = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true

  try {
    const args = [
      'add',
      '--title', form.title,
      '--username', form.username,
      '--password', form.password
    ]
    
    if (form.url) args.push('--url', form.url)
    if (form.category) args.push('--category', form.category)
    if (form.notes) args.push('--notes', form.notes)

    const result = await invoke('run_command', {
      command: authStore.pmPath,
      args: ['--non-interactive', ...args],
      env: {
        PM_MASTER_PASSWORD: authStore.masterPassword
      }
    })

    if (result.code === 0) {
      ElMessage.success('保存成功')
      emit('save', form)
      handleClose()
    } else {
      ElMessage.error('保存失败')
    }
  } catch (err) {
    error('Failed to save password:', err)
    ElMessage.error('保存失败：' + err)
  } finally {
    saving.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}
</script>
