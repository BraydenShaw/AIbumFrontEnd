<template>
  <div class="file-upload-container">
    <h1>上传你的照片</h1>

    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        type="file"
        ref="fileInput"
        multiple
        accept="image/*"
        @change="handleFileChange"
        style="display: none"
      />
      <p>拖拽文件到此处或 <span>点击选择文件</span></p>
      <p class="file-limit">支持图片格式 (JPEG, PNG, GIF等)，最大 5MB</p>
    </div>

    <div v-if="filesToUpload.length" class="file-list-section">
      <h2>待上传文件 ({{ filesToUpload.length }})</h2>
      <ul class="file-list">
        <li v-for="(file, index) in filesToUpload" :key="file.id" class="file-item">
          <div class="file-info">
            <img v-if="file.previewUrl" :src="file.previewUrl" class="file-preview" alt="文件预览" />
            <div v-else class="file-preview-placeholder">无预览</div>
            <div class="file-details">
              <span>{{ file.file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.file.size) }})</span>
              <span v-if="file.progress > 0" class="upload-progress-text">
                {{ file.progress.toFixed(0) }}%
              </span>
              <span v-if="file.status === 'success'" class="upload-status success">上传成功!</span>
              <span v-if="file.status === 'failed'" class="upload-status error">上传失败: {{ file.error }}</span>
            </div>
          </div>
          <div class="file-actions">
            <button @click="removeFile(index)" class="remove-btn" title="移除文件">x</button>
          </div>
          <div v-if="file.progress > 0 && file.status === 'uploading'" class="progress-bar-container">
            <div class="progress-bar" :style="{ width: file.progress + '%' }"></div>
          </div>
        </li>
      </ul>
      <button
        @click="uploadAllFiles"
        :disabled="isUploadingAll || !filesToUpload.length"
        class="upload-all-btn"
      >
        {{ isUploadingAll ? '正在上传...' : '上传所有文件' }} ({{ filesToUpload.filter(f => f.status === 'pending').length }}个)
      </button>
      <p v-if="globalError" class="global-error">{{ globalError }}</p>
    </div>

    <p v-else class="no-files-message">还没有选择任何文件。</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadService } from '../api/uploadService'; // 导入模拟的上传服务

// State variables
const fileInput = ref(null); // 用于引用隐藏的文件输入框
const isDragOver = ref(false); // 拖拽状态
const filesToUpload = ref([]); // 待上传的文件列表
const isUploadingAll = ref(false); // 整体上传状态
const globalError = ref(null); // 全局错误信息

// Constants for file validation
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

// --- Helper Functions ---

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- File Handling Functions ---

const triggerFileInput = () => {
  fileInput.value.click(); // 模拟点击隐藏的文件输入框
};

const handleFileChange = (event) => {
  const newFiles = Array.from(event.target.files);
  addFiles(newFiles);
  // 清空 input 的 value，确保下次选择相同文件时也能触发 change 事件
  event.target.value = '';
};

const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (event) => {
  isDragOver.value = false;
  const droppedFiles = Array.from(event.dataTransfer.files);
  addFiles(droppedFiles);
};

const addFiles = (newFiles) => {
  globalError.value = null; // Clear previous errors

  newFiles.forEach(file => {
    // 1. Validate file type
    if (!ALLOWED_MIMES.includes(file.type)) {
      globalError.value = `文件 "${file.name}" 类型不正确。只允许 ${ALLOWED_MIMES.map(m => m.split('/')[1].toUpperCase()).join(', ')} 格式。`;
      return;
    }
    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      globalError.value = `文件 "${file.name}" 过大。文件大小不能超过 ${MAX_FILE_SIZE_MB}MB。`;
      return;
    }

    // 3. Check for duplicates (简单文件名重复检查)
    if (filesToUpload.value.some(existingFile => existingFile.file.name === file.name && existingFile.file.size === file.size)) {
      console.warn(`File "${file.name}" is already in the list.`);
      return;
    }

    const fileEntry = {
      id: generateUniqueId(),
      file: file,
      previewUrl: null, // 用于存储图片的 Data URL
      progress: 0,
      status: 'pending', // 'pending', 'uploading', 'success', 'failed'
      error: null,
    };

    // 生成图片预览 URL
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fileEntry.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    filesToUpload.value.push(fileEntry);
  });
};

