<script setup lang="ts">
import { ref, computed } from "vue";
import { ModelMessage } from "../../../../model/ModelMessage";
import { useMessageStore } from "../../../store/useMessageStore";
import ContextMenu from "./ContextMenu.vue";

const props = defineProps<{ 
  data: ModelMessage;
  isHighlighted?: boolean;
}>();

const emit = defineEmits<{
  (e: 'scrollToMessage', id: string): void;
}>();

const messageStore = useMessageStore();

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

const handleContextMenuSelect = () => {
  messageStore.setReferencedMessage(props.data);
};

const closeContextMenu = () => {
  contextMenuVisible.value = false;
};

const handleReferenceClick = () => {
  if (props.data.reference) {
    emit('scrollToMessage', props.data.reference.referencedMessageId);
  }
};
</script>

<template>
  <template v-if="data?.isInMsg">
    <div 
      class="messageItem left"
      :class="{ highlighted: isHighlighted }"
      @contextmenu="handleContextMenu"
    >
      <div class="avatar">
        <img :src="data?.avatar" alt=""/>
      </div>
      <div class="msgBox">
        <div class="fromName">{{ data?.fromName }}</div>
        <div class="msgContent">
          <div 
            v-if="data?.reference" 
            class="reference-card"
            @click="handleReferenceClick"
          >
            <div class="reference-indicator"></div>
            <div class="reference-info">
              <div class="reference-name">{{ data.reference.referencedFromName }}</div>
              <div class="reference-text">{{ data.reference.referencedContent }}</div>
            </div>
          </div>
          <div class="message-text">{{ data?.messageContent }}</div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div 
      class="messageItem right"
      :class="{ highlighted: isHighlighted }"
      @contextmenu="handleContextMenu"
    >
      <div class="msgBox">
        <div class="msgContent">
          <div 
            v-if="data?.reference" 
            class="reference-card"
            @click="handleReferenceClick"
          >
            <div class="reference-indicator"></div>
            <div class="reference-info">
              <div class="reference-name">{{ data.reference.referencedFromName }}</div>
              <div class="reference-text">{{ data.reference.referencedContent }}</div>
            </div>
          </div>
          <div class="message-text">{{ data?.messageContent }}</div>
        </div>
      </div>
      <div class="avatar">
        <img :src="data?.avatar" alt=""/>
      </div>
    </div>
  </template>
  
  <ContextMenu
    :visible="contextMenuVisible"
    :x="contextMenuX"
    :y="contextMenuY"
    @select="handleContextMenuSelect"
    @close="closeContextMenu"
  />
</template>

<style lang="scss" scoped>
.messageItem {
  display: flex;
  padding-top: 8px;
  padding-bottom: 8px;
  position: relative;
  transition: background 0.3s;
}

.highlighted {
  background: rgba(149, 236, 105, 0.2);
  animation: highlight-fade 2s ease-out;
}

@keyframes highlight-fade {
  0% {
    background: rgba(149, 236, 105, 0.4);
  }
  100% {
    background: transparent;
  }
}

.left {
  padding-right: 30%;

  &::after {
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #fff;
    position: absolute;
    left: 60px;
    top: 38px;
    content: "";
  }
}

.right {
  padding-left: 30%;

  &::after {
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 6px solid rgb(149, 236, 105);
    position: absolute;
    right: 60px;
    top: 18px;
    content: "";
  }

  .msgContent {
    background: rgb(149, 236, 105) !important;
  }
}

.avatar {
  width: 66px;
  text-align: center;

  img {
    width: 46px;
    height: 46px;
  }
}

.msgBox {
  flex: 1;
}

.fromName {
  color: rgb(178, 178, 178);
  margin-bottom: 6px;
}

.msgContent {
  background: #fff;
  border-radius: 3px;
  padding: 8px;
  line-height: 22px;
}

.reference-card {
  display: flex;
  align-items: flex-start;
  background: rgb(245, 245, 245);
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid rgb(149, 236, 105);

  &:hover {
    background: rgb(235, 235, 235);
  }
}

.reference-indicator {
  display: none;
}

.reference-info {
  flex: 1;
  overflow: hidden;
}

.reference-name {
  color: rgb(149, 236, 105);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.reference-text {
  color: #999;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-text {
  word-break: break-word;
}
</style>
