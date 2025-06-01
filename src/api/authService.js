// src/api/authService.js

// 模拟的用户数据 (实际项目中从数据库获取)
const users = new Map(); // key: username, value: { password, token }

// 初始化一些测试用户
users.set('testuser', { password: 'password123', token: 'mock_jwt_token_testuser' });
users.set('admin', { password: 'admin123', token: 'mock_jwt_token_admin' });

export const authService = {
  /**
   * 模拟用户登录
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{token: string}>}
   */
  login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.get(username);
        if (user && user.password === password) {
          console.log(`User ${username} logged in successfully.`);
          resolve({ token: user.token });
        } else {
          console.error(`Login failed for ${username}: Invalid credentials.`);
          reject(new Error('用户名或密码不正确！'));
        }
      }, 1000); // 模拟网络延迟
    });
  },

  /**
   * 模拟用户注册
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{message: string}>}
   */
  register(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (users.has(username)) {
          console.error(`Registration failed for ${username}: Username already exists.`);
          reject(new Error('用户名已存在！'));
        } else {
          // 在实际项目中，这里会将密码进行哈希存储，并生成新的Token
          users.set(username, { password: password, token: `mock_jwt_token_${username}` });
          console.log(`User ${username} registered successfully.`);
          resolve({ message: '注册成功！' });
        }
      }, 1000); // 模拟网络延迟
    });
  },

  /**
   * 模拟验证Token (实际项目中可能用于验证用户是否还在登录状态)
   * @param {string} token
   * @returns {Promise<boolean>}
   */
  verifyToken(token) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 在实际项目中，这里会向后端发送请求验证Token的有效性
        // 简单模拟：只要Token存在，就认为是有效的
        const isValid = Array.from(users.values()).some(user => user.token === token);
        console.log(`Token verification: ${token} is ${isValid ? 'valid' : 'invalid'}`);
        resolve(isValid);
      }, 500);
    });
  }
};