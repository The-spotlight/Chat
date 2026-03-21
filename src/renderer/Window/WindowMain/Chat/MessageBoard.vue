<script setup lang="ts">
import BarTop from "../../../Components/BarTop.vue";
import {useMessageStore} from "../../../store/useMessageStore";
import MessageItem from "./MessageItem.vue";
import MessageInput from "./MessageInput.vue";
import {nextTick, watch} from "vue";

const messageStore = useMessageStore()

watch(
    () => messageStore.data.length,
    () => {
        nextTick(() => {
            const list = document.querySelector('.messageList');
            if (list) {
                list.scrollTop = list.scrollHeight;
            }
        });
    }
);

</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <div class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem :data="item" v-for="item in messageStore.data" :key="item.id"/>
    </div>
    <MessageInput/>
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}
</style>