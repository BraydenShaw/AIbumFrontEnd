// src/api/authService.js

// 模拟的用户数据 (实际项目中从数据库获取)
const users = new Map(); // key: username, value: { password, token }

// 初始化一些测试用户
users.set('testuser', { password: 'password123', token: 'mock_jwt_token_testuser' });
users.set('admin', { password: 'admin123', token: 'mock_jwt_token_admin' });

// export const authService = {
//   /**
//    * 模拟用户登录
//    * @param {string} username
//    * @param {string} password
//    * @returns {Promise<{token: string}>}
//    */
//   login(username, password) {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         const user = users.get(username);
//         if (user && user.password === password) {
//           console.log(`User ${username} logged in successfully.`);
//           resolve({ token: user.token });
//         } else {
//           console.error(`Login failed for ${username}: Invalid credentials.`);
//           reject(new Error('用户名或密码不正确！'));
//         }
//       }, 1000); // 模拟网络延迟
//     });
//   },


export const authService = {
  /**
   * 实际用户登录功能，连接后端API
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{token: string}>}
   */
  async login(username, password) {
    // 后端登录API的URL
    const loginUrl = 'http://localhost:8080/api/users/login';
     const user = users.get(username);
     

    try {
      console.log(`Attempting to log in user: ${username}`);
      if (user && user.password === password) {
return new Promise((resolve, reject) => {
      
        const user = users.get(username);
        if (user && user.password === password) {
          console.log(`User ${username} logged in successfully.`);
          resolve({ token: user.token });
        }
        })}
      else {const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 将用户名和密码作为JSON字符串放入请求体
        body: JSON.stringify({ name: username, password: password }),
      });
    }
      // 检查HTTP响应状态码
      if (response.ok ) { // response.ok 表示状态码在 200-299 之间
        const data = await response.json();
        console.log(`User ${username} logged in successfully from backend.`, data);
        // 假设后端返回的数据中包含 'token' 字段
        if (data.token) {
          // 登录成功后，可以根据后端返回的数据进行处理，例如保存token
          users.set(username, { password: password, token: data.token }); // 更新本地模拟数据（可选）
          // return { token: data.token };
          return { token: 'mock_jwt_token_testuser' };
        } else {
          // 如果后端没有返回token，视为登录失败或响应格式不正确
          // throw new Error('登录成功但未获取到有效的令牌。');
        }
      } else {
        // 处理后端返回的错误信息
        const errorData = await response.json();
        const errorMessage = errorData.message || '登录失败，请检查用户名或密码。';
        console.error(`Login failed for ${username}: ${response.status} - ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`Network or API error during login for ${username}:`, error);
      // 抛出错误以便调用方捕获
      throw new Error('网络请求失败或服务器无响应。' + error.message);
    }
  },

  // /**
  //  * 模拟用户注册
  //  * @param {string} username
  //  * @param {string} password
  //  * @returns {Promise<{message: string}>}
  //  */
  // register(username, password) {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       if (users.has(username)) {
  //         console.error(`Registration failed for ${username}: Username already exists.`);
  //         reject(new Error('用户名已存在！'));
  //       } else {
  //         // 在实际项目中，这里会将密码进行哈希存储，并生成新的Token
  //         users.set(username, { password: password, token: `mock_jwt_token_${username}` });
  //         console.log(`User ${username} registered successfully.`);
  //         resolve({ message: '注册成功！' });
  //       }
  //     }, 1000); // 模拟网络延迟
  //   });
  // },


   /**
   * 实际用户注册功能，连接后端API
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{message: string}>}
   */
  async register(username, password) {
    // 后端注册API的URL
    const registerUrl = 'http://localhost:8080/api/users/register';

    try {
      console.log(`Attempting to register user: ${username}`);
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 将用户名和密码作为JSON字符串放入请求体
        body: JSON.stringify({ name: username, password: password }),
      });

      // 检查HTTP响应状态码
      if (response.ok) { // response.ok 表示状态码在 200-299 之间
        const data = await response.json();
        console.log(`User ${username} registered successfully on backend.`, data);
        // 注册成功后，可以根据后端返回的数据进行处理
        // 这里为了保持模拟数据的完整性，我们依然可以更新本地的users Map，但这在实际项目中不是必须的
        // 如果后端返回了用户ID或令牌等，可以在这里处理
        users.set(username, { password: password, token: `mock_jwt_token_${username}_backend` });
        return { message: data.message || '注册成功！' }; // 使用后端返回的消息或默认消息
      } else {
        // 处理后端返回的错误信息
        const errorData = await response.json();
        const errorMessage = errorData.message || '注册失败，请稍后再试。';
        console.error(`Registration failed for ${username}: ${response.status} - ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`Network or API error during registration for ${username}:`, error);
      // 抛出错误以便调用方捕获
      throw new Error('网络请求失败或服务器无响应。' + error.message);
    }
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