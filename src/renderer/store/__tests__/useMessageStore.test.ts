import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessageStore } from '../useMessageStore'
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
    it('should recall a message within 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Message to recall')

      const message = store.data[store.data.length - 1]
      message.id = 'recall-test-id'
      message.createTime = Date.now()
      message.isInMsg = false

      const result = store.recallMessage('recall-test-id')

      expect(result).toBe(true)
      expect(message.isRecalled).toBe(true)
    })

    it('should clear message content when recalled', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Message to recall')

      const message = store.data[store.data.length - 1]
      message.id = 'recall-clear-id'
      message.createTime = Date.now()
      message.isInMsg = false

      store.recallMessage('recall-clear-id')

      expect(message.messageContent).toBe('')
    })

    it('should update referenced content when message is recalled', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)

      // Create original message
      const originalMsg = new ModelMessage()
      originalMsg.id = 'original-msg-id'
      originalMsg.createTime = Date.now()
      originalMsg.isInMsg = false
      originalMsg.messageContent = 'Original content'
      originalMsg.fromName = 'Test User'
      originalMsg.chatId = chat.id
      store.data.push(originalMsg)

      // Create message that references the original
      const referencingMsg = new ModelMessage()
      referencingMsg.id = 'referencing-msg-id'
      referencingMsg.createTime = Date.now()
      referencingMsg.isInMsg = false
      referencingMsg.messageContent = 'Reply with reference'
      referencingMsg.fromName = 'Test User'
      referencingMsg.chatId = chat.id
      referencingMsg.reference = {
        referencedMessageId: 'original-msg-id',
        referencedFromName: 'Test User',
        referencedContent: 'Original content'
      }
      store.data.push(referencingMsg)

      // Recall the original message
      store.recallMessage('original-msg-id')

      // Check that the reference content is updated
      expect(referencingMsg.reference?.referencedContent).toBe('消息已被撤回')
    })

    it('should not recall a message after 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Old message')

      const message = store.data[store.data.length - 1]
      message.id = 'old-msg-id'
      message.createTime = Date.now() - 3 * 60 * 1000
      message.isInMsg = false

      const result = store.recallMessage('old-msg-id')

      expect(result).toBe(false)
      expect(message.isRecalled).toBeFalsy()
    })

    it('should not recall an incoming message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)

      const message = new ModelMessage()
      message.id = 'incoming-msg-id'
      message.createTime = Date.now()
      message.isInMsg = true
      message.messageContent = 'Incoming message'
      message.chatId = chat.id
      store.data.push(message)

      const result = store.recallMessage('incoming-msg-id')

      expect(result).toBe(false)
      expect(message.isRecalled).toBeFalsy()
    })

    it('should not recall an already recalled message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Message to recall')

      const message = store.data[store.data.length - 1]
      message.id = 'already-recalled-id'
      message.createTime = Date.now()
      message.isInMsg = false
      message.isRecalled = true

      const result = store.recallMessage('already-recalled-id')

      expect(result).toBe(false)
    })

    it('should return false when recalling non-existent message', () => {
      const store = useMessageStore()
      const result = store.recallMessage('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('edit functionality', () => {
    it('should edit a message within 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Original message')

      const message = store.data[store.data.length - 1]
      message.id = 'edit-test-id'
      message.createTime = Date.now()
      message.isInMsg = false

      const result = store.editMessage('edit-test-id', 'Edited message')

      expect(result).toBe(true)
      expect(message.messageContent).toBe('Edited message')
      expect(message.isEdited).toBe(true)
      expect(message.editTime).toBeDefined()
    })

    it('should not edit a message after 2 minutes', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Old message')

      const message = store.data[store.data.length - 1]
      message.id = 'old-edit-id'
      message.createTime = Date.now() - 3 * 60 * 1000
      message.isInMsg = false

      const result = store.editMessage('old-edit-id', 'New content')

      expect(result).toBe(false)
      expect(message.messageContent).toBe('Old message')
    })

    it('should not edit an incoming message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)

      const message = new ModelMessage()
      message.id = 'incoming-edit-id'
      message.createTime = Date.now()
      message.isInMsg = true
      message.messageContent = 'Incoming message'
      message.chatId = chat.id
      store.data.push(message)

      const result = store.editMessage('incoming-edit-id', 'Edited content')

      expect(result).toBe(false)
      expect(message.messageContent).toBe('Incoming message')
    })

    it('should not edit a recalled message', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Recalled message')

      const message = store.data[store.data.length - 1]
      message.id = 'recalled-edit-id'
      message.createTime = Date.now()
      message.isInMsg = false
      message.isRecalled = true

      const result = store.editMessage('recalled-edit-id', 'New content')

      expect(result).toBe(false)
    })

    it('should return false when editing non-existent message', () => {
      const store = useMessageStore()
      const result = store.editMessage('non-existent-id', 'New content')
      expect(result).toBe(false)
    })
  })

  describe('checkMessageOperable', () => {
    it('should return correct operability for own message within time limit', () => {
      const store = useMessageStore()
      const message = new ModelMessage()
      message.id = 'test-id'
      message.createTime = Date.now()
      message.isInMsg = false

      const result = store.checkMessageOperable(message)

      expect(result.canRecall).toBe(true)
      expect(result.canEdit).toBe(true)
    })

    it('should return false for message outside time limit', () => {
      const store = useMessageStore()
      const message = new ModelMessage()
      message.id = 'test-id'
      message.createTime = Date.now() - 3 * 60 * 1000
      message.isInMsg = false

      const result = store.checkMessageOperable(message)

      expect(result.canRecall).toBe(false)
      expect(result.canEdit).toBe(false)
    })

    it('should return false for incoming message', () => {
      const store = useMessageStore()
      const message = new ModelMessage()
      message.id = 'test-id'
      message.createTime = Date.now()
      message.isInMsg = true

      const result = store.checkMessageOperable(message)

      expect(result.canRecall).toBe(false)
      expect(result.canEdit).toBe(false)
    })

    it('should return false for recalled message', () => {
      const store = useMessageStore()
      const message = new ModelMessage()
      message.id = 'test-id'
      message.createTime = Date.now()
      message.isInMsg = false
      message.isRecalled = true

      const result = store.checkMessageOperable(message)

      expect(result.canRecall).toBe(false)
      expect(result.canEdit).toBe(false)
    })
  })

  describe('getMessageById', () => {
    it('should return message by id', () => {
      const store = useMessageStore()
      const chat = new ModelChat()
      chat.id = 'test-chat-id'
      chat.fromName = 'Test User'
      chat.avatar = 'test-avatar.png'

      store.initData(chat)
      store.sendMessage('Test message')

      const message = store.data[store.data.length - 1]
      message.id = 'find-me-id'

      const found = store.getMessageById('find-me-id')

      expect(found).toBeDefined()
      expect(found?.id).toBe('find-me-id')
    })

    it('should return undefined for non-existent id', () => {
      const store = useMessageStore()
      const found = store.getMessageById('non-existent')
      expect(found).toBeUndefined()
    })
  })
})
