<script setup lang="ts">
import { watch, nextTick, ref } from "vue";
import BarTop from "../../../Components/BarTop.vue";
import {useMessageStore} from "../../../store/useMessageStore";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";

const messageStore = useMessageStore();
const messageListRef = ref<HTMLDivElement | null>(null);
const highlightedMessageId = ref<string | null>(null);

// 监听消息列表变化，自动滚动到底部
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

// 跳转到指定消息
const jumpToMessage = (messageId: string) => {
  nextTick(() => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement && messageListRef.value) {
      // 滚动到消息位置
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 高亮显示消息
      highlightedMessageId.value = messageId;
      messageElement.classList.add('highlight-message');
      
      // 2秒后移除高亮
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
        if (highlightedMessageId.value === messageId) {
          highlightedMessageId.value = null;
        }
      }, 2000);
    }
  });
};
</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <div ref="messageListRef" class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem 
        :data="item" 
        :index="index" 
        v-for="(item, index) in messageStore.data" 
        :key="item.id"
        @jump-to-message="jumpToMessage"
      />
    </div>
    <MessageInput />
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}

:deep(.highlight-message) {
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(149, 236, 105, 0.3);
  }
}
</style>
