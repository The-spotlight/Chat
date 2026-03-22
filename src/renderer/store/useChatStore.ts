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
        model.lastMessageTime = Date.now() - i * 60000; // 按索引递减设置时间戳
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

    // 会话列表排序：置顶优先，置顶会话按置顶时间倒序，未置顶按最后消息时间倒序
    const sortedData = computed(() => {
        return [...data.value].sort((a, b) => {
            // 置顶会话优先
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            // 都置顶，按置顶时间倒序
            if (a.isPinned && b.isPinned) {
                return (b.pinnedTime || 0) - (a.pinnedTime || 0);
            }
            
            // 都未置顶，按最后消息时间倒序
            return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
        });
    });

    const filteredData = computed(() => {
        const trimmedKeyword = searchKeyword.value.trim();
        
        // 空搜索词，返回排序后的数据
        if (!trimmedKeyword) {
            return sortedData.value;
        }

        // 转义搜索关键词中的正则特殊字符
        const safeKeyword = escapeRegExp(trimmedKeyword);

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
        item.unreadCount = 0;
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
            chat.lastMessageTime = Date.now();
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
        if (chat && !chat.isSelected) {
            chat.unreadCount++;
        }
    };

    // 清除指定会话未读计数
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
    const getTotalUnread = computed(() => {
        return data.value.reduce((total, chat) => total + chat.unreadCount, 0);
    });

    // 格式化未读计数显示
    const formatUnreadCount = (count: number): string => {
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
        searchStats,
        clearSearch,
        getSelectedChat,
        updateLastMessage,
        togglePin,
        incrementUnread,
        clearUnread,
        markAllAsRead,
        getTotalUnread,
        formatUnreadCount,
        sortedData
    }
})


