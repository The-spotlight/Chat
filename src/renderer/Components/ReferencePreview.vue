<script setup lang="ts">
interface Props {
  fromName: string;
  content: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div class="reference-preview">
    <div class="reference-info">
      <span class="reference-sender">{{ fromName }}</span>
      <span class="reference-content">{{ content }}</span>
    </div>
    <button class="close-btn" @click="handleClose">
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
.reference-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-left: 3px solid rgb(149, 236, 105);
}

.reference-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.reference-sender {
  color: rgb(149, 236, 105);
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.reference-content {
  color: #999;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: #e0e0e0;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 8px;

  &:hover {
    background: #d0d0d0;
    color: #333;
  }
}
</style>
