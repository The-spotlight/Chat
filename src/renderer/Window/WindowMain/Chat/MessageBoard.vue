<script setup lang="ts">
import { watch, nextTick, ref, computed, onMounted } from "vue";
import BarTop from "../../../Components/BarTop.vue";
import { useMessageStore } from "../../../store/useMessageStore";
import { useChatStore } from "../../../store/useChatStore";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";

const messageStore = useMessageStore();
const chatStore = useChatStore();
const messageListRef = ref<HTMLDivElement | null>(null);
const messageItemRefs = ref<Map<string, HTMLElement>>(new Map());
const isSwitchingChat = ref(false);
const previousChatId = ref<string | null>(null);

onMounted(() => {
  chatStore.initializeMessageStore();
});

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

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

const scrollToFirstUnread = async () => {
  if (!messageStore.hasPendingUnread) return;
  
  const unreadCount = messageStore.pendingUnreadCount;
  const messages = messageStore.data;
  
  if (messages.length >= unreadCount) {
    const firstUnreadIndex = messages.length - unreadCount;
    const firstUnreadMessage = messages[firstUnreadIndex];
    
    if (firstUnreadMessage) {
      await scrollToMessage(firstUnreadMessage.id);
      messageStore.clearPendingUnread();
    }
  }
};

const showUnreadBanner = computed(() => {
  return messageStore.hasPendingUnread && messageStore.pendingUnreadCount > 10;
});

watch(
  () => messageStore.data.length,
  () => {
    if (!isSwitchingChat.value) {
      scrollToBottom();
    }
  },
  { immediate: true }
);

watch(
  () => chatStore.getSelectedChat,
  async (newChat) => {
    if (newChat && newChat.id !== previousChatId.value) {
      isSwitchingChat.value = true;
      previousChatId.value = newChat.id || null;
      
      await nextTick();
      
      if (messageStore.hasPendingUnread) {
        await scrollToFirstUnread();
      } else {
        scrollToBottom();
      }
      
      setTimeout(() => {
        isSwitchingChat.value = false;
      }, 100);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <div class="message-container">
      <transition name="slide-down">
        <div 
          v-if="showUnreadBanner" 
          class="unread-banner"
          @click="scrollToFirstUnread"
        >
          <span class="unread-icon">📩</span>
          <span>你有 {{ messageStore.pendingUnreadCount }} 条未读消息</span>
          <span class="unread-action">点击查看</span>
        </div>
      </transition>
      <div ref="messageListRef" class="flex-1 overflow-y-auto overflow-x-hidden messageList">
        <MessageItem 
          v-for="item in messageStore.data" 
          :key="item.id"
          :data="item"
          :isHighlighted="messageStore.highlightedMessageId === item.id"
          @scrollToMessage="scrollToMessage"
        />
      </div>
    </div>
    <MessageInput />
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}
.message-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.unread-banner {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 8px 16px;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transform: translateX(-50%) translateY(-2px);
  }
}
.unread-icon {
  font-size: 14px;
}
.unread-action {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 4px;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
</style>
