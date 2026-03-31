<script setup lang="ts">
import { watch, nextTick, ref } from "vue";
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
</style>
