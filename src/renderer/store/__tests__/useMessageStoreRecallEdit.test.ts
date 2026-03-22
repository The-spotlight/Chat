import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessageStore } from '../useMessageStore'
import { OPERATION_TIME_LIMIT, canOperateMessage, isWithinTimeLimit } from '../../utils/messageUtils'
import { ModelChat } from '../../../model/ModelChat'
import { ModelMessage } from '../../../model/ModelMessage'

describe('useMessageStore - Recall and Edit functionality', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  const createTestChat = (): ModelChat => {
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'
    return chat
  }

  const createOutgoingMessage = (content: string = 'Test message'): ModelMessage => {
    const message = new ModelMessage()
    message.id = 'test-msg-id'
    message.isInMsg = false
    message.messageContent = content
    message.fromName = '我'
    message.avatar = 'test-avatar.png'
    message.createTime = Date.now()
    message.isEdited = false
    message.isRecalled = false
    return message
  }

  const createIncomingMessage = (content: string = 'Test message'): ModelMessage => {
    const message = new ModelMessage()
    message.id = 'test-msg-id'
    message.isInMsg = true
    message.messageContent = content
    message.fromName = 'Sender'
    message.avatar = 'test-avatar.png'
    message.createTime = Date.now()
    message.isEdited = false
    message.isRecalled = false
    return message
  }

  describe('Time limit functionality', () => {
    it('should return true for messages within 2 minutes', () => {
      const message = createOutgoingMessage()
      message.createTime = Date.now()
      
      expect(isWithinTimeLimit(message.createTime)).toBe(true)
    })

    it('should return false for messages older than 2 minutes', () => {
      const message = createOutgoingMessage()
      message.createTime = Date.now() - OPERATION_TIME_LIMIT - 1000
      
      expect(isWithinTimeLimit(message.createTime)).toBe(false)
    })
  })

  describe('canOperateMessage functionality', () => {
    it('should allow operation on own messages within time limit', () => {
      const message = createOutgoingMessage()
      
      expect(canOperateMessage(message)).toBe(true)
    })

    it('should not allow operation on incoming messages', () => {
      const message = createIncomingMessage()
      
      expect(canOperateMessage(message)).toBe(false)
    })

    it('should not allow operation on messages beyond time limit', () => {
      const message = createOutgoingMessage()
      message.createTime = Date.now() - OPERATION_TIME_LIMIT - 1000
      
      expect(canOperateMessage(message)).toBe(false)
    })

    it('should not allow operation on recalled messages', () => {
      const message = createOutgoingMessage()
      message.isRecalled = true
      
      expect(canOperateMessage(message)).toBe(false)
    })
  })

  describe('Recall functionality', () => {
    it('should recall a message within time limit', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const messageId = store.data[1].id
      
      const result = store.recallMessage(messageId)
      
      expect(result).toBe(true)
      const recalledMessage = store.data.find(m => m.id === messageId)
      expect(recalledMessage?.isRecalled).toBe(true)
      expect(recalledMessage?.messageContent).toBe('')
    })

    it('should not recall a message beyond time limit', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const message = store.data[1]
      message.createTime = Date.now() - OPERATION_TIME_LIMIT - 1000
      
      const result = store.recallMessage(message.id)
      
      expect(result).toBe(false)
      expect(message.isRecalled).toBe(false)
    })

    it('should not recall an incoming message', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const incomingMessage = store.data.find(m => m.isInMsg)
      expect(incomingMessage).toBeDefined()
      
      const result = store.recallMessage(incomingMessage!.id)
      
      expect(result).toBe(false)
      expect(incomingMessage!.isRecalled).toBe(false)
    })

    it('should not recall an already recalled message', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const messageId = store.data[1].id
      
      store.recallMessage(messageId)
      const result = store.recallMessage(messageId)
      
      expect(result).toBe(false)
    })

    it('should update reference content when referenced message is recalled', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const referencedMsg = store.data[1]
      const referencingMsgId = store.data[2].id
      
      store.data[2].reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: referencedMsg.fromName || '',
        referencedContent: 'Original content'
      }
      
      store.recallMessage(referencedMsg.id)
      
      const updatedReferencingMsg = store.data.find(m => m.id === referencingMsgId)
      expect(updatedReferencingMsg?.reference?.referencedContent).toBe('消息已被撤回')
    })
  })

  describe('Edit functionality', () => {
    it('should edit a message within time limit', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const message = store.data[1]
      const newContent = 'Updated content'
      
      const result = store.editMessage(message.id, newContent)
      
      expect(result).toBe(true)
      expect(message.messageContent).toBe(newContent)
      expect(message.isEdited).toBe(true)
      expect(message.editedTime).toBeDefined()
    })

    it('should not edit a message beyond time limit', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const message = store.data[1]
      message.createTime = Date.now() - OPERATION_TIME_LIMIT - 1000
      const originalContent = message.messageContent
      
      const result = store.editMessage(message.id, 'Updated content')
      
      expect(result).toBe(false)
      expect(message.messageContent).toBe(originalContent)
      expect(message.isEdited).toBe(false)
    })

    it('should not edit with empty content', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const message = store.data[1]
      const originalContent = message.messageContent
      
      const result = store.editMessage(message.id, '   ')
      
      expect(result).toBe(false)
      expect(message.messageContent).toBe(originalContent)
      expect(message.isEdited).toBe(false)
    })

    it('should not edit an incoming message', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const incomingMessage = store.data.find(m => m.isInMsg)!
      const originalContent = incomingMessage.messageContent
      
      const result = store.editMessage(incomingMessage.id, 'Updated content')
      
      expect(result).toBe(false)
      expect(incomingMessage.messageContent).toBe(originalContent)
    })
  })

  describe('getMessageById functionality', () => {
    it('should return message by id', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const message = store.data[0]
      const foundMessage = store.getMessageById(message.id)
      
      expect(foundMessage).toBeDefined()
      expect(foundMessage?.id).toBe(message.id)
    })

    it('should return undefined for non-existent id', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const foundMessage = store.getMessageById('non-existent-id')
      
      expect(foundMessage).toBeUndefined()
    })
  })

  describe('Bug #3 regression: recall message should update reference card', () => {
    it('should update reference content when referenced message is recalled', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const referencedMsg = store.data[1]
      const referencingMsg = store.data[2]
      
      referencingMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: referencedMsg.fromName || '',
        referencedContent: 'Original content'
      }
      
      const result = store.recallMessage(referencedMsg.id)
      
      expect(result).toBe(true)
      
      const updatedReferencingMsg = store.data.find(m => m.id === referencingMsg.id)
      expect(updatedReferencingMsg?.reference?.referencedContent).toBe('消息已被撤回')
    })

    it('should update all reference cards that reference the recalled message', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const referencedMsg = store.data[1]
      
      store.data[2].reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Sender',
        referencedContent: 'Original content 1'
      }
      
      store.data[3].reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Sender',
        referencedContent: 'Original content 2'
      }
      
      const result = store.recallMessage(referencedMsg.id)
      
      expect(result).toBe(true)
      
      expect(store.data[2].reference?.referencedContent).toBe('消息已被撤回')
      expect(store.data[3].reference?.referencedContent).toBe('消息已被撤回')
    })

    it('should not affect reference cards that reference other messages', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const msgToRecall = store.data[1]
      const otherMsg = store.data[2]
      
      store.data[3].reference = {
        referencedMessageId: otherMsg.id,
        referencedFromName: 'Sender',
        referencedContent: 'Should not change'
      }
      
      const result = store.recallMessage(msgToRecall.id)
      
      expect(result).toBe(true)
      
      expect(store.data[3].reference?.referencedContent).toBe('Should not change')
    })

    it('should mark the recalled message correctly', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const msgToRecall = store.data[1]
      const originalContent = msgToRecall.messageContent
      
      const result = store.recallMessage(msgToRecall.id)
      
      expect(result).toBe(true)
      
      const recalledMsg = store.data.find(m => m.id === msgToRecall.id)
      expect(recalledMsg?.isRecalled).toBe(true)
      expect(recalledMsg?.messageContent).toBe('')
      expect(recalledMsg?.messageContent).not.toBe(originalContent)
    })
  })
})
