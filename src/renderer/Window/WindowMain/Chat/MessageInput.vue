<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from "vue";
import { useMessageStore } from "../../../store/useMessageStore";
import { useChatStore } from "../../../store/useChatStore";
import ReferencePreview from "./ReferencePreview.vue";

const messageStore = useMessageStore();
const chatStore = useChatStore();

const inputContent = ref("");
const inputRef = ref<HTMLTextAreaElement | null>(null);

const canSend = computed(() => {
  return inputContent.value.trim().length > 0 && chatStore.getSelectedChat !== null;
});

const isDisabled = computed(() => {
  return chatStore.getSelectedChat === null;
});

const hasReference = computed(() => {
  return messageStore.referencedMessage !== null;
});

const sendMessage = () => {
  if (!canSend.value) return;

  const content = inputContent.value.trim();
  
  messageStore.sendMessage(content);

  inputContent.value = "";
  focusInput();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      return;
    }
    e.preventDefault();
    sendMessage();
  }
};

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

const autoResize = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = "auto";
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + "px";
    }
  });
};

const handleCloseReference = () => {
  messageStore.clearReferencedMessage();
};

watch(inputContent, () => {
  autoResize();
});

onMounted(() => {
  focusInput();
});
</script>

<template>
  <div class="input-area">
    <ReferencePreview
      v-if="hasReference"
      :message="messageStore.referencedMessage!"
      @close="handleCloseReference"
    />
    <div class="input-wrapper" :class="{ disabled: isDisabled }">
      <textarea
        ref="inputRef"
        v-model="inputContent"
        class="message-input"
        :placeholder="isDisabled ? '请先选择一个会话' : '输入消息...'"
        :disabled="isDisabled"
        @keydown="handleKeydown"
        rows="1"
      ></textarea>
      <button
        class="send-btn"
        :class="{ active: canSend }"
        :disabled="!canSend"
        @click="sendMessage"
      >
        发送
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-area {
  background: rgb(245, 245, 245);
  border-top: 1px solid rgb(228, 228, 228);
  padding: 12px 16px;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  border: 1px solid rgb(228, 228, 228);
  transition: all 0.2s;

  &:focus-within {
    border-color: rgb(149, 236, 105);
  }

  &.disabled {
    background: rgb(248, 248, 248);
    opacity: 0.7;
  }
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 20px;
  max-height: 120px;
  overflow-y: auto;
  background: transparent;

  &:disabled {
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
}

.send-btn {
  padding: 6px 16px;
  background: rgb(228, 228, 228);
  color: #999;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: not-allowed;
  transition: all 0.2s;
  flex-shrink: 0;

  &.active {
    background: rgb(149, 236, 105);
    color: #333;
    cursor: pointer;

    &:hover {
      background: rgb(134, 218, 92);
    }

    &:active {
      background: rgb(119, 200, 79);
    }
  }
}
</style>
