<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { ModelMessage } from "../../../../model/ModelMessage";
import { useMessageStore, RECALL_TEXT_SELF, RECALL_TEXT_OTHER } from "../../../store/useMessageStore";
import { canRecallMessage, canEditMessage, canOperateMessage } from "../../../utils/messageUtils";
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

const isEditing = ref(false);
const editContent = ref("");
const editInputRef = ref<HTMLTextAreaElement | null>(null);

const isHovering = ref(false);
const showDropdown = ref(false);

const isRecalled = computed(() => props.data?.isRecalled ?? false);
const isEdited = computed(() => props.data?.isEdited ?? false);

const recallText = computed(() => {
  return props.data?.isInMsg ? RECALL_TEXT_OTHER : RECALL_TEXT_SELF;
});

const canRecall = computed(() => {
  if (!props.data) return false;
  return canRecallMessage(props.data);
});

const canEdit = computed(() => {
  if (!props.data) return false;
  return canEditMessage(props.data);
});

const showActionButtons = computed(() => {
  if (!props.data) return false;
  if (props.data.isInMsg) return false;
  if (props.data.isRecalled) return false;
  return canOperateMessage(props.data);
});

const handleContextMenu = (e: MouseEvent) => {
  if (isRecalled.value) return;
  e.preventDefault();
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

const handleContextMenuSelect = () => {
  messageStore.setReferencedMessage(props.data);
};

const handleRecall = () => {
  if (props.data?.id) {
    messageStore.recallMessage(props.data.id);
  }
};

const handleEdit = () => {
  if (!canEdit.value) return;
  editContent.value = props.data?.messageContent || "";
  isEditing.value = true;
  nextTick(() => {
    editInputRef.value?.focus();
    autoResizeEditInput();
  });
};

const handleCopy = () => {
  if (props.data?.messageContent) {
    navigator.clipboard.writeText(props.data.messageContent);
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

const cancelEdit = () => {
  isEditing.value = false;
  editContent.value = "";
};

const saveEdit = () => {
  const trimmedContent = editContent.value.trim();
  if (!trimmedContent || !props.data?.id) {
    cancelEdit();
    return;
  }
  
  messageStore.editMessage(props.data.id, trimmedContent);
  isEditing.value = false;
  editContent.value = "";
};

const autoResizeEditInput = () => {
  nextTick(() => {
    if (editInputRef.value) {
      editInputRef.value.style.height = "auto";
      editInputRef.value.style.height = Math.min(editInputRef.value.scrollHeight, 200) + "px";
    }
  });
};

const handleEditKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    saveEdit();
  } else if (e.key === "Escape") {
    cancelEdit();
  }
};

const handleDropdownRecall = () => {
  showDropdown.value = false;
  handleRecall();
};

const handleDropdownEdit = () => {
  showDropdown.value = false;
  handleEdit();
};

const handleDropdownCopy = () => {
  showDropdown.value = false;
  handleCopy();
};

const toggleDropdown = (e: MouseEvent) => {
  e.stopPropagation();
  showDropdown.value = !showDropdown.value;
};

const handleMouseEnter = () => {
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
  showDropdown.value = false;
};
</script>

<template>
  <template v-if="data?.isInMsg">
    <div 
      class="messageItem left"
      :class="{ highlighted: isHighlighted, recalled: isRecalled }"
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
          <div v-if="isRecalled" class="recalled-text">{{ recallText }}</div>
          <div v-else class="message-text">{{ data?.messageContent }}</div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div 
      class="messageItem right"
      :class="{ highlighted: isHighlighted, recalled: isRecalled }"
      @contextmenu="handleContextMenu"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="msgBox">
        <div v-if="showActionButtons && isHovering && !isEditing" class="action-buttons">
          <div class="more-btn" @click="toggleDropdown">
            <span>•••</span>
          </div>
          <div v-if="showDropdown" class="dropdown-menu">
            <div v-if="canRecall" class="dropdown-item" @click="handleDropdownRecall">撤回</div>
            <div v-if="canEdit" class="dropdown-item" @click="handleDropdownEdit">编辑</div>
            <div class="dropdown-item" @click="handleDropdownCopy">复制</div>
          </div>
        </div>
        <div class="msgContent" :class="{ 'edit-mode': isEditing }">
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
          <template v-if="isRecalled">
            <div class="recalled-text">{{ recallText }}</div>
          </template>
          <template v-else-if="isEditing">
            <textarea
              ref="editInputRef"
              v-model="editContent"
              class="edit-input"
              @input="autoResizeEditInput"
              @keydown="handleEditKeydown"
            ></textarea>
            <div class="edit-actions">
              <div class="edit-buttons">
                <button class="cancel-btn" @click="cancelEdit">取消</button>
                <button class="save-btn" @click="saveEdit">保存</button>
              </div>
              <div class="char-count">{{ editContent.length }}</div>
            </div>
          </template>
          <template v-else>
            <div class="message-text">{{ data?.messageContent }}</div>
            <div v-if="isEdited" class="edited-label">已编辑</div>
          </template>
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
    :message="data"
    @select="handleContextMenuSelect"
    @recall="handleRecall"
    @edit="handleEdit"
    @copy="handleCopy"
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

.recalled {
  .msgContent {
    background: transparent !important;
  }
  
  &.right::after {
    display: none;
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
  flex-direction: row;

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
  
  .msgBox {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
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
  position: relative;
  min-width: 50px;
  
  &.edit-mode {
    background: #fff !important;
    padding: 8px;
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

.recalled-text {
  color: #999;
  font-size: 12px;
  text-align: center;
}

.edited-label {
  color: #999;
  font-size: 11px;
  margin-top: 4px;
  text-align: right;
}

.action-buttons {
  position: relative;
  margin-bottom: 4px;
  opacity: 0;
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.more-btn {
  width: 28px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  color: #666;
  
  &:hover {
    background: #f5f5f5;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 80px;
  z-index: 1000;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background: #f5f5f5;
  }
}

.edit-input {
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  
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

.edit-buttons {
  display: flex;
  gap: 8px;
}

.cancel-btn,
.save-btn {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  
  &:hover {
    background: #e8e8e8;
  }
}

.save-btn {
  background: rgb(149, 236, 105);
  color: #333;
  
  &:hover {
    background: rgb(134, 218, 92);
  }
}

.char-count {
  color: #999;
  font-size: 12px;
}
</style>
