import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessageStore } from '../useMessageStore'
import { ModelChat } from '../../../model/ModelChat'

describe('useMessageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty data', () => {
    const store = useMessageStore()
    expect(store.data).toEqual([])
    expect(store.currentChat).toBeNull()
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
})
