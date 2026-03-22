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

  // ========== 置顶功能测试 ==========
  describe('Pin functionality', () => {
    it('should toggle pin status', () => {
      const store = useChatStore()
      const chat = store.data[0]
      const chatId = chat.id!

      expect(chat.isPinned).toBe(false)
      expect(chat.pinnedTime).toBeUndefined()

      store.togglePin(chatId)

      expect(chat.isPinned).toBe(true)
      expect(chat.pinnedTime).toBeDefined()
      expect(typeof chat.pinnedTime).toBe('number')

      store.togglePin(chatId)

      expect(chat.isPinned).toBe(false)
      expect(chat.pinnedTime).toBeUndefined()
    })

    it('should sort pinned chats before unpinned chats', () => {
      const store = useChatStore()
      const chat1 = store.data[0]
      const chat2 = store.data[1]
      const chat3 = store.data[2]

      // 设置不同的时间戳确保排序稳定
      store.togglePin(chat2.id!)
      store.data.find(c => c.id === chat2.id)!.pinnedTime = Date.now() - 1000

      store.togglePin(chat3.id!)
      store.data.find(c => c.id === chat3.id)!.pinnedTime = Date.now()

      const sorted = store.sortedData
      // chat3 时间戳更大，应该排在前面
      expect(sorted[0].id).toBe(chat3.id)
      expect(sorted[1].id).toBe(chat2.id)
      expect(sorted[0].isPinned).toBe(true)
      expect(sorted[1].isPinned).toBe(true)
    })

    it('should sort pinned chats by pinnedTime in descending order', () => {
      const store = useChatStore()
      const chat1 = store.data[0]
      const chat2 = store.data[1]

      store.togglePin(chat1.id!)
      // 等待一小段时间确保时间戳不同
      const firstPinTime = Date.now()
      store.data.find(c => c.id === chat1.id)!.pinnedTime = firstPinTime

      store.togglePin(chat2.id!)
      const secondPinTime = firstPinTime + 1000
      store.data.find(c => c.id === chat2.id)!.pinnedTime = secondPinTime

      const sorted = store.sortedData
      const pinnedChats = sorted.filter(c => c.isPinned)
      expect(pinnedChats[0].id).toBe(chat2.id)
      expect(pinnedChats[1].id).toBe(chat1.id)
    })

    it('should not throw when toggling pin for non-existent chat', () => {
      const store = useChatStore()
      expect(() => store.togglePin('non-existent-id')).not.toThrow()
    })
  })

  // ========== 未读计数功能测试 ==========
  describe('Unread count functionality', () => {
    it('should increment unread count for non-selected chat', () => {
      const store = useChatStore()
      const chat = store.data[0]
      const chatId = chat.id!

      expect(chat.unreadCount).toBe(0)

      store.incrementUnread(chatId)

      expect(chat.unreadCount).toBe(1)

      store.incrementUnread(chatId)
      store.incrementUnread(chatId)

      expect(chat.unreadCount).toBe(3)
    })

    it('should not increment unread count for selected chat', () => {
      const store = useChatStore()
      const selectedChat = store.data.find(c => c.isSelected)!

      expect(selectedChat.unreadCount).toBe(0)

      store.incrementUnread(selectedChat.id!)

      expect(selectedChat.unreadCount).toBe(0)
    })

    it('should clear unread count', () => {
      const store = useChatStore()
      const chat = store.data[0]
      const chatId = chat.id!

      store.incrementUnread(chatId)
      store.incrementUnread(chatId)
      expect(chat.unreadCount).toBe(2)

      store.clearUnread(chatId)

      expect(chat.unreadCount).toBe(0)
    })

    it('should clear unread count when selecting a chat', () => {
      const store = useChatStore()
      const chat = store.data[0]
      const chatId = chat.id!

      store.incrementUnread(chatId)
      store.incrementUnread(chatId)
      expect(chat.unreadCount).toBe(2)

      store.selectItem(chat)

      expect(chat.unreadCount).toBe(0)
      expect(chat.isSelected).toBe(true)
    })

    it('should mark all as read', () => {
      const store = useChatStore()

      store.data.forEach(chat => {
        if (!chat.isSelected) {
          store.incrementUnread(chat.id!)
          store.incrementUnread(chat.id!)
        }
      })

      expect(store.totalUnreadCount).toBeGreaterThan(0)

      store.markAllAsRead()

      store.data.forEach(chat => {
        expect(chat.unreadCount).toBe(0)
      })
      expect(store.totalUnreadCount).toBe(0)
      expect(store.hasUnreadMessages).toBe(false)
    })

    it('should calculate total unread count correctly', () => {
      const store = useChatStore()

      store.data[0].unreadCount = 5
      store.data[1].unreadCount = 3
      store.data[2].unreadCount = 10

      expect(store.totalUnreadCount).toBe(18)
      expect(store.hasUnreadMessages).toBe(true)
    })

    it('should return correct unread display text', () => {
      const store = useChatStore()

      expect(store.getUnreadDisplay(0)).toBe('')
      expect(store.getUnreadDisplay(1)).toBe('1')
      expect(store.getUnreadDisplay(5)).toBe('5')
      expect(store.getUnreadDisplay(99)).toBe('99')
      expect(store.getUnreadDisplay(100)).toBe('99+')
      expect(store.getUnreadDisplay(999)).toBe('99+')
    })

    it('should not throw when clearing unread for non-existent chat', () => {
      const store = useChatStore()
      expect(() => store.clearUnread('non-existent-id')).not.toThrow()
    })

    it('should not throw when incrementing unread for non-existent chat', () => {
      const store = useChatStore()
      expect(() => store.incrementUnread('non-existent-id')).not.toThrow()
    })
  })

  // ========== 排序功能测试 ==========
  describe('Sorting functionality', () => {
    it('should maintain sorted order in filteredData', () => {
      const store = useChatStore()
      
      // 置顶部分会话
      store.togglePin(store.data[5].id!)
      store.togglePin(store.data[3].id!)

      const filtered = store.filteredData
      const pinnedCount = filtered.filter(c => c.isPinned).length
      
      // 确保所有置顶会话都在前面
      for (let i = 0; i < pinnedCount; i++) {
        expect(filtered[i].isPinned).toBe(true)
      }
      
      // 确保未置顶会话都在后面
      for (let i = pinnedCount; i < filtered.length; i++) {
        expect(filtered[i].isPinned).toBe(false)
      }
    })
  })
})
