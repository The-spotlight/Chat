import {defineStore} from "pinia";
import {ModelChat} from "../../model/ModelChat";
import {Ref, ref} from "vue";
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

export const useChatStore = defineStore('chat', () => {
    let data: Ref<ModelChat[]> = ref(prepareData())
    let selectItem = (item: ModelChat) => {
        if (item.isSelected) return;
        data.value.forEach(i => i.isSelected = false)
        item.isSelected = true
        const messageStore = useMessageStore()
        messageStore.initData(item)
    }

    let updateChatLastMessage = (chatId: string, lastMsg: string, sendTime: string = '刚刚') => {
        let chat = data.value.find(item => item.id === chatId);
        if (chat) {
            chat.lastMsg = lastMsg;
            chat.sendTime = sendTime;
        }
    }

    let getSelectedChat = () => {
        return data.value.find(item => item.isSelected) || null;
    }

    return {data, selectItem, updateChatLastMessage, getSelectedChat}
})


