// src/api/galleryService.js

// 模拟的图片数据（保持不变，但为其添加分类和标签字段）
let mockPhotos = Array.from({ length: 50 }, (_, i) => ({
  id: `photo_${i + 1}`,
  url: `https://picsum.photos/id/${i + 10}/800/600?random=${i}`, // 使用更大尺寸的图片
  thumbnailUrl: `https://picsum.photos/id/${i + 10}/200/150?random=${i}`,
  title: `风景照 ${i + 1}`,
  description: `这是一张美丽的风景照，由系统自动生成。编号：${i + 1}。`,
  uploadDate: new Date(Date.now() - i * 3600 * 1000 * 24).toISOString().split('T')[0],
  size: Math.floor(Math.random() * 5000 + 1000) + 'KB',
  width: 800,
  height: 600,
  // 为每张图片添加 categoryId 和 tags 字段
  categoryId: i % 3 === 0 ? 'category_1' : (i % 3 === 1 ? 'category_2' : null),
  tags: i % 5 === 0 ? ['自然', '日落'] : (i % 5 === 1 ? ['城市', '建筑'] : (i % 5 === 2 ? ['人物', '旅行'] : [])),
}));

// 模拟的分类数据
let mockCategories = [
  { id: 'category_1', name: '风景' },
  { id: 'category_2', name: '生活' },
  { id: 'category_3', name: '人物' },
];

// 模拟的常用标签 (你可以从后端获取或在前端维护一个列表)
let mockTags = ['自然', '日落', '海边', '城市', '建筑', '旅行', '家庭', '美食', '宠物', '艺术'];

export const galleryService = {
  /**
   * 模拟获取图片列表（带分页、分类和标签筛选）
   * @param {number} page - 页码，从1开始
   * @param {number} limit - 每页数量
   * @param {string | null} categoryId - 分类ID筛选
   * @param {Array<string>} tags - 标签数组筛选（AND 关系）
   * @returns {Promise<{photos: Array, total: number}>}
   */
  getPhotos(page = 1, limit = 10, categoryId = null, tags = []) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredPhotos = mockPhotos;

        // 按分类ID筛选
        if (categoryId) {
          filteredPhotos = filteredPhotos.filter(photo => photo.categoryId === categoryId);
        }

        // 按标签筛选 (AND 关系：图片必须包含所有指定的标签)
        if (tags && tags.length > 0) {
          filteredPhotos = filteredPhotos.filter(photo =>
            tags.every(tag => photo.tags && photo.tags.includes(tag))
          );
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPhotos = filteredPhotos.slice(startIndex, endIndex);

        console.log(`Fetching photos: Page ${page}, Limit ${limit}, Category: ${categoryId}, Tags: ${tags.join(', ')}. Found ${paginatedPhotos.length}`);
        resolve({
          photos: paginatedPhotos,
          total: filteredPhotos.length, // 注意这里是过滤后的总数
        });
      }, 800); // 模拟网络延迟
    });
  },

  /**
   * 模拟删除图片
   * @param {string} photoId - 图片ID
   * @returns {Promise<boolean>}
   */
  deletePhoto(photoId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = mockPhotos.length;
        mockPhotos = mockPhotos.filter(photo => photo.id !== photoId);
        if (mockPhotos.length < initialLength) {
          console.log(`Photo ${photoId} deleted successfully.`);
          resolve(true);
        } else {
          console.warn(`Photo ${photoId} not found for deletion.`);
          reject(new Error('图片不存在或无法删除！'));
        }
      }, 500); // 模拟网络延迟
    });
  },

  /**
   * 模拟更新图片信息（包括分类和标签）
   * @param {string} photoId
   * @param {Object} updates - { categoryId?: string, tags?: Array<string> }
   * @returns {Promise<Object>} 更新后的图片对象
   */
  updatePhoto(photoId, updates) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockPhotos.findIndex(p => p.id === photoId);
        if (index !== -1) {
          mockPhotos[index] = { ...mockPhotos[index], ...updates };
          console.log(`Photo ${photoId} updated with:`, updates);
          resolve(mockPhotos[index]);
        } else {
          console.warn(`Photo ${photoId} not found for update.`);
          reject(new Error('图片不存在或无法更新！'));
        }
      }, 500);
    });
  },

  /**
   * 模拟获取所有分类
   * @returns {Promise<Array<Object>>}
   */
  getCategories() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Fetching categories.');
        resolve([...mockCategories]);
      }, 300);
    });
  },

  /**
   * 模拟创建新分类
   * @param {string} name - 分类名称
   * @returns {Promise<Object>} 新创建的分类对象
   */
  createCategory(name) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mockCategories.some(c => c.name === name)) {
          reject(new Error('分类名称已存在！'));
          return;
        }
        const newCategory = { id: `category_${Date.now()}`, name };
        mockCategories.push(newCategory);
        console.log('New category created:', newCategory);
        resolve(newCategory);
      }, 500);
    });
  },

  /**
   * 模拟获取所有常用标签
   * @returns {Promise<Array<string>>}
   */
  getPopularTags() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Fetching popular tags.');
        resolve([...mockTags]);
      }, 300);
    });
  },

  /**
   * 模拟添加新标签 (如果标签不存在，则添加到常用标签列表)
   * @param {string} tag - 标签名称
   * @returns {Promise<boolean>}
   */
  addPopularTag(tag) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!mockTags.includes(tag)) {
          mockTags.push(tag);
          console.log(`Tag "${tag}" added to popular tags.`);
        }
        resolve(true);
      }, 200);
    });
  },
};