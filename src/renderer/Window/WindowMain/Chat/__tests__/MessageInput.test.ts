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
    
    // sendMessage 内部会进行 trim，所以传入的是原始内容
    expect(sendMessageSpy).toHaveBeenCalledWith('   Hello World   ')
  })

  describe('reference preview', () => {
    it('should not render reference preview when no message is referenced', () => {
      const wrapper = mount(MessageInput)
      const chatStore = useChatStore()
      chatStore.selectItem(chatStore.data[0])

      expect(wrapper.find('.reference-preview').exists()).toBe(false)
    })

    it('should render reference preview when a message is referenced', async () => {
      const wrapper = mount(MessageInput)
      const chatStore = useChatStore()
      const messageStore = useMessageStore()
      
      chatStore.selectItem(chatStore.data[0])

      const referencedMsg = new ModelMessage()
      referencedMsg.fromName = 'Sender'
      referencedMsg.messageContent = 'Referenced message'
      
      messageStore.setReferencedMessage(referencedMsg)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.reference-preview').exists()).toBe(true)
    })

    it('should display referenced sender name in preview', async () => {
      const wrapper = mount(MessageInput)
      const chatStore = useChatStore()
      const messageStore = useMessageStore()
      
      chatStore.selectItem(chatStore.data[0])

      const referencedMsg = new ModelMessage()
      referencedMsg.fromName = 'John Doe'
      referencedMsg.messageContent = 'Test message'
      
      messageStore.setReferencedMessage(referencedMsg)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.reference-name').text()).toBe('John Doe')
    })

    it('should display truncated content in preview', async () => {
      const wrapper = mount(MessageInput)
      const chatStore = useChatStore()
      const messageStore = useMessageStore()
      
      chatStore.selectItem(chatStore.data[0])

      const longContent = 'This is a very long message that exceeds thirty characters limit'
      const referencedMsg = new ModelMessage()
      referencedMsg.fromName = 'Sender'
      referencedMsg.messageContent = longContent
      
      messageStore.setReferencedMessage(referencedMsg)
      await wrapper.vm.$nextTick()

      const previewText = wrapper.find('.reference-text').text()
      expect(previewText.length).toBeLessThanOrEqual(33)
      expect(previewText.endsWith('...')).toBe(true)
    })

    it('should clear reference when close button is clicked', async () => {
      const wrapper = mount(MessageInput)
      const chatStore = useChatStore()
      const messageStore = useMessageStore()
      
      chatStore.selectItem(chatStore.data[0])

      const referencedMsg = new ModelMessage()
      referencedMsg.fromName = 'Sender'
      referencedMsg.messageContent = 'Test message'
      
      messageStore.setReferencedMessage(referencedMsg)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.reference-preview').exists()).toBe(true)

      await wrapper.find('.close-btn').trigger('click')
      await wrapper.vm.$nextTick()

      expect(messageStore.referencedMessage).toBeNull()
    })

    it('should send message with reference and clear reference state', async () => {
      const wrapper = mount(MessageInput)
      const chatStore = useChatStore()
      const messageStore = useMessageStore()
      
      chatStore.selectItem(chatStore.data[0])

      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-id'
      referencedMsg.fromName = 'Sender'
      referencedMsg.messageContent = 'Original message'
      
      messageStore.setReferencedMessage(referencedMsg)
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      await textarea.setValue('Reply message')
      
      const sendBtn = wrapper.find('.send-btn')
      await sendBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(messageStore.referencedMessage).toBeNull()
      
      const lastMessage = messageStore.data[messageStore.data.length - 1]
      expect(lastMessage.reference).toBeDefined()
      expect(lastMessage.reference?.referencedMessageId).toBe('ref-id')
    })
  })
})
