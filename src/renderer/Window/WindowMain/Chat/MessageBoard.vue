<script setup lang="ts">
import { watch, nextTick, ref, computed } from "vue";
import BarTop from "../../../Components/BarTop.vue";
import { useMessageStore } from "../../../store/useMessageStore";
import { useChatStore } from "../../../store/useChatStore";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";

const messageStore = useMessageStore();
const chatStore = useChatStore();
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

const scrollToFirstUnread = () => {
  // 滚动到列表顶部模拟第一条未读
  if (messageListRef.value) {
    messageListRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

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

// 获取当前会话的未读计数
const currentChatUnreadCount = computed(() => {
  const selectedChat = chatStore.getSelectedChat;
  return selectedChat?.unreadCount || 0;
});

// 是否显示未读提示条（未读超过10条）
const showUnreadBanner = computed(() => {
  return currentChatUnreadCount.value > 10;
});
</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <!-- 未读消息浮动提示条 -->
    <div 
      v-if="showUnreadBanner" 
      class="unread-banner"
      @click="scrollToFirstUnread"
    >
      你有 {{ currentChatUnreadCount }} 条未读消息，点击查看
    </div>
    <div ref="messageListRef" class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem 
        v-for="item in messageStore.data" 
        :key="item.id"
        :data="item"
        :isHighlighted="messageStore.highlightedMessageId === item.id"
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
.unread-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}
</style>
