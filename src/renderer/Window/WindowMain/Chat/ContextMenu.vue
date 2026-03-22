<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  visible?: boolean;
}

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  items: MenuItem[];
}>();

const emit = defineEmits<{
  (e: 'select', key: string): void;
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLDivElement | null>(null);

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

const handleSelect = (key: string) => {
  emit('select', key);
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
      <template v-for="item in items" :key="item.key">
        <div
          v-if="item.visible !== false"
          class="menu-item"
          @click="handleSelect(item.key)"
        >
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </div>
      </template>
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
