<template>
  <div class="gallery-container">
    <h1>我的相册</h1>

    <div class="gallery-filters">
      <div class="filter-group">
        <label for="category-filter">分类:</label>
        <select id="category-filter" v-model="selectedCategoryFilterId" @change="applyFilters">
          <option :value="null">所有分类</option>
          <option v-for="cat in galleryStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <div v-if="galleryStore.loadingCategories" class="filter-loading">加载分类...</div>
      </div>

      <div class="filter-group tag-filter-group">
        <label for="tag-filter">标签:</label>
        <div class="selected-tags-display">
          <span v-for="(tag, index) in localSelectedTags" :key="tag" class="filter-tag-item">
            {{ tag }}
            <button @click="removeFilterTag(index)" class="remove-filter-tag-btn">&times;</button>
          </span>
          <input
            type="text"
            v-model.trim="newFilterTag"
            @keydown.enter.prevent="addFilterTag"
            @keydown.tab.prevent="addFilterTag"
            :placeholder="localSelectedTags.length === 0 ? '添加标签筛选...' : ''"
            class="filter-tag-input"
            @focus="showFilterTagSuggestions = true"
            @blur="handleFilterTagInputBlur"
          />
        </div>
        <div v-if="showFilterTagSuggestions && filteredFilterTagSuggestions.length" class="filter-tag-suggestions">
          <div
            v-for="suggestion in filteredFilterTagSuggestions"
            :key="suggestion"
            class="suggestion-item"
            @mousedown.prevent="selectFilterTagSuggestion(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
        <div v-if="galleryStore.loadingTags" class="filter-loading">加载标签...</div>
      </div>
    </div>

    <div v-if="galleryStore.isLoadingPhotos && galleryStore.photos.length === 0" class="loading-message">
      <div class="spinner"></div>
      <p>正在加载图片...</p>
    </div>

    <div v-else-if="galleryStore.photos.length === 0 && !galleryStore.isLoadingPhotos" class="no-photos-message">
      <p>您的相册中还没有图片，快去 <router-link to="/upload">上传</router-link> 吧！</p>
      <p v-if="selectedCategoryFilterId || localSelectedTags.length">当前筛选条件下没有图片。</p>
    </div>

    <div v-else class="photo-grid" ref="photoGridRef">
      <div
        v-for="photo in galleryStore.photos"
        :key="photo.id"
        class="photo-item"
        @click="openImageViewer(photo)"
      >
        <img
          v-lazy="photo.thumbnailUrl"
          :alt="photo.title"
          class="photo-thumbnail"
        />
        <div class="photo-info">
          <h3>{{ photo.title }}</h3>
          <p class="photo-date">{{ photo.uploadDate }}</p>
          <div class="photo-tags">
              <span v-for="tag in photo.tags" :key="tag" class="photo-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="galleryStore.canLoadMore && galleryStore.photos.length > 0" class="load-more-section">
      <button @click="galleryStore.loadMorePhotos()" :disabled="galleryStore.isLoadingPhotos" class="load-more-btn">
        {{ galleryStore.isLoadingPhotos ? '加载中...' : '加载更多' }}
      </button>
    </div>
    <p v-else-if="!galleryStore.canLoadMore && galleryStore.photos.length > 0 && !galleryStore.isLoadingPhotos" class="end-of-list-message">
      没有更多图片了
    </p>

    <p v-if="galleryStore.error" class="error-message">{{ galleryStore.error }}</p>

    <ImageViewer
      :photo="selectedPhoto"
      :isVisible="isImageViewerVisible"
      @close="closeImageViewer"
      @delete="handleDeletePhoto"
    />
  </div>
</template>


<script setup>


import { ref, onMounted, onUnmounted, computed } from 'vue'; // <-- 在这里添加 computed
import { useGalleryStore } from '../stores/gallery';
import ImageViewer from '../components/ImageViewer.vue';
const galleryStore = useGalleryStore();

