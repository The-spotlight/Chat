<script setup lang="ts">
import {ref, nextTick} from "vue";
import {useMessageStore} from "../../../store/useMessageStore";
import {useChatStore} from "../../../store/useChatStore";

const messageStore = useMessageStore();
const chatStore = useChatStore();

const inputContent = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const canSend = () => {
    return chatStore.selectedChat && inputContent.value.trim().length > 0;
};

const handleSend = () => {
    if (!canSend()) return;

    const content = inputContent.value;
    const message = messageStore.sendMessage(content);

    if (message && chatStore.selectedChat) {
        chatStore.updateLastMessage(chatStore.selectedChat.id, content.trim());
    }

    inputContent.value = '';

    nextTick(() => {
        textareaRef.value?.focus();
    });
};

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
};
</script>

<template>
  <div class="messageInput">
    <div class="inputWrapper" :class="{ disabled: !chatStore.selectedChat }">
      <textarea
        ref="textareaRef"
        v-model="inputContent"
        placeholder="输入消息..."
        :disabled="!chatStore.selectedChat"
        @keydown="handleKeydown"
      ></textarea>
      <button
        class="sendBtn"
        :disabled="!canSend()"
        @click="handleSend"
      >
        发送
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.messageInput {
  padding: 10px 16px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.inputWrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;

  &.disabled {
    opacity: 0.6;
  }
}

textarea {
  flex: 1;
  min-height: 36px;
  max-height: 120px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
  line-height: 1.4;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #07c160;
  }

  &:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #bbb;
  }
}

.sendBtn {
  padding: 8px 20px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #06ad56;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}
</style>
