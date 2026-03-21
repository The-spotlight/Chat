<script setup lang="ts">
import { ref, inject } from 'vue';
import { ModelMessage } from "../../../../model/ModelMessage";
import { useMessageStore } from "../../../store/useMessageStore";
import ContextMenu from "../../../Components/ContextMenu.vue";
import QuoteCard from "./QuoteCard.vue";

const props = defineProps<{ data: ModelMessage }>();

const messageStore = useMessageStore();
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);

const scrollToMessage = inject<(messageId: string) => void>('scrollToMessage');

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  contextMenuRef.value?.open(e.clientX, e.clientY);
};

const handleQuote = () => {
  messageStore.setQuote(props.data);
};

const handleQuoteCardClick = (messageId: string) => {
  scrollToMessage?.(messageId);
};
</script>

<template>
  <div
    class="message-item-wrapper"
    :class="{ left: data?.isInMsg, right: !data?.isInMsg }"
    @contextmenu="handleContextMenu"
  >
    <template v-if="data?.isInMsg">
      <div class="messageItem left">
        <div class="avatar">
          <img :src="data?.avatar" alt=""/>
        </div>
        <div class="msgBox">
          <div class="fromName">{{ data?.fromName }}</div>
          <QuoteCard 
            v-if="data?.quote" 
            :quote="data.quote" 
            @click="handleQuoteCardClick" 
          />
          <div class="msgContent">{{ data?.messageContent }}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="messageItem right">
        <div class="msgBox">
          <QuoteCard 
            v-if="data?.quote" 
            :quote="data.quote" 
            @click="handleQuoteCardClick" 
          />
          <div class="msgContent">{{ data?.messageContent }}</div>
        </div>
        <div class="avatar">
          <img :src="data?.avatar" alt=""/>
        </div>
      </div>
    </template>
    
    <ContextMenu ref="contextMenuRef" @quote="handleQuote" />
  </div>
</template>
<style lang="scss" scoped>
.message-item-wrapper {
  position: relative;
  transition: background-color 0.3s ease;
  
  &.highlighted {
    background-color: rgba(149, 236, 105, 0.2);
    border-radius: 8px;
    animation: pulse 1s ease-in-out;
  }
}

@keyframes pulse {
  0%, 100% {
    background-color: rgba(149, 236, 105, 0.2);
  }
  50% {
    background-color: rgba(149, 236, 105, 0.4);
  }
}

.messageItem {
  display: flex;
  padding-top: 8px;
  padding-bottom: 8px;
  position: relative;
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
</style>