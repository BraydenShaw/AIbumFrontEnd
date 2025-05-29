<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
const columnNum = ref(3)

const props = defineProps({
  albumId: Number,
})

const emit = defineEmits(['update:albumId'])

const albumId = computed({
  get: () => props.albumId,
  set: (val) => emit('update:albumId', val),
})

const clickLeft = () => {
  console.log('点击了返回按钮')
  albumId.value = 0 // 返回到相册列表
}

const updateColumnNum = () => {
  const width = window.innerWidth
  console.log('Current window width:', width)
  if (width < 700) {
    columnNum.value = 1
  } else if (width < 1000) {
    columnNum.value = 2
  } else {
    columnNum.value = 3
  }
}
onMounted(() => {
  updateColumnNum()
  window.addEventListener('resize', updateColumnNum)
})
const images = [
  'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66',
]
</script>

<template>
  <van-nav-bar :title="'相册' + albumId" left-text="返回" left-arrow @click-left="clickLeft" />
  <van-grid :column-num="columnNum" :gutter="8">
    <van-grid-item v-for="(img, index) in images" :key="index" v-lazy="img">
      <van-image :src="img" fit="contain" width="100%" />
    </van-grid-item>
  </van-grid>
</template>
