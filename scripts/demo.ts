/**
 * Demo Script - Full ERC-5564 Stealth Address Workflow
 *
 * This script demonstrates the complete stealth address workflow:
 * 1. Recipient generates keypairs and meta-address
 * 2. Sender derives a stealth address
 * 3. Recipient recovers the private key
 *
 * Run with: pnpm demo
 */

import {
  generateStealthKeyPairs,
  encodeMetaAddress,
  getSenderStealthAddress,
  recoverStealthPrivKey,
  SCHEME_ID,
} from '../src/lib/index'

function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║         ERC-5564 Stealth Addresses - Full Demo                ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log()

  // ============================================================================
  // Step 1: Recipient Setup
  // ============================================================================
  console.log('📋 Step 1: Recipient generates keypairs')
  console.log('─'.repeat(65))

  const recipientKeys = generateStealthKeyPairs()

  console.log('Spend Private Key:', recipientKeys.spend.privateKey)
  console.log('Spend Public Key: ', recipientKeys.spend.publicKey)
  console.log('View Private Key: ', recipientKeys.view.privateKey)
  console.log('View Public Key:  ', recipientKeys.view.publicKey)
  console.log()

  // ============================================================================
  // Step 2: Create Meta-Address
  // ============================================================================
  console.log('📋 Step 2: Recipient creates stealth meta-address')
  console.log('─'.repeat(65))

  const metaAddress = encodeMetaAddress({
    scheme: SCHEME_ID,
    spendPubkey: recipientKeys.spend.publicKey,
    viewPubkey: recipientKeys.view.publicKey,
  })

  console.log('Meta-Address:', metaAddress)
  console.log()
  console.log('💡 The recipient shares this meta-address publicly (e.g., ENS record)')
  console.log()

  // ============================================================================
  // Step 3: Sender Derives Stealth Address
  // ============================================================================
  console.log('📋 Step 3: Sender derives stealth address')
  console.log('─'.repeat(65))

  const senderResult = getSenderStealthAddress(metaAddress)

  console.log('Stealth Address:   ', senderResult.stealthAddress)
  console.log('Stealth Public Key:', senderResult.stealthPubKey)
  console.log('View Tag:          ', senderResult.viewTag)
  console.log('Ephemeral Pub Key: ', senderResult.ephemPubKey)
  console.log()
  console.log('💡 Sender sends funds to stealthAddress and publishes announcement')
  console.log('   with ephemPubKey and viewTag')
  console.log()

  // ============================================================================
  // Step 4: Recipient Recovers Private Key
  // ============================================================================
  console.log('📋 Step 4: Recipient scans announcements and recovers private key')
  console.log('─'.repeat(65))

  const recoveryResult = recoverStealthPrivKey({
    viewPrivKey: recipientKeys.view.privateKey,
    spendPrivKey: recipientKeys.spend.privateKey,
    ephemPubKey: senderResult.ephemPubKey,
    viewTag: senderResult.viewTag,
  })

  console.log('Recovered Address:    ', recoveryResult.stealthAddress)
  console.log('Recovered Private Key:', recoveryResult.stealthPrivKey)
  console.log()

  // ============================================================================
  // Verification
  // ============================================================================
  console.log('📋 Verification')
  console.log('─'.repeat(65))

  const addressMatch = recoveryResult.stealthAddress === senderResult.stealthAddress
  console.log(`Addresses match: ${addressMatch ? '✅ YES' : '❌ NO'}`)

  if (!addressMatch) {
    console.error('ERROR: Address mismatch!')
    process.exit(1)
  }

  console.log()
  console.log('✅ Demo completed successfully!')
  console.log()
  console.log('💡 The recipient can now use the recovered private key to spend')
  console.log('   funds from the stealth address.')
}

main()
