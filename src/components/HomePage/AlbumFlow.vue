<script setup lang="ts">
import { ref } from 'vue'
import ImageFlow from '../AlbumPage/ImageFlow.vue'

const albumId = ref(0)

const clickCell = (i: number) => {
  console.log('点击了相册', i)
  albumId.value = i
  // 这里可以添加跳转到相册详情页的逻辑
}
</script>

<template>
  <div v-if="albumId === 0">
    <div v-for="i in 10" :key="i">
      <van-cell-group inset style="margin: 5px">
        <van-cell :title="'相册' + i" is-link label="描述信息" @click="clickCell(i)" />
      </van-cell-group>
    </div>
  </div>
  <div v-else>
    <ImageFlow v-model:albumId="albumId" />
  </div>
</template>

<style scoped></style>
