<template>
  <div class="flex h54px box-border pt23px pl12px pr12px position-relative chatSearch">
    <div class="searchIcon"><i class="icon icon-sousuo"></i></div>
    <div class="inputBox" ref="inputBox" contenteditable="true" placeholder="搜索" @input="handleInput" @keydown="handleKeydown"></div>
    <div class="searchBtn">+</div>
  </div>
</template>
<script lang="ts" setup>
import { useChatStore } from "../../../store/useChatStore";
import { ref, watch } from "vue";

const store = useChatStore();
const inputBox = ref<HTMLDivElement | null>(null);
let debounceTimer: number | null = null;

// XSS防护：转义特殊字符
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// 清理输入内容
const sanitizeInput = (text: string): string => {
  // 移除HTML标签
  const withoutTags = text.replace(/<[^>]*>/g, "");
  // 转义特殊字符
  const escaped = escapeHtml(withoutTags);
  // 移除多余空白字符（包括换行、制表符）
  const cleaned = escaped.replace(/\s+/g, " ").trim();
  return cleaned;
};

// 防抖处理
const debouncedSearch = (keyword: string, delay: number = 150) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(() => {
    store.setSearchKeyword(keyword);
  }, delay);
};

const handleInput = () => {
  if (inputBox.value) {
    const rawText = inputBox.value.innerText;
    const keyword = sanitizeInput(rawText);
    debouncedSearch(keyword);
  }
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  // ESC键清除搜索
  if (event.key === "Escape") {
    clearSearch();
  }
  // 防止回车换行
  if (event.key === "Enter") {
    event.preventDefault();
  }
};

// 清除搜索
const clearSearch = () => {
  if (inputBox.value) {
    inputBox.value.innerText = "";
  }
  store.setSearchKeyword("");
  // 失去焦点
  inputBox.value?.blur();
};

// 监听搜索关键词变化，同步清空输入框
watch(
  () => store.searchKeyword,
  (newVal) => {
    if (!newVal && inputBox.value && inputBox.value.innerText.trim()) {
      inputBox.value.innerText = "";
    }
  }
);
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
  /* 输入框为空时显示 placeholder */
  &:empty:before {
    content: attr(placeholder);
    color: #888;
  }
  /* 输入框获取焦点时移除 placeholder */
  &:focus:before {
    content: none;
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
