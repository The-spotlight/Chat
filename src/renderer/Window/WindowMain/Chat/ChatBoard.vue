<script setup lang="ts">
import ChatSearch from "./ChatSearch.vue";
import ChatItem from "./ChatItem.vue";

import {useChatStore} from "../../../store/useChatStore";

let store = useChatStore();
</script>

<template>
  <div class="w250px h100% flex flex-col box-border">
    <ChatSearch />
    <div class="flex-1 overflow-y-auto box-border listBox">
      <ChatItem :data="item" v-for="item in store.data" :key="item.id" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.listBox {
  background: rgb(230, 229, 229) linear-gradient(to bottom right, rgb(235, 234, 233), rgb(240, 240, 240));
}
</style>