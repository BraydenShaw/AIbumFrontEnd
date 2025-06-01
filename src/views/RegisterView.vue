<template>
  <div class="auth-container">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label for="confirmPassword">确认密码:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required />
      </div>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? '注册中...' : '注册' }}
      </button>
      <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
    </form>
    <p class="switch-auth">
      已有账号？<router-link to="/login">立即登录</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.error = '两次输入的密码不一致！';
    return;
  }
  authStore.error = null; // 清除之前的错误
  await authStore.register(username.value, password.value);
  // 注册成功后，authStore.error 会被清除，并由 actions 负责跳转
};
</script>

<style scoped>
/* 注册页面样式与登录页面类似，可以共用部分样式 */
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="password"] {
  width: calc(100% - 20px);
  padding: 12px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #28a745; /* 绿色按钮 */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #218838;
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  font-size: 14px;
}

.switch-auth {
  margin-top: 20px;
  font-size: 15px;
  color: #666;
}

.switch-auth a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.switch-auth a:hover {
  text-decoration: underline;
}
</style>