// 图片详情查看器相关 state
const selectedPhoto = ref(null);
const isImageViewerVisible = ref(false);

// 筛选器相关 state
const selectedCategoryFilterId = ref(null); // 绑定到分类选择框
const localSelectedTags = ref([]); // 用于标签筛选的本地数组
const newFilterTag = ref(''); // 标签筛选输入框的临时值
const showFilterTagSuggestions = ref(false); // 标签筛选建议的显示状态

// 瀑布流容器引用 (用于实现无限滚动)
const photoGridRef = ref(null);

// --- 图片详情查看器方法 ---
const openImageViewer = (photo) => {
  selectedPhoto.value = photo;
  isImageViewerVisible.value = true;
};

const closeImageViewer = () => {
  selectedPhoto.value = null;
  isImageViewerVisible.value = false;
};

const handleDeletePhoto = async (photoId) => {
  closeImageViewer(); // 关闭弹窗
  await galleryStore.deletePhoto(photoId);
  // 删除后，可以考虑重新加载当前筛选条件下的图片
  if (galleryStore.photos.length === 0 && galleryStore.currentPage > 1) {
      galleryStore.refreshPhotos(); // 如果当前页删没了，重新加载第一页
  }
};

// --- 筛选器方法 ---
const applyFilters = () => {
  galleryStore.setCategoryFilter(selectedCategoryFilterId.value);
  galleryStore.setTagFilter(localSelectedTags.value);
};

// 标签筛选器逻辑
const addFilterTag = () => {
  if (newFilterTag.value && !localSelectedTags.value.includes(newFilterTag.value)) {
    localSelectedTags.value.push(newFilterTag.value);
    newFilterTag.value = '';
    showFilterTagSuggestions.value = false;
    applyFilters(); // 应用新筛选
  }
};

const removeFilterTag = (index) => {
  localSelectedTags.value.splice(index, 1);
  applyFilters(); // 应用新筛选
};

const filteredFilterTagSuggestions = computed(() => {
  if (!newFilterTag.value) {
    return galleryStore.availableTags.filter(tag => !localSelectedTags.value.includes(tag));
  }
  return galleryStore.availableTags.filter(tag =>
    tag.toLowerCase().includes(newFilterTag.value.toLowerCase()) && !localSelectedTags.value.includes(tag)
  );
});

const selectFilterTagSuggestion = (tag) => {
  if (!localSelectedTags.value.includes(tag)) {
    localSelectedTags.value.push(tag);
    newFilterTag.value = '';
    showFilterTagSuggestions.value = false;
    applyFilters(); // 应用新筛选
  }
};

const handleFilterTagInputBlur = () => {
  setTimeout(() => {
    showFilterTagSuggestions.value = false;
  }, 150);
};

// --- 无限滚动逻辑 (可选，如果不需要点击加载更多) ---
const handleScroll = () => {
  const container = photoGridRef.value;
  if (!container) return;

  // 这里的滚动监听需要针对 `photo-grid` div 自身，
  // 或者你也可以监听 `window` 的滚动事件并调整判断条件
  const scrollBottom = container.scrollTop + container.clientHeight;
  const contentHeight = container.scrollHeight;

  if (scrollBottom >= contentHeight - 300 && galleryStore.canLoadMore) {
    galleryStore.loadMorePhotos();
  }
};


onMounted(async () => {
  // 加载分类和标签数据
  await galleryStore.fetchCategories();
  await galleryStore.fetchAvailableTags();

  // 如果图片列表为空（首次加载或刷新），则加载第一批图片
  if (galleryStore.photos.length === 0) {
    await galleryStore.loadMorePhotos();
  }

  // 为 photo-grid 添加滚动事件监听器（如果 photo-grid 是可滚动的）
  // 确保 photoGridRef.value 存在
  // 例如，如果 photo-grid 设置了 max-height 和 overflow-y: auto
  // photoGridRef.value?.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // 清理滚动事件监听器
  // photoGridRef.value?.removeEventListener('scroll', handleScroll);
});
const vLazy = {
  beforeMount(el, binding) {
    const defaultSrc = 'https://via.placeholder.com/150/F8F8F8/888888?text=Loading...'; // 默认占位图
    el.src = defaultSrc; // 设置占位图
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value; // 加载实际图片
          observer.unobserve(el);
        }
      });
    }, {
      rootMargin: '0px 0px 100px 0px' // 提前100px加载
    });
    observer.observe(el);
  }
};
</script>

