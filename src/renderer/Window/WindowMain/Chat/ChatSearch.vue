<template>
  <div class="flex h54px box-border pt23px pl12px pr12px position-relative chatSearch">
    <div class="searchIcon"><i class="icon icon-sousuo"></i></div>
    <input 
      class="inputBox" 
      type="text"
      placeholder="搜索"
      v-model="keyword"
      @input="handleInput"
    />
    <div class="searchBtn">+</div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'search', keyword: string): void
}>()

const keyword = ref('')

const handleInput = () => {
  emit('search', keyword.value.trim())
}
</script>
<style lang="scss" scoped>
.chatSearch {
  background: rgb(247, 247, 247);
  -webkit-app-region: drag;
  border-right: 1px solid rgb(214, 214, 214);
}
.searchIcon {
  position: absolute;
  left: 13px;
  top: 24px;
  width: 23px;
  text-align: center;
  color: #666;
  i {
    font-size: 10px;
  }
}
.inputBox {
  -webkit-app-region: no-drag;
  flex: 1;
  margin-right: 8px;
  height: 23px;
  line-height: 22px;
  background: rgb(226, 226, 226);
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid rgb(226, 226, 226);
  border-radius: 3px;
  outline: none;
  padding-left: 23px;
  font-size: 12px;
  padding-right: 6px;
  font-family: "Microsoft Yahei", -apple-system, Ubuntu, sans-serif;
  &:focus {
    background: #fff;
  }
  &::placeholder {
    color: #888;
  }
}
.searchBtn {
  -webkit-app-region: no-drag;
  width: 24px;
  height: 23px;
  background: rgb(226, 226, 226);
  font-size: 18px;
  text-align: center;
  line-height: 22px;
  border-radius: 3px;
  color: #888;
  cursor: pointer;
  box-sizing: border-box;
  &:hover {
    background: rgb(209, 209, 209);
  }
}
</style>
