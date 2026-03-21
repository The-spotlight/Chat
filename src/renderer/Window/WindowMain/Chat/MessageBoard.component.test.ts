import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MessageBoard from './MessageBoard.vue'
import { useMessageStore } from '../../../store/useMessageStore'
import { useChatStore } from '../../../store/useChatStore'
import { ModelChat } from '../../../../model/ModelChat'

// Mock Electron API
vi.mock('electron', () => ({
  ipcRenderer: {
    on: vi.fn(),
    off: vi.fn(),
    invoke: vi.fn()
  }
}))

describe('MessageBoard 组件', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('应正确渲染消息列表和输入区域', () => {
    const wrapper = mount(MessageBoard)
    
    expect(wrapper.find('.messageList').exists()).toBe(true)
    expect(wrapper.find('.inputArea').exists()).toBe(true)
    expect(wrapper.find('.messageInput').exists()).toBe(true)
    expect(wrapper.find('.sendBtn').exists()).toBe(true)
  })

  it('无选中会话时输入框应禁用并显示提示', () => {
    const chatStore = useChatStore()
    // 确保没有选中任何会话
    chatStore.data = []

    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')

    // 检查 disabled 属性是否存在
    expect(input.element.disabled).toBe(true)
    expect(input.attributes('placeholder')).toBe('请选择一个聊天会话')
  })

  it('有选中会话时输入框应启用', () => {
    const chatStore = useChatStore()
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    
    expect(input.attributes('disabled')).toBeUndefined()
    expect(input.attributes('placeholder')).toBe('请输入消息...')
  })

  it('输入内容后发送按钮应启用', async () => {
    const chatStore = useChatStore()
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    const sendBtn = wrapper.find('.sendBtn')
    
    // 初始状态：按钮禁用
    expect(sendBtn.classes()).toContain('disabled')
    expect(sendBtn.attributes('disabled')).toBeDefined()
    
    // 输入内容
    await input.setValue('测试消息')
    
    // 按钮应启用
    expect(sendBtn.classes()).not.toContain('disabled')
    expect(sendBtn.attributes('disabled')).toBeUndefined()
  })

  it('点击发送按钮应发送消息并清空输入框', async () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    messageStore.initData(chat)
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    const sendBtn = wrapper.find('.sendBtn')
    
    // 输入并发送
    await input.setValue('测试消息内容')
    await sendBtn.trigger('click')
    await flushPromises()
    
    // 验证消息已添加到 store
    const lastMessage = messageStore.data[messageStore.data.length - 1]
    expect(lastMessage.messageContent).toBe('测试消息内容')
    expect(lastMessage.isInMsg).toBe(false)
    expect(lastMessage.fromName).toBe('我')
    
    // 输入框应清空
    expect((input.element as HTMLTextAreaElement).value).toBe('')
  })

  it('按 Enter 键应发送消息', async () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    messageStore.initData(chat)
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    
    // 输入并按 Enter
    await input.setValue('Enter发送测试')
    await input.trigger('keydown', { key: 'Enter', shiftKey: false })
    await flushPromises()
    
    // 验证消息已发送
    const lastMessage = messageStore.data[messageStore.data.length - 1]
    expect(lastMessage.messageContent).toBe('Enter发送测试')
  })

  it('Shift+Enter 应换行而不发送', async () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    messageStore.initData(chat)
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    
    const initialLength = messageStore.data.length
    
    // 输入并按 Shift+Enter
    await input.setValue('换行测试')
    await input.trigger('keydown', { key: 'Enter', shiftKey: true })
    await flushPromises()
    
    // 消息列表不应增加
    expect(messageStore.data.length).toBe(initialLength)
  })

  it('输入仅包含空格时不应发送', async () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    messageStore.initData(chat)
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    const sendBtn = wrapper.find('.sendBtn')
    
    const initialLength = messageStore.data.length
    
    // 输入空格
    await input.setValue('   ')
    await sendBtn.trigger('click')
    await flushPromises()
    
    // 消息列表不应增加
    expect(messageStore.data.length).toBe(initialLength)
    expect(sendBtn.classes()).toContain('disabled')
  })

  it('输入仅包含换行时不应发送', async () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    messageStore.initData(chat)
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    
    const initialLength = messageStore.data.length
    
    // 输入换行
    await input.setValue('\n\n\n')
    await input.trigger('keydown', { key: 'Enter', shiftKey: false })
    await flushPromises()
    
    // 消息列表不应增加
    expect(messageStore.data.length).toBe(initialLength)
  })

  it('发送消息后应更新会话的最后消息和时间', async () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    
    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.lastMsg = '旧消息'
    chat.sendTime = '昨天'
    chat.isSelected = true
    chatStore.data = [chat]
    messageStore.initData(chat)
    
    const wrapper = mount(MessageBoard)
    const input = wrapper.find('.messageInput')
    const sendBtn = wrapper.find('.sendBtn')
    
    // 发送消息
    await input.setValue('新消息内容')
    await sendBtn.trigger('click')
    await flushPromises()
    
    // 验证会话信息已更新
    expect(chat.lastMsg).toBe('新消息内容')
    expect(chat.sendTime).toBe('刚刚')
  })

  it('发送消息后输入框应保持焦点', async () => {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()

    const chat = new ModelChat()
    chat.id = 'chat-1'
    chat.fromName = '测试用户'
    chat.isSelected = true
    chatStore.data = [chat]
    messageStore.initData(chat)

    const wrapper = mount(MessageBoard, { attachTo: document.body })
    const input = wrapper.find('.messageInput')

    // 聚焦输入框
    await input.element.focus()

    // 发送消息
    await input.setValue('测试消息')
    await wrapper.find('.sendBtn').trigger('click')
    await flushPromises()

    // 验证输入框仍保持焦点
    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })
})
