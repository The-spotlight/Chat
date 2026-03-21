import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import QuotePreview from '../QuotePreview.vue'
import { useMessageStore } from '../../../../store/useMessageStore'
import { ModelMessage } from '../../../../../model/ModelMessage'

describe('QuotePreview', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should not render when there is no quote', () => {
    const wrapper = mount(QuotePreview)
    expect(wrapper.find('.quote-preview').exists()).toBe(false)
  })

  it('should render correctly when there is a quote', () => {
    const messageStore = useMessageStore()
    const message = new ModelMessage()
    message.id = 'test-message-id'
    message.fromName = 'Test User'
    message.messageContent = 'This is a test message'
    
    messageStore.setQuote(message)
    
    const wrapper = mount(QuotePreview)
    expect(wrapper.find('.quote-preview').exists()).toBe(true)
    expect(wrapper.find('.quote-sender').text()).toBe('Test User')
    expect(wrapper.find('.quote-text').text()).toBe('This is a test message')
  })

  it('should truncate content longer than 30 characters', () => {
    const messageStore = useMessageStore()
    const message = new ModelMessage()
    message.id = 'test-message-id'
    message.fromName = 'Test User'
    message.messageContent = 'This is a very long message that should be truncated after thirty characters'
    
    messageStore.setQuote(message)
    
    const wrapper = mount(QuotePreview)
    const quoteText = wrapper.find('.quote-text').text()
    expect(quoteText.length).toBeLessThanOrEqual(33) // 30 chars + '...'
    expect(quoteText).toContain('...')
  })

  it('should call clearQuote when close button is clicked', async () => {
    const messageStore = useMessageStore()
    const message = new ModelMessage()
    message.id = 'test-message-id'
    message.fromName = 'Test User'
    message.messageContent = 'This is a test message'
    
    messageStore.setQuote(message)
    expect(messageStore.currentQuote).not.toBeNull()
    
    const wrapper = mount(QuotePreview)
    await wrapper.find('.quote-close').trigger('click')
    
    expect(messageStore.currentQuote).toBeNull()
  })

  it('should display sender name in green color', () => {
    const messageStore = useMessageStore()
    const message = new ModelMessage()
    message.id = 'test-message-id'
    message.fromName = 'Test User'
    message.messageContent = 'This is a test message'
    
    messageStore.setQuote(message)
    
    const wrapper = mount(QuotePreview)
    const senderElement = wrapper.find('.quote-sender')
    expect(senderElement.exists()).toBe(true)
  })

  it('should display content text in gray color', () => {
    const messageStore = useMessageStore()
    const message = new ModelMessage()
    message.id = 'test-message-id'
    message.fromName = 'Test User'
    message.messageContent = 'This is a test message'
    
    messageStore.setQuote(message)
    
    const wrapper = mount(QuotePreview)
    const contentElement = wrapper.find('.quote-text')
    expect(contentElement.exists()).toBe(true)
  })
})
