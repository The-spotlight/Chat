<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface MenuItem {
    label: string;
    action: () => void;
}

const props = defineProps<{
    items: MenuItem[];
}>();

const visible = ref(false);
const position = ref({ x: 0, y: 0 });
const menuRef = ref<HTMLDivElement | null>(null);

const show = (x: number, y: number) => {
    position.value = { x, y };
    visible.value = true;
};

const hide = () => {
    visible.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
        hide();
    }
};

const handleItemClick = (item: MenuItem) => {
    item.action();
    hide();
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

defineExpose({
    show,
    hide
});
</script>

<template>
    <div
        v-if="visible"
        ref="menuRef"
        class="context-menu"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
    >
        <div
            v-for="(item, index) in items"
            :key="index"
            class="menu-item"
            @click="handleItemClick(item)"
        >
            {{ item.label }}
        </div>
    </div>
</template>

<style scoped lang="scss">
.context-menu {
    position: fixed;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 6px 0;
    min-width: 120px;
    z-index: 1000;
}

.menu-item {
    padding: 10px 16px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f5f5f5;
    }
}
</style>
