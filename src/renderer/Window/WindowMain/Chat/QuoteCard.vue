<script setup lang="ts">
import { computed } from 'vue';
import { ModelMessageQuote } from "../../../../model/ModelMessage";

const props = defineProps<{ quote: ModelMessageQuote }>();

const emit = defineEmits<{
  (e: 'click', messageId: string): void;
}>();

const MAX_CONTENT_LENGTH = 50;

const truncatedContent = computed(() => {
  if (props.quote.content.length <= MAX_CONTENT_LENGTH) {
    return props.quote.content;
  }
  return props.quote.content.substring(0, MAX_CONTENT_LENGTH) + '...';
});

const handleClick = () => {
  emit('click', props.quote.messageId);
};
</script>

<template>
  <div class="quote-card" @click="handleClick">
    <div class="quote-card-inner">
      <div class="quote-sender">{{ quote.fromName }}</div>
      <div class="quote-content">{{ truncatedContent }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.quote-card {
  background: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid rgb(149, 236, 105);
  padding: 8px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: #ebebeb;
  }
}

.quote-card-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quote-sender {
  color: rgb(149, 236, 105);
  font-size: 12px;
  font-weight: 500;
}

.quote-content {
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
