import { describe, it, expect } from 'vitest'
import {
  encodeMetaAddress,
  parseMetaAddress,
  generateStealthKeyPairs,
  InvalidMetaAddressError,
  UnsupportedSchemeError,
  SCHEME_ID,
} from '../index'

describe('metaAddress', () => {
  describe('encodeMetaAddress', () => {
    it('should encode a valid meta-address', () => {
      const { spend, view } = generateStealthKeyPairs()

      const metaAddress = encodeMetaAddress({
        scheme: SCHEME_ID,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      // Meta-address should be 0x + 134 hex chars (67 bytes)
      expect(metaAddress).toMatch(/^0x[0-9a-fA-F]{134}$/)

      // Should start with scheme ID
      expect(metaAddress.slice(0, 4)).toBe('0x02')
    })

    it('should throw UnsupportedSchemeError for invalid scheme', () => {
      const { spend, view } = generateStealthKeyPairs()

      expect(() => {
        encodeMetaAddress({
          scheme: 0x01, // Invalid scheme
          spendPubkey: spend.publicKey,
          viewPubkey: view.publicKey,
        })
      }).toThrow(UnsupportedSchemeError)

      expect(() => {
        encodeMetaAddress({
          scheme: 0x03, // Invalid scheme
          spendPubkey: spend.publicKey,
          viewPubkey: view.publicKey,
        })
      }).toThrow(UnsupportedSchemeError)
    })

    it('should produce consistent output for same input', () => {
      const { spend, view } = generateStealthKeyPairs()

      const metaAddress1 = encodeMetaAddress({
        scheme: SCHEME_ID,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      const metaAddress2 = encodeMetaAddress({
        scheme: SCHEME_ID,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      expect(metaAddress1).toBe(metaAddress2)
    })
  })

  describe('parseMetaAddress', () => {
    it('should parse a valid meta-address', () => {
      const { spend, view } = generateStealthKeyPairs()

      const metaAddress = encodeMetaAddress({
        scheme: SCHEME_ID,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      const parsed = parseMetaAddress(metaAddress)

      expect(parsed.scheme).toBe(SCHEME_ID)
      expect(parsed.spendPubkey.toLowerCase()).toBe(spend.publicKey.toLowerCase())
      expect(parsed.viewPubkey.toLowerCase()).toBe(view.publicKey.toLowerCase())
    })

    it('should throw InvalidMetaAddressError for invalid formats', () => {
      // Too short
      expect(() => parseMetaAddress('0x1234')).toThrow(InvalidMetaAddressError)

      // Too long
      expect(() => parseMetaAddress('0x' + '00'.repeat(70))).toThrow(InvalidMetaAddressError)

      // Invalid characters
      expect(() => parseMetaAddress('0x' + 'gg'.repeat(67))).toThrow(InvalidMetaAddressError)

      // Missing 0x prefix
      expect(() => parseMetaAddress('02' + '00'.repeat(66))).toThrow(InvalidMetaAddressError)

      // Empty string
      expect(() => parseMetaAddress('')).toThrow(InvalidMetaAddressError)
    })
  })

  describe('round-trip encoding/decoding', () => {
    it('should correctly round-trip meta-addresses', () => {
      for (let i = 0; i < 5; i++) {
        const { spend, view } = generateStealthKeyPairs()

        const original = {
          scheme: SCHEME_ID,
          spendPubkey: spend.publicKey,
          viewPubkey: view.publicKey,
        }

        const encoded = encodeMetaAddress(original)
        const decoded = parseMetaAddress(encoded)

        expect(decoded.scheme).toBe(original.scheme)
        expect(decoded.spendPubkey.toLowerCase()).toBe(original.spendPubkey.toLowerCase())
        expect(decoded.viewPubkey.toLowerCase()).toBe(original.viewPubkey.toLowerCase())
      }
    })
  })
})
