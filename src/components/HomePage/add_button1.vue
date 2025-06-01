<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// 导入 Vant 的 Button, showToast 函数，以及 Grid 和 GridItem 组件
import { Button as VanButton, showToast as vanShowToast, Grid as VanGrid, GridItem as VanGridItem } from 'vant';

const showList = ref(false);

// 移除所有拖动相关的状态变量
// const isDragging = ref(false);
// const dragStartX = ref(0);
// const dragStartY = ref(0);
// const buttonX = ref(0);
// const buttonY = ref(0);
// const initialButtonX = ref(0);
// const initialButtonY = ref(0);
// const isClickEvent = ref(true);

// 引用按钮元素，以便获取其尺寸和父容器 (如果不再需要获取尺寸，也可以移除)
const buttonRef = ref<HTMLElement | null>(null);

// 处理点击加号按钮 (简化，直接切换列表显示状态)
const handlePlusButtonClick = () => {
  showList.value = !showList.value;
};

// 处理点击列表项
const handleListItemClick = (item: string) => {
  vanShowToast({
    message: `点击了: ${item}`,
    duration: 2000, // 提示持续时间，单位毫秒
    forbidClick: false, // 期间是否禁止背景点击
  });
  showList.value = false; // 点击后关闭列表
  // 在这里实现每个列表项的实际功能
};

// 点击外部区域关闭列表
onMounted(() => {
  // 移除所有拖动相关的事件监听器
  // document.addEventListener('mousemove', handleMouseMove);
  // document.addEventListener('mouseup', handleMouseUp);

  const handleClickOutsideList = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // 检查点击事件是否发生在按钮或列表内部
    // 确保 buttonRef.value 存在且点击不在按钮或列表弹出层内
    if (showList.value && buttonRef.value && !buttonRef.value.contains(target) && !target.closest('.plus-button-list-popup')) {
      showList.value = false;
    }
  };
  // 监听整个文档的鼠标按下事件来关闭列表
  document.addEventListener('mousedown', handleClickOutsideList);

  onUnmounted(() => {
    // 移除所有拖动相关的事件监听器
    // document.removeEventListener('mousemove', handleMouseMove);
    // document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousedown', handleClickOutsideList);
  });
});
</script>

<template>
  <div
    ref="buttonRef"
    class="plus-button-container"
    @click="handlePlusButtonClick" >
    <van-button
      type="primary"
      round
      class="w-16 h-16 !p-0 flex items-center justify-center
             bg-gradient-to-br from-blue-500 to-blue-700 text-white
             shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
             transform hover:scale-110 active:scale-95
             focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75
             border-2 border-blue-400 hover:border-blue-300"
      aria-label="添加新项目"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-plus"
      >
        <path d="M12 5V19" />
        <path d="M5 12H19" />
      </svg>
    </van-button>

    <Transition name="list-fade">
      <div
        v-if="showList"
        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white rounded-xl shadow-2xl py-2 !w-40 z-10 plus-button-list-popup
               border-2 border-gray-300 ring-1 ring-gray-200 ring-opacity-50"
      >
        <van-grid :column-num="2" :border="false" :gutter="8" class="!bg-transparent">
          <van-grid-item @click="handleListItemClick('新建相册')" class="!bg-transparent">
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-folder-plus text-blue-500"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-3h5l2 3h9a2 2 0 0 1 2 2z" />
                <path d="M12 11v6" />
                <path d="M9 14h6" />
              </svg>
            </template>
            <template #text>
              <span class="text-gray-800 text-sm mt-1">新建相册</span>
            </template>
          </van-grid-item>

          <van-grid-item @click="handleListItemClick('上传图片')" class="!bg-transparent">
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-image-plus text-green-500"
              >
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                <line x1="16" x2="22" y1="5" y2="5" />
                <line x1="19" x2="19" y1="2" y2="8" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 22" />
              </svg>
            </template>
            <template #text>
              <span class="text-gray-800 text-sm mt-1">上传图片</span>
            </template>
          </van-grid-item>

          <van-grid-item @click="handleListItemClick('创建故事')" class="!bg-transparent">
            <template #icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-book-open text-purple-500"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </template>
            <template #text>
              <span class="text-gray-800 text-sm mt-1">创建故事</span>
            </template>
          </van-grid-item>
        </van-grid>
      </div>
    </Transition>
  </div>
</template>

<style>
  /* 列表弹出动画 */
  .list-fade-enter-active,
  .list-fade-leave-active {
    transition: all 0.2s ease-out;
    transform-origin: bottom;
  }
  .list-fade-enter-from,
  .list-fade-leave-to {
    transform: scaleY(0) translateX(-50%);
    opacity: 0;
  }
  .list-fade-enter-to,
  .list-fade-leave-from {
    transform: scaleY(1) translateX(-50%);
    opacity: 1;
  }
</style>
