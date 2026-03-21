import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ChatSearch from './ChatSearch.vue'

describe('ChatSearch 组件', () => {
  it('应正确渲染搜索框', () => {
    const wrapper = mount(ChatSearch)
    
    expect(wrapper.find('.chatSearch').exists()).toBe(true)
    expect(wrapper.find('.inputBox').exists()).toBe(true)
    expect(wrapper.find('.searchIcon').exists()).toBe(true)
    expect(wrapper.find('.searchBtn').exists()).toBe(true)
  })

  it('输入时应触发 search 事件', async () => {
    const wrapper = mount(ChatSearch)
    const inputBox = wrapper.find('.inputBox')
    
    // 模拟输入
    inputBox.element.textContent = '测试关键词'
    await inputBox.trigger('input')
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual(['测试关键词'])
  })

  it('输入空格应正确触发事件并去除首尾空格', async () => {
    const wrapper = mount(ChatSearch)
    const inputBox = wrapper.find('.inputBox')
    
    inputBox.element.textContent = '  测试  '
    await inputBox.trigger('input')
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual(['测试'])
  })

  it('清空输入时应触发空字符串事件', async () => {
    const wrapper = mount(ChatSearch)
    const inputBox = wrapper.find('.inputBox')
    
    // 先输入内容
    inputBox.element.textContent = '测试'
    await inputBox.trigger('input')
    
    // 清空内容
    inputBox.element.textContent = ''
    await inputBox.trigger('input')
    
    expect(wrapper.emitted('search')).toHaveLength(2)
    expect(wrapper.emitted('search')![1]).toEqual([''])
  })

  it('连续输入应触发多次 search 事件', async () => {
    const wrapper = mount(ChatSearch)
    const inputBox = wrapper.find('.inputBox')
    
    inputBox.element.textContent = '张'
    await inputBox.trigger('input')
    
    inputBox.element.textContent = '张三'
    await inputBox.trigger('input')
    
    inputBox.element.textContent = '张三的'
    await inputBox.trigger('input')
    
    expect(wrapper.emitted('search')).toHaveLength(3)
    expect(wrapper.emitted('search')![0]).toEqual(['张'])
    expect(wrapper.emitted('search')![1]).toEqual(['张三'])
    expect(wrapper.emitted('search')![2]).toEqual(['张三的'])
  })

  it('输入框应具有正确的属性', () => {
    const wrapper = mount(ChatSearch)
    const inputBox = wrapper.find('.inputBox')
    
    expect(inputBox.attributes('contenteditable')).toBe('true')
    expect(inputBox.attributes('placeholder')).toBe('搜索')
  })
})
