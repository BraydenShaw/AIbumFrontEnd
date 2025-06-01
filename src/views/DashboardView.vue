<template>
  <div class="dashboard-container">
    <h2>欢迎，{{ authStore.userInfo?.username || '用户' }}！</h2>
    <p>这里是你的照片管理系统仪表盘。</p>
    <p>你已成功登录，可以访问受保护的资源。</p>
    <button @click="authStore.logout()" class="logout-button">
      退出登录
    </button>

    <div class="dashboard-links">
      <router-link to="/">返回主页</router-link> |
      <router-link to="/upload">上传照片 (待开发)</router-link> |
      <router-link to="/gallery">我的相册 (待开发)</router-link>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  background-color: #f9f9f9;
  text-align: center;
  color: #333;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 28px;
}

p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.logout-button {
  padding: 10px 25px;
  background-color: #dc3545; /* 红色按钮 */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 25px;
}

.logout-button:hover {
  background-color: #c82333;
}

.dashboard-links {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #e0e0e0;
  font-size: 16px;
}

.dashboard-links a {
  color: #007bff;
  text-decoration: none;
  margin: 0 10px;
  transition: color 0.3s ease;
}

.dashboard-links a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>