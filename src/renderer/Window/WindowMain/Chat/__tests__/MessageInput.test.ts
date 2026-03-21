import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MessageInput from '../MessageInput.vue'
import { useChatStore } from '../../../../store/useChatStore'
import { useMessageStore } from '../../../../store/useMessageStore'

describe('MessageInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render correctly', () => {
    const wrapper = mount(MessageInput)
    expect(wrapper.find('.input-area').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('.send-btn').exists()).toBe(true)
  })

  it('should be disabled when no chat is selected', async () => {
    const chatStore = useChatStore()
    // Deselect all chats first
    chatStore.data.forEach(c => c.isSelected = false)
    
    const wrapper = mount(MessageInput)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.input-wrapper').classes()).toContain('disabled')
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.send-btn').attributes('disabled')).toBeDefined()
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('请先选择一个会话')
  })

  it('should be enabled when a chat is selected', () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    
    // Select a chat
    chatStore.selectItem(chatStore.data[0])
    
    expect(wrapper.find('.input-wrapper').classes()).not.toContain('disabled')
    expect(wrapper.find('textarea').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('输入消息...')
  })

  it('should update input value when typing', async () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    chatStore.selectItem(chatStore.data[0])
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello World')
    
    expect(textarea.element.value).toBe('Hello World')
  })

  it('should enable send button only when there is content', async () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    chatStore.selectItem(chatStore.data[0])
    
    const sendBtn = wrapper.find('.send-btn')
    expect(sendBtn.classes()).not.toContain('active')
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('   ')
    expect(sendBtn.classes()).not.toContain('active')
    
    await textarea.setValue('Hello')
    expect(sendBtn.classes()).toContain('active')
  })

  it('should send message on button click', async () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    chatStore.selectItem(chatStore.data[0])
    
    const sendMessageSpy = vi.spyOn(messageStore, 'sendMessage')
    const updateLastMessageSpy = vi.spyOn(chatStore, 'updateLastMessage')
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Test message')
    
    const sendBtn = wrapper.find('.send-btn')
    await sendBtn.trigger('click')
    
    expect(sendMessageSpy).toHaveBeenCalledWith('Test message')
    expect(updateLastMessageSpy).toHaveBeenCalled()
    expect(textarea.element.value).toBe('')
  })

  it('should not send empty message', async () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    chatStore.selectItem(chatStore.data[0])
    
    const sendMessageSpy = vi.spyOn(messageStore, 'sendMessage')
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('   ')
    
    const sendBtn = wrapper.find('.send-btn')
    await sendBtn.trigger('click')
    
    expect(sendMessageSpy).not.toHaveBeenCalled()
  })

  it('should send message on Enter key', async () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    chatStore.selectItem(chatStore.data[0])
    
    const sendMessageSpy = vi.spyOn(messageStore, 'sendMessage')
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Test message')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })
    
    expect(sendMessageSpy).toHaveBeenCalledWith('Test message')
  })

  it('should not send message on Shift+Enter (should allow newline)', async () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    chatStore.selectItem(chatStore.data[0])
    
    const sendMessageSpy = vi.spyOn(messageStore, 'sendMessage')
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Test message')
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true })
    
    expect(sendMessageSpy).not.toHaveBeenCalled()
  })

  it('should trim message content before sending', async () => {
    const wrapper = mount(MessageInput)
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    chatStore.selectItem(chatStore.data[0])
    
    const sendMessageSpy = vi.spyOn(messageStore, 'sendMessage')
    
    const textarea = wrapper.find('textarea')
    await textarea.setValue('   Hello World   ')
    
    const sendBtn = wrapper.find('.send-btn')
    await sendBtn.trigger('click')
    
    expect(sendMessageSpy).toHaveBeenCalledWith('Hello World')
  })
})
