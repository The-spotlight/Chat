<script setup lang="ts">
import { onMounted } from "vue";
import ChatBoard from "./Chat/ChatBoard.vue";
import MessageBoard from "./Chat/MessageBoard.vue";
import { useChatStore } from "../../store/useChatStore";

const chatStore = useChatStore();

onMounted(() => {
  chatStore.initializeStore();
});
</script>
<template>
  <ChatBoard></ChatBoard>
  <MessageBoard></MessageBoard>
</template>
<style scoped lang="scss"></style>