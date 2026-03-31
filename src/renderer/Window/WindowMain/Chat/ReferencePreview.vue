<script setup lang="ts">
import { computed } from "vue";
import { ModelMessage } from "../../../../model/ModelMessage";

const props = defineProps<{
  message: ModelMessage;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const truncatedContent = computed(() => {
  const content = props.message.messageContent || '';
  if (content.length <= 30) return content;
  return content.slice(0, 30) + '...';
});

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div class="reference-preview">
    <div class="reference-indicator"></div>
    <div class="reference-content">
      <span class="reference-name">{{ message.fromName }}</span>
      <span class="reference-text">{{ truncatedContent }}</span>
    </div>
    <button class="close-btn" @click="handleClose" aria-label="关闭引用">×</button>
  </div>
</template>

<style lang="scss" scoped>
.reference-preview {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid rgb(228, 228, 228);
  position: relative;
}

.reference-indicator {
  width: 3px;
  height: 100%;
  min-height: 24px;
  background: rgb(149, 236, 105);
  border-radius: 2px;
  margin-right: 10px;
  flex-shrink: 0;
}

.reference-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reference-name {
  color: rgb(149, 236, 105);
  font-size: 13px;
  font-weight: 500;
}

.reference-text {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgb(245, 245, 245);
    color: #666;
  }
}
</style>
