import { ModelMessage } from "../../model/ModelMessage";

const OPERATION_TIME_LIMIT_MS = 2 * 60 * 1000;

export const isWithinTimeLimit = (message: ModelMessage): boolean => {
    if (!message.createTime) return false;
    const now = Date.now();
    return (now - message.createTime) <= OPERATION_TIME_LIMIT_MS;
};

export const canRecallMessage = (message: ModelMessage): boolean => {
    if (message.isInMsg) return false;
    if (message.isRecalled) return false;
    return isWithinTimeLimit(message);
};

export const canEditMessage = (message: ModelMessage): boolean => {
    if (message.isInMsg) return false;
    if (message.isRecalled) return false;
    return isWithinTimeLimit(message);
};

export const canOperateMessage = (message: ModelMessage): boolean => {
    return canRecallMessage(message) || canEditMessage(message);
};
