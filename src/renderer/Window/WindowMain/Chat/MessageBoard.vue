<script setup lang="ts">
import { watch, nextTick, ref, provide, onUpdated } from "vue";
import BarTop from "../../../Components/BarTop.vue";
import {useMessageStore} from "../../../store/useMessageStore";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";

const messageStore = useMessageStore();
const messageListRef = ref<HTMLDivElement | null>(null);
const highlightedMessageId = ref<string | null>(null);
const messageItemRefs = ref<Map<string, HTMLElement>>(new Map());

// 提供滚动到消息的方法
const scrollToMessage = (messageId: string) => {
  const messageElement = messageItemRefs.value.get(messageId);
  if (messageElement && messageListRef.value) {
    // 滚动到消息位置
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 高亮显示消息
    highlightedMessageId.value = messageId;
    
    // 3秒后取消高亮
    setTimeout(() => {
      highlightedMessageId.value = null;
    }, 3000);
  }
};

// 提供给子组件的方法
provide('scrollToMessage', scrollToMessage);

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

// 更新后重新收集消息元素引用
onUpdated(() => {
  // 清空并重新收集所有消息元素引用
  messageItemRefs.value.clear();
  
  if (messageListRef.value) {
    const messageElements = messageListRef.value.querySelectorAll('.message-item-wrapper');
    messageStore.data.forEach((item, index) => {
      if (item.id && messageElements[index]) {
        messageItemRefs.value.set(item.id, messageElements[index] as HTMLElement);
      }
    });
  }
});
</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <div ref="messageListRef" class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem 
        :data="item" 
        v-for="item in messageStore.data" 
        :key="item.id"
        :class="{ 'highlighted': item.id === highlightedMessageId }"
      />
    </div>
    <MessageInput />
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}
</style>