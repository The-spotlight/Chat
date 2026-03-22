<script setup lang="ts">
import ChatSearch from "./ChatSearch.vue";
import ChatItem from "./ChatItem.vue";

import {useChatStore} from "../../../store/useChatStore";

let store = useChatStore();

// 全部已读
const handleMarkAllAsRead = () => {
  store.markAllAsRead();
};
</script>

<template>
  <div class="w250px h100% flex flex-col box-border">
    <ChatSearch />
    <!-- 全部已读按钮 -->
    <div v-if="store.hasUnreadMessages" class="markAllReadBar">
      <button class="markAllReadBtn" @click="handleMarkAllAsRead">
        全部标记已读
      </button>
      <span class="unreadSummary">共 {{ store.totalUnreadCount }} 条未读</span>
    </div>
    <div class="flex-1 overflow-y-auto box-border listBox">
      <template v-if="store.filteredData.length > 0">
        <TransitionGroup name="chatList">
          <ChatItem :data="item" v-for="item in store.filteredData" :key="item.id" />
        </TransitionGroup>
      </template>
      <div v-else class="no-result">暂无匹配会话</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.listBox {
  background: rgb(230, 229, 229) linear-gradient(to bottom right, rgb(235, 234, 233), rgb(240, 240, 240));
}
.no-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

// 全部已读栏
.markAllReadBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.markAllReadBtn {
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #1890ff;
    border-color: #1890ff;
  }

  &:active {
    background: #e6f7ff;
  }
}

.unreadSummary {
  font-size: 12px;
  color: #ff4d4f;
}

// 列表动画
.chatList-move {
  transition: transform 0.3s ease;
}

.chatList-enter-active,
.chatList-leave-active {
  transition: all 0.3s ease;
}

.chatList-enter-from,
.chatList-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
