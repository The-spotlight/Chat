import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessageStore } from '../useMessageStore'
import { truncateContent } from '../../utils/messageUtils'
import { ModelChat } from '../../../model/ModelChat'
import { ModelMessage } from '../../../model/ModelMessage'

describe('useMessageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty data', () => {
    const store = useMessageStore()
    expect(store.data).toEqual([])
    expect(store.currentChat).toBeNull()
    expect(store.referencedMessage).toBeNull()
    expect(store.highlightedMessageId).toBeNull()
  })

  it('should initialize data with a chat', () => {
    const store = useMessageStore()
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'

    store.initData(chat, true) // 使用 immediate: true 进行同步初始化

    expect(store.currentChat).toEqual(chat)
    expect(store.data.length).toBe(10)
    expect(store.data[0].chatId).toBe('test-chat-id')
    expect(store.referencedMessage).toBeNull()
  })

  it('should send a message when currentChat is set', () => {
    const store = useMessageStore()
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'

    store.initData(chat, true) // 使用 immediate: true 进行同步初始化
    const initialLength = store.data.length

    store.sendMessage('Hello, this is a test message')

    expect(store.data.length).toBe(initialLength + 1)
    const newMessage = store.data[store.data.length - 1]
    expect(newMessage.messageContent).toBe('Hello, this is a test message')
    expect(newMessage.isInMsg).toBe(false)
    expect(newMessage.fromName).toBe('我')
    expect(newMessage.chatId).toBe('test-chat-id')
  })

  it('should not send a message when currentChat is null', () => {
    const store = useMessageStore()
    
    store.sendMessage('This should not be sent')

    expect(store.data.length).toBe(0)
  })

  it('should set correct message properties', () => {
    const store = useMessageStore()
    const chat = new ModelChat()
    chat.id = 'test-id'
    chat.avatar = 'test-avatar.png'
    
    store.initData(chat, true) // 使用 immediate: true 进行同步初始化
    store.sendMessage('Test message')

    const message = store.data.find(m => m.messageContent === 'Test message')
    expect(message).toBeDefined()
    expect(message?.isInMsg).toBe(false)
    expect(message?.fromName).toBe('我')
    expect(message?.avatar).toBe('test-avatar.png')
    expect(message?.createTime).toBeDefined()
  })

  describe('reference functionality', () => {
    it('should set referenced message correctly', () => {
      const store = useMessageStore()
      const message = new ModelMessage()
      message.id = 'ref-msg-id'
      message.fromName = 'Sender'
      message.messageContent = 'This is a referenced message'

      store.setReferencedMessage(message)

      expect(store.referencedMessage).toEqual(message)
    })

    it('should clear referenced message correctly', () => {
      const store = useMessageStore()
      const message = new ModelMessage()
      message.id = 'ref-msg-id'
      message.fromName = 'Sender'
      message.messageContent = 'This is a referenced message'

      store.setReferencedMessage(message)
      expect(store.referencedMessage).not.toBeNull()

      store.clearReferencedMessage()
      expect(store.referencedMessage).toBeNull()
    })

    it('should send message with reference when referencedMessage is set', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat, true) // 使用 immediate: true 进行同步初始化

      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = 'Original Sender'
      referencedMsg.messageContent = 'This is the original message to be referenced'

      store.setReferencedMessage(referencedMsg)
      store.sendMessage('This is a reply with reference')

      const newMessage = store.data[store.data.length - 1]
      expect(newMessage.reference).toBeDefined()
      expect(newMessage.reference?.referencedMessageId).toBe('ref-msg-id')
      expect(newMessage.reference?.referencedFromName).toBe('Original Sender')
      expect(newMessage.reference?.referencedContent).toContain('This is the original message')
    })

    it('should clear referenced message after sending', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat, true) // 使用 immediate: true 进行同步初始化

      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = 'Original Sender'
      referencedMsg.messageContent = 'Original message'

      store.setReferencedMessage(referencedMsg)
      expect(store.referencedMessage).not.toBeNull()

      store.sendMessage('Reply message')
      expect(store.referencedMessage).toBeNull()
    })

    it('should truncate long content to 50 characters in reference', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat, true) // 使用 immediate: true 进行同步初始化

      const longContent = 'This is a very long message that exceeds fifty characters and should be truncated properly when referenced in a reply message'
      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = 'Original Sender'
      referencedMsg.messageContent = longContent

      store.setReferencedMessage(referencedMsg)
      store.sendMessage('Reply')

      const newMessage = store.data[store.data.length - 1]
      expect(newMessage.reference?.referencedContent.length).toBeLessThanOrEqual(53)
      expect(newMessage.reference?.referencedContent).toContain('...')
    })
  })

  describe('highlight functionality', () => {
    it('should set highlighted message id', () => {
      const store = useMessageStore()
      
      store.setHighlightedMessageId('msg-id-123')
      expect(store.highlightedMessageId).toBe('msg-id-123')
    })

    it('should clear highlighted message id', () => {
      const store = useMessageStore()
      
      store.setHighlightedMessageId('msg-id-123')
      expect(store.highlightedMessageId).toBe('msg-id-123')
      
      store.setHighlightedMessageId(null)
      expect(store.highlightedMessageId).toBeNull()
    })
  })

  describe('truncateContent utility', () => {
    it('should return empty string for empty content', () => {
      expect(truncateContent('', 50)).toBe('')
    })

    it('should not truncate short content', () => {
      const shortContent = 'Short message'
      expect(truncateContent(shortContent, 50)).toBe(shortContent)
    })

    it('should truncate long content and add ellipsis', () => {
      const longContent = 'This is a very long message that needs to be truncated'
      const result = truncateContent(longContent, 20)
      expect(result.length).toBe(23)
      expect(result.endsWith('...')).toBe(true)
    })
  })
})
