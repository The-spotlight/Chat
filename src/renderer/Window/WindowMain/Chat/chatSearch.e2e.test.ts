import { describe, it, expect, beforeEach } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { ModelChat } from '../../../../model/ModelChat'

// 模拟完整的搜索场景
function useChatSearchScenario(chatData: ModelChat[]) {
  const searchKeyword = ref('')
  const searchHistory = ref<string[]>([])

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

  const isEmptyResult = computed(() => {
    return searchKeyword.value.trim() !== '' && filteredData.value.length === 0
  })

  const onSearch = (keyword: string) => {
    searchKeyword.value = keyword
    if (!keyword) return
    
    // 如果已存在，先移除
    const index = searchHistory.value.indexOf(keyword)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }
    // 添加到最前面
    searchHistory.value.unshift(keyword)
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }
  }

  const clearSearch = () => {
    searchKeyword.value = ''
  }

  const selectChat = (chatId: string) => {
    chatData.forEach(chat => {
      chat.isSelected = chat.id === chatId
    })
  }

  return {
    searchKeyword,
    searchHistory,
    filteredData,
    isEmptyResult,
    onSearch,
    clearSearch,
    selectChat
  }
}

// 创建真实场景数据
function createRealWorldChats(): ModelChat[] {
  const chats: ModelChat[] = []

  const scenarios = [
    { name: '产品经理-张三', msg: '需求文档已更新，请查看' },
    { name: '技术总监-李四', msg: '代码评审通过，可以合并' },
    { name: '前端开发群', msg: '王五: 组件库升级完成' },
    { name: '客户-ABC公司', msg: '合同已经签字回传' },
    { name: 'HR-招聘', msg: '面试安排在明天下午2点' },
    { name: '财务-报销', msg: '上月的报销已到账' },
    { name: '运维告警', msg: '服务器CPU使用率超过90%' },
    { name: '家人群', msg: '妈妈: 周末回家吃饭吗' },
    { name: '朋友-小明', msg: '周末打球去吗' },
    { name: '快递通知', msg: '您的快递已到达菜鸟驿站' }
  ]

  scenarios.forEach((scenario, index) => {
    const chat = new ModelChat()
    chat.id = `chat-${index}`
    chat.fromName = scenario.name
    chat.lastMsg = scenario.msg
    chat.isSelected = index === 0
    chats.push(chat)
  })

  return chats
}

