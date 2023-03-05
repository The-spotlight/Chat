<script setup lang="ts">
import BarTop from "../../../Components/BarTop.vue";
import {useMessageStore} from "../../../store/useMessageStore";
import MessageItem from "./MessageItem.vue";

const messageStore = useMessageStore()

</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <div class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem :data="item" v-for="item in messageStore.data" :key="item.id"/>
    </div>
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}
</style>