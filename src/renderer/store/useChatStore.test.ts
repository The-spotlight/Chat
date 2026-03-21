import {describe, it, expect, beforeEach} from 'vitest';
import {createPinia, setActivePinia} from 'pinia';
import {useChatStore} from './useChatStore';
import {ModelChat} from '../../model/ModelChat';

describe('useChatStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('initial state', () => {
        it('should have 10 chat items by default', () => {
            const store = useChatStore();

            expect(store.data.length).toBe(10);
        });

        it('should have one selected chat by default', () => {
            const store = useChatStore();

            const selectedItems = store.data.filter(item => item.isSelected);
            expect(selectedItems.length).toBe(1);
            expect(selectedItems[0]).toBe(store.data[4]);
        });
    });

    describe('selectedChat', () => {
        it('should return the selected chat', () => {
            const store = useChatStore();

            expect(store.selectedChat).toBeDefined();
            expect(store.selectedChat?.isSelected).toBe(true);
        });

        it('should return undefined when no chat is selected', () => {
            const store = useChatStore();
            store.data.forEach(item => item.isSelected = false);

            expect(store.selectedChat).toBeUndefined();
        });
    });

    describe('selectItem', () => {
        it('should select a chat item', () => {
            const store = useChatStore();
            const targetItem = store.data[0];
            expect(targetItem.isSelected).toBe(false);

            store.selectItem(targetItem);

            expect(targetItem.isSelected).toBe(true);
            expect(store.selectedChat).toBe(targetItem);
        });

        it('should deselect other items when selecting a new one', () => {
            const store = useChatStore();
            const previousSelected = store.data[4];
            const targetItem = store.data[0];

            store.selectItem(targetItem);

            expect(previousSelected.isSelected).toBe(false);
            expect(targetItem.isSelected).toBe(true);
        });

        it('should not change selection if the same item is clicked', () => {
            const store = useChatStore();
            const selectedChat = store.data[4];
            const originalLastMsg = selectedChat.lastMsg;

            store.selectItem(selectedChat);

            expect(selectedChat.isSelected).toBe(true);
            expect(selectedChat.lastMsg).toBe(originalLastMsg);
        });
    });

    describe('updateLastMessage', () => {
        it('should update last message and time for a chat', () => {
            const store = useChatStore();
            const chat = store.data[4];
            const chatId = chat.id;

            store.updateLastMessage(chatId, '新的测试消息');

            expect(chat.lastMsg).toBe('新的测试消息');
            expect(chat.sendTime).toBe('刚刚');
        });

        it('should not update if chat not found', () => {
            const store = useChatStore();
            const chat = store.data[4];
            const originalLastMsg = chat.lastMsg;
            const originalSendTime = chat.sendTime;

            store.updateLastMessage('non-existent-id', '新消息');

            expect(chat.lastMsg).toBe(originalLastMsg);
            expect(chat.sendTime).toBe(originalSendTime);
        });

        it('should update the correct chat when multiple exist', () => {
            const store = useChatStore();
            const chat1 = store.data[0];
            const chat2 = store.data[1];

            store.updateLastMessage(chat1.id, '消息1');
            store.updateLastMessage(chat2.id, '消息2');

            expect(chat1.lastMsg).toBe('消息1');
            expect(chat2.lastMsg).toBe('消息2');
        });
    });
});
