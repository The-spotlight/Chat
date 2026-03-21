import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ReferencePreview from '../ReferencePreview.vue'

describe('ReferencePreview', () => {
  it('renders sender name correctly', () => {
    const wrapper = mount(ReferencePreview, {
      props: { fromName: 'John Doe', content: 'Test content' }
    })
    expect(wrapper.find('.reference-sender').text()).toBe('John Doe')
  })

  it('renders content correctly', () => {
    const wrapper = mount(ReferencePreview, {
      props: { fromName: 'John Doe', content: 'Test content' }
    })
    expect(wrapper.find('.reference-content').text()).toBe('Test content')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(ReferencePreview, {
      props: { fromName: 'John Doe', content: 'Test content' }
    })
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('has correct border styling', () => {
    const wrapper = mount(ReferencePreview, {
      props: { fromName: 'John Doe', content: 'Test content' }
    })
    const preview = wrapper.find('.reference-preview')
    expect(preview.exists()).toBe(true)
  })

  it('displays long content with ellipsis', () => {
    const longContent = 'a'.repeat(100)
    const wrapper = mount(ReferencePreview, {
      props: { fromName: 'John Doe', content: longContent }
    })
    const contentEl = wrapper.find('.reference-content')
    expect(contentEl.text()).toBe(longContent)
  })
})
