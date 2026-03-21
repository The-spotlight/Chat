import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuoteCard from '../QuoteCard.vue'

describe('QuoteCard', () => {
  const mockReference = {
    messageId: 'msg-123',
    fromName: 'Test User',
    content: 'This is a quoted message'
  }

  it('renders sender name correctly', () => {
    const wrapper = mount(QuoteCard, {
      props: { reference: mockReference }
    })
    expect(wrapper.find('.quote-sender').text()).toBe('Test User')
  })

  it('renders content correctly', () => {
    const wrapper = mount(QuoteCard, {
      props: { reference: mockReference }
    })
    expect(wrapper.find('.quote-content').text()).toBe('This is a quoted message')
  })

  it('applies clickable class when clickable prop is true', () => {
    const wrapper = mount(QuoteCard, {
      props: { reference: mockReference, clickable: true }
    })
    expect(wrapper.find('.quote-card').classes()).toContain('clickable')
  })

  it('does not apply clickable class when clickable prop is false', () => {
    const wrapper = mount(QuoteCard, {
      props: { reference: mockReference, clickable: false }
    })
    expect(wrapper.find('.quote-card').classes()).not.toContain('clickable')
  })

  it('emits click event when clicked and clickable', async () => {
    const wrapper = mount(QuoteCard, {
      props: { reference: mockReference, clickable: true }
    })
    await wrapper.find('.quote-card').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click event when not clickable', async () => {
    const wrapper = mount(QuoteCard, {
      props: { reference: mockReference, clickable: false }
    })
    await wrapper.find('.quote-card').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('truncates long content with ellipsis', () => {
    const longReference = {
      messageId: 'msg-456',
      fromName: 'Long User',
      content: 'a'.repeat(100)
    }
    const wrapper = mount(QuoteCard, {
      props: { reference: longReference }
    })
    const content = wrapper.find('.quote-content')
    expect(content.element.scrollWidth).toBeGreaterThan(content.element.clientWidth)
  })
})
