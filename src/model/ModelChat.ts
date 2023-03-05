import {ModelBase} from "./ModelBase";

export class ModelChat extends ModelBase {
    fromName?: string;
    sendTime?: number | string;
    isSelected = false;
    lastMsg?: string;
    avatar?: string;
    chatType?: number; // 0：单聊， 2：公众号，3：文件传输助手
}