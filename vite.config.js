import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 后端地址默认 8080；本机 8080 被占用时可用环境变量 XC_BACKEND 指向别处
const BACKEND = process.env.XC_BACKEND || 'http://localhost:8080'

const proxy = {
  '/login': { target: BACKEND, changeOrigin: true },
  '/jiedan': { target: BACKEND, changeOrigin: true },
  '/captchaImage': { target: BACKEND, changeOrigin: true }
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5174,
    open: false,
    host: true,
    proxy
  },
  preview: {
    port: 4174,
    host: true,
    proxy
  }
})
