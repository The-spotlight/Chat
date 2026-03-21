<script setup lang="ts">
import { watch, nextTick, ref } from "vue";
import BarTop from "../../../Components/BarTop.vue";
import {useMessageStore} from "../../../store/useMessageStore";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";

const messageStore = useMessageStore();
const messageListRef = ref<HTMLDivElement | null>(null);

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
</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <div ref="messageListRef" class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem :data="item" v-for="item in messageStore.data" :key="item.id"/>
    </div>
    <MessageInput />
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}
</style>