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

onMounted(() => {
  ipcRenderer.invoke('showWin')
})

</script>

<style scoped>
.pageBox {
  border-top: 1px solid #e6e6e6;
  box-sizing: border-box;
  margin-top: -1px;
}
</style>