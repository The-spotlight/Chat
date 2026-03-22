import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessageStore, RECALL_TEXT_SELF, RECALL_TEXT_OTHER, RECALL_REFERENCE_TEXT } from '../useMessageStore'
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

    store.initData(chat)

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

    store.initData(chat)
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
    
    store.initData(chat)
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

      store.initData(chat)

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

      store.initData(chat)

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

      store.initData(chat)

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
      const store = useMessageStore()
      expect(store.truncateContent('', 50)).toBe('')
    })

    it('should not truncate short content', () => {
      const store = useMessageStore()
      const shortContent = 'Short message'
      expect(store.truncateContent(shortContent, 50)).toBe(shortContent)
    })

    it('should truncate long content and add ellipsis', () => {
      const store = useMessageStore()
      const longContent = 'This is a very long message that needs to be truncated'
      const result = store.truncateContent(longContent, 20)
      expect(result.length).toBe(23)
      expect(result.endsWith('...')).toBe(true)
    })
  })

  describe('recall functionality', () => {
    let originalDateNow: typeof Date.now

    beforeEach(() => {
      originalDateNow = Date.now
    })

    afterEach(() => {
      Date.now = originalDateNow
    })

    const mockDateNow = (timestamp: number) => {
      Date.now = vi.fn(() => timestamp)
    }

    it('should recall message within 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-to-recall'
      message.isInMsg = false
      message.createTime = now - 60 * 1000
      message.messageContent = 'Message to recall'
      
      store.data.push(message)
      
      const result = store.recallMessage('msg-to-recall')
      
      expect(result).toBe(true)
      expect(message.isRecalled).toBe(true)
    })

    it('should not recall message older than 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-old'
      message.isInMsg = false
      message.createTime = now - 3 * 60 * 1000
      message.messageContent = 'Old message'
      
      store.data.push(message)
      
      const result = store.recallMessage('msg-old')
      
      expect(result).toBe(false)
      expect(message.isRecalled).toBeUndefined()
    })

    it('should not recall incoming message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-incoming'
      message.isInMsg = true
      message.createTime = now
      message.messageContent = 'Incoming message'
      
      store.data.push(message)
      
      const result = store.recallMessage('msg-incoming')
      
      expect(result).toBe(false)
      expect(message.isRecalled).toBeUndefined()
    })

    it('should not recall already recalled message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-recalled'
      message.isInMsg = false
      message.createTime = now
      message.messageContent = 'Already recalled'
      message.isRecalled = true
      
      store.data.push(message)
      
      const result = store.recallMessage('msg-recalled')
      
      expect(result).toBe(false)
    })

    it('should update reference content when message is recalled', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const originalMessage = new ModelMessage()
      originalMessage.id = 'original-msg'
      originalMessage.isInMsg = false
      originalMessage.createTime = now
      originalMessage.messageContent = 'Original message'
      
      store.data.push(originalMessage)
      
      const replyMessage = new ModelMessage()
      replyMessage.id = 'reply-msg'
      replyMessage.isInMsg = false
      replyMessage.createTime = now
      replyMessage.messageContent = 'Reply message'
      replyMessage.reference = {
        referencedMessageId: 'original-msg',
        referencedFromName: '我',
        referencedContent: 'Original message'
      }
      
      store.data.push(replyMessage)
      
      store.recallMessage('original-msg')
      
      expect(replyMessage.reference?.referencedContent).toBe(RECALL_REFERENCE_TEXT)
    })

    it('should export correct recall text constants', () => {
      expect(RECALL_TEXT_SELF).toBe('你撤回了一条消息')
      expect(RECALL_TEXT_OTHER).toBe('对方撤回了一条消息')
      expect(RECALL_REFERENCE_TEXT).toBe('消息已被撤回')
    })
  })

  describe('edit functionality', () => {
    let originalDateNow: typeof Date.now

    beforeEach(() => {
      originalDateNow = Date.now
    })

    afterEach(() => {
      Date.now = originalDateNow
    })

    const mockDateNow = (timestamp: number) => {
      Date.now = vi.fn(() => timestamp)
    }

    it('should edit message within 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-to-edit'
      message.isInMsg = false
      message.createTime = now - 60 * 1000
      message.messageContent = 'Original message'
      
      store.data.push(message)
      
      const result = store.editMessage('msg-to-edit', 'Edited message')
      
      expect(result).toBe(true)
      expect(message.messageContent).toBe('Edited message')
      expect(message.isEdited).toBe(true)
      expect(message.editedAt).toBeDefined()
    })

    it('should not edit message older than 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-old'
      message.isInMsg = false
      message.createTime = now - 3 * 60 * 1000
      message.messageContent = 'Old message'
      
      store.data.push(message)
      
      const result = store.editMessage('msg-old', 'New content')
      
      expect(result).toBe(false)
      expect(message.messageContent).toBe('Old message')
      expect(message.isEdited).toBeUndefined()
    })

    it('should not edit incoming message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-incoming'
      message.isInMsg = true
      message.createTime = now
      message.messageContent = 'Incoming message'
      
      store.data.push(message)
      
      const result = store.editMessage('msg-incoming', 'New content')
      
      expect(result).toBe(false)
      expect(message.messageContent).toBe('Incoming message')
    })

    it('should not edit recalled message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.id = 'msg-recalled'
      message.isInMsg = false
      message.createTime = now
      message.messageContent = 'Recalled message'
      message.isRecalled = true
      
      store.data.push(message)
      
      const result = store.editMessage('msg-recalled', 'New content')
      
      expect(result).toBe(false)
    })

    it('should set editedAt timestamp when editing', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const editTime = 1700000000000
      mockDateNow(editTime)
      
      const message = new ModelMessage()
      message.id = 'msg-edit'
      message.isInMsg = false
      message.createTime = editTime - 60 * 1000
      message.messageContent = 'Original'
      
      store.data.push(message)
      
      store.editMessage('msg-edit', 'Edited')
      
      expect(message.editedAt).toBe(editTime)
    })
  })

  describe('getMessageById', () => {
    it('should return message by id', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.avatar = 'test-avatar.png'
      
      store.initData(chat)
      
      const message = new ModelMessage()
      message.id = 'test-msg-id'
      message.messageContent = 'Test message'
      
      store.data.push(message)
      
      const found = store.getMessageById('test-msg-id')
      
      expect(found).toBeDefined()
      expect(found?.messageContent).toBe('Test message')
    })

    it('should return undefined for non-existent id', () => {
      const store = useMessageStore()
      
      const found = store.getMessageById('non-existent-id')
      
      expect(found).toBeUndefined()
    })
  })
})
