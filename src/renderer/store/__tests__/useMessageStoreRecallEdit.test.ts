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
      const referencingMsg = store.data[2]
      
      referencingMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: referencedMsg.fromName || '',
        referencedContent: 'Original content'
      }
      
      store.recallMessage(referencedMsg.id)
      
      expect(referencingMsg.reference?.referencedContent).toBe('消息已被撤回')
    })

    it('should update reference content and clear sender name when referenced message is recalled - Bug #3', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const referencedMsg = store.data[1]
      const referencingMsg = store.data[2]
      
      referencingMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Test User',
        referencedContent: 'Original content'
      }
      
      store.recallMessage(referencedMsg.id)
      
      expect(referencingMsg.reference?.referencedContent).toBe('消息已被撤回')
      expect(referencingMsg.reference?.referencedFromName).toBe('')
    })

    it('should update all referencing messages when a message is recalled', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const referencedMsg = store.data[1]
      const referencingMsg1 = store.data[2]
      const referencingMsg2 = store.data[3]
      
      referencingMsg1.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Test User',
        referencedContent: 'Original content 1'
      }
      
      referencingMsg2.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Test User',
        referencedContent: 'Original content 2'
      }
      
      store.recallMessage(referencedMsg.id)
      
      expect(referencingMsg1.reference?.referencedContent).toBe('消息已被撤回')
      expect(referencingMsg1.reference?.referencedFromName).toBe('')
      expect(referencingMsg2.reference?.referencedContent).toBe('消息已被撤回')
      expect(referencingMsg2.reference?.referencedFromName).toBe('')
    })

    it('should handle nested references when multiple messages reference each other', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const msgA = store.data[1]
      const msgB = store.data[2]
      const msgC = store.data[3]
      
      msgB.reference = {
        referencedMessageId: msgA.id,
        referencedFromName: 'User A',
        referencedContent: 'Message A content'
      }
      
      msgC.reference = {
        referencedMessageId: msgB.id,
        referencedFromName: 'User B',
        referencedContent: 'Message B content'
      }
      
      store.recallMessage(msgA.id)
      
      expect(msgB.reference?.referencedContent).toBe('消息已被撤回')
      expect(msgB.reference?.referencedFromName).toBe('')
      expect(msgC.reference?.referencedContent).toBe('Message B content')
      expect(msgC.reference?.referencedFromName).toBe('User B')
    })

    it('should handle case when referencing message is incoming and outgoing', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const referencedMsg = store.data.find(m => !m.isInMsg)!
      const incomingRefMsg = store.data.find(m => m.isInMsg)!
      const outgoingRefMsg = store.data.find(m => !m.isInMsg && m.id !== referencedMsg.id)!
      
      incomingRefMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Me',
        referencedContent: 'Original outgoing message'
      }
      
      outgoingRefMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Me',
        referencedContent: 'Original outgoing message'
      }
      
      store.recallMessage(referencedMsg.id)
      
      expect(incomingRefMsg.reference?.referencedContent).toBe('消息已被撤回')
      expect(incomingRefMsg.reference?.referencedFromName).toBe('')
      expect(outgoingRefMsg.reference?.referencedContent).toBe('消息已被撤回')
      expect(outgoingRefMsg.reference?.referencedFromName).toBe('')
    })

    it('should not affect unrelated references when recalling a message', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat)
      
      const msgA = store.data[1]
      const msgB = store.data[2]
      const msgC = store.data[3]
      const msgD = store.data[4]
      
      msgB.reference = {
        referencedMessageId: msgA.id,
        referencedFromName: 'User A',
        referencedContent: 'Message A'
      }
      
      msgD.reference = {
        referencedMessageId: msgC.id,
        referencedFromName: 'User C',
        referencedContent: 'Message C'
      }
      
      store.recallMessage(msgA.id)
      
      expect(msgB.reference?.referencedContent).toBe('消息已被撤回')
      expect(msgB.reference?.referencedFromName).toBe('')
      expect(msgD.reference?.referencedContent).toBe('Message C')
      expect(msgD.reference?.referencedFromName).toBe('User C')
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
})
