import {defineStore} from "pinia";
import {ModelChat} from "../../model/ModelChat";
import {Ref, ref, computed, watch} from "vue";
import {useMessageStore} from "./useMessageStore";


let prepareData = () => {
    let result = [];
    const unreadDistribution = [0, 0, 3, 0, 0, 1, 0, 12, 0, 2];
    const sendTimes = ['刚刚', '5分钟前', '10分钟前', '半小时前', '昨天', '昨天', '前天', '3天前', '上周', '上周'];
    const lastMessages = [
        '好的，明天见！',
        '这个方案我觉得可以',
        '收到，我马上处理',
        '周末有空一起吃饭吗？',
        '文件已经发到你邮箱了',
        '嗯嗯',
        '那个问题解决了吗？',
        '生日快乐！🎂',
        '下周会议改到周三了',
        '好久不见啊'
    ];
    
    for (let i = 0; i < 10; i++) {
        let model = new ModelChat();
        model.fromName = '聊天对象' + i;
        model.sendTime = sendTimes[i];
        model.lastMsg = lastMessages[i];
        model.avatar = `https://pic3.zhimg.com/v2-306cd8f07a20cba46873209739c6395d_im.jpg?source=32738c0c`;
        model.lastMessageTime = Date.now() - i * 3600000;
        model.unreadCount = unreadDistribution[i];
        result.push(model);
    }
    result[4].isSelected = true;
    result[4].unreadCount = 0;
    return result;
}

const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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

const sortChats = (chats: ModelChat[]): ModelChat[] => {
    return [...chats].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        if (a.isPinned && b.isPinned) {
            return (b.pinnedAt || 0) - (a.pinnedAt || 0);
        }
        
        return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
    });
};

export const useChatStore = defineStore('chat', () => {
    let data: Ref<ModelChat[]> = ref(prepareData())
    const searchKeyword = ref('')
    const isInitialized = ref(false)

    const initializeMessageStore = () => {
        if (isInitialized.value) return;
        isInitialized.value = true;
        
        const selectedChat = data.value.find(item => item.isSelected);
        if (selectedChat) {
            const messageStore = useMessageStore();
            messageStore.initData(selectedChat);
        }
    };

    const setSearchKeyword = (keyword: string) => {
        const maxLength = 50;
        searchKeyword.value = keyword.slice(0, maxLength);
    }

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

    const filteredData = computed(() => {
        const trimmedKeyword = searchKeyword.value.trim();
        
        let baseData = data.value;
        
        if (trimmedKeyword) {
            baseData = data.value.filter(item => {
                const nameMatch = safeIncludes(item.fromName, trimmedKeyword);
                const lastMsgMatch = safeIncludes(item.lastMsg, trimmedKeyword);
                return nameMatch || lastMsgMatch;
            });
        }

        return sortChats(baseData);
    });

    let selectItem = (item: ModelChat, options?: { clearSearch?: boolean }) => {
        if (item.isSelected) return;
        data.value.forEach(i => i.isSelected = false)
        item.isSelected = true
        const unreadCount = item.unreadCount || 0;
        item.unreadCount = 0;
        if (options?.clearSearch !== false) {
            searchKeyword.value = '';
        }
        const messageStore = useMessageStore()
        messageStore.initData(item, unreadCount)
    }

    const getSelectedChat = computed(() => {
        return data.value.find(item => item.isSelected) || null;
    });

    const updateLastMessage = (chatId: string, content: string) => {
        const chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.lastMsg = content;
            chat.sendTime = '刚刚';
            chat.lastMessageTime = Date.now();
        }
    };

    const clearSearch = () => {
        searchKeyword.value = '';
    };

    const togglePin = (chatId: string) => {
        const chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.isPinned = !chat.isPinned;
            if (chat.isPinned) {
                chat.pinnedAt = Date.now();
            } else {
                chat.pinnedAt = undefined;
            }
        }
    };

    const incrementUnread = (chatId: string) => {
        const selectedChat = getSelectedChat.value;
        if (selectedChat && selectedChat.id === chatId) {
            return;
        }
        
        const chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.unreadCount = (chat.unreadCount || 0) + 1;
        }
    };

    const clearUnread = (chatId: string) => {
        const chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.unreadCount = 0;
        }
    };

    const markAllAsRead = () => {
        data.value.forEach(chat => {
            chat.unreadCount = 0;
        });
    };

    const totalUnreadCount = computed(() => {
        return data.value.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
    });

    const hasUnread = computed(() => {
        return totalUnreadCount.value > 0;
    });

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
        totalUnreadCount,
        hasUnread,
        initializeMessageStore,
        isInitialized
    }
}, {
    persist: {
        key: 'chat-store',
        storage: localStorage,
        paths: ['data'],
    },
})
