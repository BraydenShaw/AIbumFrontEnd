<template>
  <div class="home-container">
    <h1>欢迎来到照片管理系统！</h1>
    <p>这是一个公开页面，任何人都可以访问。</p>
    <p>请登录或注册以管理你的照片。</p>
    <div class="home-links">
      <router-link to="/login" class="btn btn-primary">登录</router-link>
      <router-link to="/register" class="btn btn-secondary">注册</router-link>
      <router-link v-if="authStore.isLoggedIn" to="/dashboard" class="btn btn-success">进入仪表盘</router-link>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();
</script>

<style scoped>
.home-container {
  text-align: center;
  margin-top: 100px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 1.1em;
  margin-bottom: 25px;
}

.home-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.btn {
  display: inline-block;
  padding: 12px 25px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-size: 1.1em;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: 1px solid #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #004085;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: 1px solid #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: 1px solid #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}
</style>