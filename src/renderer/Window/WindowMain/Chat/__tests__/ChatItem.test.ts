import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChatItem from '../ChatItem.vue'
import { useChatStore } from '../../../../store/useChatStore'
import { ModelChat } from '../../../../../model/ModelChat'

describe('ChatItem', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  const createTestChat = (overrides: Partial<ModelChat> = {}): ModelChat => {
    const chat = new ModelChat()
    chat.id = 'test-chat-id'
    chat.fromName = 'Test User'
    chat.avatar = 'test-avatar.png'
    chat.lastMsg = 'Last message'
    chat.sendTime = '刚刚'
    chat.unreadCount = 0
    chat.isPinned = false
    return Object.assign(chat, overrides)
  }

  it('should render chat item correctly', () => {
    const chat = createTestChat()
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    expect(wrapper.find('.chatItem').exists()).toBe(true)
    expect(wrapper.find('.fromName').text()).toBe('Test User')
    expect(wrapper.find('.lastMsg').text()).toBe('Last message')
  })

  it('should display unread badge when unreadCount > 0', () => {
    const chat = createTestChat({ unreadCount: 5 })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    const badge = wrapper.find('.unread-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('5')
  })

  it('should not display unread badge when unreadCount is 0', () => {
    const chat = createTestChat({ unreadCount: 0 })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    expect(wrapper.find('.unread-badge').exists()).toBe(false)
  })

  it('should display "99+" when unreadCount > 99', () => {
    const chat = createTestChat({ unreadCount: 100 })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    const badge = wrapper.find('.unread-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('99+')
  })

  it('should display "99+" when unreadCount is exactly 100', () => {
    const chat = createTestChat({ unreadCount: 100 })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    const badge = wrapper.find('.unread-badge')
    expect(badge.text()).toBe('99+')
  })

  it('should display exact number when unreadCount is 99', () => {
    const chat = createTestChat({ unreadCount: 99 })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    const badge = wrapper.find('.unread-badge')
    expect(badge.text()).toBe('99')
  })

  it('should apply wide badge style for two-digit numbers', () => {
    const chat = createTestChat({ unreadCount: 15 })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    const badge = wrapper.find('.unread-badge')
    expect(badge.classes()).toContain('badge-wide')
  })

  it('should not apply wide badge style for single-digit numbers', () => {
    const chat = createTestChat({ unreadCount: 5 })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    const badge = wrapper.find('.unread-badge')
    expect(badge.classes()).not.toContain('badge-wide')
  })

  it('should display pin icon when chat is pinned', () => {
    const chat = createTestChat({ isPinned: true })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    expect(wrapper.find('.pin-icon').exists()).toBe(true)
    expect(wrapper.find('.chatItem').classes()).toContain('chatItemPinned')
  })

  it('should not display pin icon when chat is not pinned', () => {
    const chat = createTestChat({ isPinned: false })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    expect(wrapper.find('.pin-icon').exists()).toBe(false)
    expect(wrapper.find('.chatItem').classes()).not.toContain('chatItemPinned')
  })

  it('should show context menu on right click', async () => {
    const chat = createTestChat()
    const wrapper = mount(ChatItem, {
      props: { data: chat },
      attachTo: document.body
    })

    await wrapper.find('.chatItem').trigger('contextmenu')
    await wrapper.vm.$nextTick()
    
    const contextMenu = document.querySelector('.context-menu')
    expect(contextMenu).not.toBeNull()
  })

  it('should emit click event when chat item is clicked', async () => {
    const chat = createTestChat()
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    const store = useChatStore()
    const selectSpy = vi.spyOn(store, 'selectItem')

    await wrapper.find('.chatItem').trigger('click')

    expect(selectSpy).toHaveBeenCalledWith(chat)
  })

  it('should apply selected class when chat is selected', () => {
    const chat = createTestChat({ isSelected: true })
    const wrapper = mount(ChatItem, {
      props: { data: chat }
    })

    expect(wrapper.find('.chatItem').classes()).toContain('chatItemSelected')
  })
})
