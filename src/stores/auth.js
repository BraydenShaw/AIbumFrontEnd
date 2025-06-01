// src/stores/auth.js

import { defineStore } from 'pinia';
import { authService } from '../api/authService';
import router from '../router'; // 引入 router 用于跳转

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('user_token') || null, // 从 localStorage 读取 Token
    isAuthenticated: !!localStorage.getItem('user_token'), // 根据 Token 判断是否认证
    user: null, // 存储用户信息，例如 { username: 'xxx', roles: ['admin'] }
    loading: false,
    error: null,
  }),

  getters: {
    // 方便地获取认证状态
    isLoggedIn: (state) => state.isAuthenticated,
    // 获取用户Token
    authToken: (state) => state.token,
    // 获取用户信息
    userInfo: (state) => state.user,
  },

  actions: {
    /**
     * 用户登录
     * @param {string} username
     * @param {string} password
     */
    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(username, password);
        this.token = response.token;
        this.isAuthenticated = true;
        localStorage.setItem('user_token', response.token); // 存储 Token 到 localStorage
        // 在实际项目中，这里会获取并存储更详细的用户信息
        this.user = { username: username, roles: ['user'] }; // 模拟用户角色
        router.push('/dashboard'); // 登录成功后跳转到仪表盘
      } catch (err) {
        this.error = err.message || '登录失败！';
        this.token = null;
        this.isAuthenticated = false;
        this.user = null;
        localStorage.removeItem('user_token');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 用户注册
     * @param {string} username
     * @param {string} password
     */
    async register(username, password) {
      this.loading = true;
      this.error = null;
      try {
        await authService.register(username, password);
        // 注册成功后可以自动登录或者跳转到登录页
        // await this.login(username, password); // 自动登录
        router.push('/login'); // 跳转到登录页让用户手动登录
        alert('注册成功，请登录！');
      } catch (err) {
        this.error = err.message || '注册失败！';
      } finally {
        this.loading = false;
      }
    },

    /**
     * 用户登出
     */
    logout() {
      this.token = null;
      this.isAuthenticated = false;
      this.user = null;
      localStorage.removeItem('user_token'); // 从 localStorage 移除 Token
      router.push('/login'); // 登出后跳转到登录页
      console.log('User logged out.');
    },

    /**
     * 检查用户是否已登录 (在应用初始化时调用)
     * 作用：刷新页面后，根据 localStorage 中的 Token 恢复登录状态
     */
    async checkAuthStatus() {
      const storedToken = localStorage.getItem('user_token');
      if (storedToken && !this.isAuthenticated) { // 只有在有Token但未认证时才进行检查
        this.loading = true;
        try {
          const isValid = await authService.verifyToken(storedToken);
          if (isValid) {
            this.token = storedToken;
            this.isAuthenticated = true;
            // 在实际项目中，这里会根据Token从后端获取用户信息
            this.user = { username: 'guest', roles: ['user'] }; // 模拟用户信息
            console.log('Auth status restored from localStorage.');
          } else {
            this.logout(); // Token无效则清除登录状态
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          this.logout();
        } finally {
          this.loading = false;
        }
      } else if (!storedToken && this.isAuthenticated) {
         // 如果 localStorage 中没有 Token，但 store 中却是登录状态，则清除
         this.logout();
      }
    }
  },
});