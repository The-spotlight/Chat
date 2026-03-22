import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ContextMenu, { ContextMenuItem } from '../ContextMenu.vue'

describe('ContextMenu', () => {
  const testItems: ContextMenuItem[] = [
    { id: 'quote', label: '引用', icon: '↩' },
    { id: 'copy', label: '复制', icon: '📋' },
    { id: 'divider', label: '', divider: true },
    { id: 'edit', label: '编辑', icon: '✏️' },
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should not render when visible is false', () => {
    mount(ContextMenu, {
      props: {
        visible: false,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    expect(document.querySelector('.context-menu')).toBeNull()
  })

  it('should not render when items is empty', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: []
      },
      attachTo: document.body
    })

    expect(document.querySelector('.context-menu')).toBeNull()
  })

  it('should render when visible is true and items are provided', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    expect(document.querySelector('.context-menu')).not.toBeNull()
  })

  it('should position menu at specified coordinates', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 200,
        y: 150,
        items: testItems
      },
      attachTo: document.body
    })

    const menu = document.querySelector('.context-menu') as HTMLElement
    expect(menu).not.toBeNull()
    expect(menu.style.left).toBe('200px')
    expect(menu.style.top).toBe('150px')
  })

  it('should display menu items correctly', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(3)
    expect(menuItems[0]?.textContent).toContain('引用')
    expect(menuItems[1]?.textContent).toContain('复制')
    expect(menuItems[2]?.textContent).toContain('编辑')
  })

  it('should render dividers correctly', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    const dividers = document.querySelectorAll('.menu-divider')
    expect(dividers.length).toBe(1)
  })

  it('should emit click event with item id when menu item is clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    ;(menuItems[0] as HTMLElement)?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual(['quote'])
  })

  it('should emit close event when menu item is clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    ;(menuItems[0] as HTMLElement)?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should hide items with show: false', () => {
    const itemsWithHidden: ContextMenuItem[] = [
      { id: 'quote', label: '引用', icon: '↩' },
      { id: 'edit', label: '编辑', icon: '✏️', show: false },
    ]

    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: itemsWithHidden
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(1)
    expect(menuItems[0]?.textContent).toContain('引用')
  })

  it('should have white background with shadow', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    const menu = document.querySelector('.context-menu')
    expect(menu?.classList.contains('context-menu')).toBe(true)
  })

  it('should have hover effect on menu item', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: testItems
      },
      attachTo: document.body
    })

    const menuItem = document.querySelector('.menu-item')
    expect(menuItem?.classList.contains('menu-item')).toBe(true)
  })

  describe('Bug #3: Context menu edge detection', () => {
    it('should adjust position when menu would go beyond right edge', async () => {
      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: window.innerWidth - 50,
          y: 100,
          items: testItems
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()
      
      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      
      const menuLeft = parseInt(menu.style.left)
      expect(menuLeft).toBeLessThan(window.innerWidth - 100)
    })

    it('should adjust position when menu would go beyond bottom edge', async () => {
      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: 100,
          y: window.innerHeight - 50,
          items: testItems
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()
      
      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      
      const menuTop = parseInt(menu.style.top)
      expect(menuTop).toBeLessThan(window.innerHeight - 100)
    })

    it('should not go beyond left edge', async () => {
      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: -50,
          y: 100,
          items: testItems
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()
      
      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      
      const menuLeft = parseInt(menu.style.left)
      expect(menuLeft).toBeGreaterThanOrEqual(10)
    })

    it('should not go beyond top edge when flipping upwards', async () => {
      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: 100,
          y: 30,
          items: [...testItems, ...testItems, ...testItems]
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()
      
      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      
      const menuTop = parseInt(menu.style.top)
      expect(menuTop).toBeGreaterThanOrEqual(10)
    })

    it('should position menu correctly when near bottom-right corner', async () => {
      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: window.innerWidth - 50,
          y: window.innerHeight - 50,
          items: testItems
        },
        attachTo: document.body
      })

      await wrapper.vm.$nextTick()
      
      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      
      const menuLeft = parseInt(menu.style.left)
      const menuTop = parseInt(menu.style.top)
      
      expect(menuLeft).toBeLessThan(window.innerWidth - 100)
      expect(menuTop).toBeLessThan(window.innerHeight - 100)
    })
  })
})
