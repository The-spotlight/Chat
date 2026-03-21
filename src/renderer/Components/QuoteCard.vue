<script setup lang="ts">
import { MessageReference } from '../../model/ModelMessage';

interface Props {
  reference: MessageReference;
  clickable?: boolean;
}

withDefaults(defineProps<Props>(), {
  clickable: false
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <div 
    class="quote-card" 
    :class="{ clickable }"
    @click="handleClick"
  >
    <div class="quote-sender">{{ reference.fromName }}</div>
    <div class="quote-content">{{ reference.content }}</div>
  </div>
</template>

<style scoped lang="scss">
.quote-card {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 6px 10px;
  margin-bottom: 6px;
  border-left: 3px solid rgb(149, 236, 105);

  &.clickable {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: #e8e8e8;
    }
  }

  .quote-sender {
    color: rgb(149, 236, 105);
    font-size: 12px;
    margin-bottom: 2px;
  }

  .quote-content {
    color: #666;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
