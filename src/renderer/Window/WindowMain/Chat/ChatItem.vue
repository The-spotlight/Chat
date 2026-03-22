<script setup lang="ts">
import {ModelChat} from "../../../../model/ModelChat";
import {useChatStore} from "../../../store/useChatStore";
import {ref, computed} from "vue";
import ContextMenu, {ContextMenuItem} from "./ContextMenu.vue";

const props = defineProps<{ data: ModelChat }>()
let store = useChatStore();

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const itemClick = (item: ModelChat) => {
  store.selectItem(item);
}

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
};

const closeContextMenu = () => {
  contextMenuVisible.value = false;
};

const handleContextMenuClick = (itemId: string) => {
  if (itemId === 'togglePin') {
    store.togglePin(props.data.id!);
  }
  closeContextMenu();
};

const contextMenuItems = computed<ContextMenuItem[]>(() => [
  {
    id: 'togglePin',
    label: props.data.isPinned ? '取消置顶' : '置顶',
    icon: props.data.isPinned ? '📌' : '📍'
  }
]);

const formatUnreadCount = (count: number): string => {
  if (count > 99) return '99+';
  return String(count);
};
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
        <div class="fromName">{{ data.fromName }}</div>
        <div class="timeName">{{ data.sendTime }}</div>
      </div>
      <div class="row">
        <div class="lastMsg">{{ data.lastMsg }}</div>
        <div class="subscribe">
          <span v-if="data.isPinned" class="pin-icon">📌</span>
          <span 
            v-if="data.unreadCount && data.unreadCount > 0" 
            class="unread-badge"
            :class="{ 'badge-wide': data.unreadCount > 9 }"
          >
            {{ formatUnreadCount(data.unreadCount) }}
          </span>
        </div>
      </div>
    </div>
    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @click="handleContextMenuClick"
      @close="closeContextMenu"
    />
  </div>
</template>
<style scoped lang="scss">
.chatItem {
  display: flex;
  height: 66px;
  box-sizing: border-box;
  cursor: pointer;
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
  background: rgb(240, 240, 235);
  &:hover {
    background: rgb(230, 230, 225);
  }
  &.chatItemSelected {
    background: rgb(210, 210, 205);
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
}
.row {
  box-sizing: border-box;
  height: 28px;
  line-height: 28px;
  display: flex;
}
.fromName {
  flex: 1;
}
.timeName {
  color: rgb(153, 153, 153);
  padding-right: 12px;
  font-size: 12px;
}
.lastMsg {
  color: rgb(153, 153, 153);
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.subscribe {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 10px;
}
.pin-icon {
  font-size: 12px;
}
.unread-badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  font-weight: 500;
  line-height: 1;
  
  &.badge-wide {
    border-radius: 9px;
    padding: 0 6px;
  }
}
</style>
