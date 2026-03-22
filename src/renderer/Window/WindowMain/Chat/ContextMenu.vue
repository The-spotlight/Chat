<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from "vue";

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
const menuHeight = ref(0);
const menuWidth = ref(0);

const MENU_MARGIN = 10;
const ESTIMATED_ITEM_HEIGHT = 36;
const ESTIMATED_DIVIDER_HEIGHT = 9;
const ESTIMATED_MENU_PADDING = 12;

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

const estimateMenuDimensions = (): { width: number; height: number } => {
  let height = ESTIMATED_MENU_PADDING;
  let width = 120;
  
  props.items.forEach(item => {
    if (item.show !== false) {
      if (item.divider) {
        height += ESTIMATED_DIVIDER_HEIGHT;
      } else {
        height += ESTIMATED_ITEM_HEIGHT;
      }
      const textLength = item.label.length * 12 + (item.icon ? 28 : 8) + 32;
      if (textLength > width) {
        width = textLength;
      }
    }
  });
  
  return { width, height };
};

const updateMenuDimensions = () => {
  if (menuRef.value) {
    const actualHeight = menuRef.value.offsetHeight;
    const actualWidth = menuRef.value.offsetWidth;
    
    if (actualHeight > 0) {
      menuHeight.value = actualHeight;
    } else {
      const estimated = estimateMenuDimensions();
      menuHeight.value = estimated.height;
    }
    
    if (actualWidth > 0) {
      menuWidth.value = actualWidth;
    } else {
      const estimated = estimateMenuDimensions();
      menuWidth.value = estimated.width;
    }
  } else {
    const estimated = estimateMenuDimensions();
    menuHeight.value = estimated.height;
    menuWidth.value = estimated.width;
  }
};

const adjustedPosition = computed(() => {
  let adjustedX = props.x;
  let adjustedY = props.y;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const currentMenuWidth = menuWidth.value || estimateMenuDimensions().width;
  const currentMenuHeight = menuHeight.value || estimateMenuDimensions().height;
  
  if (adjustedX + currentMenuWidth + MENU_MARGIN > viewportWidth) {
    adjustedX = viewportWidth - currentMenuWidth - MENU_MARGIN;
  }
  
  if (adjustedX < MENU_MARGIN) {
    adjustedX = MENU_MARGIN;
  }
  
  if (adjustedY + currentMenuHeight + MENU_MARGIN > viewportHeight) {
    adjustedY = props.y - currentMenuHeight;
    if (adjustedY < MENU_MARGIN) {
      adjustedY = MENU_MARGIN;
    }
  }
  
  return {
    x: adjustedX,
    y: adjustedY
  };
});

watch(
  () => props.visible,
  async (newVisible) => {
    if (newVisible) {
      updateMenuDimensions();
      await nextTick();
      updateMenuDimensions();
    }
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
  window.addEventListener('resize', updateMenuDimensions);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
  window.removeEventListener('resize', updateMenuDimensions);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && items.length > 0"
      ref="menuRef"
      class="context-menu"
      :style="{ left: adjustedPosition.x + 'px', top: adjustedPosition.y + 'px' }"
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
