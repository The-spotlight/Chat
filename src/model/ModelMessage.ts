import {ModelBase} from "./ModelBase";

export interface MessageReference {
    referencedMessageId: string;
    referencedFromName: string;
    referencedContent: string;
}

export class ModelMessage extends ModelBase {
    createTime?: number;
    receiveTime?: number;
    messageContent?: string;
    chatId?: string;
    fromName?: string;
    avatar?: string;
    isInMsg?: boolean;
    reference?: MessageReference;
    isEdited?: boolean;
    editedTime?: number;
    isRecalled?: boolean;
}