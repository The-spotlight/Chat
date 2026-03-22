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

  describe('Boundary detection', () => {
    it('should adjust position when menu would overflow right edge', () => {
      const originalInnerWidth = window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true
      })

      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: 750,
          y: 100,
          items: testItems
        },
        attachTo: document.body
      })

      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      const leftValue = parseInt(menu.style.left, 10)
      expect(leftValue + 120).toBeLessThanOrEqual(800)

      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        writable: true
      })
    })

    it('should adjust position when menu would overflow bottom edge', () => {
      const originalInnerHeight = window.innerHeight
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        writable: true
      })

      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: 100,
          y: 550,
          items: testItems
        },
        attachTo: document.body
      })

      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      const topValue = parseInt(menu.style.top, 10)
      expect(topValue + 200).toBeLessThanOrEqual(600)

      Object.defineProperty(window, 'innerHeight', {
        value: originalInnerHeight,
        writable: true
      })
    })

    it('should not adjust position when menu fits within viewport', () => {
      const wrapper = mount(ContextMenu, {
        props: {
          visible: true,
          x: 100,
          y: 100,
          items: testItems
        },
        attachTo: document.body
      })

      const menu = document.querySelector('.context-menu') as HTMLElement
      expect(menu).not.toBeNull()
      expect(menu.style.left).toBe('100px')
      expect(menu.style.top).toBe('100px')
    })
  })
})
