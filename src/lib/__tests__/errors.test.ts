import { describe, it, expect } from 'vitest'
import {
  StealthAddressError,
  InvalidMetaAddressError,
  UnsupportedSchemeError,
  ViewTagMismatchError,
  InvalidPrivateKeyError,
  InvalidPublicKeyError,
} from '../index'

describe('errors', () => {
  describe('StealthAddressError', () => {
    it('should be instanceof Error', () => {
      const error = new StealthAddressError('test')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(StealthAddressError)
    })

    it('should have correct name', () => {
      const error = new StealthAddressError('test')
      expect(error.name).toBe('StealthAddressError')
    })

    it('should have correct message', () => {
      const error = new StealthAddressError('test message')
      expect(error.message).toBe('test message')
    })
  })

  describe('InvalidMetaAddressError', () => {
    it('should extend StealthAddressError', () => {
      const error = new InvalidMetaAddressError()
      expect(error).toBeInstanceOf(StealthAddressError)
      expect(error).toBeInstanceOf(InvalidMetaAddressError)
    })

    it('should have correct name', () => {
      const error = new InvalidMetaAddressError()
      expect(error.name).toBe('InvalidMetaAddressError')
    })

    it('should have default message', () => {
      const error = new InvalidMetaAddressError()
      expect(error.message).toContain('Invalid stealth meta-address')
    })

    it('should accept custom message', () => {
      const error = new InvalidMetaAddressError('custom message')
      expect(error.message).toBe('custom message')
    })
  })

  describe('UnsupportedSchemeError', () => {
    it('should extend StealthAddressError', () => {
      const error = new UnsupportedSchemeError(0x01)
      expect(error).toBeInstanceOf(StealthAddressError)
      expect(error).toBeInstanceOf(UnsupportedSchemeError)
    })

    it('should have correct name', () => {
      const error = new UnsupportedSchemeError(0x01)
      expect(error.name).toBe('UnsupportedSchemeError')
    })

    it('should include scheme in message', () => {
      const error = new UnsupportedSchemeError(0x01)
      expect(error.message).toContain('0x01')
    })

    it('should store scheme value', () => {
      const error = new UnsupportedSchemeError(0x03)
      expect(error.scheme).toBe(0x03)
    })
  })

  describe('ViewTagMismatchError', () => {
    it('should extend StealthAddressError', () => {
      const error = new ViewTagMismatchError('0x01', '0x02')
      expect(error).toBeInstanceOf(StealthAddressError)
      expect(error).toBeInstanceOf(ViewTagMismatchError)
    })

    it('should have correct name', () => {
      const error = new ViewTagMismatchError('0x01', '0x02')
      expect(error.name).toBe('ViewTagMismatchError')
    })

    it('should include expected and actual tags in message', () => {
      const error = new ViewTagMismatchError('0xab', '0xcd')
      expect(error.message).toContain('0xab')
      expect(error.message).toContain('0xcd')
    })

    it('should store tag values', () => {
      const error = new ViewTagMismatchError('0xab', '0xcd')
      expect(error.expectedTag).toBe('0xab')
      expect(error.actualTag).toBe('0xcd')
    })
  })

  describe('InvalidPrivateKeyError', () => {
    it('should extend StealthAddressError', () => {
      const error = new InvalidPrivateKeyError()
      expect(error).toBeInstanceOf(StealthAddressError)
    })

    it('should have correct name', () => {
      const error = new InvalidPrivateKeyError()
      expect(error.name).toBe('InvalidPrivateKeyError')
    })
  })

  describe('InvalidPublicKeyError', () => {
    it('should extend StealthAddressError', () => {
      const error = new InvalidPublicKeyError()
      expect(error).toBeInstanceOf(StealthAddressError)
    })

    it('should have correct name', () => {
      const error = new InvalidPublicKeyError()
      expect(error.name).toBe('InvalidPublicKeyError')
    })
  })

  describe('error catching', () => {
    it('should be catchable by base class', () => {
      const errors = [
        new InvalidMetaAddressError(),
        new UnsupportedSchemeError(0x01),
        new ViewTagMismatchError('0x01', '0x02'),
        new InvalidPrivateKeyError(),
        new InvalidPublicKeyError(),
      ]

      for (const error of errors) {
        expect(() => {
          throw error
        }).toThrow(StealthAddressError)
      }
    })
  })
})
