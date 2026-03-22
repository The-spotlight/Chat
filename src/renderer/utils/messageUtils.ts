import { ModelMessage } from "../../model/ModelMessage";

export const MESSAGE_OPERATION_TIME_LIMIT = 2 * 60 * 1000;

export function isWithinOperationTimeLimit(createTime?: number): boolean {
  if (!createTime) return false;
  return Date.now() - createTime <= MESSAGE_OPERATION_TIME_LIMIT;
}

export function canRecallMessage(message: ModelMessage, currentUserName?: string): boolean {
  if (message.isRecalled) return false;
  if (message.isInMsg) return false;
  if (!isWithinOperationTimeLimit(message.createTime)) return false;
  return true;
}

export function canEditMessage(message: ModelMessage, currentUserName?: string): boolean {
  if (message.isRecalled) return false;
  if (message.isInMsg) return false;
  if (!isWithinOperationTimeLimit(message.createTime)) return false;
  return true;
}

export function getRecallDisplayText(message: ModelMessage, isSelf: boolean): string {
  if (isSelf) {
    return "你撤回了一条消息";
  }
  return "对方撤回了一条消息";
}

export function getRecalledReferenceContent(): string {
  return "消息已被撤回";
}
