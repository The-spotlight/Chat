import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '../useChatStore'
import { useMessageStore } from '../useMessageStore'

describe('useChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with chat data', () => {
    const store = useChatStore()
    expect(store.data.length).toBe(10)
    expect(store.data[4].isSelected).toBe(true)
  })

  it('should select a chat item', () => {
    const store = useChatStore()
    const messageStore = useMessageStore()
    
    const chatToSelect = store.data[0]
    expect(chatToSelect.isSelected).toBe(false)
    
    store.selectItem(chatToSelect)
    
    expect(chatToSelect.isSelected).toBe(true)
    expect(store.data.filter(c => c.isSelected).length).toBe(1)
  })

  it('should get selected chat', () => {
    const store = useChatStore()
    
    const selectedChat = store.getSelectedChat
    expect(selectedChat).not.toBeNull()
    expect(selectedChat?.isSelected).toBe(true)
    expect(selectedChat?.fromName).toBe('聊天对象4')
  })

  it('should update last message for a chat', () => {
    const store = useChatStore()
    const chat = store.data[0]
    const chatId = chat.id!
    const originalLastMsg = chat.lastMsg

    store.updateLastMessage(chatId, 'New last message')

    const updatedChat = store.data.find(c => c.id === chatId)
    expect(updatedChat?.lastMsg).toBe('New last message')
    expect(updatedChat?.sendTime).toBe('刚刚')
    expect(updatedChat?.lastMsg).not.toBe(originalLastMsg)
  })

  it('should not update when chatId does not exist', () => {
    const store = useChatStore()
    const originalData = [...store.data.map(c => ({ ...c }))]

    store.updateLastMessage('non-existent-id', 'Message that should not be saved')

    store.data.forEach((chat, index) => {
      expect(chat.lastMsg).toBe(originalData[index].lastMsg)
    })
  })

  it('should filter chats by search keyword', () => {
    const store = useChatStore()
    
    store.setSearchKeyword('聊天对象1')
    expect(store.filteredData.length).toBeLessThan(10)
    
    store.setSearchKeyword('')
    expect(store.filteredData.length).toBe(10)
  })

  it('should handle search with no matches', () => {
    const store = useChatStore()
    
    store.setSearchKeyword('不存在的聊天对象')
    expect(store.filteredData.length).toBe(0)
    expect(store.searchStats.hasResults).toBe(false)
    expect(store.searchStats.isSearching).toBe(true)
  })

  it('should clear search state', () => {
    const store = useChatStore()
    
    store.setSearchKeyword('测试搜索')
    expect(store.searchKeyword).toBe('测试搜索')
    
    store.clearSearch()
    expect(store.searchKeyword).toBe('')
    expect(store.searchStats.isSearching).toBe(false)
  })

  it('should provide search statistics', () => {
    const store = useChatStore()
    
    store.setSearchKeyword('聊天对象1')
    expect(store.searchStats.total).toBe(10)
    expect(store.searchStats.filtered).toBeGreaterThan(0)
    expect(store.searchStats.isSearching).toBe(true)
  })

  // 置顶功能测试
  it('should toggle pin status correctly', () => {
    const store = useChatStore()
    const chat = store.data[0]
    const chatId = chat.id!
    
    expect(chat.isPinned).toBe(false)
    
    store.togglePin(chatId)
    expect(chat.isPinned).toBe(true)
    expect(chat.pinnedTime).toBeDefined()
    
    store.togglePin(chatId)
    expect(chat.isPinned).toBe(false)
    expect(chat.pinnedTime).toBeUndefined()
  })

  it('should sort pinned chats first', () => {
    const store = useChatStore()
    
    // 置顶最后一个聊天
    const lastChat = store.data[store.data.length - 1]
    store.togglePin(lastChat.id!)
    
    // 置顶的聊天应该排在前面
    expect(store.sortedData[0].id).toBe(lastChat.id)
  })

  it('should sort multiple pinned chats by pinnedTime descending', async () => {
    const store = useChatStore()
    
    // 依次置顶两个聊天
    const chat1 = store.data[0]
    const chat2 = store.data[1]
    
    store.togglePin(chat1.id!)
    await new Promise(resolve => setTimeout(resolve, 10)) // 确保时间戳不同
    store.togglePin(chat2.id!)
    
    // 后置顶的应该排在前面
    expect(store.sortedData[0].id).toBe(chat2.id)
    expect(store.sortedData[1].id).toBe(chat1.id)
  })

  // 未读计数测试
  it('should increment unread count for non-selected chat', () => {
    const store = useChatStore()
    const nonSelectedChat = store.data.find(c => !c.isSelected)!
    const chatId = nonSelectedChat.id!
    
    const initialCount = nonSelectedChat.unreadCount
    store.incrementUnread(chatId)
    
    expect(nonSelectedChat.unreadCount).toBe(initialCount + 1)
  })

  it('should not increment unread count for selected chat', () => {
    const store = useChatStore()
    const selectedChat = store.data.find(c => c.isSelected)!
    const chatId = selectedChat.id!
    
    const initialCount = selectedChat.unreadCount
    store.incrementUnread(chatId)
    
    expect(selectedChat.unreadCount).toBe(initialCount)
  })

  it('should clear unread count when selecting chat', () => {
    const store = useChatStore()
    const chat = store.data[0]
    const chatId = chat.id!
    
    // 先增加未读计数
    chat.unreadCount = 5
    expect(chat.unreadCount).toBe(5)
    
    // 选中该会话
    store.selectItem(chat)
    
    expect(chat.unreadCount).toBe(0)
  })

  it('should clear unread count for specific chat', () => {
    const store = useChatStore()
    const chat = store.data[0]
    const chatId = chat.id!
    
    chat.unreadCount = 10
    store.clearUnread(chatId)
    
    expect(chat.unreadCount).toBe(0)
  })

  it('should mark all chats as read', () => {
    const store = useChatStore()
    
    // 给多个会话设置未读计数
    store.data[0].unreadCount = 3
    store.data[1].unreadCount = 5
    store.data[2].unreadCount = 2
    
    store.markAllAsRead()
    
    store.data.forEach(chat => {
      expect(chat.unreadCount).toBe(0)
    })
  })

  it('should calculate total unread correctly', () => {
    const store = useChatStore()
    
    // 清除所有未读
    store.markAllAsRead()
    
    // 设置未读计数
    store.data[0].unreadCount = 3
    store.data[1].unreadCount = 5
    store.data[2].unreadCount = 2
    
    expect(store.getTotalUnread).toBe(10)
  })

  it('should format unread count correctly', () => {
    const store = useChatStore()
    
    expect(store.formatUnreadCount(0)).toBe('')
    expect(store.formatUnreadCount(5)).toBe('5')
    expect(store.formatUnreadCount(99)).toBe('99')
    expect(store.formatUnreadCount(100)).toBe('99+')
    expect(store.formatUnreadCount(999)).toBe('99+')
  })

  // 消息存储联动测试
  it('should increment unread when receiving message for non-current chat', () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    // 选择第一个聊天作为当前聊天
    chatStore.selectItem(chatStore.data[0])
    
    // 给第二个聊天发消息（非当前聊天）
    const secondChat = chatStore.data[1]
    const initialCount = secondChat.unreadCount
    
    messageStore.receiveMessage(secondChat.id!, '测试消息')
    
    expect(secondChat.unreadCount).toBe(initialCount + 1)
  })

  it('should not increment unread when receiving message for current chat', () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    // 选择第一个聊天作为当前聊天
    const currentChat = chatStore.data[0]
    chatStore.selectItem(currentChat)
    
    const initialCount = currentChat.unreadCount
    messageStore.receiveMessage(currentChat.id!, '测试消息')
    
    expect(currentChat.unreadCount).toBe(initialCount)
  })
})
