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
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      // 确保消息创建时间是当前时间（在限制内）
      const message = store.data[1]
      message.createTime = Date.now()
      message.isInMsg = false // 确保是发出的消息
      
      const result = store.recallMessage(message.id)
      
      expect(result).toBe(true)
      const recalledMessage = store.data.find(m => m.id === message.id)
      expect(recalledMessage?.isRecalled).toBe(true)
      expect(recalledMessage?.messageContent).toBe('')
    })

    it('should not recall a message beyond time limit', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      const message = store.data[1]
      message.createTime = Date.now() - OPERATION_TIME_LIMIT - 1000
      
      const result = store.recallMessage(message.id)
      
      expect(result).toBe(false)
      expect(message.isRecalled).toBe(false)
    })

    it('should not recall an incoming message', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      const incomingMessage = store.data.find(m => m.isInMsg)
      expect(incomingMessage).toBeDefined()
      
      const result = store.recallMessage(incomingMessage!.id)
      
      expect(result).toBe(false)
      expect(incomingMessage!.isRecalled).toBe(false)
    })

    it('should not recall an already recalled message', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      const messageId = store.data[1].id
      
      store.recallMessage(messageId)
      const result = store.recallMessage(messageId)
      
      expect(result).toBe(false)
    })

    it('should update reference content when referenced message is recalled', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      const referencedMsg = store.data[1]
      const referencingMsg = store.data[2]
      
      // 确保被引用的消息创建时间在限制内
      referencedMsg.createTime = Date.now()
      referencedMsg.isInMsg = false
      
      referencingMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: referencedMsg.fromName || '',
        referencedContent: 'Original content'
      }
      
      store.recallMessage(referencedMsg.id)
      
      expect(referencingMsg.reference?.referencedContent).toBe('消息已被撤回')
    })
  })

  describe('Edit functionality', () => {
    it('should edit a message within time limit', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      const message = store.data[1]
      // 确保消息创建时间在限制内
      message.createTime = Date.now()
      message.isInMsg = false
      
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
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
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
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
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
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
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
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      const message = store.data[0]
      const foundMessage = store.getMessageById(message.id)
      
      expect(foundMessage).toBeDefined()
      expect(foundMessage?.id).toBe(message.id)
    })

    it('should return undefined for non-existent id', () => {
      const store = useMessageStore()
      const chat = createTestChat()
      store.initData(chat, true) // 使用 immediate: true 进行同步初始化
      
      const foundMessage = store.getMessageById('non-existent-id')
      
      expect(foundMessage).toBeUndefined()
    })
  })
})
