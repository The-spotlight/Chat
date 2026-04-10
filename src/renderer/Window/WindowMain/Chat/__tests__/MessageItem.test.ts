import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MessageItem from '../MessageItem.vue'
import { ModelMessage } from '../../../../../model/ModelMessage'
import { useMessageStore } from '../../../../store/useMessageStore'

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

  it('should not display reference sender name when referencedFromName is empty (recalled message)', () => {
    const message = createMessage(true)
    message.reference = {
      referencedMessageId: 'ref-id',
      referencedFromName: '',
      referencedContent: '消息已被撤回'
    }
    
    const wrapper = mount(MessageItem, {
      props: { data: message }
    })

    const referenceName = wrapper.find('.reference-name')
    expect(referenceName.exists()).toBe(false)
    
    const referenceText = wrapper.find('.reference-text')
    expect(referenceText.exists()).toBe(true)
    expect(referenceText.text()).toBe('消息已被撤回')
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

  describe('Bug #1: Edit message with Enter key should not add extra newline', () => {
    it('should save edit without adding newline when Enter is pressed', async () => {
      const message = createMessage(false, 'Original message')
      const messageStore = useMessageStore()
      const editSpy = vi.spyOn(messageStore, 'editMessage')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      await textarea.setValue('Edited content')
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Enter', 
        bubbles: true,
        cancelable: true
      })
      textarea.element.dispatchEvent(event)
      await wrapper.vm.$nextTick()

      expect(editSpy).toHaveBeenCalledWith(message.id, 'Edited content')
      expect(editSpy).not.toHaveBeenCalledWith(message.id, expect.stringContaining('\n'))
    })

    it('should remove all newline characters from content before saving', async () => {
      const message = createMessage(false, 'Original message')
      const messageStore = useMessageStore()
      const editSpy = vi.spyOn(messageStore, 'editMessage')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      await textarea.setValue('Line1\nLine2\rLine3\n')
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Enter', 
        bubbles: true,
        cancelable: true
      })
      textarea.element.dispatchEvent(event)
      await wrapper.vm.$nextTick()

      expect(editSpy).toHaveBeenCalledWith(message.id, 'Line1Line2Line3')
      expect(editSpy).not.toHaveBeenCalledWith(message.id, expect.stringContaining('\n'))
      expect(editSpy).not.toHaveBeenCalledWith(message.id, expect.stringContaining('\r'))
    })

    it('should prevent default Enter behavior in edit textarea', async () => {
      const message = createMessage(false, 'Original message')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      await textarea.setValue('Test content')
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Enter', 
        bubbles: true,
        cancelable: true
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      textarea.element.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should allow Shift+Enter for input but strip newlines on save', async () => {
      const message = createMessage(false, 'Original message')
      const messageStore = useMessageStore()
      const editSpy = vi.spyOn(messageStore, 'editMessage')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      await textarea.setValue('Content with\nnewline')
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Enter', 
        shiftKey: false,
        bubbles: true,
        cancelable: true
      })
      textarea.element.dispatchEvent(event)
      await wrapper.vm.$nextTick()

      expect(editSpy).toHaveBeenCalledWith(message.id, 'Content withnewline')
    })
  })

  describe('Bug #2: Escape key should cancel edit when using IME', () => {
    it('should cancel edit when Escape key is pressed on keydown', async () => {
      const message = createMessage(false, 'Original message')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      await textarea.setValue('Modified content')
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Escape', 
        bubbles: true,
        cancelable: true
      })
      textarea.element.dispatchEvent(event)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('textarea').exists()).toBe(false)
      expect(wrapper.find('.message-text').text()).toBe('Original message')
    })

    it('should cancel edit when using keyCode 27 (IME composition scenario)', async () => {
      const message = createMessage(false, 'Original message')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      await textarea.setValue('Modified content')
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Unidentified', 
        keyCode: 27,
        bubbles: true,
        cancelable: true
      })
      textarea.element.dispatchEvent(event)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('textarea').exists()).toBe(false)
      expect(wrapper.find('.message-text').text()).toBe('Original message')
    })

    it('should cancel edit when key is "Esc" (short form)', async () => {
      const message = createMessage(false, 'Original message')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      await textarea.setValue('Modified content')
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Esc', 
        bubbles: true,
        cancelable: true
      })
      textarea.element.dispatchEvent(event)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('textarea').exists()).toBe(false)
      expect(wrapper.find('.message-text').text()).toBe('Original message')
    })

    it('should prevent default Escape behavior during IME composition', async () => {
      const message = createMessage(false, 'Test message')
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      ;(wrapper.vm as any).startEdit()
      await wrapper.vm.$nextTick()

      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
      
      const event = new KeyboardEvent('keydown', { 
        key: 'Unidentified', 
        keyCode: 27,
        bubbles: true,
        cancelable: true
      })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      textarea.element.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Bug #3: Received message should show action buttons on hover', () => {
    it('should show action buttons on mouse enter for incoming messages', async () => {
      const message = createMessage(true, 'Incoming message')
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      expect(wrapper.find('.action-buttons').exists()).toBe(false)

      await wrapper.find('.messageItem.left').trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.action-buttons').exists()).toBe(true)
    })

    it('should hide action buttons on mouse leave for incoming messages', async () => {
      const message = createMessage(true, 'Incoming message')
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      await wrapper.find('.messageItem.left').trigger('mouseenter')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.action-buttons').exists()).toBe(true)

      await wrapper.find('.messageItem.left').trigger('mouseleave')
      // Wait for the 200ms delay
      await new Promise(resolve => setTimeout(resolve, 300))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.action-buttons').exists()).toBe(false)
    })

    it('should only show quote and copy buttons for incoming messages', async () => {
      const message = createMessage(true, 'Incoming message')
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      await wrapper.find('.messageItem.left').trigger('mouseenter')
      await wrapper.vm.$nextTick()

      const dropdownItems = wrapper.findAll('.dropdown-item')
      expect(dropdownItems.length).toBe(2)
      expect(dropdownItems[0].text()).toContain('引用')
      expect(dropdownItems[1].text()).toContain('复制')
    })

    it('should show all action buttons for outgoing messages', async () => {
      const message = createMessage(false, 'Outgoing message')
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      await wrapper.find('.messageItem.right').trigger('mouseenter')
      await wrapper.vm.$nextTick()

      const dropdownItems = wrapper.findAll('.dropdown-item')
      expect(dropdownItems.length).toBe(4)
      expect(dropdownItems[0].text()).toContain('引用')
      expect(dropdownItems[1].text()).toContain('编辑')
      expect(dropdownItems[2].text()).toContain('撤回')
      expect(dropdownItems[3].text()).toContain('复制')
    })

    it('should not show action buttons for recalled messages', async () => {
      const message = createMessage(true, 'Recalled message')
      message.isRecalled = true
      
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      await wrapper.find('.messageItem.left').trigger('mouseenter')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.action-buttons').exists()).toBe(false)
    })
  })

  describe('Bug #1: Action buttons disappear when mouse moves to them', () => {
    it('should keep action buttons visible when mouse moves to buttons area', async () => {
      const message = createMessage(false, 'Outgoing message')
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      // First, hover on message to show action buttons
      await wrapper.find('.messageItem.right').trigger('mouseenter')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.action-buttons').exists()).toBe(true)

      // Then move mouse to action buttons area
      const actionButtons = wrapper.find('.action-buttons')
      await actionButtons.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      // Buttons should still be visible
      expect(wrapper.find('.action-buttons').exists()).toBe(true)

      // Move mouse away from both message and buttons
      await actionButtons.trigger('mouseleave')
      // Wait for the 200ms delay
      await new Promise(resolve => setTimeout(resolve, 300))
      await wrapper.vm.$nextTick()

      // Buttons should be hidden
      expect(wrapper.find('.action-buttons').exists()).toBe(false)
    })

    it('should keep action buttons visible for incoming messages when mouse moves to buttons', async () => {
      const message = createMessage(true, 'Incoming message')
      const wrapper = mount(MessageItem, {
        props: { data: message },
        attachTo: document.body
      })

      // First, hover on message to show action buttons
      await wrapper.find('.messageItem.left').trigger('mouseenter')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.action-buttons').exists()).toBe(true)

      // Then move mouse to action buttons area
      const actionButtons = wrapper.find('.action-buttons')
      await actionButtons.trigger('mouseenter')
      await wrapper.vm.$nextTick()

      // Buttons should still be visible
      expect(wrapper.find('.action-buttons').exists()).toBe(true)

      // Move mouse away from both message and buttons
      await actionButtons.trigger('mouseleave')
      // Wait for the 200ms delay
      await new Promise(resolve => setTimeout(resolve, 300))
      await wrapper.vm.$nextTick()

      // Buttons should be hidden
      expect(wrapper.find('.action-buttons').exists()).toBe(false)
    })
  })
})
