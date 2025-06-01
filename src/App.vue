<template>
  <div id="app-container">
    <header class="app-header">
      <nav>
        <router-link to="/">主页</router-link> |
        <router-link v-if="!authStore.isLoggedIn" to="/login">登录</router-link>
        <router-link v-if="!authStore.isLoggedIn" to="/register">注册</router-link>
        <router-link v-if="authStore.isLoggedIn" to="/dashboard">仪表盘</router-link>
        <router-link v-if="authStore.isLoggedIn" to="/upload">上传照片</router-link>
        <router-link v-if="authStore.isLoggedIn" to="/gallery">我的相册</router-link>
        <router-link v-if="authStore.isLoggedIn" to="/settings">设置</router-link> <a v-if="authStore.isLoggedIn" @click="authStore.logout()" href="#">退出</a>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

// 在应用挂载时检查认证状态，以处理刷新页面后 Pinia 状态丢失的问题
onMounted(() => {
  authStore.checkAuthStatus();
});
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f4f7f6;
  color: #2c3e50;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #333;
  padding: 15px 20px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.app-header nav a,
.app-header nav a:visited {
  color: white;
  text-decoration: none;
  padding: 8px 15px;
  margin: 0 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.app-header nav a:hover {
  background-color: #555;
}

.app-header nav a.router-link-active {
  background-color: #007bff;
  font-weight: bold;
}

.app-header nav a[href="#"] { /* 针对退出链接的样式 */
  cursor: pointer;
}

.app-main {
  flex-grow: 1;
  padding: 20px;
}
</style>