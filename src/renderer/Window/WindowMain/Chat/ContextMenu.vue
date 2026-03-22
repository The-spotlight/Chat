<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { ModelMessage } from "../../../../model/ModelMessage";
import { canRecallMessage, canEditMessage } from "../../../utils/messageUtils";

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  message: ModelMessage | null;
}>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'recall'): void;
  (e: 'edit'): void;
  (e: 'copy'): void;
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLDivElement | null>(null);

const isRecalled = computed(() => props.message?.isRecalled ?? false);

const canRecall = computed(() => {
  if (!props.message) return false;
  return canRecallMessage(props.message);
});

const canEdit = computed(() => {
  if (!props.message) return false;
  return canEditMessage(props.message);
});

const showReference = computed(() => !isRecalled.value);

const showCopy = computed(() => !isRecalled.value);

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close');
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

const handleReference = () => {
  emit('select');
  emit('close');
};

const handleRecall = () => {
  emit('recall');
  emit('close');
};

const handleEdit = () => {
  emit('edit');
  emit('close');
};

const handleCopy = () => {
  emit('copy');
  emit('close');
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="{ left: x + 'px', top: y + 'px' }"
    >
      <div v-if="showReference" class="menu-item" @click="handleReference">
        <span class="menu-icon">↩</span>
        <span>引用</span>
      </div>
      <div v-if="canRecall" class="menu-item" @click="handleRecall">
        <span class="menu-icon">↩</span>
        <span>撤回</span>
      </div>
      <div v-if="canEdit" class="menu-item" @click="handleEdit">
        <span class="menu-icon">✎</span>
        <span>编辑</span>
      </div>
      <div v-if="showCopy" class="menu-item" @click="handleCopy">
        <span class="menu-icon">📋</span>
        <span>复制</span>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  min-width: 120px;
  z-index: 9999;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.15s;

  &:hover {
    background: rgb(245, 245, 245);
  }
}

.menu-icon {
  font-size: 14px;
  color: #666;
}
</style>
