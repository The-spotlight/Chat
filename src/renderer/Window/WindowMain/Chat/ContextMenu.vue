<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  show?: boolean;
  divider?: boolean;
}

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}>();

const emit = defineEmits<{
  (e: 'click', itemId: string): void;
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLDivElement | null>(null);
const MENU_MIN_WIDTH = 120;
const MENU_MAX_HEIGHT = 200;

const adjustedPosition = computed(() => {
  let adjustedX = props.x;
  let adjustedY = props.y;

  const menuWidth = MENU_MIN_WIDTH;
  const menuHeight = MENU_MAX_HEIGHT;

  if (props.x + menuWidth > window.innerWidth) {
    adjustedX = window.innerWidth - menuWidth - 10;
  }

  if (props.y + menuHeight > window.innerHeight) {
    adjustedY = window.innerHeight - menuHeight - 10;
  }

  return {
    left: adjustedX + 'px',
    top: adjustedY + 'px'
  };
});

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

const handleItemClick = (item: ContextMenuItem) => {
  if (item.divider) return;
  emit('click', item.id);
  emit('close');
};

const visibleItems = ref<ContextMenuItem[]>([]);

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
      v-if="visible && items.length > 0"
      ref="menuRef"
      class="context-menu"
      :style="adjustedPosition"
    >
      <template v-for="item in items" :key="item.id">
        <div 
          v-if="item.divider && (item.show !== false)" 
          class="menu-divider"
        ></div>
        <div 
          v-else-if="item.show !== false" 
          class="menu-item" 
          @click="handleItemClick(item)"
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

.menu-divider {
  height: 1px;
  background: rgb(230, 230, 230);
  margin: 4px 0;
}
</style>
