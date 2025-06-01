// src/api/uploadService.js

// 引入 axios，请确保已通过 npm install axios 安装
import axios from 'axios';

export const uploadService = {
  /**
   * 模拟文件上传到后端
   * @param {FormData} formData - 包含文件的 FormData 对象
   * @param {Function} onUploadProgress - 监听上传进度的回调函数
   * @returns {Promise<any>}
   */
  upload(formData, onUploadProgress) {
    return new Promise((resolve, reject) => {
      // 真实项目中这里会是 axios.post('/your-backend-upload-api', formData, { onUploadProgress })
      // 模拟上传成功或失败
      setTimeout(() => {
        // 模拟进度更新
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          if (onUploadProgress) {
            onUploadProgress({ loaded: progress, total: 100 }); // 模拟进度
          }
          if (progress >= 100) {
            clearInterval(interval);
            console.log('Mock upload completed.');
            resolve({ message: '文件上传成功！', fileId: 'mock_file_id_' + Date.now() });
          }
        }, 200);

        // 可以随机模拟上传失败
        // if (Math.random() > 0.8) {
        //   reject(new Error('模拟上传失败：网络错误或服务器异常'));
        // } else {
        //   resolve({ message: '文件上传成功！', fileId: 'mock_file_id_' + Date.now() });
        // }
      }, 500); // 模拟初始网络延迟
    });
  }
};