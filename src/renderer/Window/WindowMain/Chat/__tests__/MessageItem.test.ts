import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MessageItem from '../MessageItem.vue'
import { ModelMessage } from '../../../../../model/ModelMessage'
import { useMessageStore, RECALL_TEXT_SELF, RECALL_TEXT_OTHER } from '../../../../store/useMessageStore'

describe('MessageItem', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  const createMessage = (isInMsg: boolean = true, content: string = 'Test message'): ModelMessage => {
    const message = new ModelMessage()
    message.isInMsg = isInMsg
    message.messageContent = content
    message.fromName = isInMsg ? 'Sender' : '我'
    message.avatar = 'test-avatar.png'
    message.createTime = Date.now()
    return message
  }

  it('should render incoming message on the left', () => {
    const message = createMessage(true)
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    expect(wrapper.find('.messageItem.left').exists()).toBe(true)
    expect(wrapper.find('.fromName').text()).toBe('Sender')
  })

  it('should render outgoing message on the right', () => {
    const message = createMessage(false)
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    expect(wrapper.find('.messageItem.right').exists()).toBe(true)
  })

  it('should display message content', () => {
    const message = createMessage(true, 'Hello World')
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    expect(wrapper.find('.message-text').text()).toBe('Hello World')
  })

  it('should not render reference card when message has no reference', () => {
    const message = createMessage(true)
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    expect(wrapper.find('.reference-card').exists()).toBe(false)
  })

  it('should render reference card when message has reference', () => {
    const message = createMessage(true)
    message.reference = {
      referencedMessageId: 'ref-id',
      referencedFromName: 'Original Sender',
      referencedContent: 'Original message content'
    }
    
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    expect(wrapper.find('.reference-card').exists()).toBe(true)
    expect(wrapper.find('.reference-name').text()).toBe('Original Sender')
    expect(wrapper.find('.reference-text').text()).toBe('Original message content')
  })

  it('should display referenced sender name in green', () => {
    const message = createMessage(true)
    message.reference = {
      referencedMessageId: 'ref-id',
      referencedFromName: 'Original Sender',
      referencedContent: 'Content'
    }
    
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    const referenceName = wrapper.find('.reference-name')
    expect(referenceName.exists()).toBe(true)
  })

  it('should have green left border on reference card', () => {
    const message = createMessage(true)
    message.reference = {
      referencedMessageId: 'ref-id',
      referencedFromName: 'Sender',
      referencedContent: 'Content'
    }
    
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    const referenceCard = wrapper.find('.reference-card')
    expect(referenceCard.classes()).toContain('reference-card')
  })

  it('should emit scrollToMessage event when reference card is clicked', async () => {
    const message = createMessage(true)
    message.reference = {
      referencedMessageId: 'ref-id-123',
      referencedFromName: 'Sender',
      referencedContent: 'Content'
    }
    
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    await wrapper.find('.reference-card').trigger('click')
    expect(wrapper.emitted('scrollToMessage')).toBeTruthy()
    expect(wrapper.emitted('scrollToMessage')?.[0]).toEqual(['ref-id-123'])
  })

  it('should show context menu on right click', async () => {
    const message = createMessage(true)
    mount(MessageItem, {
      props: { data: message },
      attachTo: document.body
    })

    const messageItem = document.querySelector('.messageItem') as HTMLElement
    messageItem?.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    }))

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(document.querySelector('.context-menu')).not.toBeNull()
  })

  it('should call setReferencedMessage when context menu select is triggered', async () => {
    const message = createMessage(true, 'Message to reference')
    const messageStore = useMessageStore()
    
    messageStore.setReferencedMessage(message)
    
    expect(messageStore.referencedMessage).toEqual(message)
  })

  it('should apply highlighted class when isHighlighted is true', () => {
    const message = createMessage(true)
    const wrapper = mount(MessageItem, {
      props: { 
        data: message,
        isHighlighted: true
      }
    })

    expect(wrapper.find('.messageItem').classes()).toContain('highlighted')
  })

  it('should not apply highlighted class when isHighlighted is false', () => {
    const message = createMessage(true)
    const wrapper = mount(MessageItem, {
      props: { 
        data: message,
        isHighlighted: false
      }
    })

    expect(wrapper.find('.messageItem').classes()).not.toContain('highlighted')
  })

  it('should display truncated reference content', () => {
    const message = createMessage(true)
    message.reference = {
      referencedMessageId: 'ref-id',
      referencedFromName: 'Sender',
      referencedContent: 'This is a very long reference content that should be truncated at 50 characters...'
    }
    
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    const referenceText = wrapper.find('.reference-text').text()
    expect(referenceText).toBe('This is a very long reference content that should be truncated at 50 characters...')
  })

  describe('recall functionality', () => {
    it('should display recall text for recalled own message', () => {
      const message = createMessage(false, 'Original message')
      message.isRecalled = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.recalled-text').exists()).toBe(true)
      expect(wrapper.find('.recalled-text').text()).toBe(RECALL_TEXT_SELF)
    })

    it('should display recall text for recalled incoming message', () => {
      const message = createMessage(true, 'Original message')
      message.isRecalled = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.recalled-text').exists()).toBe(true)
      expect(wrapper.find('.recalled-text').text()).toBe(RECALL_TEXT_OTHER)
    })

    it('should not display message content for recalled message', () => {
      const message = createMessage(false, 'Original message')
      message.isRecalled = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.message-text').exists()).toBe(false)
    })

    it('should apply recalled class for recalled message', () => {
      const message = createMessage(false, 'Original message')
      message.isRecalled = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.messageItem').classes()).toContain('recalled')
    })

    it('should not show context menu for recalled message', async () => {
      const message = createMessage(false, 'Original message')
      message.isRecalled = true
      
      mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      const messageItem = document.querySelector('.messageItem') as HTMLElement
      messageItem?.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      }))

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(document.querySelector('.context-menu')).toBeNull()
    })
  })

  describe('edit functionality', () => {
    it('should display edited label for edited message', () => {
      const message = createMessage(false, 'Edited message')
      message.isEdited = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.edited-label').exists()).toBe(true)
      expect(wrapper.find('.edited-label').text()).toBe('已编辑')
    })

    it('should not display edited label for non-edited message', () => {
      const message = createMessage(false, 'Normal message')
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.edited-label').exists()).toBe(false)
    })

    it('should not display edited label for recalled message', () => {
      const message = createMessage(false, 'Recalled message')
      message.isEdited = true
      message.isRecalled = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.edited-label').exists()).toBe(false)
    })
  })

  describe('action buttons', () => {
    it('should not show action buttons for incoming message', () => {
      const message = createMessage(true)
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.action-buttons').exists()).toBe(false)
    })

    it('should not show action buttons for recalled message', () => {
      const message = createMessage(false)
      message.isRecalled = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.action-buttons').exists()).toBe(false)
    })

    it('should not show action buttons for message older than 2 minutes', () => {
      const message = createMessage(false)
      message.createTime = Date.now() - 3 * 60 * 1000
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.action-buttons').exists()).toBe(false)
    })

    it('should show action buttons for own message within time limit on hover', async () => {
      const message = createMessage(false)
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      await wrapper.find('.messageItem').trigger('mouseenter')
      
      expect(wrapper.find('.action-buttons').exists()).toBe(true)
    })
  })

  describe('reference with recalled message', () => {
    it('should display "消息已被撤回" when referenced message is recalled', () => {
      const message = createMessage(true)
      message.reference = {
        referencedMessageId: 'ref-id',
        referencedFromName: 'Sender',
        referencedContent: '消息已被撤回'
      }
      
      const wrapper = mount(MessageItem, {
        props: { data: message }
      })

      expect(wrapper.find('.reference-text').text()).toBe('消息已被撤回')
    })
  })
})
