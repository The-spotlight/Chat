<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{
  (e: 'quote'): void;
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLDivElement | null>(null);
const position = ref({ x: 0, y: 0 });
const isVisible = ref(false);

const open = (x: number, y: number) => {
  position.value = { x, y };
  isVisible.value = true;
};

const close = () => {
  isVisible.value = false;
  emit('close');
};

const handleQuote = () => {
  emit('quote');
  close();
};

const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    close();
  }
};

defineExpose({ open, close });

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="menuRef"
      class="context-menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
    >
      <div class="menu-item" @click="handleQuote">
        <span class="menu-icon">📎</span>
        <span>引用</span>
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
  padding: 8px 0;
  min-width: 120px;
  z-index: 9999;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    background-color: #ebebeb;
  }
}

.menu-icon {
  font-size: 14px;
}
</style>
