import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '../useChatStore'
import { useMessageStore } from '../useMessageStore'

describe('useChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
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

  it('should search for keywords with special characters like dot', () => {
    const store = useChatStore()
    
    store.data[0].fromName = 'v2.0项目组'
    store.data[1].fromName = 'v3.0项目组'
    store.data[2].fromName = '测试组'
    
    store.setSearchKeyword('v2.0')
    expect(store.filteredData.length).toBe(1)
    expect(store.filteredData[0].fromName).toBe('v2.0项目组')
    
    store.setSearchKeyword('v3.0')
    expect(store.filteredData.length).toBe(1)
    expect(store.filteredData[0].fromName).toBe('v3.0项目组')
  })

  it('should search for keywords with special characters like parentheses', () => {
    const store = useChatStore()
    
    store.data[0].fromName = '测试(一组)'
    store.data[1].fromName = '测试(二组)'
    store.data[2].fromName = '普通组'
    
    store.setSearchKeyword('(一')
    expect(store.filteredData.length).toBe(1)
    expect(store.filteredData[0].fromName).toBe('测试(一组)')
    
    store.setSearchKeyword('二组)')
    expect(store.filteredData.length).toBe(1)
    expect(store.filteredData[0].fromName).toBe('测试(二组)')
  })

  it('should search for keywords with special characters like plus', () => {
    const store = useChatStore()
    
    store.data[0].fromName = 'C++开发组'
    store.data[1].fromName = 'Java开发组'
    store.data[2].fromName = 'Python开发组'
    
    store.setSearchKeyword('C++')
    expect(store.filteredData.length).toBe(1)
    expect(store.filteredData[0].fromName).toBe('C++开发组')
  })

  it('should search lastMsg with special characters', () => {
    const store = useChatStore()
    
    store.data[0].lastMsg = 'v1.2版本已发布'
    store.data[1].lastMsg = 'v2.0版本在路上'
    store.data[2].lastMsg = '其他消息'
    
    store.setSearchKeyword('v1.2')
    expect(store.filteredData.length).toBe(1)
    expect(store.filteredData[0].lastMsg).toBe('v1.2版本已发布')
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

  describe('selectItem with search integration', () => {
    it('should preserve search keyword by default when selecting a chat', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      expect(store.searchKeyword).toBe('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect)
      
      // 默认不清空搜索
      expect(store.searchKeyword).toBe('聊天对象1')
    })

    it('should initialize message store when selecting a chat', () => {
      const store = useChatStore()
      const messageStore = useMessageStore()
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect)
      
      expect(messageStore.currentChat).toEqual(chatToSelect)
      expect(messageStore.data.length).toBe(10)
    })

    it('should not re-select already selected chat', () => {
      const store = useChatStore()
      const messageStore = useMessageStore()
      
      const selectedChat = store.getSelectedChat
      expect(selectedChat).not.toBeNull()
      
      messageStore.sendMessage('test message')
      const messageCountBefore = messageStore.data.length
      
      store.selectItem(selectedChat!)
      
      expect(messageStore.data.length).toBe(messageCountBefore)
    })

    it('should preserve search keyword when clearSearch option is false', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      expect(store.searchKeyword).toBe('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect, { clearSearch: false })
      
      expect(store.searchKeyword).toBe('聊天对象1')
    })

    it('should clear search keyword when clearSearch option is true', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect, { clearSearch: true })
      
      expect(store.searchKeyword).toBe('')
    })

    it('should preserve search keyword by default when no options provided', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect)
      
      // 默认不清空搜索
      expect(store.searchKeyword).toBe('聊天对象1')
    })
  })

  describe('initializeMessageStore', () => {
    it('should initialize message store for selected chat', () => {
      const store = useChatStore()
      const messageStore = useMessageStore()
      
      expect(store.isInitialized).toBe(false)
      expect(messageStore.currentChat).toBeNull()
      
      store.initializeMessageStore()
      
      expect(store.isInitialized).toBe(true)
      expect(messageStore.currentChat).not.toBeNull()
      expect(messageStore.currentChat?.isSelected).toBe(true)
    })

    it('should not re-initialize if already initialized', () => {
      const store = useChatStore()
      const messageStore = useMessageStore()
      
      store.initializeMessageStore()
      const firstChat = messageStore.currentChat
      
      store.initializeMessageStore()
      
      expect(messageStore.currentChat).toEqual(firstChat)
    })

    it('should handle case when no chat is selected', () => {
      const store = useChatStore()
      const messageStore = useMessageStore()
      
      store.data.forEach(chat => chat.isSelected = false)
      
      store.initializeMessageStore()
      
      expect(store.isInitialized).toBe(true)
      expect(messageStore.currentChat).toBeNull()
    })
  })

  describe('Pin functionality', () => {
    it('should toggle pin status correctly', () => {
      const store = useChatStore()
      const chat = store.data[0]
      const chatId = chat.id!
      
      expect(chat.isPinned).toBe(false)
      expect(chat.pinnedAt).toBeUndefined()
      
      store.togglePin(chatId)
      
      expect(chat.isPinned).toBe(true)
      expect(chat.pinnedAt).toBeDefined()
      
      store.togglePin(chatId)
      
      expect(chat.isPinned).toBe(false)
      expect(chat.pinnedAt).toBeUndefined()
    })

    it('should sort pinned chats before unpinned ones', () => {
      const store = useChatStore()
      const chat1 = store.data[0]
      const chat2 = store.data[1]
      
      chat1.lastMessageTime = Date.now() - 1000
      chat2.lastMessageTime = Date.now()
      
      store.togglePin(chat1.id!)
      
      const sorted = store.filteredData
      expect(sorted[0].id).toBe(chat1.id)
      expect(sorted[0].isPinned).toBe(true)
    })

    it('should sort multiple pinned chats by pinnedAt time in descending order', () => {
      const store = useChatStore()
      const chat1 = store.data[0]
      const chat2 = store.data[1]
      const chat3 = store.data[2]
      
      const baseTime = Date.now()
      
      vi.setSystemTime(baseTime - 3000)
      store.togglePin(chat1.id!)
      
      vi.setSystemTime(baseTime - 1000)
      store.togglePin(chat2.id!)
      
      vi.setSystemTime(baseTime)
      store.togglePin(chat3.id!)
      
      const sorted = store.filteredData
      
      const pinnedChats = sorted.filter(c => c.isPinned)
      expect(pinnedChats.length).toBe(3)
      expect(pinnedChats[0].id).toBe(chat3.id)
      expect(pinnedChats[1].id).toBe(chat2.id)
      expect(pinnedChats[2].id).toBe(chat1.id)
    })
  })

  describe('Unread count functionality', () => {
    it('should increment unread count for non-selected chat', () => {
      const store = useChatStore()
      const chat = store.data[0]
      const chatId = chat.id!
      
      const initialCount = chat.unreadCount || 0
      
      store.incrementUnread(chatId)
      
      expect(chat.unreadCount).toBe(initialCount + 1)
    })

    it('should not increment unread count for selected chat', () => {
      const store = useChatStore()
      const selectedChat = store.getSelectedChat
      
      expect(selectedChat).not.toBeNull()
      
      const initialCount = selectedChat!.unreadCount || 0
      
      store.incrementUnread(selectedChat!.id!)
      
      expect(selectedChat!.unreadCount).toBe(initialCount)
    })

    it('should clear unread count when selecting a chat', () => {
      const store = useChatStore()
      const chat = store.data[0]
      
      chat.unreadCount = 5
      
      store.selectItem(chat)
      
      expect(chat.unreadCount).toBe(0)
    })

    it('should clear unread count for specific chat', () => {
      const store = useChatStore()
      const chat = store.data[0]
      
      chat.unreadCount = 5
      
      store.clearUnread(chat.id!)
      
      expect(chat.unreadCount).toBe(0)
    })

    it('should mark all chats as read', () => {
      const store = useChatStore()
      
      store.data[0].unreadCount = 3
      store.data[1].unreadCount = 5
      store.data[2].unreadCount = 2
      
      store.markAllAsRead()
      
      store.data.forEach(chat => {
        expect(chat.unreadCount).toBe(0)
      })
    })

    it('should calculate total unread count correctly', () => {
      const store = useChatStore()
      
      store.data.forEach(chat => chat.unreadCount = 0)
      
      store.data[0].unreadCount = 3
      store.data[1].unreadCount = 5
      store.data[2].unreadCount = 2
      store.data[3].unreadCount = 0
      
      expect(store.totalUnreadCount).toBe(10)
    })

    it('should detect if there are unread messages', () => {
      const store = useChatStore()
      
      store.data.forEach(chat => chat.unreadCount = 0)
      expect(store.hasUnread).toBe(false)
      
      store.data[0].unreadCount = 1
      expect(store.hasUnread).toBe(true)
    })
  })

  describe('Bug #1: updateLastMessage should trigger resort', () => {
    it('should move chat to top of unpinned chats after updating last message', () => {
      const store = useChatStore()
      const baseTime = Date.now()
      
      // 设置初始时间，确保 chat[5] 时间较旧
      store.data[0].lastMessageTime = baseTime - 5000
      store.data[1].lastMessageTime = baseTime - 4000
      store.data[2].lastMessageTime = baseTime - 3000
      store.data[3].lastMessageTime = baseTime - 2000
      store.data[4].lastMessageTime = baseTime - 1000
      store.data[5].lastMessageTime = baseTime - 6000
      
      const chat5 = store.data[5]
      const chat5Id = chat5.id!
      
      // 更新 chat5 的最后消息时间
      vi.setSystemTime(baseTime)
      store.updateLastMessage(chat5Id, 'New message')
      
      // 验证 chat5 移动到了未置顶列表的最前面
      const unpinnedChats = store.filteredData.filter(c => !c.isPinned)
      expect(unpinnedChats[0].id).toBe(chat5Id)
      expect(unpinnedChats[0].lastMsg).toBe('New message')
    })

    it('should not affect pinned chats order when updating unpinned chat', () => {
      const store = useChatStore()
      const baseTime = Date.now()
      
      // 置顶 chat[0]
      vi.setSystemTime(baseTime - 2000)
      store.togglePin(store.data[0].id!)
      
      // 设置未置顶聊天的时间
      store.data[1].lastMessageTime = baseTime - 3000
      store.data[2].lastMessageTime = baseTime - 4000
      
      // 更新 chat[2] 的消息
      vi.setSystemTime(baseTime)
      store.updateLastMessage(store.data[2].id!, 'New message')
      
      // 验证置顶聊天仍在最前面
      expect(store.filteredData[0].isPinned).toBe(true)
      expect(store.filteredData[0].id).toBe(store.data[0].id)
    })
  })

  describe('Bug #2: selectItem should preserve search by default', () => {
    it('should preserve search keyword when selecting a chat without options', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      expect(store.searchKeyword).toBe('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect)
      
      // 默认不清空搜索
      expect(store.searchKeyword).toBe('聊天对象1')
    })

    it('should clear search keyword when explicitly passing clearSearch: true', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      expect(store.searchKeyword).toBe('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect, { clearSearch: true })
      
      expect(store.searchKeyword).toBe('')
    })

    it('should allow switching between search results without losing search state', () => {
      const store = useChatStore()
      
      // 设置搜索关键词匹配多个结果
      store.data[0].fromName = '项目组A'
      store.data[1].fromName = '项目组B'
      store.data[2].fromName = '其他聊天'
      
      store.setSearchKeyword('项目组')
      expect(store.filteredData.length).toBe(2)
      
      // 选择第一个结果
      store.selectItem(store.data[0])
      expect(store.searchKeyword).toBe('项目组')
      expect(store.filteredData.length).toBe(2)
      
      // 切换到第二个结果
      store.selectItem(store.data[1])
      expect(store.searchKeyword).toBe('项目组')
      expect(store.filteredData.length).toBe(2)
    })
  })
})

