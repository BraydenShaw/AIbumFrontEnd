// // src/api/uploadService.js

// // 引入 axios，请确保已通过 npm install axios 安装
// import axios from 'axios';

// export const uploadService = {
//   /**
//    * 模拟文件上传到后端
//    * @param {FormData} formData - 包含文件的 FormData 对象
//    * @param {Function} onUploadProgress - 监听上传进度的回调函数
//    * @returns {Promise<any>}
//    */
//   upload(formData, onUploadProgress) {
//     return new Promise((resolve, reject) => {
//       // 真实项目中这里会是 axios.post('/your-backend-upload-api', formData, { onUploadProgress })
//       // 模拟上传成功或失败
//       setTimeout(() => {
//         // 模拟进度更新
//         let progress = 0;
//         const interval = setInterval(() => {
//           progress += 20;
//           if (onUploadProgress) {
//             onUploadProgress({ loaded: progress, total: 100 }); // 模拟进度
//           }
//           if (progress >= 100) {
//             clearInterval(interval);
//             console.log('Mock upload completed.');
//             resolve({ message: '文件上传成功！', fileId: 'mock_file_id_' + Date.now() });
//           }
//         }, 200);

//         // 可以随机模拟上传失败
//         // if (Math.random() > 0.8) {
//         //   reject(new Error('模拟上传失败：网络错误或服务器异常'));
//         // } else {
//         //   resolve({ message: '文件上传成功！', fileId: 'mock_file_id_' + Date.now() });
//         // }
//       }, 500); // 模拟初始网络延迟
//     });
//   }
// };
// src/api/uploadService.js


import axios from 'axios';

export const uploadService = {
  /**
   * 真实文件上传到后端
   * @param {FormData} formData - 包含文件的 FormData 对象。文件应以 'file' 为键添加。
   * @param {Function} onUploadProgress - 监听上传进度的回调函数
   * @returns {Promise<any>}
   */
  async upload(formData, onUploadProgress) {
    // 后端上传API的URL
    const uploadUrl = 'http://localhost:8080/api/images';

    try {
      console.log('Attempting to upload file to:', uploadUrl);

      // 使用 axios.post 发送 FormData，并传入 onUploadProgress 回调
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          // 当使用 FormData 时，通常不需要手动设置 Content-Type，axios 会自动设置 multipart/form-data
          // 'Content-Type': 'multipart/form-data', // axios 会自动处理
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            // progressEvent 包含 loaded (已上传字节数) 和 total (总字节数)
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress({ loaded: progressEvent.loaded, total: progressEvent.total, percent: percentCompleted });
          }
        },
      });

      // 检查 axios 响应状态码（axios 会自动处理 2xx 状态码为成功）
      if (response.status >= 200 && response.status < 300) {
        console.log('File uploaded successfully:', response.data);
        return response.data; // 返回后端响应的数据
      } else {
        // 对于非 2xx 状态码，axios 默认会抛出错误，但这里为了明确，再次检查
        const errorMessage = response.data.message || `上传失败，状态码: ${response.status}`;
        console.error(`Upload failed: ${errorMessage}`, response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      // 捕获网络错误、超时、或后端返回非 2xx 状态码（axios 会将这些视为错误）
      if (axios.isAxiosError(error)) {
        // 这是 axios 错误
        const responseData = error.response?.data;
        const errorMessage = responseData?.message || error.message;
        console.error('Axios upload error:', error.response || error.request || error.message);
        throw new Error(`文件上传失败: ${errorMessage}`);
      } else {
        // 其他非 axios 错误
        console.error('Generic upload error:', error);
        throw new Error(`文件上传失败: ${error.message || '未知错误'}`);
      }
    }
  },
};
