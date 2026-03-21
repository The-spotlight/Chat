import {describe, it, expect, beforeEach, vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {createPinia, setActivePinia} from 'pinia';
import MessageInput from './MessageInput.vue';
import {useChatStore} from '../../../store/useChatStore';
import {useMessageStore} from '../../../store/useMessageStore';
import {ModelChat} from '../../../../model/ModelChat';

describe('MessageInput', () => {
    let pinia: ReturnType<typeof createPinia>;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
    });

    const mountComponent = () => {
        return mount(MessageInput, {
            global: {
                plugins: [pinia],
            },
        });
    };

    describe('rendering', () => {
        it('should render textarea and send button', () => {
            const wrapper = mountComponent();

            expect(wrapper.find('textarea').exists()).toBe(true);
            expect(wrapper.find('button.sendBtn').exists()).toBe(true);
        });

        it('should have placeholder text', () => {
            const wrapper = mountComponent();

            expect(wrapper.find('textarea').attributes('placeholder')).toBe('输入消息...');
        });
    });

    describe('disabled state when no chat selected', () => {
        it('should disable textarea when no chat is selected', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            chatStore.data.forEach((item: ModelChat) => item.isSelected = false);
            await wrapper.vm.$nextTick();

            expect(wrapper.find('textarea').attributes('disabled')).toBeDefined();
        });

        it('should disable send button when no chat is selected', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            chatStore.data.forEach((item: ModelChat) => item.isSelected = false);
            await wrapper.vm.$nextTick();

            expect(wrapper.find('button.sendBtn').attributes('disabled')).toBeDefined();
        });

        it('should enable textarea when a chat is selected', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);

            await wrapper.vm.$nextTick();

            expect(wrapper.find('textarea').attributes('disabled')).toBeUndefined();
        });
    });

    describe('send button behavior', () => {
        it('should be disabled when input is empty', () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);

            expect(wrapper.find('button.sendBtn').attributes('disabled')).toBeDefined();
        });

        it('should be disabled when input is only whitespace', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);

            await wrapper.find('textarea').setValue('   ');

            expect(wrapper.find('button.sendBtn').attributes('disabled')).toBeDefined();
        });

        it('should be enabled when input has content', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);

            await wrapper.find('textarea').setValue('测试消息');

            expect(wrapper.find('button.sendBtn').attributes('disabled')).toBeUndefined();
        });
    });

    describe('sending messages', () => {
        it('should clear input after sending', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);

            await wrapper.find('textarea').setValue('测试消息');
            await wrapper.find('button.sendBtn').trigger('click');

            expect(wrapper.find('textarea').element.value).toBe('');
        });

        it('should add message to message store', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);
            const initialLength = messageStore.data.length;

            await wrapper.find('textarea').setValue('新的测试消息');
            await wrapper.find('button.sendBtn').trigger('click');

            expect(messageStore.data.length).toBe(initialLength + 1);
            expect(messageStore.data[messageStore.data.length - 1].messageContent).toBe('新的测试消息');
        });

        it('should update chat last message', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);

            await wrapper.find('textarea').setValue('更新的消息');
            await wrapper.find('button.sendBtn').trigger('click');

            expect(chat.lastMsg).toBe('更新的消息');
            expect(chat.sendTime).toBe('刚刚');
        });
    });

    describe('keyboard shortcuts', () => {
        it('should send message on Enter key', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);
            const initialLength = messageStore.data.length;

            await wrapper.find('textarea').setValue('Enter发送测试');
            await wrapper.find('textarea').trigger('keydown', {key: 'Enter'});

            expect(messageStore.data.length).toBe(initialLength + 1);
        });

        it('should not send message on Shift+Enter', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);
            const initialLength = messageStore.data.length;

            await wrapper.find('textarea').setValue('Shift+Enter换行测试');
            await wrapper.find('textarea').trigger('keydown', {key: 'Enter', shiftKey: true});

            expect(messageStore.data.length).toBe(initialLength);
        });
    });
});
