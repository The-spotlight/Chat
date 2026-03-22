import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessageStore } from '../useMessageStore'
import { useChatStore } from '../useChatStore'
import { ModelChat } from '../../../model/ModelChat'
import { ModelMessage } from '../../../model/ModelMessage'

describe('Bug Fixes Regression Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createTestChat = (): ModelChat => {
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'
    return chat
  }

  /**
   * Bug #1: 发送消息后左侧列表最后消息未更新
   * 问题：使用 messageStore.currentChat.id 调用 updateLastMessage，但 currentChat 和 chatStore.data 中的对象可能不是同一个引用
   * 修复：使用 chatStore.getSelectedChat.id 来调用 updateLastMessage
   */
  describe('Bug #1: updateLastMessage should work with selected chat from chatStore', () => {
    it('should update last message when sending message', () => {
      const chatStore = useChatStore()
      const messageStore = useMessageStore()

      // 初始化 chat 数据
      const chat = chatStore.data[0]
      chatStore.selectItem(chat)

      // 验证初始状态
      const originalLastMsg = chat.lastMsg
      const chatId = chat.id

      // 发送消息
      const testContent = 'Test message for bug #1'
      messageStore.sendMessage(testContent)

      // 使用 chatStore.updateLastMessage 更新最后消息（模拟 MessageInput.vue 的行为）
      chatStore.updateLastMessage(chatId, testContent)

      // 验证最后消息已更新
      const updatedChat = chatStore.data.find(c => c.id === chatId)
      expect(updatedChat?.lastMsg).toBe(testContent)
      expect(updatedChat?.sendTime).toBe('刚刚')
      expect(updatedChat?.lastMessageTime).toBe(Date.now())
    })

    it('should update last message when chat is selected from filtered results', () => {
      const chatStore = useChatStore()
      const messageStore = useMessageStore()

      // 搜索并选择 chat
      chatStore.setSearchKeyword('聊天对象1')
      const filteredChat = chatStore.filteredData[0]
      const chatId = filteredChat.id
      const originalLastMsg = filteredChat.lastMsg

      // 选择 chat
      chatStore.selectItem(filteredChat)

      // 发送消息
      const testContent = 'Message after search'
      messageStore.sendMessage(testContent)
      chatStore.updateLastMessage(chatId, testContent)

      // 验证最后消息已更新
      const updatedChat = chatStore.data.find(c => c.id === chatId)
      expect(updatedChat?.lastMsg).toBe(testContent)
      expect(updatedChat?.sendTime).toBe('刚刚')
    })

    it('should update last message with correct chat reference from getSelectedChat', () => {
      const chatStore = useChatStore()
      const messageStore = useMessageStore()

      // 选择第一个 chat
      const chat1 = chatStore.data[0]
      chatStore.selectItem(chat1)

      // 发送第一条消息
      const content1 = 'First message'
      messageStore.sendMessage(content1)

      // 使用 getSelectedChat 获取选中的 chat 并更新最后消息
      const selectedChat = chatStore.getSelectedChat
      expect(selectedChat).not.toBeNull()
      chatStore.updateLastMessage(selectedChat!.id, content1)

      // 验证更新成功
      expect(chat1.lastMsg).toBe(content1)
      expect(chat1.sendTime).toBe('刚刚')

      // 切换到第二个 chat
      const chat2 = chatStore.data[1]
      chatStore.selectItem(chat2)

      // 发送第二条消息
      const content2 = 'Second message'
      messageStore.sendMessage(content2)

      // 使用 getSelectedChat 获取新选中的 chat
      const newSelectedChat = chatStore.getSelectedChat
      chatStore.updateLastMessage(newSelectedChat!.id, content2)

      // 验证第二个 chat 更新成功，第一个 chat 保持不变
      expect(chat2.lastMsg).toBe(content2)
      expect(chat2.sendTime).toBe('刚刚')
      expect(chat1.lastMsg).toBe(content1) // 第一个 chat 保持不变
    })

    it('should not update last message when chatId does not exist', () => {
      const chatStore = useChatStore()
      const messageStore = useMessageStore()

      // 选择 chat
      const chat = chatStore.data[0]
      chatStore.selectItem(chat)
      const originalLastMsg = chat.lastMsg

      // 尝试使用不存在的 chatId 更新
      chatStore.updateLastMessage('non-existent-id', 'New content')

      // 验证原 chat 的最后消息未改变
      expect(chat.lastMsg).toBe(originalLastMsg)
    })

    it('should update last message time to current time', () => {
      const chatStore = useChatStore()
      const messageStore = useMessageStore()

      // 设置固定时间
      const fixedTime = 1000000000000
      vi.setSystemTime(fixedTime)

      // 选择 chat
      const chat = chatStore.data[0]
      chatStore.selectItem(chat)

      // 发送消息并更新最后消息
      chatStore.updateLastMessage(chat.id, 'Test message')

      // 验证时间更新为当前时间
      expect(chat.lastMessageTime).toBe(fixedTime)
    })
  })

  /**
   * Bug #2: 引用消息发送后引用卡片显示为空
   * 问题：引用消息的属性可能为 undefined，导致引用卡片显示为空
   * 修复：确保引用消息的属性有默认值，使用 '未知用户' 和 '空消息' 作为回退
   */
  describe('Bug #2: reference card should not be empty', () => {
    it('should create reference with proper content when fromName is undefined', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      // 创建一条 fromName 为 undefined 的消息
      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = undefined
      referencedMsg.messageContent = 'Original message content'

      messageStore.setReferencedMessage(referencedMsg)
      messageStore.sendMessage('Reply message')

      const sentMessage = messageStore.data[messageStore.data.length - 1]
      expect(sentMessage.reference).toBeDefined()
      expect(sentMessage.reference?.referencedFromName).toBe('未知用户')
      expect(sentMessage.reference?.referencedContent).toContain('Original message')
    })

    it('should create reference with proper content when messageContent is empty', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      // 创建一条 messageContent 为空的消息
      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = 'Test Sender'
      referencedMsg.messageContent = ''

      messageStore.setReferencedMessage(referencedMsg)
      messageStore.sendMessage('Reply message')

      const sentMessage = messageStore.data[messageStore.data.length - 1]
      expect(sentMessage.reference).toBeDefined()
      expect(sentMessage.reference?.referencedFromName).toBe('Test Sender')
      expect(sentMessage.reference?.referencedContent).toBe('空消息')
    })

    it('should create reference with proper content when both fields are undefined', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      // 创建一条 fromName 和 messageContent 都为 undefined 的消息
      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = undefined
      referencedMsg.messageContent = undefined

      messageStore.setReferencedMessage(referencedMsg)
      messageStore.sendMessage('Reply message')

      const sentMessage = messageStore.data[messageStore.data.length - 1]
      expect(sentMessage.reference).toBeDefined()
      expect(sentMessage.reference?.referencedFromName).toBe('未知用户')
      expect(sentMessage.reference?.referencedContent).toBe('空消息')
    })

    it('should create reference with trimmed fromName', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      // 创建一条 fromName 有空白字符的消息
      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = '  Test Sender  '
      referencedMsg.messageContent = 'Original content'

      messageStore.setReferencedMessage(referencedMsg)
      messageStore.sendMessage('Reply message')

      const sentMessage = messageStore.data[messageStore.data.length - 1]
      expect(sentMessage.reference?.referencedFromName).toBe('Test Sender')
    })

    it('should truncate long content to 50 characters in reference', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      const longContent = 'a'.repeat(100)
      const referencedMsg = new ModelMessage()
      referencedMsg.id = 'ref-msg-id'
      referencedMsg.fromName = 'Test Sender'
      referencedMsg.messageContent = longContent

      messageStore.setReferencedMessage(referencedMsg)
      messageStore.sendMessage('Reply message')

      const sentMessage = messageStore.data[messageStore.data.length - 1]
      expect(sentMessage.reference?.referencedContent.length).toBeLessThanOrEqual(53)
      expect(sentMessage.reference?.referencedContent).toContain('...')
    })
  })

  /**
   * Bug #3: 撤回消息后引用该消息的卡片内容未更新
   * 问题：直接修改 msg.reference.referencedContent 可能不会触发 Vue 的响应式更新
   * 修复：创建一个新的 reference 对象来替换旧的，确保响应式更新触发
   */
  describe('Bug #3: reference content should update when referenced message is recalled', () => {
    it('should update reference content when referenced message is recalled', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      // 获取两条消息，一条引用另一条
      const referencedMsg = messageStore.data.find((m: ModelMessage) => !m.isInMsg)!
      const referencingMsg = messageStore.data.find((m: ModelMessage) => m.id !== referencedMsg.id)!

      // 设置引用关系
      referencingMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: referencedMsg.fromName || 'Unknown',
        referencedContent: referencedMsg.messageContent || ''
      }

      // 撤回被引用的消息
      const result = messageStore.recallMessage(referencedMsg.id)

      // 验证撤回成功
      expect(result).toBe(true)
      expect(referencedMsg.isRecalled).toBe(true)

      // 验证引用内容已更新
      expect(referencingMsg.reference?.referencedContent).toBe('消息已被撤回')
    })

    it('should update reference content for multiple messages referencing the same message', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      // 获取三条消息
      const referencedMsg = messageStore.data.find((m: ModelMessage) => !m.isInMsg)!
      const referencingMsg1 = messageStore.data[0]
      const referencingMsg2 = messageStore.data[1]

      // 确保三条消息不同
      if (referencingMsg1.id === referencedMsg.id) {
        Object.assign(referencingMsg1, messageStore.data[2])
      }
      if (referencingMsg2.id === referencedMsg.id || referencingMsg2.id === referencingMsg1.id) {
        Object.assign(referencingMsg2, messageStore.data[3])
      }

      // 设置两条消息都引用同一条消息
      referencingMsg1.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: referencedMsg.fromName || 'Unknown',
        referencedContent: 'Original content 1'
      }
      referencingMsg2.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: referencedMsg.fromName || 'Unknown',
        referencedContent: 'Original content 2'
      }

      // 撤回被引用的消息
      messageStore.recallMessage(referencedMsg.id)

      // 验证两条消息的引用内容都已更新
      expect(referencingMsg1.reference?.referencedContent).toBe('消息已被撤回')
      expect(referencingMsg2.reference?.referencedContent).toBe('消息已被撤回')
    })

    it('should preserve other reference fields when updating content', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      const referencedMsg = messageStore.data.find((m: ModelMessage) => !m.isInMsg)!
      const referencingMsg = messageStore.data.find((m: ModelMessage) => m.id !== referencedMsg.id)!

      // 设置引用关系
      referencingMsg.reference = {
        referencedMessageId: referencedMsg.id,
        referencedFromName: 'Original Sender',
        referencedContent: 'Original content'
      }

      // 撤回被引用的消息
      messageStore.recallMessage(referencedMsg.id)

      // 验证引用内容已更新，但其他字段保持不变
      expect(referencingMsg.reference?.referencedContent).toBe('消息已被撤回')
      expect(referencingMsg.reference?.referencedMessageId).toBe(referencedMsg.id)
      expect(referencingMsg.reference?.referencedFromName).toBe('Original Sender')
    })

    it('should not affect references to other messages when recalling one message', () => {
      const messageStore = useMessageStore()
      const chat = createTestChat()
      messageStore.initData(chat)

      // 获取三条消息 - 使用 isInMsg = false 的消息（索引 1, 3, 5...）
      const msg1 = messageStore.data[1] // isInMsg = false
      const msg2 = messageStore.data[3] // isInMsg = false
      const msg3 = messageStore.data[0] // isInMsg = true

      // 设置 msg3 引用 msg1，msg2 引用另一条消息
      msg3.reference = {
        referencedMessageId: msg1.id,
        referencedFromName: 'Sender 1',
        referencedContent: 'Content 1'
      }
      msg2.reference = {
        referencedMessageId: 'other-msg-id',
        referencedFromName: 'Other Sender',
        referencedContent: 'Other content'
      }

      // 撤回 msg1（可以被撤回，因为 isInMsg = false）
      const result = messageStore.recallMessage(msg1.id)
      expect(result).toBe(true)

      // 验证 msg3 的引用内容已更新
      expect(msg3.reference?.referencedContent).toBe('消息已被撤回')

      // 验证 msg2 的引用内容未受影响
      expect(msg2.reference?.referencedContent).toBe('Other content')
    })
  })
})
