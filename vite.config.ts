import { defineConfig } from 'vite'

export default defineConfig(async () => ({
  plugins: [],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: '0.0.0.0',
    hmr: false
  }
}))
