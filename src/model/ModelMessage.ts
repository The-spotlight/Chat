import {ModelBase} from "./ModelBase";

export interface ModelMessageQuote {
    messageId: string;
    fromName: string;
    content: string;
}

export class ModelMessage extends ModelBase {
    createTime?: number;
    receiveTime?: number;
    messageContent?: string;
    chatId?: string;
    fromName?: string;
    avatar?: string;
    //** 是否为传入消息 */
    isInMsg?: boolean;
    //** 引用的消息 */
    quote?: ModelMessageQuote | null;
}