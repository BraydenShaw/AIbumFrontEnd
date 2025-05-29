<script setup lang="ts">
import { ref } from 'vue'
import { http } from '@/utils/api'
import type { User } from '@/types'
import { showToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'

const router = useRouter() // 获取 router 实例

async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  try {
    const newUser = await http.post<User>('/users/register', userData)
    showToast({ message: '用户创建成功！', type: 'success' })
    return newUser
  } catch (error) {
    console.error('Failed to create user:', error)
    throw error
  }
}

const activeTab = ref(0)

const loginForm = ref({
  name: '',
  password: '',
})

const registerForm = ref({
  name: '',
  password: '',
  confirmPassword: '',
})

const onLogin = async () => {
  try {
    await http.post('/users/login', {
      name: loginForm.value.name,
      password: loginForm.value.password,
    })
    showToast({ message: '登陆成功！', type: 'success' })
    router.push('/')
  } catch (error) {
    console.error('Failed to login:', error)
  }
}

const validateConfirmPassword = (val: string) => {
  return val === registerForm.value.password
}

const onRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    showToast('两次密码不一致')
    return
  }
  try {
    const user = await createUser({
      name: registerForm.value.name,
      password: registerForm.value.password,
    })
    router.push('/')
  } catch (error) {}
}
</script>

<template>
  <div class="auth-container">
    <van-tabs v-model:active="activeTab" animated swipeable>
      <van-tab title="登录">
        <van-form @submit="onLogin">
          <van-field
            v-model="loginForm.name"
            name="用户名"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="loginForm.password"
            name="密码"
            label="密码"
            type="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <div style="margin: 16px">
            <van-button round block type="primary" native-type="submit">登录</van-button>
          </div>
        </van-form>
      </van-tab>

      <van-tab title="注册">
        <van-form @submit="onRegister">
          <van-field
            v-model="registerForm.name"
            name="用户名"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
          <van-field
            v-model="registerForm.password"
            name="密码"
            label="密码"
            type="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <van-field
            v-model="registerForm.confirmPassword"
            name="确认密码"
            label="确认密码"
            type="password"
            placeholder="请确认密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validateConfirmPassword, message: '两次密码不一致' },
            ]"
          />
          <div style="margin: 16px">
            <van-button round block type="primary" native-type="submit">注册</van-button>
          </div>
        </van-form>
      </van-tab>
    </van-tabs>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px 20px;
}
</style>
