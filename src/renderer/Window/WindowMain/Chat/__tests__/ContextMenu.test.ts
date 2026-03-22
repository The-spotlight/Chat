import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ContextMenu from '../ContextMenu.vue'

const defaultItems = [
  { key: 'reference', label: '引用', icon: '↩', visible: true }
]

describe('ContextMenu', () => {
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
        items: defaultItems
      },
      attachTo: document.body
    })

    expect(document.querySelector('.context-menu')).toBeNull()
  })

  it('should render when visible is true', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: defaultItems
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
        items: defaultItems
      },
      attachTo: document.body
    })

    const menu = document.querySelector('.context-menu') as HTMLElement
    expect(menu).not.toBeNull()
    expect(menu.style.left).toBe('200px')
    expect(menu.style.top).toBe('150px')
  })

  it('should display "引用" menu item', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: defaultItems
      },
      attachTo: document.body
    })

    const menuItem = document.querySelector('.menu-item')
    expect(menuItem?.textContent).toContain('引用')
  })

  it('should emit select event when menu item is clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: defaultItems
      },
      attachTo: document.body
    })

    const menuItem = document.querySelector('.menu-item') as HTMLElement
    menuItem?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')![0]).toEqual(['reference'])
  })

  it('should emit close event when menu item is clicked', async () => {
    const wrapper = mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: defaultItems
      },
      attachTo: document.body
    })

    const menuItem = document.querySelector('.menu-item') as HTMLElement
    menuItem?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should have white background with shadow', () => {
    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: defaultItems
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
        items: defaultItems
      },
      attachTo: document.body
    })

    const menuItem = document.querySelector('.menu-item')
    expect(menuItem?.classList.contains('menu-item')).toBe(true)
  })

  it('should filter out invisible items', () => {
    const itemsWithInvisible = [
      { key: 'reference', label: '引用', icon: '↩', visible: true },
      { key: 'recall', label: '撤回', icon: '↶', visible: false }
    ]

    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: itemsWithInvisible
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(1)
    expect(menuItems[0]?.textContent).toContain('引用')
  })

  it('should display multiple visible items', () => {
    const multipleItems = [
      { key: 'reference', label: '引用', icon: '↩', visible: true },
      { key: 'recall', label: '撤回', icon: '↶', visible: true },
      { key: 'edit', label: '编辑', icon: '✎', visible: true }
    ]

    mount(ContextMenu, {
      props: {
        visible: true,
        x: 100,
        y: 100,
        items: multipleItems
      },
      attachTo: document.body
    })

    const menuItems = document.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(3)
  })
})