describe('聊天搜索端到端场景测试', () => {
  describe('用户场景：快速查找工作相关会话', () => {
    it('用户搜索"产品"应找到产品经理和相关群聊', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData } = useChatSearchScenario(chats)

      onSearch('产品')
      await nextTick()

      expect(filteredData.value.length).toBe(1)
      expect(filteredData.value[0].fromName).toContain('产品经理')
    })

    it('用户搜索"代码"应找到技术相关会话', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData } = useChatSearchScenario(chats)

      onSearch('代码')
      await nextTick()

      expect(filteredData.value.length).toBe(1)
      expect(filteredData.value[0].fromName).toBe('技术总监-李四')
    })

    it('用户搜索"周末"应找到家人和朋友的消息', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData } = useChatSearchScenario(chats)

      onSearch('周末')
      await nextTick()

      expect(filteredData.value.length).toBe(2)
      const names = filteredData.value.map(c => c.fromName)
      expect(names).toContain('家人群')
      expect(names).toContain('朋友-小明')
    })
  })

  describe('用户场景：搜索历史记录', () => {
    it('应记录用户的搜索历史', async () => {
      const chats = createRealWorldChats()
      const { onSearch, searchHistory } = useChatSearchScenario(chats)

      onSearch('产品')
      onSearch('代码')
      onSearch('周末')

      expect(searchHistory.value).toEqual(['周末', '代码', '产品'])
    })

    it('重复搜索不应重复添加到历史', async () => {
      const chats = createRealWorldChats()
      const { onSearch, searchHistory } = useChatSearchScenario(chats)

      onSearch('产品')
      onSearch('代码')
      onSearch('产品')

      // 重复搜索会将该词移到最前面
      expect(searchHistory.value).toEqual(['产品', '代码'])
    })

    it('搜索历史应限制为最近10条', async () => {
      const chats = createRealWorldChats()
      const { onSearch, searchHistory } = useChatSearchScenario(chats)

      for (let i = 0; i < 15; i++) {
        onSearch(`搜索词${i}`)
      }

      expect(searchHistory.value.length).toBe(10)
      expect(searchHistory.value[0]).toBe('搜索词14')
    })
  })

  describe('用户场景：搜索后选择会话', () => {
    it('用户搜索后点击会话应保持选中状态', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData, selectChat, clearSearch } = useChatSearchScenario(chats)

      // 搜索过滤
      onSearch('产品')
      await nextTick()

      // 选择会话
      const targetChat = filteredData.value[0]
      selectChat(targetChat.id)

      expect(targetChat.isSelected).toBe(true)

      // 清空搜索
      clearSearch()
      await nextTick()

      // 选中状态应保持
      expect(targetChat.isSelected).toBe(true)
    })

    it('切换选中会话应更新状态', async () => {
      const chats = createRealWorldChats()
      const { selectChat } = useChatSearchScenario(chats)

      selectChat('chat-1')
      expect(chats[0].isSelected).toBe(false)
      expect(chats[1].isSelected).toBe(true)

      selectChat('chat-2')
      expect(chats[1].isSelected).toBe(false)
      expect(chats[2].isSelected).toBe(true)
    })
  })

  describe('用户场景：复杂搜索流程', () => {
    it('用户连续搜索不同关键词的流程', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData, isEmptyResult, clearSearch } = useChatSearchScenario(chats)

      // 第一步：搜索"服务器"
      onSearch('服务器')
      await nextTick()
      expect(filteredData.value.length).toBe(1)
      expect(filteredData.value[0].fromName).toBe('运维告警')

      // 第二步：修改为搜索"合同"
      onSearch('合同')
      await nextTick()
      expect(filteredData.value.length).toBe(1)
      expect(filteredData.value[0].fromName).toBe('客户-ABC公司')

      // 第三步：搜索不存在的内容
      onSearch('xyz123')
      await nextTick()
      expect(isEmptyResult.value).toBe(true)
      expect(filteredData.value.length).toBe(0)

      // 第四步：清空搜索
      clearSearch()
      await nextTick()
      expect(filteredData.value.length).toBe(10)
      expect(isEmptyResult.value).toBe(false)
    })

    it('用户快速输入时的防抖场景', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData } = useChatSearchScenario(chats)

      // 模拟快速连续输入
      onSearch('产')
      onSearch('产品')
      onSearch('产品经理')

      // 最终结果应正确
      expect(filteredData.value.length).toBe(1)
      expect(filteredData.value[0].fromName).toContain('产品经理')
    })
  })

  describe('边界场景', () => {
    it('特殊字符搜索', async () => {
      const chats = createRealWorldChats()
      chats[0].lastMsg = '价格：¥1000 [特价]'
      const { onSearch, filteredData } = useChatSearchScenario(chats)

      onSearch('¥1000')
      await nextTick()

      expect(filteredData.value.length).toBe(1)
    })

    it('中文拼音混合搜索', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData } = useChatSearchScenario(chats)

      // 搜索中文
      onSearch('zhangsan')
      await nextTick()
      expect(filteredData.value.length).toBe(0)

      // 搜索正确的汉字
      onSearch('张三')
      await nextTick()
      expect(filteredData.value.length).toBe(1)
    })

    it('超长搜索关键词', async () => {
      const chats = createRealWorldChats()
      const { onSearch, filteredData, isEmptyResult } = useChatSearchScenario(chats)

      const longKeyword = '这是一个非常长的搜索关键词'.repeat(10)
      onSearch(longKeyword)
      await nextTick()

      expect(isEmptyResult.value).toBe(true)
      expect(filteredData.value.length).toBe(0)
    })
  })
})
