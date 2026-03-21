import {describe, it, expect, beforeEach, vi} from 'vitest';
import {mount} from '@vue/test-utils';
import {createPinia, setActivePinia} from 'pinia';
import MessageBoard from './MessageBoard.vue';
import {useMessageStore} from '../../../store/useMessageStore';
import {useChatStore} from '../../../store/useChatStore';
import {ModelChat} from '../../../../model/ModelChat';

vi.mock('../../../Components/BarTop.vue', () => ({
    default: {
        name: 'BarTop',
        template: '<div class="bar-top-mock">BarTop</div>',
    },
}));

describe('MessageBoard', () => {
    let pinia: ReturnType<typeof createPinia>;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        vi.clearAllMocks();
    });

    const mountComponent = () => {
        return mount(MessageBoard, {
            global: {
                plugins: [pinia],
                stubs: {
                    BarTop: true,
                },
            },
            attachTo: document.body,
        });
    };

    describe('rendering', () => {
        it('should render message list container', () => {
            const wrapper = mountComponent();

            expect(wrapper.find('.messageList').exists()).toBe(true);
        });

        it('should render MessageInput component', () => {
            const wrapper = mountComponent();

            expect(wrapper.findComponent({name: 'MessageInput'}).exists()).toBe(true);
        });

        it('should render messages when chat is selected', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);

            await wrapper.vm.$nextTick();

            expect(messageStore.data.length).toBe(10);
            const messageItems = wrapper.findAllComponents({name: 'MessageItem'});
            expect(messageItems.length).toBe(10);
        });
    });

    describe('auto scroll behavior', () => {
        it('should scroll to bottom when new message is added', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);

            await wrapper.vm.$nextTick();

            const scrollContainer = document.querySelector('.messageList');
            if (scrollContainer) {
                Object.defineProperty(scrollContainer, 'scrollHeight', {
                    writable: true,
                    value: 1000,
                });
                Object.defineProperty(scrollContainer, 'scrollTop', {
                    writable: true,
                    value: 0,
                });
            }

            messageStore.sendMessage('新消息测试');
            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 0));

            if (scrollContainer) {
                expect(scrollContainer.scrollTop).toBe(1000);
            }
        });
    });

    describe('integration with MessageInput', () => {
        it('should display new message after sending', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);

            await wrapper.vm.$nextTick();

            const initialCount = wrapper.findAllComponents({name: 'MessageItem'}).length;

            const textarea = wrapper.find('textarea');
            await textarea.setValue('集成测试消息');
            await wrapper.find('button.sendBtn').trigger('click');
            await wrapper.vm.$nextTick();

            const newCount = wrapper.findAllComponents({name: 'MessageItem'}).length;
            expect(newCount).toBe(initialCount + 1);
        });

        it('should update chat last message when message is sent', async () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            const messageStore = useMessageStore();
            const chat = chatStore.data[0];
            chatStore.selectItem(chat);
            messageStore.initData(chat);

            await wrapper.vm.$nextTick();

            const textarea = wrapper.find('textarea');
            await textarea.setValue('更新最后消息测试');
            await wrapper.find('button.sendBtn').trigger('click');
            await wrapper.vm.$nextTick();

            expect(chat.lastMsg).toBe('更新最后消息测试');
            expect(chat.sendTime).toBe('刚刚');
        });
    });

    describe('empty state', () => {
        it('should show empty message list when no chat is selected', () => {
            const wrapper = mountComponent();
            const chatStore = useChatStore();
            chatStore.data.forEach((item: ModelChat) => item.isSelected = false);

            const messageItems = wrapper.findAllComponents({name: 'MessageItem'});
            expect(messageItems.length).toBe(0);
        });
    });
});
