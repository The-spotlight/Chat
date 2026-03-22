import {defineStore} from "pinia";
import {ModelChat} from "../../model/ModelChat";
import {ref, computed} from "vue";
import {ModelMessage, MessageReference} from "../../model/ModelMessage";
import { canOperateMessage, isWithinTimeLimit, truncateContent } from '../utils/messageUtils';

export const useMessageStore = defineStore('message', () => {
        let data = ref<ModelMessage[]>([]);
        let currentChat = ref<ModelChat | null>(null);
        let referencedMessage = ref<ModelMessage | null>(null);
        let highlightedMessageId = ref<string | null>(null);
        let pendingUnreadCount = ref(0);
        
        let msg1 = `醉里挑灯看剑，梦回吹角连营。八百里分麾下灸，五十弦翻塞外声。沙场秋点兵。马作的卢飞快，弓如霹雳弦惊。了却君王天下事，嬴得生前身后名。可怜白发生`;
        let msg2 = `怒发冲冠，凭栏处，潇潇雨歇。抬望眼，仰天长啸，壮怀激烈。 三十功名尘与土，八千里路云和月。莫等闲，白了少年头，空悲切！ 靖康耻，犹未雪；臣子恨，何时灭?驾长车，踏破贺兰山缺！ 壮志饥餐胡虏肉，笑谈渴饮匈奴血。待从头，收拾旧山河，朝天阙！`;
        
        let initData = (chat: ModelChat, immediate: boolean = false) => {
            // 如果切换到同一个会话，不重新初始化
            if (currentChat.value && currentChat.value.id === chat.id) {
                return;
            }
            
            currentChat.value = chat;
            referencedMessage.value = null;
            pendingUnreadCount.value = chat.unreadCount || 0;
            
            // 生成消息数据的辅助函数
            const generateMessages = () => {
                let result = [];
                for (let i = 0; i < 10; i++) {
                    let model = new ModelMessage();
                    model.createTime = Date.now() - (10 - i) * 60000; // 模拟历史消息时间
                    model.isInMsg = i % 2 === 0;
                    model.messageContent = model.isInMsg ? msg1 : msg2;
                    model.fromName = model.isInMsg ? chat.fromName : "我";
                    model.avatar = chat.avatar;
                    model.chatId = chat.id;
                    model.isEdited = false;
                    model.isRecalled = false;
                    result.push(model);
                }
                return result;
            };
            
            if (immediate) {
                // 同步初始化（用于测试）
                data.value = generateMessages();
            } else {
                // 异步初始化（用于UI），先清空数据确保UI立即响应
                data.value = [];
                // 使用 setTimeout 延迟加载新数据，确保清空操作先渲染
                setTimeout(() => {
                    data.value = generateMessages();
                }, 0);
            }
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

        let sendMessage = (content: string): boolean => {
            // 验证是否有当前会话
            if (!currentChat.value) {
                console.warn('Cannot send message: no chat selected');
                return false;
            }
            
            // 验证内容不为空（去除首尾空白后）
            const trimmedContent = content.trim();
            if (!trimmedContent) {
                console.warn('Cannot send message: content is empty');
                return false;
            }
            
            let model = new ModelMessage();
            model.createTime = Date.now();
            model.isInMsg = false;
            model.messageContent = trimmedContent;
            model.fromName = "我";
            model.avatar = currentChat.value.avatar;
            model.chatId = currentChat.value.id;
            model.isEdited = false;
            model.isRecalled = false;
            
            if (referencedMessage.value) {
                model.reference = {
                    referencedMessageId: referencedMessage.value.id,
                    referencedFromName: referencedMessage.value.fromName || '',
                    referencedContent: truncateContent(referencedMessage.value.messageContent || '', 50)
                };
                referencedMessage.value = null;
            }
            
            // 使用展开运算符创建新数组，确保响应式更新
            data.value = [...data.value, model];
            return true;
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
                    msg.reference.referencedContent = '消息已被撤回';
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
            hasPendingUnread
        };
    },
    {
        persist: true,
    }
)
