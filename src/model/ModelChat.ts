import {ModelBase} from "./ModelBase";

export class ModelChat extends ModelBase {
    fromName?: string;
    sendTime?: number | string;
    isSelected = false;
    lastMsg?: string;
    avatar?: string;
    chatType?: number; // 0：单聊， 2：公众号，3：文件传输助手
    isPinned = false; // 置顶状态
    pinnedTime?: number; // 置顶时间戳
    unreadCount = 0; // 未读消息计数
    lastMessageTime?: number; // 最后消息时间戳，用于排序
}