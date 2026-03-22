import {defineStore} from "pinia";
import {ModelChat} from "../../model/ModelChat";
import {Ref, ref, computed} from "vue";
import {useMessageStore} from "./useMessageStore";


let prepareData = () => {
    let result = [];
    for (let i = 0; i < 10; i++) {
        let model = new ModelChat();
        model.fromName = '聊天对象' + i;
        model.sendTime = '昨天';
        model.lastMsg = "这是此会话的最后一条消息" + i;
        model.avatar = `https://pic3.zhimg.com/v2-306cd8f07a20cba46873209739c6395d_im.jpg?source=32738c0c`;
        result.push(model);
    }
    result[4].isSelected = true;
    return result;
}

// 转义正则特殊字符
const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 安全的字符串包含检查
const safeIncludes = (source: string | undefined | null, keyword: string): boolean => {
    if (source === undefined || source === null) {
        return false;
    }
    try {
        return String(source).toLowerCase().includes(keyword.toLowerCase());
    } catch (e) {
        console.warn('String comparison failed:', e);
        return false;
    }
};

export const useChatStore = defineStore('chat', () => {
    let data: Ref<ModelChat[]> = ref(prepareData())
    const searchKeyword = ref('')

    const setSearchKeyword = (keyword: string) => {
        // 限制最大搜索长度，防止性能问题
        const maxLength = 50;
        searchKeyword.value = keyword.slice(0, maxLength);
    }

    // 搜索结果统计
    const searchStats = computed(() => {
        const total = data.value.length;
        const filtered = filteredData.value.length;
        return {
            total,
            filtered,
            hasResults: filtered > 0,
            isSearching: searchKeyword.value.trim().length > 0
        };
    });

    // 排序后的会话列表
    const sortedData = computed(() => {
        return [...data.value].sort((a, b) => {
            // 置顶会话优先
            if (a.isPinned !== b.isPinned) {
                return a.isPinned ? -1 : 1;
            }
            // 置顶会话之间按置顶时间倒序排列（最新置顶的排在最前面）
            if (a.isPinned && b.isPinned) {
                return (b.pinnedTime || 0) - (a.pinnedTime || 0);
            }
            // 未置顶会话之间按最后消息时间倒序排列
            // 将 sendTime 转换为可比较的数字
            const getTimeValue = (time: number | string | undefined): number => {
                if (typeof time === 'number') return time;
                if (typeof time === 'string') {
                    // 简单的字符串比较，实际项目中可能需要更复杂的逻辑
                    if (time === '刚刚') return Date.now();
                    if (time === '昨天') return Date.now() - 86400000;
                    return new Date(time).getTime() || 0;
                }
                return 0;
            };
            return getTimeValue(b.sendTime) - getTimeValue(a.sendTime);
        });
    });

    const filteredData = computed(() => {
        const trimmedKeyword = searchKeyword.value.trim();
        
        // 空搜索词，返回排序后的全部数据
        if (!trimmedKeyword) {
            return sortedData.value;
        }

        // 转义搜索关键词中的正则特殊字符
        const safeKeyword = escapeRegExp(trimmedKeyword);

        // 搜索时不改变排序顺序，只在 sortedData 基础上过滤
        return sortedData.value.filter(item => {
            // 搜索匹配：聊天对象名称 或 最后一条消息内容
            const nameMatch = safeIncludes(item.fromName, safeKeyword);
            const lastMsgMatch = safeIncludes(item.lastMsg, safeKeyword);
            
            return nameMatch || lastMsgMatch;
        });
    });

    let selectItem = (item: ModelChat) => {
        if (item.isSelected) return;
        data.value.forEach(i => i.isSelected = false)
        item.isSelected = true
        // 切换到会话时清除未读计数
        clearUnread(item.id!)
        const messageStore = useMessageStore()
        messageStore.initData(item)
    }

    // 获取当前选中的会话
    const getSelectedChat = computed(() => {
        return data.value.find(item => item.isSelected) || null;
    });

    // 更新选中会话的最后一条消息和时间
    const updateLastMessage = (chatId: string, content: string) => {
        const chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.lastMsg = content;
            chat.sendTime = '刚刚';
        }
    };

    // 清除搜索状态
    const clearSearch = () => {
        searchKeyword.value = '';
    };

    // 切换置顶状态
    const togglePin = (chatId: string) => {
        const chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.isPinned = !chat.isPinned;
            chat.pinnedTime = chat.isPinned ? Date.now() : undefined;
        }
    };

    // 增加未读计数
    const incrementUnread = (chatId: string) => {
        const chat = data.value.find(item => item.id === chatId);
        // 如果当前正在查看该会话，不增加未读计数
        if (chat && !chat.isSelected) {
            chat.unreadCount++;
        }
    };

    // 清除未读计数
    const clearUnread = (chatId: string) => {
        const chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.unreadCount = 0;
        }
    };

    // 全部已读
    const markAllAsRead = () => {
        data.value.forEach(chat => {
            chat.unreadCount = 0;
        });
    };

    // 获取未读总数
    const totalUnreadCount = computed(() => {
        return data.value.reduce((sum, chat) => sum + chat.unreadCount, 0);
    });

    // 是否有未读消息
    const hasUnreadMessages = computed(() => {
        return totalUnreadCount.value > 0;
    });

    // 获取未读计数显示文本（处理 99+ 逻辑）
    const getUnreadDisplay = (count: number): string => {
        if (count <= 0) return '';
        if (count > 99) return '99+';
        return String(count);
    };

    return {
        data,
        selectItem,
        searchKeyword,
        setSearchKeyword,
        filteredData,
        sortedData,
        searchStats,
        clearSearch,
        getSelectedChat,
        updateLastMessage,
        togglePin,
        incrementUnread,
        clearUnread,
        markAllAsRead,
        totalUnreadCount,
        hasUnreadMessages,
        getUnreadDisplay
    }
})
