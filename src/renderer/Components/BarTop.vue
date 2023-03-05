<template>
  <div class="topBar">
    <div class="winTitle">{{ title }}</div>
    <div class="winTool">
      <div @click="minimizeMainWin">
        <i class="icon icon-minimize"/>
      </div>
      <div v-if="isMaximized" @click="unMaximizeMainWin">
        <i class="icon icon-restore"/>
      </div>
      <div v-else @click="maximizeMainWin">
        <i class="icon icon-maximize"/>
      </div>
      <div @click="closeWin">
        <i class="icon icon-close"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {onMounted, onUnmounted, ref} from "vue";

defineProps<{ title?: string }>()

let isMaximized = ref(false)
const closeWin = () => {
  ipcRenderer.invoke('closeWin')
}
const maximizeMainWin = () => {
  ipcRenderer.invoke('maximizeMainWin')
}
const minimizeMainWin = () => {
  ipcRenderer.invoke('minimizeMainWin')
}
const unMaximizeMainWin = () => {
  ipcRenderer.invoke('unMaximizeMainWin')
}

const winMaximizeEvent = () => {
  isMaximized.value = true
}

const winUnMaximizeEvent = () => {
  isMaximized.value = false
}

onMounted(() => {
  ipcRenderer.on("windowMaximized", winMaximizeEvent);
  ipcRenderer.on("windowUnMaximized", winUnMaximizeEvent);
});

onUnmounted(() => {
  ipcRenderer.off("windowMaximized", winMaximizeEvent);
  ipcRenderer.off("windowUnMaximized", winUnMaximizeEvent);
});

</script>

<style lang="scss" scoped>
//样式代码
.topBar {
  display: flex;
  height: 25px;
  line-height: 25px;
  -webkit-app-region: drag; /* 可拖拽区域 */
  width: 100%;
}

.winTitle {
  flex: 1;
  padding-left: 12px;
  font-size: 14px;
  color: #888;
}

.winTool {
  height: 100%;
  display: flex;
  -webkit-app-region: no-drag; /* 可拖拽区域内的不可拖拽区域 */
}

.winTool div {
  height: 100%;
  width: 34px;
  text-align: center;
  color: #999;
  cursor: pointer;
  line-height: 25px;
}

.winTool .icon {
  font-size: 10px;
  color: #666666;
  font-weight: bold;
}

.winTool div:hover {
  background: #efefef;
}

.winTool div:last-child:hover {
  background: #ff7875;
}

.winTool div:last-child:hover i {
  color: #fff !important;
}
</style>