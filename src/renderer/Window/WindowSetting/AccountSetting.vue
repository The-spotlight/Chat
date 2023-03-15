<script setup lang="ts">
import {useMessageStore} from "../../store/useMessageStore";

const messageStore = useMessageStore()

</script>

<template>
  <div>
    {{ messageStore.data[0].fromName }}

  </div>
</template>

<style scoped>

</style>