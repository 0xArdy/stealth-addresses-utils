import { describe, it, expect } from 'vitest'
import {
  generateKeyPair,
  generateStealthKeyPairs,
  derivePublicKey,
  bytesToHex,
  hexToBytes,
  isValidHex,
  isValidMetaAddress,
  padHex,
  encodeMetaAddress,
  SCHEME_ID,
} from '../index'

describe('utils', () => {
  describe('generateKeyPair', () => {
    it('should generate valid keypairs', () => {
      const { privateKey, publicKey } = generateKeyPair()

      // Private key: 32 bytes = 64 hex chars
      expect(privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/)

      // Public key: compressed, 33 bytes = 66 hex chars, starts with 02 or 03
      expect(publicKey).toMatch(/^0x(02|03)[0-9a-fA-F]{64}$/)
    })

    it('should generate different keypairs each time', () => {
      const kp1 = generateKeyPair()
      const kp2 = generateKeyPair()

      expect(kp1.privateKey).not.toBe(kp2.privateKey)
      expect(kp1.publicKey).not.toBe(kp2.publicKey)
    })
  })

  describe('generateStealthKeyPairs', () => {
    it('should generate valid spend and view keypairs', () => {
      const { spend, view } = generateStealthKeyPairs()

      // Spend keypair
      expect(spend.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/)
      expect(spend.publicKey).toMatch(/^0x(02|03)[0-9a-fA-F]{64}$/)

      // View keypair
      expect(view.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/)
      expect(view.publicKey).toMatch(/^0x(02|03)[0-9a-fA-F]{64}$/)

      // Spend and view should be different
      expect(spend.privateKey).not.toBe(view.privateKey)
      expect(spend.publicKey).not.toBe(view.publicKey)
    })
  })

  describe('derivePublicKey', () => {
    it('should derive correct public key from private key', () => {
      const { privateKey, publicKey } = generateKeyPair()

      const derivedPublicKey = derivePublicKey(privateKey)

      expect(derivedPublicKey.toLowerCase()).toBe(publicKey.toLowerCase())
    })

    it('should return compressed format by default', () => {
      const { privateKey } = generateKeyPair()
      const publicKey = derivePublicKey(privateKey)

      // Compressed: 33 bytes, starts with 02 or 03
      expect(publicKey).toMatch(/^0x(02|03)[0-9a-fA-F]{64}$/)
    })

    it('should return uncompressed format when requested', () => {
      const { privateKey } = generateKeyPair()
      const publicKey = derivePublicKey(privateKey, false)

      // Uncompressed: 65 bytes, starts with 04
      expect(publicKey).toMatch(/^0x04[0-9a-fA-F]{128}$/)
    })
  })

  describe('bytesToHex / hexToBytes', () => {
    it('should convert bytes to hex correctly', () => {
      const bytes = new Uint8Array([0x12, 0x34, 0xab, 0xcd])
      const hex = bytesToHex(bytes)

      expect(hex).toBe('0x1234abcd')
    })

    it('should convert hex to bytes correctly', () => {
      const hex = '0x1234abcd'
      const bytes = hexToBytes(hex)

      expect(bytes).toEqual(new Uint8Array([0x12, 0x34, 0xab, 0xcd]))
    })

    it('should handle hex without 0x prefix', () => {
      const hex = '1234abcd'
      const bytes = hexToBytes(hex)

      expect(bytes).toEqual(new Uint8Array([0x12, 0x34, 0xab, 0xcd]))
    })

    it('should round-trip correctly', () => {
      const original = new Uint8Array([0x00, 0xff, 0x12, 0x34])
      const hex = bytesToHex(original)
      const restored = hexToBytes(hex)

      expect(restored).toEqual(original)
    })
  })

  describe('isValidHex', () => {
    it('should validate correct hex strings', () => {
      expect(isValidHex('0x')).toBe(true)
      expect(isValidHex('0x1234')).toBe(true)
      expect(isValidHex('0xabcdef')).toBe(true)
      expect(isValidHex('0xABCDEF')).toBe(true)
    })

    it('should reject invalid hex strings', () => {
      expect(isValidHex('')).toBe(false)
      expect(isValidHex('1234')).toBe(false)
      expect(isValidHex('0xgggg')).toBe(false)
      expect(isValidHex('hello')).toBe(false)
    })

    it('should validate expected length', () => {
      expect(isValidHex('0x1234', 2)).toBe(true)
      expect(isValidHex('0x1234', 3)).toBe(false)
      expect(isValidHex('0x', 0)).toBe(true)
    })
  })

  describe('isValidMetaAddress', () => {
    it('should validate correct meta-addresses', () => {
      const { spend, view } = generateStealthKeyPairs()
      const metaAddress = encodeMetaAddress({
        scheme: SCHEME_ID,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      expect(isValidMetaAddress(metaAddress)).toBe(true)
    })

    it('should reject invalid meta-addresses', () => {
      expect(isValidMetaAddress('')).toBe(false)
      expect(isValidMetaAddress('0x')).toBe(false)
      expect(isValidMetaAddress('0x1234')).toBe(false)
      expect(isValidMetaAddress('0x' + '00'.repeat(66))).toBe(false)
      expect(isValidMetaAddress('0x' + '00'.repeat(68))).toBe(false)
    })
  })

  describe('padHex', () => {
    it('should pad hex strings correctly', () => {
      expect(padHex('0x1', 1)).toBe('0x01')
      expect(padHex('0x1', 2)).toBe('0x0001')
      expect(padHex('0x1234', 4)).toBe('0x00001234')
    })

    it('should handle already-padded hex', () => {
      expect(padHex('0x0001', 2)).toBe('0x0001')
      expect(padHex('0x00001234', 4)).toBe('0x00001234')
    })

    it('should handle hex without 0x prefix', () => {
      expect(padHex('1', 2)).toBe('0x0001')
    })
  })
})
