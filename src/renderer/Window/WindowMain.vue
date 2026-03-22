<template>
  <BarLeft/>
  <div class="pageBox flex-1 h100% flex">
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import BarLeft from "../Components/BarLeft.vue";
import {ipcRenderer} from 'electron'
import {onMounted} from "vue";
import {useChatStore} from "../store/useChatStore";

const chatStore = useChatStore();

onMounted(() => {
  ipcRenderer.invoke('showWin')
  // 初始化选中状态，恢复消息列表
  chatStore.initSelectedState();
})
</script>

<style scoped>
.pageBox {
  border-top: 1px solid #e6e6e6;
  box-sizing: border-box;
  margin-top: -1px;
}
</style>