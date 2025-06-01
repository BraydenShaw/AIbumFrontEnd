<template>
  <div v-if="isVisible" class="image-viewer-overlay" @click.self="close">
    <div class="image-viewer-content">
      <button class="close-btn" @click="close">&times;</button>
      <div class="image-display-area">
        <img :src="photo.url" :alt="photo.title" class="main-image" @load="handleImageLoad" @error="handleImageError" />
        <div v-if="isLoadingImage" class="loading-spinner"></div>
      </div>
      <div class="image-details">
        <h3>{{ photo.title || '无标题' }}</h3>
        <p v-if="photo.description">{{ photo.description }}</p>

        <div class="detail-item">
          <strong>分类:</strong>
          <select v-model="localCategoryId" @change="saveMetadata">
            <option :value="null">未分类</option>
            <option v-for="cat in galleryStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
          <button @click="openCreateCategoryModal" class="create-category-btn" title="创建新分类">+</button>
        </div>

        <div class="detail-item tags-editor">
          <strong>标签:</strong>
          <TagInput v-model="localTags" :available-tags="galleryStore.availableTags" @update:modelValue="saveMetadata" />
        </div>

        <div class="detail-item">
          <strong>上传日期:</strong> {{ photo.uploadDate }}
        </div>
        <div class="detail-item">
          <strong>大小:</strong> {{ photo.size }}
        </div>
        <div class="detail-item">
          <strong>分辨率:</strong> {{ photo.width }}x{{ photo.height }}
        </div>

        <button @click="confirmDelete" class="delete-btn">删除图片</button>
      </div>
    </div>

    <div v-if="isCreateCategoryModalVisible" class="modal-overlay" @click.self="isCreateCategoryModalVisible = false">
      <div class="modal-content">
        <h3>创建新分类</h3>
        <input type="text" v-model.trim="newCategoryName" placeholder="输入分类名称" class="category-input" />
        <div class="modal-actions">
          <button @click="createCategory" :disabled="!newCategoryName || createCategoryLoading">
            {{ createCategoryLoading ? '创建中...' : '创建' }}
          </button>
          <button @click="isCreateCategoryModalVisible = false" class="cancel-btn">取消</button>
        </div>
        <p v-if="createCategoryError" class="error-message">{{ createCategoryError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useGalleryStore } from '../stores/gallery';
import TagInput from './TagInput.vue'; // 引入标签输入组件
const galleryStore = useGalleryStore(); 
const props = defineProps({
  photo: {
    type: Object,
    default: null,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'delete']);

const isLoadingImage = ref(true);
// 用于本地编辑的响应式数据
const localCategoryId = ref(null);
const localTags = ref([]);

// 创建分类模态框相关
const isCreateCategoryModalVisible = ref(false);
const newCategoryName = ref('');
const createCategoryLoading = ref(false);
const createCategoryError = ref(null);

// 监听 photo 变化，重置加载状态
watch(() => props.photo, (newPhoto) => {
  if (newPhoto) {
    isLoadingImage.value = true;
    localCategoryId.value = newPhoto.categoryId || null;
    localTags.value = [...(newPhoto.tags || [])]; // 复制一份，避免直接修改props
  }
}, { immediate: true });
// 首次挂载时加载分类和标签
onMounted(() => {
  galleryStore.fetchCategories();
  galleryStore.fetchAvailableTags();
});
const handleImageLoad = () => {
  isLoadingImage.value = false;
};

const handleImageError = () => {
  isLoadingImage.value = false;
  console.error('Failed to load image:', props.photo.url);
  // 可以显示一个错误占位图
};

const close = () => {
  emit('close');
};

const confirmDelete = () => {
  if (confirm(`确定要删除图片 "${props.photo.title}" 吗？此操作不可撤销。`)) {
    emit('delete', props.photo.id);
  }
};

// 保存图片元数据 (分类和标签)
const saveMetadata = async () => {
  if (!props.photo) return;
  console.log('Saving metadata:', { categoryId: localCategoryId.value, tags: localTags.value });
  try {
    await galleryStore.updatePhotoMetadata(props.photo.id, {
      categoryId: localCategoryId.value,
      tags: localTags.value
    });
    // 更新成功后，Pinia store 已更新，无需额外操作
  } catch (err) {
    // 错误信息已在 store 中处理，这里可以进一步反馈给用户
  }
};

// 创建分类模态框
const openCreateCategoryModal = () => {
  newCategoryName.value = ''; // 清空输入
  createCategoryError.value = null;
  isCreateCategoryModalVisible.value = true;
};

const createCategory = async () => {
  if (!newCategoryName.value) return;
  createCategoryLoading.value = true;
  createCategoryError.value = null;
  try {
    const newCat = await galleryStore.createCategory(newCategoryName.value);
    localCategoryId.value = newCat.id; // 新建成功后自动选中该分类
    isCreateCategoryModalVisible.value = false;
    saveMetadata(); // 自动保存当前图片的分类
  } catch (err) {
    createCategoryError.value = err.message || '创建分类失败！';
  } finally {
    createCategoryLoading.value = false;
  }
};
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px); /* 毛玻璃效果 */
}

