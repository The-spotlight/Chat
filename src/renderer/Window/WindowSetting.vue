<script setup lang="ts">

import BarTop from "../Components/BarTop.vue";
import {dialogReady} from "../common/Dialog";
import {onMounted} from "vue";

const msgHandler = (e: any) => {
  console.log(e.data);
  window.opener.postMessage({msgName: "hello", value: "I am your son."});
};

onMounted(() => {
  console.log("ready", Date.now());
  window.addEventListener("message", msgHandler);
  dialogReady();
});

</script>

<template>
  <BarTop title="设置"/>
  <div class="flex flex-1">
    <div class="flex-1 box-border pt50px">
      <router-view/>
    </div>
  </div>
</template>

<style>
#app {
  flex-direction: column;
  background: rgb(245, 245, 245);
}
</style>

<style scoped lang="scss">
</style>