import {defineStore} from "pinia";
import {ModelChat} from "../../model/ModelChat";
import {ref, computed} from "vue";
import {ModelMessage, MessageReference} from "../../model/ModelMessage";
import { canOperateMessage, isWithinTimeLimit, truncateContent } from '../utils/messageUtils';

/**
 * Message Store - 消息状态管理
 * 
 * 设计说明：此 store 不使用持久化配置（persist），原因如下：
 * 
 * 1. Mock 数据场景：initData() 方法会生成模拟消息数据，每次切换会话都会重新生成，
 *    如果启用持久化，会导致持久化数据与新生成的数据冲突。
 * 
 * 2. 数据一致性：useChatStore 已启用持久化，会保存会话列表状态（包括选中的会话），
 *    页面刷新后，initializeMessageStore() 会根据选中的会话重新初始化消息数据，
 *    确保 chatStore 和 messageStore 状态一致。
 * 
 * 3. 未来扩展：如需持久化用户发送的真实消息，建议：
 *    - 按会话 ID 分别存储消息（如使用 IndexedDB 或 localStorage key: `messages_${chatId}`）
 *    - 在 initData() 中先加载持久化消息，再追加 mock 数据（如需要）
 *    - 或完全移除 mock 数据，改为从后端 API 加载
 * 
 * @see useChatStore - 会话状态管理（已启用持久化）
 * @see initializeMessageStore - 初始化消息数据的方法
 */
export const useMessageStore = defineStore('message', () => {
        let data = ref<ModelMessage[]>([]);
        let currentChat = ref<ModelChat | null>(null);
        let referencedMessage = ref<ModelMessage | null>(null);
        let highlightedMessageId = ref<string | null>(null);
        let pendingUnreadCount = ref(0);
        let skipNextScrollToBottom = ref(false);
        
        let msg1 = `醉里挑灯看剑，梦回吹角连营。八百里分麾下灸，五十弦翻塞外声。沙场秋点兵。马作的卢飞快，弓如霹雳弦惊。了却君王天下事，嬴得生前身后名。可怜白发生`;
        let msg2 = `怒发冲冠，凭栏处，潇潇雨歇。抬望眼，仰天长啸，壮怀激烈。 三十功名尘与土，八千里路云和月。莫等闲，白了少年头，空悲切！ 靖康耻，犹未雪；臣子恨，何时灭?驾长车，踏破贺兰山缺！ 壮志饥餐胡虏肉，笑谈渴饮匈奴血。待从头，收拾旧山河，朝天阙！`;
        
        let initData = (chat: ModelChat) => {
            currentChat.value = chat;
            referencedMessage.value = null;
            pendingUnreadCount.value = chat.unreadCount || 0;
            skipNextScrollToBottom.value = (chat.unreadCount || 0) > 0;
            let result = [];
            for (let i = 0; i < 10; i++) {
                let model = new ModelMessage();
                model.createTime = Date.now();
                model.isInMsg = i % 2 === 0;
                model.messageContent = model.isInMsg ? msg1 : msg2;
                model.fromName = model.isInMsg ? chat.fromName : "我";
                model.avatar = chat.avatar;
                model.chatId = chat.id;
                model.isEdited = false;
                model.isRecalled = false;
                result.push(model);
            }
            data.value = result;
        };

        let consumeSkipScrollFlag = () => {
            const shouldSkip = skipNextScrollToBottom.value;
            skipNextScrollToBottom.value = false;
            return shouldSkip;
        };

        let setReferencedMessage = (message: ModelMessage | null) => {
            referencedMessage.value = message;
        };

        let clearReferencedMessage = () => {
            referencedMessage.value = null;
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
            model.isEdited = false;
            model.isRecalled = false;

            if (referencedMessage.value) {
                const refMsg = referencedMessage.value;
                model.reference = {
                    referencedMessageId: refMsg.id,
                    referencedFromName: refMsg.fromName?.trim() || '未知用户',
                    referencedContent: truncateContent(refMsg.messageContent || '', 50) || '空消息'
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
            if (!message || !canOperateMessage(message)) return false;

            message.isRecalled = true;
            message.messageContent = '';

            data.value.forEach(msg => {
                if (msg.reference && msg.reference.referencedMessageId === messageId) {
                    msg.reference = {
                        ...msg.reference,
                        referencedFromName: '',
                        referencedContent: '消息已被撤回'
                    };
                }
            });

            return true;
        };

        let editMessage = (messageId: string, newContent: string) => {
            const message = data.value.find(m => m.id === messageId);
            if (!message || !canOperateMessage(message) || !newContent.trim()) return false;
            
            message.messageContent = newContent;
            message.isEdited = true;
            message.editedTime = Date.now();
            
            return true;
        };

        let getMessageById = (messageId: string): ModelMessage | undefined => {
            return data.value.find(m => m.id === messageId);
        };

        let clearPendingUnread = () => {
            pendingUnreadCount.value = 0;
        };

        let hasPendingUnread = computed(() => {
            return pendingUnreadCount.value > 0;
        });

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
            recallMessage,
            editMessage,
            getMessageById,
            pendingUnreadCount,
            clearPendingUnread,
            hasPendingUnread,
            skipNextScrollToBottom,
            consumeSkipScrollFlag
        };
    }
)
