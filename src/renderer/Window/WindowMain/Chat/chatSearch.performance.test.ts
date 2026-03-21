import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { ModelChat } from '../../../../model/ModelChat'

// 模拟搜索过滤逻辑
function useChatSearch(chatData: ModelChat[]) {
  const searchKeyword = ref('')

  const filteredData = computed(() => {
    const keyword = searchKeyword.value.toLowerCase().trim()
    if (!keyword) {
      return chatData
    }
    return chatData.filter(item => {
      const fromName = item.fromName?.toLowerCase() || ''
      const lastMsg = item.lastMsg?.toLowerCase() || ''
      return fromName.includes(keyword) || lastMsg.includes(keyword)
    })
  })

  const onSearch = (keyword: string) => {
    searchKeyword.value = keyword
  }

  return {
    searchKeyword,
    filteredData,
    onSearch
  }
}

// 创建大量模拟数据
function createLargeMockChats(count: number): ModelChat[] {
  const chats: ModelChat[] = []
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const messages = [
    '你好，在吗？',
    '明天开会讨论项目进度',
    '收到，谢谢',
    '这个方案怎么样？',
    '周末有空一起吃饭吗',
    '文件已经发给你了',
    '请查收邮件',
    '会议改期到下午三点',
    '好的，没问题',
    '稍等一下，我正在处理'
  ]

  for (let i = 0; i < count; i++) {
    const chat = new ModelChat()
    chat.id = `chat-${i}`
    chat.fromName = `${names[i % names.length]}${Math.floor(i / names.length)}`
    chat.lastMsg = messages[i % messages.length] + ` - ${i}`
    chat.isSelected = i === 0
    chats.push(chat)
  }
  return chats
}

describe('聊天列表搜索性能测试', () => {
  it('100 条数据搜索应在 10ms 内完成', () => {
    const mockChats = createLargeMockChats(100)
    const { onSearch, filteredData } = useChatSearch(mockChats)

    const start = performance.now()
    onSearch('张三')
    // 触发 computed 计算
    const result = filteredData.value
    const end = performance.now()

    expect(end - start).toBeLessThan(10)
    expect(result.length).toBeGreaterThan(0)
  })

  it('1000 条数据搜索应在 50ms 内完成', () => {
    const mockChats = createLargeMockChats(1000)
    const { onSearch, filteredData } = useChatSearch(mockChats)

    const start = performance.now()
    onSearch('开会')
    const result = filteredData.value
    const end = performance.now()

    expect(end - start).toBeLessThan(50)
    expect(result.length).toBeGreaterThan(0)
  })

  it('5000 条数据搜索应在 100ms 内完成', () => {
    const mockChats = createLargeMockChats(5000)
    const { onSearch, filteredData } = useChatSearch(mockChats)

    const start = performance.now()
    onSearch('文件')
    const result = filteredData.value
    const end = performance.now()

    expect(end - start).toBeLessThan(100)
    expect(result.length).toBeGreaterThan(0)
  })

  it('连续多次搜索应保持性能稳定', () => {
    const mockChats = createLargeMockChats(1000)
    const { onSearch, filteredData } = useChatSearch(mockChats)

    const times: number[] = []

    for (let i = 0; i < 10; i++) {
      const start = performance.now()
      onSearch(`搜索词${i}`)
      const result = filteredData.value
      const end = performance.now()
      times.push(end - start)
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    expect(avgTime).toBeLessThan(50)
  })

  it('空关键词搜索应快速返回全部数据', () => {
    const mockChats = createLargeMockChats(5000)
    const { onSearch, filteredData } = useChatSearch(mockChats)

    const start = performance.now()
    onSearch('')
    const result = filteredData.value
    const end = performance.now()

    expect(end - start).toBeLessThan(5)
    expect(result.length).toBe(5000)
  })

  it('无匹配结果的搜索应快速返回空数组', () => {
    const mockChats = createLargeMockChats(5000)
    const { onSearch, filteredData } = useChatSearch(mockChats)

    const start = performance.now()
    onSearch('完全不存在的搜索词xyz123')
    const result = filteredData.value
    const end = performance.now()

    expect(end - start).toBeLessThan(100)
    expect(result.length).toBe(0)
  })
})
