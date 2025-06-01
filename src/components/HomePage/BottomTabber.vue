<script setup lang="ts">
import { ref, computed } from 'vue'

// 接收来自父组件的 activeTab
const props = defineProps({
  activeTab: Number,
})

// 通知父组件更新 activeTab 的事件
const emit = defineEmits(['update:activeTab'])

// 建立一个双向绑定的 computed 值
const currentTab = computed({
  get: () => props.activeTab,
  set: (val) => emit('update:activeTab', val),
})
</script>

<template>
  <van-tabbar v-model="currentTab">
    <van-tabbar-item icon="wap-home-o" />
    
    <van-tabbar-item icon="user-circle-o" />
  </van-tabbar>
</template>
