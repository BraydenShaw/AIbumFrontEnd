<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { http } from '@/utils/api'
import type { User } from '@/types'
import { showToast, showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'
import BottomTabber from '@/components/HomePage/BottomTabber.vue'
import UploadImage from '@/components/HomePage/UploadImage.vue'
import AlbumFlow from '@/components/HomePage/AlbumFlow.vue'

const router = useRouter() // 获取 router 实例
const activeTab = ref(0)
</script>

<template>
  <div class="page-container">
    <div class="main-content">
      <div v-if="activeTab === 0">
        <album-flow />
      </div>
      <div v-else-if="activeTab === 1">
        <h2>Tab 1 Content</h2>
        <upload-image />
      </div>
      <div v-else-if="activeTab === 2">
        <h2>Tab 2 Content</h2>
      </div>
    </div>
    <bottom-tabber v-model:activeTab="activeTab" />
  </div>
</template>
<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 全屏高度 */
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto; /* 可滚动 */
  background-color: #f5f5f5; /* 背景色 */
}
</style>
