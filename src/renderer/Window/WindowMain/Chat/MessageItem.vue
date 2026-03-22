<script setup lang="ts">
import { ref, computed } from "vue";
import { ModelMessage } from "../../../../model/ModelMessage";
import { useMessageStore } from "../../../store/useMessageStore";
import ContextMenu, { MenuItem } from "./ContextMenu.vue";
import { 
  canRecallMessage, 
  canEditMessage, 
  getRecallDisplayText,
  getRecalledReferenceContent
} from "../../../utils/messageUtils";

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
const isHovered = ref(false);
const isEditing = ref(false);
const editContent = ref("");
const showActionMenu = ref(false);

const isSelf = computed(() => !props.data.isInMsg);
const isRecalled = computed(() => props.data.isRecalled);

const canRecall = computed(() => canRecallMessage(props.data));
const canEdit = computed(() => canEditMessage(props.data));

const menuItems = computed<MenuItem[]>(() => {
  if (isRecalled.value) {
    return [];
  }
  
  const items: MenuItem[] = [
    { key: 'reference', label: '引用', icon: '↩', visible: true }
  ];
  
  if (isSelf.value) {
    items.push({ key: 'recall', label: '撤回', icon: '↶', visible: canRecall.value });
    items.push({ key: 'edit', label: '编辑', icon: '✎', visible: canEdit.value });
  }
  
  items.push({ key: 'copy', label: '复制', icon: '⎘', visible: !isRecalled.value });
  
  return items;
});

const actionMenuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [];
  
  if (canRecall.value) {
    items.push({ key: 'recall', label: '撤回', icon: '↶' });
  }
  if (canEdit.value) {
    items.push({ key: 'edit', label: '编辑', icon: '✎' });
  }
  items.push({ key: 'copy', label: '复制', icon: '⎘' });
  
  return items;
});

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

const handleContextMenuSelect = (key: string) => {
  switch (key) {
    case 'reference':
      messageStore.setReferencedMessage(props.data);
      break;
    case 'recall':
      handleRecall();
      break;
    case 'edit':
      startEdit();
      break;
    case 'copy':
      handleCopy();
      break;
  }
};

const closeContextMenu = () => {
  contextMenuVisible.value = false;
};

const handleRecall = () => {
  if (props.data.id) {
    messageStore.recallMessage(props.data.id);
  }
};

const startEdit = () => {
  if (!canEdit.value) return;
  editContent.value = props.data.messageContent || "";
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editContent.value = "";
};

const saveEdit = () => {
  if (!editContent.value.trim()) return;
  if (props.data.id) {
    const success = messageStore.editMessage(props.data.id, editContent.value.trim());
    if (success) {
      isEditing.value = false;
      editContent.value = "";
    }
  }
};

const handleCopy = () => {
  if (props.data.messageContent) {
    navigator.clipboard.writeText(props.data.messageContent);
  }
};

const handleReferenceClick = () => {
  if (props.data.reference) {
    emit('scrollToMessage', props.data.reference.referencedMessageId);
  }
};

const getReferenceContent = (reference: { referencedMessageId: string; referencedContent: string }) => {
  const referencedMessage = messageStore.getMessageById(reference.referencedMessageId);
  if (referencedMessage?.isRecalled) {
    return getRecalledReferenceContent();
  }
  return reference.referencedContent;
};

const recallDisplayText = computed(() => {
  return getRecallDisplayText(props.data, isSelf.value);
});
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
              <div class="reference-text">{{ getReferenceContent(data.reference) }}</div>
            </div>
          </div>
          
          <template v-if="isRecalled">
            <div class="recall-text">{{ recallDisplayText }}</div>
          </template>
          <template v-else>
            <div class="message-text">{{ data?.messageContent }}</div>
            <div v-if="data?.isEdited" class="edited-badge">已编辑</div>
          </template>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div 
      class="messageItem right"
      :class="{ highlighted: isHighlighted }"
      @contextmenu="handleContextMenu"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false; showActionMenu = false"
    >
      <div class="msgBox">
        <div class="msgContent" :class="{ 'editing': isEditing }">
          <div 
            v-if="data?.reference" 
            class="reference-card"
            @click="handleReferenceClick"
          >
            <div class="reference-indicator"></div>
            <div class="reference-info">
              <div class="reference-name">{{ data.reference.referencedFromName }}</div>
              <div class="reference-text">{{ getReferenceContent(data.reference) }}</div>
            </div>
          </div>
          
          <template v-if="isRecalled">
            <div class="recall-text">{{ recallDisplayText }}</div>
          </template>
          <template v-else-if="isEditing">
            <textarea
              v-model="editContent"
              class="edit-textarea"
              rows="3"
            ></textarea>
            <div class="edit-actions">
              <div class="char-count">{{ editContent.length }} 字</div>
              <div class="button-group">
                <button class="btn-cancel" @click="cancelEdit">取消</button>
                <button class="btn-save" @click="saveEdit">保存</button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="message-text">{{ data?.messageContent }}</div>
            <div v-if="data?.isEdited" class="edited-badge">已编辑</div>
          </template>
        </div>
        
        <div 
          v-if="isHovered && !isRecalled && !isEditing" 
          class="action-buttons"
        >
          <div class="more-actions">
            <button 
              class="btn-more"
              @click="showActionMenu = !showActionMenu"
            >
              ⋮
            </button>
            <div v-if="showActionMenu" class="action-dropdown">
              <div
                v-for="item in actionMenuItems"
                :key="item.key"
                class="action-dropdown-item"
                @click="handleContextMenuSelect(item.key); showActionMenu = false"
              >
                <span v-if="item.icon" class="action-icon">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>
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
    :items="menuItems"
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
  position: relative;
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
  position: relative;

  &.editing {
    background: #fff !important;
    min-width: 200px;
  }
}

.recall-text {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 4px 0;
}

.edited-badge {
  color: #999;
  font-size: 11px;
  margin-top: 4px;
}

.edit-textarea {
  width: 100%;
  min-height: 60px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: rgb(149, 236, 105);
  }
}

.edit-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

.button-group {
  display: flex;
  gap: 8px;
}

.btn-cancel, .btn-save {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;

  &:hover {
    background: #e0e0e0;
  }
}

.btn-save {
  background: rgb(149, 236, 105);
  color: #333;

  &:hover {
    background: rgb(130, 220, 90);
  }
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

.action-buttons {
  position: absolute;
  top: -8px;
  right: 0;
  display: flex;
  gap: 4px;
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.more-actions {
  position: relative;
}

.btn-more {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}

.action-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  min-width: 100px;
  z-index: 100;
  margin-top: 4px;
  animation: fade-in 0.15s ease;
}

.action-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover {
    background: rgb(245, 245, 245);
  }
}

.action-icon {
  font-size: 12px;
  color: #666;
}
</style>
