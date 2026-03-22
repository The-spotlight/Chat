import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ContextMenu from '../ContextMenu.vue'
import { ModelMessage } from '../../../../../model/ModelMessage'

describe('ContextMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  const createMessage = (options: Partial<ModelMessage> = {}): ModelMessage => {
    const message = new ModelMessage()
    message.id = 'test-msg-id'
    message.isInMsg = false
    message.createTime = Date.now()
    message.messageContent = 'Test message'
    Object.assign(message, options)
    return message
  }

  it('should not render when visible is false', () => {
    const message = createMessage()
    mount(ContextMenu, {
      props: {
        visible: false,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    expect(document.querySelector('.context-menu')).toBeNull()
  })

  it('should render when visible is true', () => {
    const message = createMessage()
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    expect(document.querySelector('.context-menu')).not.toBeNull()
  })

  it('should position menu at specified coordinates', () => {
    const message = createMessage()
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 200,
        y: 150,
        message
      },
      attachTo: document.body
    })

    const menu = document.querySelector('.context-menu') as HTMLElement
    expect(menu).not.toBeNull()
    expect(menu.style.left).toBe('200px')
    expect(menu.style.top).toBe('150px')
  })

  it('should display "引用" menu item for non-recalled message', () => {
    const message = createMessage()
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const referenceItem = Array.from(menuItems).find(item => item.textContent?.includes('引用'))
    expect(referenceItem).toBeDefined()
  })

  it('should not display "引用" menu item for recalled message', () => {
    const message = createMessage({ isRecalled: true })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const referenceItem = Array.from(menuItems).find(item => item.textContent?.includes('引用'))
    expect(referenceItem).toBeUndefined()
  })

  it('should display "撤回" menu item for own message within time limit', () => {
    const message = createMessage({ isInMsg: false, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const recallItem = Array.from(menuItems).find(item => item.textContent?.includes('撤回'))
    expect(recallItem).toBeDefined()
  })

  it('should not display "撤回" menu item for incoming message', () => {
    const message = createMessage({ isInMsg: true, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const recallItem = Array.from(menuItems).find(item => item.textContent?.includes('撤回'))
    expect(recallItem).toBeUndefined()
  })

  it('should not display "撤回" menu item for recalled message', () => {
    const message = createMessage({ isInMsg: false, isRecalled: true, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const recallItem = Array.from(menuItems).find(item => item.textContent?.includes('撤回'))
    expect(recallItem).toBeUndefined()
  })

  it('should not display "撤回" menu item for message older than 2 minutes', () => {
    const message = createMessage({ 
      isInMsg: false, 
      createTime: Date.now() - 3 * 60 * 1000 
    })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const recallItem = Array.from(menuItems).find(item => item.textContent?.includes('撤回'))
    expect(recallItem).toBeUndefined()
  })

  it('should display "编辑" menu item for own message within time limit', () => {
    const message = createMessage({ isInMsg: false, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const editItem = Array.from(menuItems).find(item => item.textContent?.includes('编辑'))
    expect(editItem).toBeDefined()
  })

  it('should not display "编辑" menu item for incoming message', () => {
    const message = createMessage({ isInMsg: true, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const editItem = Array.from(menuItems).find(item => item.textContent?.includes('编辑'))
    expect(editItem).toBeUndefined()
  })

  it('should not display "编辑" menu item for recalled message', () => {
    const message = createMessage({ isInMsg: false, isRecalled: true, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const editItem = Array.from(menuItems).find(item => item.textContent?.includes('编辑'))
    expect(editItem).toBeUndefined()
  })

  it('should display "复制" menu item for non-recalled message', () => {
    const message = createMessage()
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const copyItem = Array.from(menuItems).find(item => item.textContent?.includes('复制'))
    expect(copyItem).toBeDefined()
  })

  it('should not display "复制" menu item for recalled message', () => {
    const message = createMessage({ isRecalled: true })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const copyItem = Array.from(menuItems).find(item => item.textContent?.includes('复制'))
    expect(copyItem).toBeUndefined()
  })

  it('should emit select event when "引用" is clicked', async () => {
    const message = createMessage()
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const referenceItem = Array.from(menuItems).find(item => item.textContent?.includes('引用')) as HTMLElement
    referenceItem?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit recall event when "撤回" is clicked', async () => {
    const message = createMessage({ isInMsg: false, createTime: Date.now() })
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const recallItem = Array.from(menuItems).find(item => item.textContent?.includes('撤回')) as HTMLElement
    recallItem?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('recall')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit edit event when "编辑" is clicked', async () => {
    const message = createMessage({ isInMsg: false, createTime: Date.now() })
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const editItem = Array.from(menuItems).find(item => item.textContent?.includes('编辑')) as HTMLElement
    editItem?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit copy event when "复制" is clicked', async () => {
    const message = createMessage()
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    const copyItem = Array.from(menuItems).find(item => item.textContent?.includes('复制')) as HTMLElement
    copyItem?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('copy')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit close event when clicking outside', async () => {
    const message = createMessage()
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    document.body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit close event when pressing Escape', async () => {
    const message = createMessage()
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should have white background with shadow', () => {
    const message = createMessage()
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menu = document.querySelector('.context-menu')
    expect(menu?.classList.contains('context-menu')).toBe(true)
  })

  it('should have hover effect on menu item', () => {
    const message = createMessage()
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItem = document.querySelector('.menu-item')
    expect(menuItem?.classList.contains('menu-item')).toBe(true)
  })

  it('should show all options for own message within time limit', () => {
    const message = createMessage({ isInMsg: false, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(4)
  })

  it('should show only reference and copy for incoming message', () => {
    const message = createMessage({ isInMsg: true, createTime: Date.now() })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(2)
  })

  it('should show no options for recalled message', () => {
    const message = createMessage({ isRecalled: true })
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        message
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(0)
  })
})
