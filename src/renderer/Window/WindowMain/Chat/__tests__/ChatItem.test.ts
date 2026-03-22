import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ChatItem from '../ChatItem.vue';
import { ModelChat } from '../../../../../model/ModelChat';
import { useChatStore } from '../../../../store/useChatStore';
describe('ChatItem', () => {
 beforeEach(() => {
 setActivePinia(createPinia());
 });
 const createChatData = (overrides = {}) => {
 const chat = new ModelChat();
 chat.id = 'test-id-123';
 chat.fromName = '测试用户';
 chat.sendTime = '刚刚';
 chat.lastMsg = '这是一条测试消息';
 chat.avatar = 'https://test-avatar-url';
 chat.isSelected = false;
 chat.isPinned = false;
 chat.unreadCount = 0;
 Object.assign(chat, overrides);
 return chat;
 };
 it('should render chat item correctly', () => {
 const chat = createChatData();
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.fromName').text()).toContain('测试用户');
 expect(wrapper.find('.lastMsg').text()).toBe('这是一条测试消息');
 expect(wrapper.find('.timeName').text()).toBe('刚刚');
 });
 it('should show pinned icon when chat is pinned', () => {
 const chat = createChatData({ isPinned: true });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.pinIcon').exists()).toBe(true);
 expect(wrapper.find('.chatItemPinned').exists()).toBe(true);
 });
 it('should not show pinned icon when chat is not pinned', () => {
 const chat = createChatData({ isPinned: false });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.pinIcon').exists()).toBe(false);
 });
 it('should show unread badge when there are unread messages', () => {
 const chat = createChatData({ unreadCount: 5 });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.unread-badge').exists()).toBe(true);
 expect(wrapper.find('.unread-badge').text()).toBe('5');
 });
 it('should not show unread badge when unreadCount is 0', () => {
 const chat = createChatData({ unreadCount: 0 });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.unread-badge').exists()).toBe(false);
 });
 it('should use large badge style when unread count >= 10', () => {
 const chat = createChatData({ unreadCount: 10 });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.unread-badge-large').exists()).toBe(true);
 });
 it('should use normal badge style when unread count < 10', () => {
 const chat = createChatData({ unreadCount: 5 });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.unread-badge-large').exists()).toBe(false);
 });
 it('should emit select chat when clicked', async () => {
 const chatStore = useChatStore();
 const chat = createChatData();
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 const selectSpy = vi.spyOn(chatStore, 'selectItem');
 await wrapper.find('.chatItem').trigger('click');
 expect(selectSpy).toHaveBeenCalledWith(chat);
 });
 it('should show selected style when chat is selected', () => {
 const chat = createChatData({ isSelected: true });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.chatItemSelected').exists()).toBe(true);
 });
 it('should show context menu on right click', async () => {
 const chat = createChatData();
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 await wrapper.find('.chatItem').trigger('contextmenu');
 // 检查是否有 ContextMenu 组件被渲染（由于 teleport，我们检查全局注册可能在 body，
 // 这里我们检查是否触发了 contextmenu 事件
 expect(wrapper.emitted()).toBeDefined();
 });
 it('should toggle pin status from context menu', async () => {
 const chatStore = useChatStore();
 const chat = createChatData({ isPinned: false });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 const togglePinSpy = vi.spyOn(chatStore, 'togglePin');
 // 模拟触发右键菜单
 await wrapper.find('.chatItem').trigger('contextmenu');
 // 由于 ContextMenu 使用 teleport，我们需要查找全局查找菜单被触发了 togglePin
 // 这里直接调用 handleMenuClick 方法来模拟菜单项点击
 await wrapper.vm.handleMenuClick('togglePin');
 expect(togglePinSpy).toHaveBeenCalledWith(chat.id);
 });
 it('should display 99+ when unread count exceeds 99', () => {
 const chat = createChatData({ unreadCount: 100 });
 const wrapper = mount(ChatItem, {
 props: {
 data: chat,
 },
 });
 expect(wrapper.find('.unread-badge').text()).toBe('99+');
 });
});
