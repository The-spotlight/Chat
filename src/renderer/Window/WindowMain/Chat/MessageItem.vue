<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { ModelMessage } from "../../../../model/ModelMessage";
import { useMessageStore } from "../../../store/useMessageStore";
import ContextMenu, { ContextMenuItem } from "./ContextMenu.vue";
import { canOperateMessage, formatMessageTime } from '../../../utils/messageUtils';

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
const isEditing = ref(false);
const editContent = ref('');
const showActions = ref(false);

const canOperate = computed(() => {
  return canOperateMessage(props.data);
});

const contextMenuItems = computed<ContextMenuItem[]>(() => {
  return [
    { id: 'quote', label: '引用', icon: '↩' },
    { id: 'copy', label: '复制', icon: '📋' },
    { id: 'divider1', label: '', divider: true, show: canOperate.value },
    { id: 'edit', label: '编辑', icon: '✏️', show: canOperate.value },
    { id: 'recall', label: '撤回', icon: '↶', show: canOperate.value },
  ];
});

const recallText = computed(() => {
  return props.data.isInMsg ? '对方撤回了一条消息' : '你撤回了一条消息';
});

const formatTime = formatMessageTime;

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

const handleContextMenuClick = (itemId: string) => {
  switch (itemId) {
    case 'quote':
      messageStore.setReferencedMessage(props.data);
      break;
    case 'copy':
      if (props.data.messageContent) {
        navigator.clipboard.writeText(props.data.messageContent);
      }
      break;
    case 'edit':
      startEdit();
      break;
    case 'recall':
      messageStore.recallMessage(props.data.id);
      break;
  }
};

const closeContextMenu = () => {
  contextMenuVisible.value = false;
};

const handleReferenceClick = () => {
  if (props.data.reference) {
    emit('scrollToMessage', props.data.reference.referencedMessageId);
  }
};

