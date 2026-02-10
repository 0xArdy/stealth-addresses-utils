import { describe, it, expect } from 'vitest'
import {
  getSenderStealthAddress,
  recoverStealthPrivKey,
  encodeMetaAddress,
  generateStealthKeyPairs,
  ViewTagMismatchError,
} from '../index'

describe('stealth addresses', () => {
  describe('getSenderStealthAddress', () => {
    it('should generate a valid stealth address', () => {
      const { spend, view } = generateStealthKeyPairs()
      const metaAddress = encodeMetaAddress({
        scheme: 0x02,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      const result = getSenderStealthAddress(metaAddress)

      // Check stealth address format
      expect(result.stealthAddress).toMatch(/^0x[0-9a-fA-F]{40}$/)

      // Check public key format (compressed, 33 bytes)
      expect(result.stealthPubKey).toMatch(/^0x(02|03)[0-9a-fA-F]{64}$/)

      // Check view tag format (1 byte)
      expect(result.viewTag).toMatch(/^0x[0-9a-fA-F]{2}$/)

      // Check ephemeral keys
      expect(result.ephemPrivKey).toMatch(/^0x[0-9a-fA-F]{64}$/)
      expect(result.ephemPubKey).toMatch(/^0x(02|03)[0-9a-fA-F]{64}$/)
    })

    it('should generate different stealth addresses each time', () => {
      const { spend, view } = generateStealthKeyPairs()
      const metaAddress = encodeMetaAddress({
        scheme: 0x02,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      const result1 = getSenderStealthAddress(metaAddress)
      const result2 = getSenderStealthAddress(metaAddress)

      // Each call should generate a unique stealth address
      expect(result1.stealthAddress).not.toBe(result2.stealthAddress)
      expect(result1.ephemPrivKey).not.toBe(result2.ephemPrivKey)
      expect(result1.ephemPubKey).not.toBe(result2.ephemPubKey)
    })
  })

  describe('recoverStealthPrivKey', () => {
    it('should recover the correct stealth private key', () => {
      const { spend, view } = generateStealthKeyPairs()
      const metaAddress = encodeMetaAddress({
        scheme: 0x02,
        spendPubkey: spend.publicKey,
        viewPubkey: view.publicKey,
      })

      // Sender generates stealth address
      const senderResult = getSenderStealthAddress(metaAddress)

      // Recipient recovers private key
      const recoveryResult = recoverStealthPrivKey({
        viewPrivKey: view.privateKey,
        spendPrivKey: spend.privateKey,
        ephemPubKey: senderResult.ephemPubKey,
        viewTag: senderResult.viewTag,
      })

      // Recovered address should match sender's derived address
      expect(recoveryResult.stealthAddress).toBe(senderResult.stealthAddress)

      // Private key should be valid format
      expect(recoveryResult.stealthPrivKey).toMatch(/^0x[0-9a-fA-F]{64}$/)
    })

    it('should throw ViewTagMismatchError for wrong recipient', () => {
      const sender = generateStealthKeyPairs()
      const wrongRecipient = generateStealthKeyPairs()

      const metaAddress = encodeMetaAddress({
        scheme: 0x02,
        spendPubkey: sender.spend.publicKey,
        viewPubkey: sender.view.publicKey,
      })

      const senderResult = getSenderStealthAddress(metaAddress)

      // Try to recover with wrong keys
      expect(() => {
        recoverStealthPrivKey({
          viewPrivKey: wrongRecipient.view.privateKey,
          spendPrivKey: wrongRecipient.spend.privateKey,
          ephemPubKey: senderResult.ephemPubKey,
          viewTag: senderResult.viewTag,
        })
      }).toThrow(ViewTagMismatchError)
    })

    it('should work correctly over multiple iterations', () => {
      // Run multiple times to ensure cryptographic correctness
      for (let i = 0; i < 10; i++) {
        const { spend, view } = generateStealthKeyPairs()
        const metaAddress = encodeMetaAddress({
          scheme: 0x02,
          spendPubkey: spend.publicKey,
          viewPubkey: view.publicKey,
        })

        const senderResult = getSenderStealthAddress(metaAddress)
        const recoveryResult = recoverStealthPrivKey({
          viewPrivKey: view.privateKey,
          spendPrivKey: spend.privateKey,
          ephemPubKey: senderResult.ephemPubKey,
          viewTag: senderResult.viewTag,
        })

        expect(recoveryResult.stealthAddress).toBe(senderResult.stealthAddress)
      }
    })
  })

  describe('full round-trip', () => {
    it('should complete full workflow: generate keys -> derive stealth -> recover', () => {
      // 1. Recipient generates keypairs
      const recipientKeys = generateStealthKeyPairs()

      // 2. Recipient creates and publishes meta-address
      const metaAddress = encodeMetaAddress({
        scheme: 0x02,
        spendPubkey: recipientKeys.spend.publicKey,
        viewPubkey: recipientKeys.view.publicKey,
      })

      // 3. Sender derives stealth address
      const { stealthAddress, ephemPubKey, viewTag, stealthPubKey } =
        getSenderStealthAddress(metaAddress)

      // Verify sender's output
      expect(stealthAddress).toMatch(/^0x[0-9a-fA-F]{40}$/)
      expect(ephemPubKey).toMatch(/^0x(02|03)[0-9a-fA-F]{64}$/)
      expect(viewTag).toMatch(/^0x[0-9a-fA-F]{2}$/)

      // 4. Recipient scans announcement and recovers private key
      const { stealthAddress: recoveredAddress, stealthPrivKey } = recoverStealthPrivKey({
        viewPrivKey: recipientKeys.view.privateKey,
        spendPrivKey: recipientKeys.spend.privateKey,
        ephemPubKey,
        viewTag,
      })

      // 5. Verify recovered address matches
      expect(recoveredAddress).toBe(stealthAddress)

      // 6. Verify private key format
      expect(stealthPrivKey).toMatch(/^0x[0-9a-fA-F]{64}$/)
    })
  })
})
