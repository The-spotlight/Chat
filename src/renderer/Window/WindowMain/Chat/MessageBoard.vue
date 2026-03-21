<script setup lang="ts">
import BarTop from "../../../Components/BarTop.vue";
import {useMessageStore} from "../../../store/useMessageStore";
import {useChatStore} from "../../../store/useChatStore";
import MessageItem from "./MessageItem.vue";
import {ref, computed, nextTick, watch} from "vue";

const messageStore = useMessageStore()
const chatStore = useChatStore()

const inputContent = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const messageListRef = ref<HTMLDivElement | null>(null)

const hasSelectedChat = computed(() => {
  return chatStore.getSelectedChat() !== null
})

const canSend = computed(() => {
  return hasSelectedChat.value && inputContent.value.trim().length > 0
})

const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

watch(() => messageStore.data.length, () => {
  scrollToBottom()
})

const handleSend = async () => {
  const content = inputContent.value.trim()
  if (!content || !hasSelectedChat.value) return

  const selectedChat = chatStore.getSelectedChat()
  if (!selectedChat) return

  const message = messageStore.sendMessage(content)
  if (message) {
    chatStore.updateChatLastMessage(selectedChat.id!, content)
    inputContent.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="h100% flex flex-1 flex-col">
    <BarTop/>
    <div ref="messageListRef" class="flex-1 overflow-y-auto overflow-x-hidden messageList">
      <MessageItem :data="item" v-for="item in messageStore.data" :key="item.id"/>
    </div>
    <div class="inputArea">
      <div class="inputWrapper">
        <textarea
          ref="inputRef"
          v-model="inputContent"
          class="messageInput"
          :placeholder="hasSelectedChat ? '请输入消息...' : '请选择一个聊天会话'"
          :disabled="!hasSelectedChat"
          @keydown="handleKeydown"
        />
        <button
          class="sendBtn"
          :class="{ disabled: !canSend }"
          :disabled="!canSend"
          @click="handleSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.messageList {
  background: rgb(245, 245, 245);
}

.inputArea {
  background: rgb(245, 245, 245);
  border-top: 1px solid rgb(220, 220, 220);
  padding: 12px 16px;
}

.inputWrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.messageInput {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 10px 12px;
  border: 1px solid rgb(200, 200, 200);
  border-radius: 4px;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 20px;
  font-family: inherit;
  background: #fff;
}

.messageInput:focus {
  border-color: rgb(149, 236, 105);
}

.messageInput:disabled {
  background: rgb(240, 240, 240);
  cursor: not-allowed;
}

.sendBtn {
  padding: 10px 24px;
  background: rgb(149, 236, 105);
  border: none;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
  height: 40px;
}

.sendBtn:hover:not(:disabled) {
  opacity: 0.9;
}

.sendBtn.disabled {
  background: rgb(200, 200, 200);
  cursor: not-allowed;
  color: #888;
}
</style>