const startEdit = () => {
  if (!canOperate.value) return;
  editContent.value = props.data.messageContent || '';
  isEditing.value = true;
  nextTick(() => {
    const input = document.querySelector(`.edit-input-${props.data.id}`) as HTMLTextAreaElement;
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
};

const cancelEdit = () => {
  isEditing.value = false;
  editContent.value = '';
};

const saveEdit = () => {
  if (!editContent.value.trim()) return;
  messageStore.editMessage(props.data.id, editContent.value.trim());
  isEditing.value = false;
  editContent.value = '';
};

const handleRecallAction = () => {
  messageStore.recallMessage(props.data.id);
};

const handleCopyAction = () => {
  if (props.data.messageContent) {
    navigator.clipboard.writeText(props.data.messageContent);
  }
};

const handleMouseEnter = () => {
  if (!props.data.isRecalled) {
    showActions.value = true;
  }
};

const handleMouseLeave = () => {
  showActions.value = false;
};

const hideActions = () => {
  showActions.value = false;
};
</script>

<template>
  <template v-if="data?.isInMsg">
    <div 
      class="messageItem left"
      :class="{ highlighted: isHighlighted }"
      @contextmenu="handleContextMenu"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
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
              <div v-if="data.reference.referencedFromName" class="reference-name">{{ data.reference.referencedFromName }}</div>
              <div class="reference-text">{{ data.reference.referencedContent }}</div>
            </div>
          </div>
          <div v-if="data?.isRecalled" class="recalled-message">{{ recallText }}</div>
          <template v-else>
            <div v-if="!isEditing" class="message-text">{{ data?.messageContent }}</div>
          </template>
        </div>
        <div class="message-meta">
          <span class="message-time">{{ formatTime(data?.createTime) }}</span>
        </div>
      </div>
      <transition name="fade">
        <div v-if="showActions && !data?.isRecalled" class="action-buttons action-buttons-left">
          <div class="dropdown">
            <button class="action-btn more-btn" @click.stop>
              <span class="icon">⋮</span>
            </button>
            <div class="dropdown-menu">
              <div class="dropdown-item" @click="messageStore.setReferencedMessage(props.data); hideActions()">
                <span class="dropdown-icon">↩</span>
                <span>引用</span>
              </div>
              <div class="dropdown-item" @click="handleCopyAction(); hideActions()">
                <span class="dropdown-icon">📋</span>
                <span>复制</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </template>
  <template v-else>
    <div 
      class="messageItem right"
      :class="{ highlighted: isHighlighted }"
      @contextmenu="handleContextMenu"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
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
              <div v-if="data.reference.referencedFromName" class="reference-name">{{ data.reference.referencedFromName }}</div>
              <div class="reference-text">{{ data.reference.referencedContent }}</div>
            </div>
          </div>
          <div v-if="data?.isRecalled" class="recalled-message">{{ recallText }}</div>
          <template v-else>
            <div v-if="!isEditing" class="message-text">{{ data?.messageContent }}</div>
            <div v-if="isEditing" class="edit-container">
              <textarea 
                :class="['edit-input', 'edit-input-' + data.id]"
                v-model="editContent"
                @keydown.enter.prevent="saveEdit"
                @keydown.esc="cancelEdit"
                rows="1"
              ></textarea>
              <div class="edit-actions">
                <div class="edit-buttons">
                  <button class="edit-btn cancel" @click="cancelEdit">取消</button>
                  <button class="edit-btn save" @click="saveEdit">保存</button>
                </div>
                <span class="char-count">{{ editContent.length }}</span>
              </div>
            </div>
          </template>
        </div>
        <div class="message-meta">
          <span v-if="data?.isEdited && !data?.isRecalled" class="edited-tag">已编辑</span>
          <span class="message-time">{{ formatTime(data?.createTime) }}</span>
        </div>
      </div>
      <div class="avatar">
        <img :src="data?.avatar" alt=""/>
      </div>
      <transition name="fade">
        <div v-if="showActions && !data?.isRecalled && !isEditing" class="action-buttons">
          <div class="dropdown">
            <button class="action-btn more-btn" @click.stop>
              <span class="icon">⋮</span>
            </button>
            <div class="dropdown-menu">
              <div v-if="canOperate" class="dropdown-item" @click="startEdit(); hideActions()">
                <span class="dropdown-icon">✏️</span>
                <span>编辑</span>
              </div>
              <div v-if="canOperate" class="dropdown-item" @click="handleRecallAction(); hideActions()">
                <span class="dropdown-icon">↶</span>
                <span>撤回</span>
              </div>
              <div class="dropdown-item" @click="handleCopyAction(); hideActions()">
                <span class="dropdown-icon">📋</span>
                <span>复制</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <ContextMenu
    :visible="contextMenuVisible"
    :x="contextMenuX"
    :y="contextMenuY"
    :items="contextMenuItems"
    @click="handleContextMenuClick"
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

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
  padding: 0 8px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.edited-tag {
  font-size: 12px;
  color: #999;
}

.recalled-message {
  color: #999;
  font-size: 14px;
  font-style: italic;
  text-align: center;
  padding: 8px 0;
}

.edit-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid rgb(200, 200, 200);
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  background: #fff;
  font-family: inherit;

  &:focus {
    border-color: rgb(149, 236, 105);
  }
}

.edit-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn.cancel {
  background: rgb(245, 245, 245);
  color: #666;

  &:hover {
    background: rgb(235, 235, 235);
  }
}

.edit-btn.save {
  background: rgb(149, 236, 105);
  color: #333;

  &:hover {
    background: rgb(130, 220, 90);
  }
}

.char-count {
  font-size: 12px;
  color: #999;
}

.action-buttons {
  position: absolute;
  top: -16px;
  right: 70px;
  display: flex;
  gap: 4px;
  z-index: 10;
}

.action-buttons-left {
  right: auto;
  left: 70px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: rgb(245, 245, 245);
    color: #333;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  min-width: 120px;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.15s;

  &:hover {
    background: rgb(245, 245, 245);
  }
}

.dropdown-icon {
  font-size: 14px;
  color: #666;
}

.right {
  .message-meta {
    justify-content: flex-end;
  }

  .edit-input {
    background: rgb(149, 236, 105);
    border-color: rgb(130, 220, 90);
  }
}

.left {
  .message-meta {
    justify-content: flex-start;
  }
}
</style>