.image-viewer-content {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2em;
  color: #fff; /* 初始为白色，悬浮时变为黑色 */
  cursor: pointer;
  z-index: 1001; /* 确保在图片和内容之上 */
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5); /* 增加可读性 */
  transition: color 0.2s ease-in-out;
}

.close-btn:hover {
  color: #ccc;
}

.image-display-area {
  flex: 2; /* 占据更多空间 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #222; /* 图片区域背景色 */
  position: relative;
  overflow: hidden; /* 防止图片溢出 */
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 确保图片完整显示 */
  display: block; /* 消除图片底部的空白 */
}

.loading-spinner {
  position: absolute;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-details {
  flex: 1; /* 占据较少空间 */
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 使得删除按钮在底部 */
  background-color: #f7f7f7;
  border-left: 1px solid #eee;
  padding-bottom: 20px;
}

.image-details h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.8em;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.image-details p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
  font-size: 0.95em;
}

.detail-item {
  margin-bottom: 15px; /* 增加间距 */
}


.detail-item strong {
  display: block; /* 让标题独占一行 */
  margin-bottom: 8px;
  font-size: 1.1em;
  color: #2c3e50;
}

.tag {
  display: inline-block;
  background-color: #e9eff5;
  color: #4a6785;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-right: 8px;
  margin-bottom: 5px;
  font-weight: bold;
}

select {
  width: calc(100% - 40px); /* 留出按钮空间 */
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  margin-right: 5px;
  height: 40px; /* 统一高度 */
  box-sizing: border-box;
}

.create-category-btn {
  background-color: #28a745; /* 绿色 */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0 10px;
  font-size: 1.8em;
  height: 40px;
  line-height: 1; /* 调整行高使文字居中 */
  cursor: pointer;
  transition: background-color 0.2s;
  vertical-align: middle; /* 对齐下拉框 */
}

.create-category-btn:hover {
  background-color: #218838;
}

.tags-editor {
  margin-top: 20px; /* 增加与上方分类的间距 */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #333;
}

.category-input {
  width: calc(100% - 20px);
  padding: 12px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}

.modal-actions button:first-child {
  background-color: #007bff;
  color: white;
}

.modal-actions button:first-child:hover:not(:disabled) {
  background-color: #0056b3;
}

.modal-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  font-size: 0.9em;
}
.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 20px; /* 推到底部 */
}

.delete-btn:hover {
  background-color: #c82333;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .image-viewer-content {
    flex-direction: column; /* 小屏幕上垂直堆叠 */
    max-width: 95vw;
    max-height: 95vh;
  }

  .image-display-area {
    min-height: 50vh; /* 确保图片区域有最小高度 */
  }

  .image-details {
    border-left: none;
    border-top: 1px solid #eee;
  }

  .close-btn {
    color: #333; /* 小屏幕上可以改回深色，防止在浅色背景上看不清 */
    text-shadow: none;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    padding: 0 8px;
  }
}
</style>