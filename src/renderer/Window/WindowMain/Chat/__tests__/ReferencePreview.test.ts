import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReferencePreview from '../ReferencePreview.vue'
import { ModelMessage } from '../../../../../model/ModelMessage'

describe('ReferencePreview', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const createMessage = (content: string, fromName: string = 'Sender'): ModelMessage => {
    const message = new ModelMessage()
    message.messageContent = content
    message.fromName = fromName
    return message
  }

  it('should render correctly with message', () => {
    const message = createMessage('Hello World', 'John')
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    expect(wrapper.find('.reference-preview').exists()).toBe(true)
    expect(wrapper.find('.reference-name').text()).toBe('John')
    expect(wrapper.find('.reference-text').text()).toBe('Hello World')
  })

  it('should display sender name correctly', () => {
    const message = createMessage('Test message', 'Alice')
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    expect(wrapper.find('.reference-name').text()).toBe('Alice')
  })

  it('should truncate content longer than 30 characters', () => {
    const longContent = 'This is a very long message that exceeds thirty characters limit'
    const message = createMessage(longContent)
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    const displayedText = wrapper.find('.reference-text').text()
    expect(displayedText.length).toBeLessThanOrEqual(33)
    expect(displayedText.endsWith('...')).toBe(true)
  })

  it('should not truncate content shorter than 30 characters', () => {
    const shortContent = 'Short message'
    const message = createMessage(shortContent)
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    expect(wrapper.find('.reference-text').text()).toBe(shortContent)
  })

  it('should emit close event when close button is clicked', async () => {
    const message = createMessage('Test message')
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')?.length).toBe(1)
  })

  it('should have green indicator bar', () => {
    const message = createMessage('Test')
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    expect(wrapper.find('.reference-indicator').exists()).toBe(true)
  })

  it('should have close button', () => {
    const message = createMessage('Test')
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    expect(wrapper.find('.close-btn').exists()).toBe(true)
    expect(wrapper.find('.close-btn').text()).toBe('×')
  })

  it('should handle empty content gracefully', () => {
    const message = createMessage('')
    const wrapper = mount(ReferencePreview, {
      props: { message }
    })

    expect(wrapper.find('.reference-preview').exists()).toBe(true)
    expect(wrapper.find('.reference-text').text()).toBe('')
  })
})
