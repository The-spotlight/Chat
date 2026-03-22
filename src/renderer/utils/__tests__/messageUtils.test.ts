import { describe, it, expect } from 'vitest'
import {
  isWithinOperationTimeLimit,
  canRecallMessage,
  canEditMessage,
  getRecallDisplayText,
  getRecalledReferenceContent,
  MESSAGE_OPERATION_TIME_LIMIT
} from '../messageUtils'
import { ModelMessage } from '../../../model/ModelMessage'

describe('messageUtils', () => {
  describe('isWithinOperationTimeLimit', () => {
    it('should return true for message created within 2 minutes', () => {
      const createTime = Date.now() - 60 * 1000
      expect(isWithinOperationTimeLimit(createTime)).toBe(true)
    })

    it('should return false for message created exactly 2 minutes ago', () => {
      const createTime = Date.now() - MESSAGE_OPERATION_TIME_LIMIT - 1
      expect(isWithinOperationTimeLimit(createTime)).toBe(false)
    })

    it('should return false for message created more than 2 minutes ago', () => {
      const createTime = Date.now() - 3 * 60 * 1000
      expect(isWithinOperationTimeLimit(createTime)).toBe(false)
    })

    it('should return false for undefined createTime', () => {
      expect(isWithinOperationTimeLimit(undefined)).toBe(false)
    })
  })

  describe('canRecallMessage', () => {
    it('should return true for own message within time limit', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 60 * 1000
      message.isInMsg = false
      message.isRecalled = false

      expect(canRecallMessage(message)).toBe(true)
    })

    it('should return false for message outside time limit', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 3 * 60 * 1000
      message.isInMsg = false
      message.isRecalled = false

      expect(canRecallMessage(message)).toBe(false)
    })

    it('should return false for incoming message', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 60 * 1000
      message.isInMsg = true
      message.isRecalled = false

      expect(canRecallMessage(message)).toBe(false)
    })

    it('should return false for already recalled message', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 60 * 1000
      message.isInMsg = false
      message.isRecalled = true

      expect(canRecallMessage(message)).toBe(false)
    })
  })

  describe('canEditMessage', () => {
    it('should return true for own message within time limit', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 60 * 1000
      message.isInMsg = false
      message.isRecalled = false

      expect(canEditMessage(message)).toBe(true)
    })

    it('should return false for message outside time limit', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 3 * 60 * 1000
      message.isInMsg = false
      message.isRecalled = false

      expect(canEditMessage(message)).toBe(false)
    })

    it('should return false for incoming message', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 60 * 1000
      message.isInMsg = true
      message.isRecalled = false

      expect(canEditMessage(message)).toBe(false)
    })

    it('should return false for recalled message', () => {
      const message = new ModelMessage()
      message.createTime = Date.now() - 60 * 1000
      message.isInMsg = false
      message.isRecalled = true

      expect(canEditMessage(message)).toBe(false)
    })
  })

  describe('getRecallDisplayText', () => {
    it('should return correct text for self message', () => {
      const message = new ModelMessage()
      expect(getRecallDisplayText(message, true)).toBe('你撤回了一条消息')
    })

    it('should return correct text for other message', () => {
      const message = new ModelMessage()
      expect(getRecallDisplayText(message, false)).toBe('对方撤回了一条消息')
    })
  })

  describe('getRecalledReferenceContent', () => {
    it('should return correct text for recalled reference', () => {
      expect(getRecalledReferenceContent()).toBe('消息已被撤回')
    })
  })
})
