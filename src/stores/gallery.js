// src/stores/gallery.js

import { defineStore } from 'pinia';
import { galleryService } from '../api/galleryService';

export const useGalleryStore = defineStore('gallery', {
  state: () => ({
    photos: [],
    currentPage: 1,
    perPage: 10,
    totalPhotos: 0,
    hasMore: true, // 是否还有更多图片可以加载
    loading: false,
    error: null,
    categories: [], // 所有可用分类
    currentCategoryId: null, // 当前选中的分类ID
    availableTags: [], // 所有常用标签
    selectedTags: [], // 当前选中的标签 (用于筛选)

    // 新增：加载分类和标签的独立 loading 状态
    loadingCategories: false,
    loadingTags: false,
  }),

  getters: {
    // 是否正在加载
    isLoading: (state) => state.loading,
    // 获取当前图片列表
    currentPhotos: (state) => state.photos,
    // 判断是否能加载更多
    canLoadMore: (state) => !state.loading && state.hasMore,
    currentCategory: (state) => state.categories.find(c => c.id === state.currentCategoryId),
  },

  actions: {
    /**
     * 加载更多图片 (用于滚动加载或点击加载)
     */
    async loadMorePhotos() {
      if (this.loading || !this.hasMore) {
        return;
      }

      this.loading = true;
      this.error = null;
      try {
        const response = await galleryService.getPhotos(
          this.currentPage,
          this.perPage,
          this.currentCategoryId, // 传入当前分类ID
          this.selectedTags // 传入当前选中的标签
        );
        this.photos.push(...response.photos);
        this.totalPhotos = response.total;
        this.currentPage++;
        this.hasMore = this.photos.length < this.totalPhotos;
        console.log(`Loaded ${response.photos.length} photos. Total: ${this.photos.length}/${this.totalPhotos}. Current Filters: Category(${this.currentCategoryId}), Tags(${this.selectedTags.join(',')})`);
      } catch (err) {
        this.error = err.message || '加载图片失败！';
        console.error('Failed to load photos:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刷新图片列表 (回到第一页重新加载)
     */
    async refreshPhotos() {
      this.photos = [];
      this.currentPage = 1;
      this.totalPhotos = 0;
      this.hasMore = true;
      await this.loadMorePhotos();
    },

    /**
     * 删除图片
     * @param {string} photoId - 要删除的图片ID
     */
    async deletePhoto(photoId) {
      this.loading = true; // 可以有单独的删除loading状态
      this.error = null;
      try {
        await galleryService.deletePhoto(photoId);
        // 从前端列表中移除被删除的图片
        this.photos = this.photos.filter(photo => photo.id !== photoId);
        this.totalPhotos--; // 总数减1
        alert('图片删除成功！');
      } catch (err) {
        this.error = err.message || '删除图片失败！';
        console.error(`Failed to delete photo ${photoId}:`, err);
        alert(`删除失败: ${this.error}`);
      } finally {
        this.loading = false;
      }
    },
    /**
     * 新增：加载所有可用分类
     */
    async fetchCategories() {
      if (this.loadingCategories || this.categories.length > 0) return; // 避免重复加载
      this.loadingCategories = true;
      try {
        this.categories = await galleryService.getCategories();
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // 可以设置一个分类加载错误状态
      } finally {
        this.loadingCategories = false;
      }
    },

    /**
     * 新增：创建新分类
     * @param {string} categoryName
     */
    async createCategory(categoryName) {
        try {
            const newCat = await galleryService.createCategory(categoryName);
            this.categories.push(newCat);
            return newCat;
        } catch (err) {
            alert(`创建分类失败: ${err.message}`);
            throw err; // 抛出错误以便组件捕获
        }
    },

    /**
     * 新增：加载所有常用标签
     */
    async fetchAvailableTags() {
      if (this.loadingTags || this.availableTags.length > 0) return; // 避免重复加载
      this.loadingTags = true;
      try {
        this.availableTags = await galleryService.getPopularTags();
      } catch (err) {
        console.error('Failed to fetch available tags:', err);
        // 可以设置一个标签加载错误状态
      } finally {
        this.loadingTags = false;
      }
    },

    /**
     * 新增：更新图片分类和标签
     * @param {string} photoId
     * @param {Object} updates - { categoryId?: string | null, tags?: Array<string> }
     */
    async updatePhotoMetadata(photoId, updates) {
      try {
        const updatedPhoto = await galleryService.updatePhoto(photoId, updates);
        // 更新 Pinia store 中的对应图片对象
        const index = this.photos.findIndex(p => p.id === photoId);
        if (index !== -1) {
          this.photos[index] = updatedPhoto;
        }
        // 如果新增了标签，也添加到可用标签列表
        if (updates.tags && updates.tags.length > 0) {
            updates.tags.forEach(tag => galleryService.addPopularTag(tag)); // 模拟添加到后端
            this.fetchAvailableTags(); // 重新获取常用标签
        }
        alert('图片信息更新成功！');
        return updatedPhoto;
      } catch (err) {
        console.error(`Failed to update photo ${photoId} metadata:`, err);
        alert(`更新图片信息失败: ${err.message}`);
        throw err; // 抛出错误以便组件捕获
      }
    },

    /**
     * 新增：设置当前筛选的分类ID，并刷新图片列表
     * @param {string | null} categoryId
     */
    setCategoryFilter(categoryId) {
      this.currentCategoryId = categoryId;
      this.refreshPhotos();
    },

    /**
     * 新增：设置当前筛选的标签数组，并刷新图片列表
     * @param {Array<string>} tags
     */
    setTagFilter(tags) {
      this.selectedTags = tags;
      this.refreshPhotos();
    },

    // 可以在图片上传成功后调用，将新图片添加到列表中
    // 如果选择刷新列表，则无需单独添加
    // addPhoto(newPhoto) {
    //   this.photos.unshift(newPhoto); // 添加到列表开头
    //   this.totalPhotos++;
    // }
  
    /**
     * 当新图片上传后，刷新列表或添加新图片
     * （根据实际需求选择，这里简单刷新）
     */
    addPhoto(newPhoto) {
        // Option 1: 直接添加到列表开头
        this.photos.unshift(newPhoto);
        this.totalPhotos++;
        // Option 2: 重新加载第一页 (更彻底但可能影响用户体验)
        // this.refreshPhotos();
    }
  },
  
});