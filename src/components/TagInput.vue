<template>
  <div class="tag-input-container">
    <div class="tags-display">
      <span v-for="(tag, index) in modelValue" :key="tag" class="tag-item">
        {{ tag }}
        <button @click="removeTag(index)" class="remove-tag-btn">&times;</button>
      </span>
      <input
        type="text"
        v-model.trim="newTag"
        @keydown.enter.prevent="addTag"
        @keydown.tab.prevent="addTag"
        @keydown.backspace="handleBackspace"
        :placeholder="placeholder"
        class="tag-input-field"
        @focus="showSuggestions = true"
        @blur="handleInputBlur"
      />
    </div>
    <div v-if="showSuggestions && filteredSuggestions.length" class="tag-suggestions">
      <div
        v-for="suggestion in filteredSuggestions"
        :key="suggestion"
        class="suggestion-item"
        @mousedown.prevent="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { // v-model 绑定当前标签数组
    type: Array,
    default: () => [],
  },
  availableTags: { // 可供选择的标签建议
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '输入标签并按回车/Tab键',
  },
});

const emit = defineEmits(['update:modelValue']);

const newTag = ref('');
const showSuggestions = ref(false); // 控制建议列表的显示

const addTag = () => {
  if (newTag.value && !props.modelValue.includes(newTag.value)) {
    const updatedTags = [...props.modelValue, newTag.value];
    emit('update:modelValue', updatedTags);
    newTag.value = '';
    showSuggestions.value = false;
  }
};

const removeTag = (index) => {
  const updatedTags = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', updatedTags);
};

const handleBackspace = (event) => {
  if (newTag.value === '' && props.modelValue.length > 0) {
    event.preventDefault(); // 阻止默认的后退行为
    removeTag(props.modelValue.length - 1);
  }
};

const filteredSuggestions = computed(() => {
  if (!newTag.value) {
    // 如果输入为空，显示所有可用标签中不在当前已选列表的标签
    return props.availableTags.filter(tag => !props.modelValue.includes(tag));
  }
  return props.availableTags.filter(tag =>
    tag.toLowerCase().includes(newTag.value.toLowerCase()) && !props.modelValue.includes(tag)
  );
});

const selectSuggestion = (tag) => {
  if (!props.modelValue.includes(tag)) {
    const updatedTags = [...props.modelValue, tag];
    emit('update:modelValue', updatedTags);
    newTag.value = '';
    showSuggestions.value = false; // 选择后隐藏建议
  }
};

const handleInputBlur = () => {
  // 延迟隐藏，以便点击建议项可以触发
  setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
};
</script>

<style scoped>
.tag-input-container {
  position: relative;
  width: 100%;
}

.tags-display {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px 10px;
  display: flex;
  flex-wrap: wrap;
  min-height: 40px;
  align-items: center;
  gap: 8px; /* 标签间距 */
  box-sizing: border-box;
}

.tag-item {
  background-color: #e0e0e0;
  color: #333;
  padding: 6px 10px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #666;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  font-size: 1.1em;
  line-height: 1;
  transition: color 0.2s;
}

.remove-tag-btn:hover {
  color: #dc3545;
}

.tag-input-field {
  flex-grow: 1; /* 占据剩余空间 */
  border: none;
  outline: none;
  padding: 5px;
  min-width: 80px; /* 最小宽度，防止太小 */
  font-size: 1em;
}

.tag-suggestions {
  position: absolute;
  top: 100%; /* 位于输入框下方 */
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100; /* 确保在其他内容之上 */
  margin-top: 5px;
}

.suggestion-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}
</style>