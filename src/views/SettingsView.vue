<template>
  <div class="settings-container">
    <h1>设置与个人中心</h1>

    <div class="setting-sections">
      <section class="setting-card">
        <h2>个人资料</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-group avatar-group">
            <label>头像:</label>
            <img :src="localUser.avatar" alt="用户头像" class="avatar-preview" />
            <input type="file" @change="handleAvatarUpload" accept="image/*" />
            <p class="hint">点击图片上传新头像（模拟）</p>
          </div>

          <div class="form-group">
            <label for="username">用户名:</label>
            <input type="text" id="username" v-model="localUser.username" disabled />
            <p class="hint">用户名通常不可修改。</p>
          </div>

          <div class="form-group">
            <label for="email">邮箱:</label>
            <input type="email" id="email" v-model="localUser.email" />
          </div>

          <div class="form-group">
            <label for="nickname">昵称:</label>
            <input type="text" id="nickname" v-model="localUser.nickname" />
          </div>

          <div class="form-group">
            <label for="bio">个人简介:</label>
            <textarea id="bio" v-model="localUser.bio" rows="4"></textarea>
          </div>

          <button type="submit" :disabled="isUpdatingProfile" class="save-btn">
            {{ isUpdatingProfile ? '保存中...' : '保存更改' }}
          </button>
          <p v-if="profileError" class="error-message">{{ profileError }}</p>
        </form>
      </section>

      <section class="setting-card">
        <h2>修改密码</h2>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label for="old-password">旧密码:</label>
            <input type="password" id="old-password" v-model="passwordForm.oldPassword" required />
          </div>

          <div class="form-group">
            <label for="new-password">新密码:</label>
            <input type="password" id="new-password" v-model="passwordForm.newPassword" required />
          </div>

          <div class="form-group">
            <label for="confirm-password">确认新密码:</label>
            <input type="password" id="confirm-password" v-model="passwordForm.confirmPassword" required />
          </div>

          <button type="submit" :disabled="isChangingPassword" class="save-btn">
            {{ isChangingPassword ? '修改中...' : '修改密码' }}
          </button>
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        </form>
      </section>

      <section class="setting-card">
        <h2>应用偏好设置</h2>
        <div class="form-group">
          <label for="theme">主题:</label>
          <select id="theme" v-model="appSettings.theme">
            <option value="light">亮色主题</option>
            <option value="dark">暗色主题</option>
          </select>
        </div>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="notifications" v-model="appSettings.enableNotifications" />
          <label for="notifications">启用通知</label>
        </div>
        <button @click="saveAppSettings" class="save-btn">保存偏好设置</button>
        <p v-if="appSettingsMessage" :class="{'success-message': appSettingsMessage.includes('成功'), 'error-message': appSettingsMessage.includes('失败')}">{{ appSettingsMessage }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

// --- 个人信息表单数据 ---
// 使用 reactive 封装对象，或者 ref(JSON.parse(JSON.stringify(authStore.user)))
// 确保是副本，以便在用户未保存前不直接修改 store
const localUser = reactive({
  username: '',
  email: '',
  nickname: '',
  bio: '',
  avatar: '',
});

const isUpdatingProfile = ref(false);
const profileError = ref(null);

// 监听 authStore.currentUser 的变化，并同步到 localUser
watch(() => authStore.currentUser, (newUser) => {
  if (newUser) {
    Object.assign(localUser, newUser); // 复制属性
  } else {
    // 如果用户登出，清空本地数据
    Object.assign(localUser, { username: '', email: '', nickname: '', bio: '', avatar: '' });
  }
}, { immediate: true }); // 立即执行一次以初始化

// --- 密码修改表单数据 ---
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const isChangingPassword = ref(false);
const passwordError = ref(null);

// --- 应用偏好设置数据 ---
const appSettings = reactive({
  theme: 'light',
  enableNotifications: true,
});
const appSettingsMessage = ref('');


// --- 方法 ---

// 处理头像上传（模拟）
const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      localUser.avatar = e.target.result; // 将图片转为 Data URL 显示
      // 在真实应用中，这里会上传文件到后端，并获取后端返回的图片URL
    };
    reader.readAsDataURL(file);
  }
};

// 更新个人信息
const updateProfile = async () => {
  isUpdatingProfile.value = true;
  profileError.value = null;
  try {
    // 只提交可修改的字段
    const updates = {
      email: localUser.email,
      nickname: localUser.nickname,
      bio: localUser.bio,
      avatar: localUser.avatar, // 如果头像有变化，也提交
    };
    await authStore.updateProfile(updates);
    // 成功信息已在 store 中以 alert 提示
  } catch (error) {
    profileError.value = error.message;
  } finally {
    isUpdatingProfile.value = false;
  }
};

// 修改密码
const changePassword = async () => {
  passwordError.value = null;
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '新密码和确认密码不一致。';
    return;
  }
  if (passwordForm.newPassword.length < 6) { // 简单校验
    passwordError.value = '新密码至少需要6位。';
    return;
  }

  isChangingPassword.value = true;
  try {
    await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
    // 成功后 store 会强制登出并跳转，这里无需额外处理
  } catch (error) {
    passwordError.value = error.message;
  } finally {
    isChangingPassword.value = false;
    // 清空密码表单
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  }
};

// 保存应用偏好设置 (模拟)
const saveAppSettings = () => {
  // 在真实应用中，这些设置会保存到用户偏好设置数据库中
  // 或者保存到本地存储 (localStorage)
  console.log('Saving app settings:', appSettings);
  localStorage.setItem('appSettings', JSON.stringify(appSettings));
  appSettingsMessage.value = '应用偏好设置保存成功！';
  setTimeout(() => appSettingsMessage.value = '', 3000); // 3秒后清除消息
};

// 页面加载时从本地存储加载应用偏好设置
onMounted(() => {
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    Object.assign(appSettings, JSON.parse(savedSettings));
  }
});
</script>

<style scoped>
.settings-container {
  max-width: 900px;
  margin: 50px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  color: #333;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
  font-size: 2.5em;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
}

.setting-sections {
  display: grid;
  grid-template-columns: 1fr; /* 默认一列 */
  gap: 30px;
}

@media (min-width: 768px) {
  .setting-sections {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); /* 两列布局 */
  }
}

.setting-card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.setting-card h2 {
  color: #007bff;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.8em;
  border-bottom: 1px solid #e9e9e9;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group textarea,
.form-group select {
  width: calc(100% - 22px); /* 减去 padding 和 border */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box; /* 保持宽度一致 */
}

.form-group input[disabled] {
  background-color: #e9e9e9;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical; /* 允许垂直调整大小 */
  min-height: 80px;
}

.hint {
  font-size: 0.85em;
  color: #888;
  margin-top: 5px;
  margin-bottom: 0;
}

.avatar-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 30px;
}

.avatar-group label {
  margin-bottom: 15px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #007bff;
  margin-bottom: 15px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.avatar-preview:hover {
  transform: scale(1.05);
}

.avatar-group input[type="file"] {
  display: none; /* 隐藏原始文件输入框 */
}

/* 模拟文件输入框的点击区域 */
.avatar-group .hint {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}


.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 10px;
  width: 18px;
  height: 18px;
}

.save-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 20px;
}

.save-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  text-align: center;
  font-weight: bold;
}

.success-message {
    color: #28a745;
    margin-top: 15px;
    text-align: center;
    font-weight: bold;
}
</style>