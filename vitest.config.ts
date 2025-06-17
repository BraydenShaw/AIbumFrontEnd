import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
// https://vite.dev/config/
// export default defineConfig({
// plugins:[vue(),vueJsx(),vueDevTools()],resolve:{
// alias:{
// '@': fileURLToPath(new URL('./src',import.meta.url))
// },},
// server:{
// host:'localhost',
// open: true,
// port: 5173,
// proxy: {
// '/api/debug':{
// //后端服务地址
// target:'http://localhost:8080',
// changeOrigin:true,//是否改变源3分钟前。Uncommitted changesYou,
// rewrite:(path)=> path.replace(/^\/api\/debug/,'/api'),// 重写路径
// },},},})