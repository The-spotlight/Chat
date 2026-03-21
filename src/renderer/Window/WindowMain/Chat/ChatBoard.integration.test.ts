import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChatBoard from './ChatBoard.vue'
import { useChatStore } from '../../../store/useChatStore'
import { ModelChat } from '../../../../model/ModelChat'

// 创建模拟数据
function createMockChats(count: number): ModelChat[] {
  const chats: ModelChat[] = []
  for (let i = 0; i < count; i++) {
    const chat = new ModelChat()
    chat.id = `chat-${i}`
    chat.fromName = `用户${i}`
    chat.lastMsg = `这是最后一条消息内容${i}`
    chat.isSelected = i === 0
    chat.avatar = 'https://example.com/avatar.jpg'
    chats.push(chat)
  }
  return chats
}

describe('ChatBoard 集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应正确渲染搜索框和聊天列表', () => {
    const store = useChatStore()
    store.data = createMockChats(3)

    const wrapper = mount(ChatBoard)

    expect(wrapper.find('.chatSearch').exists()).toBe(true)
    expect(wrapper.findAll('.chatItem')).toHaveLength(3)
  })

  it('搜索时应实时过滤聊天列表', async () => {
    const store = useChatStore()
    store.data = createMockChats(5)
    store.data[0].fromName = '张三'
    store.data[1].fromName = '张三丰'
    store.data[2].fromName = '李四'

    const wrapper = mount(ChatBoard)

    // 初始显示全部
    expect(wrapper.findAll('.chatItem')).toHaveLength(5)

    // 输入搜索关键词
    const inputBox = wrapper.find('.inputBox')
    inputBox.element.textContent = '张三'
    await inputBox.trigger('input')
    await flushPromises()

    // 应该只显示匹配的项目
    const items = wrapper.findAll('.chatItem')
    expect(items).toHaveLength(2)
    expect(items[0].find('.fromName').text()).toContain('张三')
    expect(items[1].find('.fromName').text()).toContain('张三丰')
  })

  it('搜索无结果时应显示空提示', async () => {
    const store = useChatStore()
    store.data = createMockChats(3)

    const wrapper = mount(ChatBoard)

    const inputBox = wrapper.find('.inputBox')
    inputBox.element.textContent = '不存在的用户'
    await inputBox.trigger('input')
    await flushPromises()

    expect(wrapper.find('.emptyTip').exists()).toBe(true)
    expect(wrapper.find('.emptyTip').text()).toBe('暂无匹配会话')
    expect(wrapper.findAll('.chatItem')).toHaveLength(0)
  })

  it('清空搜索时应恢复显示全部列表', async () => {
    const store = useChatStore()
    store.data = createMockChats(5)

    const wrapper = mount(ChatBoard)

    const inputBox = wrapper.find('.inputBox')

    // 先搜索
    inputBox.element.textContent = '用户1'
    await inputBox.trigger('input')
    await flushPromises()
    expect(wrapper.findAll('.chatItem')).toHaveLength(1)

    // 清空搜索
    inputBox.element.textContent = ''
    await inputBox.trigger('input')
    await flushPromises()

    expect(wrapper.findAll('.chatItem')).toHaveLength(5)
    expect(wrapper.find('.emptyTip').exists()).toBe(false)
  })

  it('搜索过程中应保持选中状态', async () => {
    const store = useChatStore()
    store.data = createMockChats(5)
    store.data[2].fromName = '特殊用户'
    store.data[2].isSelected = true

    const wrapper = mount(ChatBoard)

    // 搜索包含选中项的关键词
    const inputBox = wrapper.find('.inputBox')
    inputBox.element.textContent = '特殊用户'
    await inputBox.trigger('input')
    await flushPromises()

    const selectedItem = wrapper.find('.chatItemSelected')
    expect(selectedItem.exists()).toBe(true)
    expect(selectedItem.find('.fromName').text()).toBe('特殊用户')
  })

  it('应支持按消息内容搜索', async () => {
    const store = useChatStore()
    store.data = createMockChats(5)
    store.data[1].lastMsg = '重要的会议通知'
    store.data[3].lastMsg = '会议改期了'

    const wrapper = mount(ChatBoard)

    const inputBox = wrapper.find('.inputBox')
    inputBox.element.textContent = '会议'
    await inputBox.trigger('input')
    await flushPromises()

    const items = wrapper.findAll('.chatItem')
    expect(items).toHaveLength(2)
  })

  it('搜索应不区分大小写', async () => {
    const store = useChatStore()
    store.data = createMockChats(3)
    store.data[0].fromName = 'ZhangSan'

    const wrapper = mount(ChatBoard)

    const inputBox = wrapper.find('.inputBox')
    inputBox.element.textContent = 'zhangsan'
    await inputBox.trigger('input')
    await flushPromises()

    expect(wrapper.findAll('.chatItem')).toHaveLength(1)
  })
})
