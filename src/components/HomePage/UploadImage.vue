<template>
  <div class="p-4">
    <van-uploader
      v-model="fileList"
      multiple
      :max-count="5"
      :after-read="handleAfterRead"
      accept="image/*"
    >
      <template #default>
        <div class="uploader-trigger">
          <van-icon name="plus" />
          <span>上传图片</span>
        </div>
      </template>
    </van-uploader>

    <div class="mt-4">
      <van-button type="primary" block @click="submit">提交</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const fileList = ref([])

// 上传后处理（可以用来上传到后端）
const handleAfterRead = async (file) => {
  // 模拟上传
  showToast('上传成功')
  // 如果是自定义上传逻辑，需要手动设置状态：
  // file.status = 'done'
  // file.message = '上传成功'
}

const submit = () => {
  showToast(`共上传 ${fileList.value.length} 张图片`)
}
</script>

<style scoped>
.uploader-trigger {
  width: 80px;
  height: 80px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
</style>
