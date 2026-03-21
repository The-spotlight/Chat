import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMessageStore } from '../useMessageStore'
import { ModelChat } from '../../../model/ModelChat'
import { ModelMessage } from '../../../model/ModelMessage'

describe('useMessageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty data', () => {
    const store = useMessageStore()
    expect(store.data).toEqual([])
    expect(store.currentChat).toBeNull()
    expect(store.currentQuote).toBeNull()
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

  // Quote functionality tests
  it('should set quote correctly when calling setQuote', () => {
    const store = useMessageStore()
    const message = new ModelMessage()
    message.id = 'test-message-id'
    message.fromName = 'Test User'
    message.messageContent = 'This is a test message to quote'

    store.setQuote(message)

    expect(store.currentQuote).not.toBeNull()
    expect(store.currentQuote?.messageId).toBe('test-message-id')
    expect(store.currentQuote?.fromName).toBe('Test User')
    expect(store.currentQuote?.content).toBe('This is a test message to quote')
  })

  it('should not set quote when message is missing required fields', () => {
    const store = useMessageStore()
    const message = new ModelMessage()
    // Missing id, fromName, and messageContent

    store.setQuote(message)

    expect(store.currentQuote).toBeNull()
  })

  it('should clear quote correctly when calling clearQuote', () => {
    const store = useMessageStore()
    const message = new ModelMessage()
    message.id = 'test-message-id'
    message.fromName = 'Test User'
    message.messageContent = 'This is a test message to quote'

    store.setQuote(message)
    expect(store.currentQuote).not.toBeNull()

    store.clearQuote()
    expect(store.currentQuote).toBeNull()
  })

  it('should include quote information when sending a message with quote', () => {
    const store = useMessageStore()
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'

    store.initData(chat)

    // Set a quote
    const quotedMessage = new ModelMessage()
    quotedMessage.id = 'quoted-message-id'
    quotedMessage.fromName = 'Quoted User'
    quotedMessage.messageContent = 'This is the quoted message'
    store.setQuote(quotedMessage)

    // Send a message with quote
    store.sendMessage('This is a reply to the quoted message')

    const newMessage = store.data[store.data.length - 1]
    expect(newMessage.quote).not.toBeNull()
    expect(newMessage.quote?.messageId).toBe('quoted-message-id')
    expect(newMessage.quote?.fromName).toBe('Quoted User')
    expect(newMessage.quote?.content).toBe('This is the quoted message')
  })

  it('should clear quote after sending a message with quote', () => {
    const store = useMessageStore()
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'

    store.initData(chat)

    // Set a quote
    const quotedMessage = new ModelMessage()
    quotedMessage.id = 'quoted-message-id'
    quotedMessage.fromName = 'Quoted User'
    quotedMessage.messageContent = 'This is the quoted message'
    store.setQuote(quotedMessage)
    expect(store.currentQuote).not.toBeNull()

    // Send a message with quote
    store.sendMessage('This is a reply')

    // Quote should be cleared after sending
    expect(store.currentQuote).toBeNull()
  })

  it('should not include quote when sending messages without quote', () => {
    const store = useMessageStore()
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'

    store.initData(chat)
    store.sendMessage('This is a normal message without quote')

    const newMessage = store.data[store.data.length - 1]
    expect(newMessage.quote).toBeUndefined()
  })
})
