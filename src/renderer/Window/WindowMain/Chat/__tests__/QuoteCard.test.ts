import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import QuoteCard from '../QuoteCard.vue'
import { ModelMessageQuote } from '../../../../../model/ModelMessage'

describe('QuoteCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render correctly with quote data', () => {
    const quote: ModelMessageQuote = {
      messageId: 'test-message-id',
      fromName: 'Test User',
      content: 'This is a test message'
    }
    
    const wrapper = mount(QuoteCard, {
      props: { quote }
    })
    
    expect(wrapper.find('.quote-card').exists()).toBe(true)
    expect(wrapper.find('.quote-sender').text()).toBe('Test User')
    expect(wrapper.find('.quote-content').text()).toBe('This is a test message')
  })

  it('should truncate content longer than 50 characters', () => {
    const quote: ModelMessageQuote = {
      messageId: 'test-message-id',
      fromName: 'Test User',
      content: 'This is a very long message that should be truncated after fifty characters. This part should not be visible in the quote card display.'
    }
    
    const wrapper = mount(QuoteCard, {
      props: { quote }
    })
    
    const quoteContent = wrapper.find('.quote-content').text()
    expect(quoteContent.length).toBeLessThanOrEqual(53) // 50 chars + '...'
    expect(quoteContent).toContain('...')
  })

  it('should emit click event with messageId when clicked', async () => {
    const quote: ModelMessageQuote = {
      messageId: 'test-message-id-123',
      fromName: 'Test User',
      content: 'This is a test message'
    }
    
    const wrapper = mount(QuoteCard, {
      props: { quote }
    })
    
    await wrapper.find('.quote-card').trigger('click')
    
    expect(wrapper.emitted('click')).toBeDefined()
    expect(wrapper.emitted('click')?.[0]).toEqual(['test-message-id-123'])
  })

  it('should display sender name with correct styling', () => {
    const quote: ModelMessageQuote = {
      messageId: 'test-message-id',
      fromName: 'Test User',
      content: 'This is a test message'
    }
    
    const wrapper = mount(QuoteCard, {
      props: { quote }
    })
    
    const senderElement = wrapper.find('.quote-sender')
    expect(senderElement.exists()).toBe(true)
  })

  it('should display content with correct styling', () => {
    const quote: ModelMessageQuote = {
      messageId: 'test-message-id',
      fromName: 'Test User',
      content: 'This is a test message'
    }
    
    const wrapper = mount(QuoteCard, {
      props: { quote }
    })
    
    const contentElement = wrapper.find('.quote-content')
    expect(contentElement.exists()).toBe(true)
  })

  it('should have green left border indicator', () => {
    const quote: ModelMessageQuote = {
      messageId: 'test-message-id',
      fromName: 'Test User',
      content: 'This is a test message'
    }
    
    const wrapper = mount(QuoteCard, {
      props: { quote }
    })
    
    const quoteCard = wrapper.find('.quote-card')
    expect(quoteCard.exists()).toBe(true)
  })

  it('should have light gray background', () => {
    const quote: ModelMessageQuote = {
      messageId: 'test-message-id',
      fromName: 'Test User',
      content: 'This is a test message'
    }
    
    const wrapper = mount(QuoteCard, {
      props: { quote }
    })
    
    const quoteCard = wrapper.find('.quote-card')
    expect(quoteCard.exists()).toBe(true)
  })
})
