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
})
