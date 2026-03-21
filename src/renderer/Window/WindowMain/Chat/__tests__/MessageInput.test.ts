import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MessageInput from '../MessageInput.vue'
import { useChatStore } from '../../../../store/useChatStore'
import { useMessageStore } from '../../../../store/useMessageStore'
import { ModelMessage } from '../../../../../model/ModelMessage'

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

  // Reference Feature Tests
  describe('Reference Feature', () => {
    it('should not render reference preview when no reference exists', () => {
      const wrapper = mount(MessageInput)
      expect(wrapper.find('.reference-preview').exists()).toBe(false)
    })

    it('should render sender name and content summary when reference exists', async () => {
      const wrapper = mount(MessageInput)
      const messageStore = useMessageStore()
      const chatStore = useChatStore()
      chatStore.selectItem(chatStore.data[0])

      const message = new ModelMessage()
      message.id = 'ref-123'
      message.fromName = '张三'
      message.messageContent = '这是被引用的消息'

      messageStore.setReference(message)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.reference-preview').exists()).toBe(true)
      expect(wrapper.find('.reference-sender').text()).toBe('张三')
      expect(wrapper.find('.reference-content').text()).toBe('这是被引用的消息')
    })

    it('should truncate long content correctly', async () => {
      const wrapper = mount(MessageInput)
      const messageStore = useMessageStore()
      const chatStore = useChatStore()
      chatStore.selectItem(chatStore.data[0])

      const message = new ModelMessage()
      message.id = 'ref-456'
      message.fromName = '李四'
      message.messageContent = '这是一段很长的消息内容，超过了三十个字符的限制，需要进行截断处理'

      messageStore.setReference(message)
      await wrapper.vm.$nextTick()

      const content = wrapper.find('.reference-content').text()
      expect(content.length).toBeLessThanOrEqual(33) // 30 + 3 (ellipsis)
      expect(content.endsWith('...')).toBe(true)
    })

    it('should clear reference state when close button clicked', async () => {
      const wrapper = mount(MessageInput)
      const messageStore = useMessageStore()
      const chatStore = useChatStore()
      chatStore.selectItem(chatStore.data[0])

      const message = new ModelMessage()
      message.id = 'ref-789'
      message.fromName = '王五'
      message.messageContent = '测试消息'

      messageStore.setReference(message)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.reference-preview').exists()).toBe(true)

      const closeBtn = wrapper.find('.close-btn')
      await closeBtn.trigger('click')

      expect(wrapper.find('.reference-preview').exists()).toBe(false)
      expect(messageStore.hasReference).toBe(false)
    })

    it('should auto clear reference state after sending message', async () => {
      const wrapper = mount(MessageInput)
      const chatStore = useChatStore()
      const messageStore = useMessageStore()
      
      chatStore.selectItem(chatStore.data[0])

      const message = new ModelMessage()
      message.id = 'ref-abc'
      message.fromName = '赵六'
      message.messageContent = '被引用的消息'

      messageStore.setReference(message)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.reference-preview').exists()).toBe(true)

      const textarea = wrapper.find('textarea')
      await textarea.setValue('回复消息')

      const sendBtn = wrapper.find('.send-btn')
      await sendBtn.trigger('click')

      expect(wrapper.find('.reference-preview').exists()).toBe(false)
      expect(messageStore.hasReference).toBe(false)
    })
  })
})
