// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // 引入认证 Store

// 页面组件
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue'; // 受保护的页面
import HomeView from '../views/HomeView.vue'; // 公开页面示例
import FileUploadView from '../views/FileUploadView.vue'; // 导入上传页面
import GalleryView from '../views/GalleryView.vue'; // 导入相册页面
import SettingsView from '../views/SettingsView.vue'; // 导入设置页面

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false } // 公开页面
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true } // 需要认证才能访问
    },
    // ... 其他照片管理相关的路由，根据需要添加 meta: { requiresAuth: true }
    {
      path: '/upload',
      name: 'upload',
      component: FileUploadView,
      meta: { requiresAuth: true } // 通常上传功能需要登录
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryView,
      meta: { requiresAuth: true } // 通常相册管理需要登录
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true } // 设置页面通常需要登录
    },
  ],
});

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 在每次路由跳转前，检查一次认证状态，以防直接访问
  // 仅在首次加载或刷新时需要深度检查，后续Pinia状态已维护
  // 简单起见，这里每次都检查 localStorage，实际可以优化
  if (!authStore.isAuthenticated && localStorage.getItem('user_token')) {
    await authStore.checkAuthStatus(); // 尝试从 localStorage 恢复登录状态
  }

  // 判断路由是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 如果需要认证但用户未登录，则重定向到登录页
    console.log(`Redirecting to login: ${to.path} requires authentication.`);
    next({ name: 'login', query: { redirect: to.fullPath } }); // 将目标路径作为查询参数传递，登录后可跳转回
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    // 如果用户已登录，但尝试访问登录或注册页面，则重定向到仪表盘或其他主页
    console.log(`Redirecting to dashboard: Already logged in.`);
    next({ name: 'dashboard' });
  } else {
    // 否则正常跳转
    next();
  }
});

export default router;