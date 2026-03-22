<script setup lang="ts">
import {ModelChat} from "../../../../model/ModelChat";
import {useChatStore} from "../../../store/useChatStore";
import {ref, computed} from "vue";
import ContextMenu, { ContextMenuItem } from "./ContextMenu.vue";

const props = defineProps<{ data: ModelChat }>()
let store = useChatStore();
const itemClick = (item: ModelChat) => {
  store.selectItem(item);
}

// 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// 右键菜单项
const contextMenuItems = computed<ContextMenuItem[]>(() => {
  const isPinned = store.data.find(c => c.id === props.data.id)?.isPinned;
  return [
    { id: 'togglePin', label: isPinned ? '取消置顶' : '置顶', icon: isPinned ? '📌' : '📍' },
  ];
});

// 显示右键菜单
const showContextMenu = (event: MouseEvent, item: ModelChat) => {
  event.preventDefault();
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
};

// 处理右键菜单点击
const handleContextMenuClick = (itemId: string) => {
  if (itemId === 'togglePin') {
    store.togglePin(props.data.id!);
  }
};

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false;
};

// 获取未读显示文本
const getUnreadDisplay = (count: number): string => {
  if (count <= 0) return '';
  if (count > 99) return '99+';
  return String(count);
};

// 判断未读数字是否为个位数（用于圆点样式）
const isSingleDigit = (count: number): boolean => {
  return count > 0 && count < 10;
};
</script>

<template>
  <div 
    @click="itemClick(data)" 
    @contextmenu="showContextMenu($event, data)"
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
      </div>
      <div class="row">
        <div class="lastMsg">{{ data.lastMsg }}</div>
        <div class="unreadBadge" 
             v-if="data.unreadCount > 0"
             :class="{ singleDigit: isSingleDigit(data.unreadCount) }">
          {{ getUnreadDisplay(data.unreadCount) }}
        </div>
      </div>
    </div>
  </div>

  <!-- 使用 ContextMenu 组件 -->
  <ContextMenu
    :visible="contextMenuVisible"
    :x="contextMenuX"
    :y="contextMenuY"
    :items="contextMenuItems"
    @click="handleContextMenuClick"
    @close="closeContextMenu"
  />
</template>

<style scoped lang="scss">
.chatItem {
  display: flex;
  height: 66px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
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
  background: rgba(255, 251, 230, 0.5);
  &:hover {
    background: rgba(255, 251, 230, 0.8);
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
    border-radius: 4px;
  }
}

.chatInfo {
  flex: 1;
  height: 66px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 12px;
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
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  .pinIcon {
    margin-right: 4px;
    font-size: 12px;
  }
}

.timeName {
  color: rgb(153, 153, 153);
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

.unreadBadge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background-color: #ff4d4f;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  
  &.singleDigit {
    width: 18px;
    padding: 0;
    border-radius: 50%;
  }
}
</style>
