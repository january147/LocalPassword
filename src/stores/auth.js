import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    masterPassword: '',
    isAuthenticated: false,
    pmPath: localStorage.getItem('pmPath') || 'pm'
  }),
  
  actions: {
    setMasterPassword(password) {
      this.masterPassword = password
      this.isAuthenticated = true
    },
    
    logout() {
      this.masterPassword = ''
      this.isAuthenticated = false
    },
    
    setPmPath(path) {
      this.pmPath = path
      localStorage.setItem('pmPath', path)
    },
    
    getPmPath() {
      return this.pmPath
    }
  }
})
