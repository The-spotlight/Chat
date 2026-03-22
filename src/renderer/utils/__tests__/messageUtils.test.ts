import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { 
  isWithinTimeLimit, 
  canRecallMessage, 
  canEditMessage, 
  canOperateMessage 
} from '../messageUtils'
import { ModelMessage } from '../../../model/ModelMessage'

describe('messageUtils', () => {
  let originalDateNow: typeof Date.now

  beforeEach(() => {
    originalDateNow = Date.now
  })

  afterEach(() => {
    Date.now = originalDateNow
  })

  const mockDateNow = (timestamp: number) => {
    Date.now = vi.fn(() => timestamp)
  }

  describe('isWithinTimeLimit', () => {
    it('should return true for message created within 2 minutes', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.createTime = now - 60 * 1000
      
      expect(isWithinTimeLimit(message)).toBe(true)
    })

    it('should return true for message created exactly 2 minutes ago', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.createTime = now - 2 * 60 * 1000
      
      expect(isWithinTimeLimit(message)).toBe(true)
    })

    it('should return false for message created more than 2 minutes ago', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.createTime = now - 2 * 60 * 1000 - 1
      
      expect(isWithinTimeLimit(message)).toBe(false)
    })

    it('should return false for message without createTime', () => {
      const message = new ModelMessage()
      
      expect(isWithinTimeLimit(message)).toBe(false)
    })

    it('should return true for message created just now', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.createTime = now
      
      expect(isWithinTimeLimit(message)).toBe(true)
    })
  })

  describe('canRecallMessage', () => {
    it('should return false for incoming message (isInMsg = true)', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = true
      message.createTime = now
      
      expect(canRecallMessage(message)).toBe(false)
    })

    it('should return false for already recalled message', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now
      message.isRecalled = true
      
      expect(canRecallMessage(message)).toBe(false)
    })

    it('should return false for message older than 2 minutes', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now - 3 * 60 * 1000
      
      expect(canRecallMessage(message)).toBe(false)
    })

    it('should return true for own message within 2 minutes', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now - 60 * 1000
      
      expect(canRecallMessage(message)).toBe(true)
    })

    it('should return true for own message created just now', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now
      
      expect(canRecallMessage(message)).toBe(true)
    })
  })

  describe('canEditMessage', () => {
    it('should return false for incoming message (isInMsg = true)', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = true
      message.createTime = now
      
      expect(canEditMessage(message)).toBe(false)
    })

    it('should return false for already recalled message', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now
      message.isRecalled = true
      
      expect(canEditMessage(message)).toBe(false)
    })

    it('should return false for message older than 2 minutes', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now - 3 * 60 * 1000
      
      expect(canEditMessage(message)).toBe(false)
    })

    it('should return true for own message within 2 minutes', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now - 60 * 1000
      
      expect(canEditMessage(message)).toBe(true)
    })

    it('should return true for edited message still within time limit', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now - 60 * 1000
      message.isEdited = true
      
      expect(canEditMessage(message)).toBe(true)
    })
  })

  describe('canOperateMessage', () => {
    it('should return true when message can be recalled', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now
      
      expect(canOperateMessage(message)).toBe(true)
    })

    it('should return true when message can be edited', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now
      
      expect(canOperateMessage(message)).toBe(true)
    })

    it('should return false for incoming message', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = true
      message.createTime = now
      
      expect(canOperateMessage(message)).toBe(false)
    })

    it('should return false for recalled message', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now
      message.isRecalled = true
      
      expect(canOperateMessage(message)).toBe(false)
    })

    it('should return false for message older than 2 minutes', () => {
      const now = Date.now()
      mockDateNow(now)
      
      const message = new ModelMessage()
      message.isInMsg = false
      message.createTime = now - 3 * 60 * 1000
      
      expect(canOperateMessage(message)).toBe(false)
    })
  })
})