const removeFile = (index) => {
  filesToUpload.value.splice(index, 1);
};

// --- Upload Logic ---

const uploadAllFiles = async () => {
  isUploadingAll.value = true;
  globalError.value = null;
  const pendingFiles = filesToUpload.value.filter(f => f.status === 'pending');

  if (pendingFiles.length === 0) {
    globalError.value = '没有待上传的文件。';
    isUploadingAll.value = false;
    return;
  }

  for (const fileEntry of pendingFiles) {
    fileEntry.status = 'uploading';
    fileEntry.progress = 0;
    fileEntry.error = null;

    const formData = new FormData();
    formData.append('file', fileEntry.file); // 'photo' 是后端接口期望的字段名

    try {
      await uploadService.upload(formData, (event) => {
        // 更新单个文件的上传进度
        fileEntry.progress = (event.loaded / event.total) * 100;
      });
      fileEntry.status = 'success';
      fileEntry.progress = 100; // 确保完成时显示100%
      console.log(`File "${fileEntry.file.name}" uploaded successfully.`);
    } catch (err) {
      fileEntry.status = 'failed';
      fileEntry.error = err.message || '未知错误';
      console.error(`Error uploading "${fileEntry.file.name}":`, err);
      globalError.value = `部分文件上传失败: ${err.message}`;
    }
  }
  isUploadingAll.value = false;
};
</script>

<style scoped>
.file-upload-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  font-family: Arial, sans-serif;
  color: #333;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed #007bff;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8faff;
  margin-bottom: 30px;
}

.upload-area:hover,
.upload-area.drag-over {
  background-color: #e0f2ff;
  border-color: #0056b3;
}

.upload-area p {
  margin: 0;
  font-size: 1.2em;
  color: #555;
}

.upload-area p span {
  color: #007bff;
  font-weight: bold;
}

.upload-area .file-limit {
  font-size: 0.9em;
  color: #888;
  margin-top: 10px;
}

.file-list-section {
  margin-top: 30px;
}

.file-list-section h2 {
  font-size: 1.5em;
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #e9e9e9;
  border-radius: 8px;
  background-color: #fdfdfd;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  position: relative; /* For progress bar */
  overflow: hidden; /* Ensure progress bar doesn't overflow */
}

.file-info {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.file-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 15px;
  border: 1px solid #eee;
}

.file-preview-placeholder {
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  color: #aaa;
  border: 1px solid #eee;
}

.file-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.file-details span {
  font-weight: bold;
  font-size: 1.1em;
  color: #444;
}

.file-size {
  font-size: 0.9em;
  color: #777;
  margin-top: 5px;
}

.upload-progress-text {
  font-size: 0.9em;
  color: #007bff;
  margin-top: 5px;
}

.upload-status {
  font-size: 0.9em;
  font-weight: bold;
  margin-top: 5px;
}

.upload-status.success {
  color: #28a745; /* Green */
}

.upload-status.error {
  color: #dc3545; /* Red */
}

.file-actions {
  margin-left: 20px;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止被挤压 */
}

.remove-btn:hover {
  background-color: #c82333;
}

.progress-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px; /* 进度条高度 */
  background-color: #e9e9e9;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #007bff;
  transition: width 0.1s ease-out; /* 平滑过渡进度 */
  border-radius: 0 0 8px 8px; /* 底部圆角 */
}

.upload-all-btn {
  display: block;
  width: 100%;
  padding: 15px;
  background-color: #28a745; /* Green */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 30px;
}

.upload-all-btn:hover:not(:disabled) {
  background-color: #218838;
}

.upload-all-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.no-files-message {
  text-align: center;
  color: #888;
  font-size: 1.1em;
  margin-top: 50px;
}

.global-error {
  color: #dc3545;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
</style>