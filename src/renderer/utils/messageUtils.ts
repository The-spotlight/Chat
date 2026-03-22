import { ModelMessage } from '../../model/ModelMessage';

export const OPERATION_TIME_LIMIT = 2 * 60 * 1000;

export const isWithinTimeLimit = (createTime: number | undefined): boolean => {
    if (!createTime) return false;
    return Date.now() - createTime < OPERATION_TIME_LIMIT;
};

export const canOperateMessage = (message: ModelMessage): boolean => {
    if (message.isRecalled) return false;
    if (message.isInMsg) return false;
    return isWithinTimeLimit(message.createTime);
};

export const formatMessageTime = (timestamp: number | undefined): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const truncateContent = (content: string, maxLength: number): string => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
};
