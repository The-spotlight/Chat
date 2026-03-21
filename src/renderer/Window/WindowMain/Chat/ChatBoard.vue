<script setup lang="ts">
import ChatSearch from "./ChatSearch.vue";
import ChatItem from "./ChatItem.vue";

import {useChatStore} from "../../../store/useChatStore";
import {ref, computed, watch} from "vue";

let store = useChatStore();
let searchKeyword = ref('');

let filteredList = computed(() => {
  const sourceData = store.data;
  if (!searchKeyword.value) {
    return sourceData;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return sourceData.filter(item => {
    const nameMatch = item.fromName?.toLowerCase().includes(keyword);
    const msgMatch = item.lastMsg?.toLowerCase().includes(keyword);
    return nameMatch || msgMatch;
  });
});

watch(
  () => filteredList.value,
  (newList) => {
    if (import.meta.env.DEV) {
      console.log('[ChatBoard] 搜索结果:', {
        keyword: searchKeyword.value,
        total: store.data.length,
        filtered: newList.length,
        hasSelected: newList.some(item => item.isSelected)
      });
    }
  },
  { immediate: true }
);

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword;
};
</script>

<template>
  <div class="w250px h100% flex flex-col box-border">
    <ChatSearch @search="handleSearch" />
    <div class="flex-1 overflow-y-auto box-border listBox">
      <template v-if="filteredList.length > 0">
        <ChatItem :data="item" v-for="item in filteredList" :key="item.id" />
      </template>
      <div v-else class="emptyTip">暂无匹配会话</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.listBox {
  background: rgb(230, 229, 229) linear-gradient(to bottom right, rgb(235, 234, 233), rgb(240, 240, 240));
}
.emptyTip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-size: 14px;
}
</style>