import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: 'localhost',
    open: true,
    port: 5173,
    proxy: {
      '/api/debug': {
        target: 'http://localhost:8080', // 后端服务地址
        changeOrigin: true, // 是否改变源
        rewrite: (path) => path.replace(/^\/api\/debug/, '/api'), // 重写路径
      },
    },
  },
})
