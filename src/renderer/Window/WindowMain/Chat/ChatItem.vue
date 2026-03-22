<script setup lang="ts">
import {ModelChat} from "../../../../model/ModelChat";
import {useChatStore} from "../../../store/useChatStore";
import ContextMenu, { ContextMenuItem } from "./ContextMenu.vue";
import { ref, computed } from "vue";

const props = defineProps<{ data: ModelChat }>()
let store = useChatStore();

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const itemClick = (item: ModelChat) => {
  store.selectItem(item);
}

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
}

const handleMenuClick = (itemId: string) => {
  if (itemId === 'togglePin' && props.data.id) {
    store.togglePin(props.data.id);
  }
}

const handleMenuClose = () => {
  contextMenuVisible.value = false;
}

const menuItems = computed(() => [
  {
    id: 'togglePin',
    label: props.data.isPinned ? '取消置顶' : '置顶',
    icon: '📌'
  }
]);
</script>

<template>
  <div 
    @click="itemClick(data)" 
    @contextmenu="handleContextMenu"
    :class="['chatItem', { chatItemSelected: data.isSelected, chatItemPinned: data.isPinned }]"
  >
    <div class="avatar">
      <img :src="data.avatar" alt="" />
    </div>
    <div class="chatInfo">
      <div class="row">
        <div class="fromName">
          <span v-if="data.isPinned" class="pinIcon">📌</span>
          {{ data.fromName }}
        </div>
        <div class="timeName">{{ data.sendTime }}</div>
        <div v-if="data.unreadCount > 0" class="unread-badge" :class="{ 'unread-badge-large': data.unreadCount >= 10 }">
          {{ store.formatUnreadCount(data.unreadCount) }}
        </div>
      </div>
      <div class="row">
        <div class="lastMsg">{{ data.lastMsg }}</div>
        <div class="subscribe"></div>
      </div>
    </div>
  </div>
  <ContextMenu
    :visible="contextMenuVisible"
    :x="contextMenuX"
    :y="contextMenuY"
    :items="menuItems"
    @click="handleMenuClick"
    @close="handleMenuClose"
  />
</template>
<style scoped lang="scss">
.chatItem {
  display: flex;
  height: 66px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  &:hover {
    background: rgb(221, 219, 218);
  }
}
.chatItemSelected {
  background: rgb(196, 196, 196);
  &:hover {
    background: rgb(196, 196, 196);
  }
}
.chatItemPinned {
  background: rgba(245, 245, 245, 0.8);
  &.chatItemSelected {
    background: rgb(196, 196, 196);
  }
}
.avatar {
  width: 66px;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 46px;
    height: 46px;
  }
}
.chatInfo {
  flex: 1;
  height: 66px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 8px;
}
.row {
  box-sizing: border-box;
  height: 28px;
  line-height: 28px;
  display: flex;
  align-items: center;
}
.fromName {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}
.pinIcon {
  font-size: 12px;
  opacity: 0.7;
}
.timeName {
  color: rgb(153, 153, 153);
  padding-right: 8px;
  font-size: 12px;
}
.lastMsg {
  color: rgb(153, 153, 153);
  flex: 1;
  font-size: 12px;
}
.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ff4757;
  color: #fff;
  font-size: 10px;
  font-weight: 500;
  border-radius: 9px;
  line-height: 1;
  margin-right: 8px;
  &-large {
    min-width: 28px;
    border-radius: 10px;
    font-size: 11px;
  }
}
</style>