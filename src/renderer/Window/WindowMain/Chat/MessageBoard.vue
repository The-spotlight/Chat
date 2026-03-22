<script setup lang="ts">
import { watch, nextTick, ref, onMounted } from "vue";
import BarTop from "../../../Components/BarTop.vue";
import { useMessageStore } from "../../../store/useMessageStore";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";

const messageStore = useMessageStore();
const messageListRef = ref<HTMLDivElement | null>(null);
const messageItemRefs = ref<Map<string, HTMLElement>>(new Map());

const setMessageItemRef = (id: string, el: any) => {
  if (el) {
    messageItemRefs.value.set(id, el.$el || el);
  } else {
    messageItemRefs.value.delete(id);
  }
};

const scrollToMessage = async (messageId: string) => {
  await nextTick();
  
  const messageEl = messageItemRefs.value.get(messageId);
  if (messageEl && messageListRef.value) {
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    messageStore.setHighlightedMessageId(messageId);
    
    setTimeout(() => {
      messageStore.setHighlightedMessageId(null);
    }, 2000);
  }
};

// 滚动到第一条未读消息
const scrollToFirstUnread = async () => {
  const firstUnreadId = messageStore.getFirstUnreadMessageId;
  if (firstUnreadId) {
    await scrollToMessage(firstUnreadId);
    // 滚动后清除未读状态
    messageStore.clearUnreadState();
  }
};

// 关闭未读提示条
const closeUnreadBanner = () => {
  messageStore.clearUnreadState();
};

// 初始化时如果有未读消息，滚动到第一条未读
onMounted(() => {
  if (messageStore.getFirstUnreadMessageId) {
    setTimeout(() => {
      scrollToFirstUnread();
    }, 300);
  }
});

watch(
  () => messageStore.data.length,
  () => {
    nextTick(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
      }
    });
  },
  { immediate: true }
);
</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <!-- 未读消息提示条 - 紧凑样式 -->
    <div v-if="messageStore.shouldShowUnreadBanner" class="unreadBanner">
      <div class="unreadContent">
        <span class="unreadDot"></span>
        <span class="unreadText">{{ messageStore.unreadCount }} 条未读</span>
        <button class="unreadBtn" @click="scrollToFirstUnread">查看</button>
      </div>
      <button class="closeBtn" @click="closeUnreadBanner">×</button>
    </div>
    <div ref="messageListRef" class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem 
        v-for="item in messageStore.data" 
        :key="item.id"
        :data="item"
        :isHighlighted="messageStore.highlightedMessageId === item.id"
        :isUnread="messageStore.isMessageUnread(item.id || '')"
        @scrollToMessage="scrollToMessage"
      />
    </div>
    <MessageInput />
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}

/* 未读消息提示条 - 紧凑样式 */
.unreadBanner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  animation: slideDown 0.2s ease;
}

.unreadContent {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unreadDot {
  width: 6px;
  height: 6px;
  background: #ff4d4f;
  border-radius: 50%;
  flex-shrink: 0;
}

.unreadText {
  font-size: 13px;
  color: #666;
}

.unreadBtn {
  padding: 2px 8px;
  background: transparent;
  border: none;
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
}

.unreadBtn:hover {
  color: #40a9ff;
}

.closeBtn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.closeBtn:hover {
  color: #666;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
