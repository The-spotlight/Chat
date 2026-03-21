<script setup lang="ts">
import { computed } from 'vue';
import { useMessageStore } from "../../../store/useMessageStore";
import { ModelMessageQuote } from "../../../../model/ModelMessage";

const messageStore = useMessageStore();

const MAX_CONTENT_LENGTH = 30;

const quote = computed(() => messageStore.currentQuote);

const truncatedContent = computed(() => {
  if (!quote.value) return '';
  if (quote.value.content.length <= MAX_CONTENT_LENGTH) {
    return quote.value.content;
  }
  return quote.value.content.substring(0, MAX_CONTENT_LENGTH) + '...';
});

const handleClose = () => {
  messageStore.clearQuote();
};
</script>

<template>
  <div v-if="quote" class="quote-preview">
    <div class="quote-content">
      <span class="quote-sender">{{ quote.fromName }}</span>
      <span class="quote-text">{{ truncatedContent }}</span>
    </div>
    <button class="quote-close" @click="handleClose">×</button>
  </div>
</template>

<style lang="scss" scoped>
.quote-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-left: 3px solid rgb(149, 236, 105);
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 0 4px 4px 0;
  font-size: 13px;
}

.quote-content {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.quote-sender {
  color: rgb(149, 236, 105);
  font-weight: 500;
  flex-shrink: 0;
}

.quote-text {
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.quote-close {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
  margin-left: 8px;

  &:hover {
    background: #f0f0f0;
    color: #666;
  }
}
</style>