<style scoped>
.gallery-container {
  max-width: 1200px;
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
  margin-bottom: 30px;
  font-size: 2.5em;
}
.gallery-filters {
  display: flex;
  justify-content: center;
  gap: 25px; /* 增加间距 */
  margin-bottom: 30px;
  flex-wrap: wrap; /* 小屏幕换行 */
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.05);
}

/* 瀑布流布局 (使用 CSS Grid Columns) */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* 自动填充，每列最小250px */
  grid-gap: 20px; /* 网格间距 */
  align-items: start; /* 确保所有图片从顶部对齐 */
  margin-top: 30px;
}

.photo-item {
  background-color: #f0f0f0; /* 占位背景色 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex; /* 让图片和信息垂直排列 */
  flex-direction: column;
}

.photo-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.photo-thumbnail {
  width: 100%;
  height: auto; /* 保持图片比例 */
  display: block;
  object-fit: cover; /* 裁剪图片以填充容器 */
  min-height: 150px; /* 最小高度，防止图片加载前太小 */
  background-color: #e9e9e9; /* 懒加载占位色 */
}

.photo-info {
  padding: 15px;
  text-align: left;
  flex-grow: 1; /* 让信息区域占据剩余空间 */
}

.photo-info h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 1.1em;
  color: #333;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.photo-info p {
  font-size: 0.85em;
  color: #777;
  margin-bottom: 0;
}

.loading-message, .no-photos-message, .end-of-list-message {
  text-align: center;
  padding: 30px;
  color: #666;
  font-size: 1.1em;
}

.loading-message .spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-photos-message a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.no-photos-message a:hover {
  text-decoration: underline;
}

.load-more-section {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1em;
  color: #555;
  position: relative; /* 用于标签建议的定位 */
}

.filter-group label {
  font-weight: bold;
  color: #333;
}

.filter-group select,
.filter-tag-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  min-width: 150px;
  box-sizing: border-box;
  height: 40px; /* 统一高度 */
}

.filter-loading {
  font-size: 0.9em;
  color: #888;
}

.tag-filter-group {
  min-width: 300px; /* 为标签输入和建议留出空间 */
  flex-grow: 1; /* 标签筛选器可以更灵活地占用空间 */
}

.selected-tags-display {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 40px;
  align-items: center;
  flex-grow: 1;
  box-sizing: border-box;
  overflow: hidden; /* 防止内容溢出 */
}

.filter-tag-item {
  background-color: #e0eaff;
  color: #0056b3;
  padding: 5px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  font-weight: bold;
}

.remove-filter-tag-btn {
  background: none;
  border: none;
  color: #0056b3;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  font-size: 1em;
  line-height: 1;
  transition: color 0.2s;
}

.remove-filter-tag-btn:hover {
  color: #dc3545;
}

.filter-tag-input {
  border: none;
  outline: none;
  padding: 5px;
  flex-grow: 1;
  min-width: 50px; /* 确保有最小输入宽度 */
  font-size: 1em;
}

.filter-tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 150px;
  overflow-y: auto;
  z-index: 50; /* 比图片查看器低，但比页面内容高 */
  margin-top: 5px;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.95em;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}

.photo-info .photo-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.photo-info .photo-tag {
    background-color: #f0f0f0;
    color: #666;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 0.75em;
}
.load-more-btn {
  background-color: #007bff;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.load-more-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 20px;
  font-weight: bold;
}
</style>