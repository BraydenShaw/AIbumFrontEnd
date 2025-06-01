<template>
  <div
    v-if="show"
    :class="`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg transition-opacity duration-300 ${
      show ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

// 定义组件的 props
const props = defineProps<{
  message: string;
  show: boolean;
}>();

// 定义组件可以发出的事件
const emit = defineEmits(['close']);

let timer: ReturnType<typeof setTimeout> | null = null;

// 监听 props.show 的变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 如果 Toast 正在显示，清除之前的定时器，防止重复
    if (timer) clearTimeout(timer);
    // 设置新的定时器，在 2 秒后关闭 Toast
    timer = setTimeout(() => {
      emit('close');
    }, 2000);
  } else {
    // 如果 Toast 不显示，清除定时器
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
}, { immediate: true }); // immediate: true 表示组件挂载时如果 show 已经是 true，也会立即执行一次监听

// 组件卸载时清除定时器，避免内存泄漏
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>
