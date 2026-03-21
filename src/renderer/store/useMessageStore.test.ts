import {describe, it, expect, beforeEach} from 'vitest';
import {createPinia, setActivePinia} from 'pinia';
import {useMessageStore} from './useMessageStore';
import {ModelChat} from '../../model/ModelChat';

describe('useMessageStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('initData', () => {
        it('should initialize messages with chat data', () => {
            const store = useMessageStore();
            const chat = new ModelChat();
            chat.fromName = '测试用户';
            chat.avatar = 'https://example.com/avatar.png';

            store.initData(chat);

            expect(store.data.length).toBe(10);
            expect(store.currentChatId).toBe(chat.id);
            expect(store.currentChatAvatar).toBe(chat.avatar);
        });

        it('should create alternating incoming and outgoing messages', () => {
            const store = useMessageStore();
            const chat = new ModelChat();
            chat.fromName = '测试用户';

            store.initData(chat);

            expect(store.data[0].isInMsg).toBe(true);
            expect(store.data[1].isInMsg).toBe(false);
            expect(store.data[2].isInMsg).toBe(true);
        });
    });

    describe('sendMessage', () => {
        it('should add message to the list', () => {
            const store = useMessageStore();
            const chat = new ModelChat();
            chat.fromName = '测试用户';
            chat.avatar = 'https://example.com/avatar.png';

            store.initData(chat);
            const initialLength = store.data.length;

            const message = store.sendMessage('你好，这是测试消息');

            expect(message).not.toBeNull();
            expect(store.data.length).toBe(initialLength + 1);
            expect(message?.messageContent).toBe('你好，这是测试消息');
            expect(message?.isInMsg).toBe(false);
            expect(message?.fromName).toBe('我');
        });

        it('should return null when no chat is selected', () => {
            const store = useMessageStore();

            const message = store.sendMessage('测试消息');

            expect(message).toBeNull();
        });

        it('should return null when content is empty', () => {
            const store = useMessageStore();
            const chat = new ModelChat();
            store.initData(chat);

            const message = store.sendMessage('');

            expect(message).toBeNull();
        });

        it('should return null when content is only whitespace', () => {
            const store = useMessageStore();
            const chat = new ModelChat();
            store.initData(chat);

            const message1 = store.sendMessage('   ');
            const message2 = store.sendMessage('\n\n');
            const message3 = store.sendMessage('\t\t');

            expect(message1).toBeNull();
            expect(message2).toBeNull();
            expect(message3).toBeNull();
        });

        it('should trim message content', () => {
            const store = useMessageStore();
            const chat = new ModelChat();
            store.initData(chat);

            const message = store.sendMessage('  测试消息  ');

            expect(message?.messageContent).toBe('测试消息');
        });

        it('should set correct chatId', () => {
            const store = useMessageStore();
            const chat = new ModelChat();
            store.initData(chat);

            const message = store.sendMessage('测试消息');

            expect(message?.chatId).toBe(chat.id);
        });
    });
});
