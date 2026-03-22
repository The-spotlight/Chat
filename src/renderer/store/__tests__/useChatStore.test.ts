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
    it('should clear search keyword when selecting a chat', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      expect(store.searchKeyword).toBe('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect)
      
      expect(store.searchKeyword).toBe('')
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

    it('should clear search keyword by default when no options provided', () => {
      const store = useChatStore()
      
      store.setSearchKeyword('聊天对象1')
      
      const chatToSelect = store.data[0]
      store.selectItem(chatToSelect)
      
      expect(store.searchKeyword).toBe('')
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

  describe('Regression Tests', () => {
    describe('Bug #1: Scroll to first unread message when switching chats', () => {
      it('should pass unreadCount to messageStore when selecting a chat', () => {
        const store = useChatStore()
        const messageStore = useMessageStore()
        
        const chat = store.data[0]
        chat.unreadCount = 5
        
        store.selectItem(chat)
        
        expect(messageStore.pendingUnreadCount).toBe(5)
      })

      it('should handle zero unreadCount correctly', () => {
        const store = useChatStore()
        const messageStore = useMessageStore()
        
        const chat = store.data[1]
        chat.unreadCount = 0
        
        store.selectItem(chat)
        
        expect(messageStore.pendingUnreadCount).toBe(0)
      })

      it('should clear unreadCount after selecting chat', () => {
        const store = useChatStore()
        
        const chat = store.data[0]
        chat.unreadCount = 5
        
        store.selectItem(chat)
        
        expect(chat.unreadCount).toBe(0)
      })
    })

    describe('Bug #2: Search with special characters', () => {
      it('should match chat names containing dots', () => {
        const store = useChatStore()
        
        store.data[0].fromName = 'v2.0项目组'
        
        store.setSearchKeyword('v2.0')
        
        expect(store.filteredData.length).toBeGreaterThan(0)
        expect(store.filteredData[0].fromName).toBe('v2.0项目组')
      })

      it('should match chat names containing parentheses', () => {
        const store = useChatStore()
        
        store.data[0].fromName = '项目(测试)组'
        
        store.setSearchKeyword('(测试)')
        
        expect(store.filteredData.length).toBeGreaterThan(0)
        expect(store.filteredData[0].fromName).toBe('项目(测试)组')
      })

      it('should match chat names containing plus signs', () => {
        const store = useChatStore()
        
        store.data[0].fromName = 'C++开发组'
        
        store.setSearchKeyword('C++')
        
        expect(store.filteredData.length).toBeGreaterThan(0)
        expect(store.filteredData[0].fromName).toBe('C++开发组')
      })

      it('should match chat names containing special regex characters', () => {
        const store = useChatStore()
        
        store.data[0].fromName = '项目*测试$组'
        
        store.setSearchKeyword('*测试$')
        
        expect(store.filteredData.length).toBeGreaterThan(0)
        expect(store.filteredData[0].fromName).toBe('项目*测试$组')
      })

      it('should return empty results when no match found', () => {
        const store = useChatStore()
        
        store.data[0].fromName = '正常名称'
        
        store.setSearchKeyword('不存在的关键词')
        
        expect(store.filteredData.length).toBe(0)
      })
    })
  })
})

