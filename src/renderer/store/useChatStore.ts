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

    const filteredData = computed(() => {
        const trimmedKeyword = searchKeyword.value.trim();
        
        // 空搜索词，返回全部数据
        if (!trimmedKeyword) {
            return data.value;
        }

        // 转义搜索关键词中的正则特殊字符
        const safeKeyword = escapeRegExp(trimmedKeyword);

        return data.value.filter(item => {
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

    return {
        data,
        selectItem,
        searchKeyword,
        setSearchKeyword,
        filteredData,
        searchStats,
        clearSearch,
        getSelectedChat,
        updateLastMessage
    }
})


