import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const BACKEND = 'http://localhost:8080'

export default defineConfig({
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
    proxy: {
      '/login': { target: BACKEND, changeOrigin: true },
      '/jiedan': { target: BACKEND, changeOrigin: true }
    }
  },
  preview: {
    port: 4174,
    host: true,
    proxy: {
      '/login': { target: BACKEND, changeOrigin: true },
      '/jiedan': { target: BACKEND, changeOrigin: true }
    }
  }
})
