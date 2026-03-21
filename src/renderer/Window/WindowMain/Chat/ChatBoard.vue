<script setup lang="ts">
import { ref, computed } from 'vue';
import ChatSearch from "./ChatSearch.vue";
import ChatItem from "./ChatItem.vue";

import { useChatStore } from "../../../store/useChatStore";

let store = useChatStore();
let searchKeyword = ref('');

const onSearch = (keyword: string) => {
  searchKeyword.value = keyword;
};

const filteredData = computed(() => {
  const keyword = searchKeyword.value.toLowerCase().trim();
  if (!keyword) {
    return store.data;
  }
  return store.data.filter(item => {
    const fromName = item.fromName?.toLowerCase() || '';
    const lastMsg = item.lastMsg?.toLowerCase() || '';
    return fromName.includes(keyword) || lastMsg.includes(keyword);
  });
});

const isEmptyResult = computed(() => {
  return searchKeyword.value.trim() !== '' && filteredData.value.length === 0;
});
</script>

<template>
  <div class="w250px h100% flex flex-col box-border">
    <ChatSearch @search="onSearch" />
    <div class="flex-1 overflow-y-auto box-border listBox">
      <ChatItem :data="item" v-for="item in filteredData" :key="item.id" />
      <div v-if="isEmptyResult" class="emptyTip">暂无匹配会话</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.listBox {
  background: rgb(230, 229, 229) linear-gradient(to bottom right, rgb(235, 234, 233), rgb(240, 240, 240));
}
.emptyTip {
  text-align: center;
  padding: 40px 20px;
  color: rgb(153, 153, 153);
  font-size: 13px;
}
</style>
