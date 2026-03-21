import {describe, it, expect, beforeEach} from 'vitest';
import {mount} from '@vue/test-utils';
import {createPinia, setActivePinia} from 'pinia';
import ChatItem from './ChatItem.vue';
import {useChatStore} from '../../../store/useChatStore';
import {ModelChat} from '../../../../model/ModelChat';

describe('ChatItem', () => {
    let pinia: ReturnType<typeof createPinia>;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
    });

    const createChatItem = (overrides: Partial<ModelChat> = {}): ModelChat => {
        const chat = new ModelChat();
        chat.fromName = '测试用户';
        chat.sendTime = '昨天';
        chat.lastMsg = '这是最后一条消息';
        chat.avatar = 'https://example.com/avatar.png';
        chat.isSelected = false;
        Object.assign(chat, overrides);
        return chat;
    };

    const mountComponent = (chat: ModelChat) => {
        return mount(ChatItem, {
            props: {data: chat},
            global: {
                plugins: [pinia],
            },
        });
    };

    describe('rendering', () => {
        it('should render chat item with correct data', () => {
            const chat = createChatItem();
            const wrapper = mountComponent(chat);

            expect(wrapper.find('.fromName').text()).toBe('测试用户');
            expect(wrapper.find('.timeName').text()).toBe('昨天');
            expect(wrapper.find('.lastMsg').text()).toBe('这是最后一条消息');
        });

        it('should render avatar image', () => {
            const chat = createChatItem({
                avatar: 'https://example.com/test-avatar.png',
            });
            const wrapper = mountComponent(chat);

            const img = wrapper.find('.avatar img');
            expect(img.attributes('src')).toBe('https://example.com/test-avatar.png');
        });

        it('should not have selected class when not selected', () => {
            const chat = createChatItem({isSelected: false});
            const wrapper = mountComponent(chat);

            expect(wrapper.find('.chatItem').classes()).not.toContain('chatItemSelected');
        });

        it('should have selected class when selected', () => {
            const chat = createChatItem({isSelected: true});
            const wrapper = mountComponent(chat);

            expect(wrapper.find('.chatItem').classes()).toContain('chatItemSelected');
        });
    });

    describe('click behavior', () => {
        it('should call selectItem when clicked', async () => {
            const chatStore = useChatStore();
            const chat = chatStore.data[0];
            chat.isSelected = false;
            const wrapper = mountComponent(chat);

            await wrapper.find('.chatItem').trigger('click');

            expect(chat.isSelected).toBe(true);
            expect(chatStore.selectedChat).toBe(chat);
        });

        it('should deselect other items when clicked', async () => {
            const chatStore = useChatStore();
            const chat1 = chatStore.data[4];
            const chat2 = chatStore.data[0];

            expect(chat1.isSelected).toBe(true);
            expect(chat2.isSelected).toBe(false);

            const wrapper = mountComponent(chat2);
            await wrapper.find('.chatItem').trigger('click');

            expect(chat1.isSelected).toBe(false);
            expect(chat2.isSelected).toBe(true);
        });

        it('should remain selected when clicking already selected item', async () => {
            const chatStore = useChatStore();
            const chat = chatStore.data[4];

            expect(chat.isSelected).toBe(true);

            const wrapper = mountComponent(chat);
            await wrapper.find('.chatItem').trigger('click');

            expect(chat.isSelected).toBe(true);
        });
    });

    describe('display variations', () => {
        it('should display different time formats', () => {
            const chat = createChatItem({sendTime: '刚刚'});
            const wrapper = mountComponent(chat);

            expect(wrapper.find('.timeName').text()).toBe('刚刚');
        });

        it('should display long last message', () => {
            const longMessage = '这是一条非常长的消息内容，用于测试消息截断或换行的显示效果';
            const chat = createChatItem({lastMsg: longMessage});
            const wrapper = mountComponent(chat);

            expect(wrapper.find('.lastMsg').text()).toBe(longMessage);
        });

        it('should display empty last message', () => {
            const chat = createChatItem({lastMsg: ''});
            const wrapper = mountComponent(chat);

            expect(wrapper.find('.lastMsg').text()).toBe('');
        });
    });
});
