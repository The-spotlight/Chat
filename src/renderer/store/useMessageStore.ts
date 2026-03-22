import {defineStore} from "pinia";
import {ModelChat} from "../../model/ModelChat";
import {ref} from "vue";
import {ModelMessage, MessageReference} from "../../model/ModelMessage";
import { canRecallMessage, canEditMessage } from "../utils/messageUtils";

export const useMessageStore = defineStore('message', () => {
        let data = ref<ModelMessage[]>([]);
        let currentChat = ref<ModelChat | null>(null);
        let referencedMessage = ref<ModelMessage | null>(null);
        let highlightedMessageId = ref<string | null>(null);
        
        let msg1 = `醉里挑灯看剑，梦回吹角连营。八百里分麾下灸，五十弦翻塞外声。沙场秋点兵。马作的卢飞快，弓如霹雳弦惊。了却君王天下事，嬴得生前身后名。可怜白发生`;
        let msg2 = `怒发冲冠，凭栏处，潇潇雨歇。抬望眼，仰天长啸，壮怀激烈。 三十功名尘与土，八千里路云和月。莫等闲，白了少年头，空悲切！ 靖康耻，犹未雪；臣子恨，何时灭?驾长车，踏破贺兰山缺！ 壮志饥餐胡虏肉，笑谈渴饮匈奴血。待从头，收拾旧山河，朝天阙！`;
        
        let initData = (chat: ModelChat) => {
            currentChat.value = chat;
            referencedMessage.value = null;
            let result = [];
            for (let i = 0; i < 10; i++) {
                let model = new ModelMessage();
                model.createTime = Date.now();
                model.isInMsg = i % 2 === 0;
                model.messageContent = model.isInMsg ? msg1 : msg2;
                model.fromName = model.isInMsg ? chat.fromName : "我";
                model.avatar = chat.avatar;
                model.chatId = chat.id;
                result.push(model);
            }
            data.value = result;
        };

        let setReferencedMessage = (message: ModelMessage | null) => {
            referencedMessage.value = message;
        };

        let clearReferencedMessage = () => {
            referencedMessage.value = null;
        };

        let truncateContent = (content: string, maxLength: number): string => {
            if (!content) return '';
            if (content.length <= maxLength) return content;
            return content.slice(0, maxLength) + '...';
        };

        let sendMessage = (content: string) => {
            if (!currentChat.value) return;
            
            let model = new ModelMessage();
            model.createTime = Date.now();
            model.isInMsg = false;
            model.messageContent = content;
            model.fromName = "我";
            model.avatar = currentChat.value.avatar;
            model.chatId = currentChat.value.id;
            
            if (referencedMessage.value) {
                model.reference = {
                    referencedMessageId: referencedMessage.value.id,
                    referencedFromName: referencedMessage.value.fromName || '',
                    referencedContent: truncateContent(referencedMessage.value.messageContent || '', 50)
                };
                referencedMessage.value = null;
            }
            
            data.value.push(model);
        };

        let setHighlightedMessageId = (id: string | null) => {
            highlightedMessageId.value = id;
        };

        let recallMessage = (messageId: string) => {
            const message = data.value.find(m => m.id === messageId);
            if (!message) return false;
            if (!canRecallMessage(message)) return false;

            message.isRecalled = true;
            message.messageContent = "";

            // Update all messages that reference this message
            data.value.forEach(msg => {
                if (msg.reference?.referencedMessageId === messageId) {
                    msg.reference.referencedContent = "消息已被撤回";
                }
            });

            return true;
        };

        let editMessage = (messageId: string, newContent: string) => {
            const message = data.value.find(m => m.id === messageId);
            if (!message) return false;
            if (!canEditMessage(message)) return false;
            
            message.messageContent = newContent;
            message.isEdited = true;
            message.editTime = Date.now();
            return true;
        };

        let checkMessageOperable = (message: ModelMessage): { canRecall: boolean; canEdit: boolean } => {
            return {
                canRecall: canRecallMessage(message),
                canEdit: canEditMessage(message)
            };
        };

        let getMessageById = (messageId: string): ModelMessage | undefined => {
            return data.value.find(m => m.id === messageId);
        };

        return {
            data, 
            initData, 
            sendMessage, 
            currentChat,
            referencedMessage,
            setReferencedMessage,
            clearReferencedMessage,
            highlightedMessageId,
            setHighlightedMessageId,
            truncateContent,
            recallMessage,
            editMessage,
            checkMessageOperable,
            getMessageById
        };
    },
    {
        persist: true,
    }
)


