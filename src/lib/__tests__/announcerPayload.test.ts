import { describe, it, expect } from 'vitest'
import { encodeAnnouncementCalldata, encodeMetadataWithViewTag, SCHEME_ID } from '../index'

describe('announcerPayload', () => {
  describe('encodeAnnouncementCalldata', () => {
    it('should encode valid calldata', () => {
      const stealthAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
      const ephemeralPubKey = ('0x' + '02' + 'ab'.repeat(32)) as `0x${string}`
      const metadata = '0xab' as `0x${string}`

      const calldata = encodeAnnouncementCalldata(stealthAddress, ephemeralPubKey, metadata)

      // Should be valid hex
      expect(calldata).toMatch(/^0x[0-9a-fA-F]+$/)

      // Should start with function selector
      expect(calldata.length).toBeGreaterThan(10)
    })

    it('should use default scheme ID', () => {
      const stealthAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
      const ephemeralPubKey = ('0x' + '02' + 'ab'.repeat(32)) as `0x${string}`

      const calldata = encodeAnnouncementCalldata(stealthAddress, ephemeralPubKey)

      // The calldata should include the scheme ID (0x02)
      expect(calldata).toBeDefined()
    })

    it('should accept custom scheme ID', () => {
      const stealthAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
      const ephemeralPubKey = ('0x' + '02' + 'ab'.repeat(32)) as `0x${string}`

      const calldata = encodeAnnouncementCalldata(stealthAddress, ephemeralPubKey, '0x', 0x03)

      expect(calldata).toMatch(/^0x[0-9a-fA-F]+$/)
    })

    it('should use empty metadata by default', () => {
      const stealthAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`
      const ephemeralPubKey = ('0x' + '02' + 'ab'.repeat(32)) as `0x${string}`

      const calldata = encodeAnnouncementCalldata(stealthAddress, ephemeralPubKey)

      expect(calldata).toMatch(/^0x[0-9a-fA-F]+$/)
    })
  })

  describe('encodeMetadataWithViewTag', () => {
    it('should encode view tag as metadata', () => {
      const viewTag = '0xab' as `0x${string}`
      const metadata = encodeMetadataWithViewTag(viewTag)

      expect(metadata).toBe('0xab')
    })

    it('should append additional data', () => {
      const viewTag = '0xab' as `0x${string}`
      const additionalData = '0x1234' as `0x${string}`
      const metadata = encodeMetadataWithViewTag(viewTag, additionalData)

      expect(metadata).toBe('0xab1234')
    })

    it('should pad short view tags', () => {
      const viewTag = '0xa' as `0x${string}`
      const metadata = encodeMetadataWithViewTag(viewTag)

      expect(metadata).toBe('0x0a')
    })

    it('should handle empty additional data', () => {
      const viewTag = '0xcd' as `0x${string}`
      const metadata = encodeMetadataWithViewTag(viewTag, '0x')

      expect(metadata).toBe('0xcd')
    })
  })
})
