/**
 * Recover Stealth Private Key Script
 *
 * Recovers the private key for a stealth address using announcement data.
 * This is what a recipient does after discovering an announcement.
 *
 * Environment variables (all required):
 * - VIEW_PRIVATE_KEY: Recipient's view private key
 * - SPEND_PRIVATE_KEY: Recipient's spend private key
 * - EPHEMERAL_PUBLIC_KEY: From the announcement
 * - VIEW_TAG: From the announcement
 *
 * Run with: pnpm recover
 */

import 'dotenv/config'
import {
  recoverStealthPrivKey,
  ViewTagMismatchError,
} from '../src/lib/index'

function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║         Recover Stealth Private Key (Recipient Side)          ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log()

  // Validate required environment variables
  const requiredVars = [
    { name: 'VIEW_PRIVATE_KEY', value: process.env.VIEW_PRIVATE_KEY },
    { name: 'SPEND_PRIVATE_KEY', value: process.env.SPEND_PRIVATE_KEY },
    { name: 'EPHEMERAL_PUBLIC_KEY', value: process.env.EPHEMERAL_PUBLIC_KEY },
    { name: 'VIEW_TAG', value: process.env.VIEW_TAG },
  ] as const

  const missingVars = requiredVars.filter((v) => !v.value)

  if (missingVars.length > 0) {
    console.error('❌ Error: Missing required environment variables:')
    console.error()
    for (const v of missingVars) {
      console.error(`   - ${v.name}`)
    }
    console.error()
    console.error('Please set these in your .env file or environment.')
    console.error()
    console.error('Example .env:')
    console.error('─'.repeat(65))
    console.error('VIEW_PRIVATE_KEY=0x...')
    console.error('SPEND_PRIVATE_KEY=0x...')
    console.error('EPHEMERAL_PUBLIC_KEY=0x...')
    console.error('VIEW_TAG=0x...')
    process.exit(1)
  }

  const viewPrivKey = process.env.VIEW_PRIVATE_KEY as `0x${string}`
  const spendPrivKey = process.env.SPEND_PRIVATE_KEY as `0x${string}`
  const ephemPubKey = process.env.EPHEMERAL_PUBLIC_KEY as `0x${string}`
  const viewTag = process.env.VIEW_TAG as `0x${string}`

  console.log('📥 Input Parameters')
  console.log('─'.repeat(65))
  console.log('View Private Key:     ', viewPrivKey.slice(0, 10) + '...' + viewPrivKey.slice(-8))
  console.log('Spend Private Key:    ', spendPrivKey.slice(0, 10) + '...' + spendPrivKey.slice(-8))
  console.log('Ephemeral Public Key: ', ephemPubKey)
  console.log('View Tag:             ', viewTag)
  console.log()

  console.log('🔐 Recovering Private Key...')
  console.log('─'.repeat(65))

  try {
    const result = recoverStealthPrivKey({
      viewPrivKey,
      spendPrivKey,
      ephemPubKey,
      viewTag,
    })

    console.log()
    console.log('✅ Recovery Successful!')
    console.log()
    console.log('📬 Stealth Address')
    console.log('─'.repeat(65))
    console.log(result.stealthAddress)
    console.log()
    console.log('🔑 Stealth Private Key')
    console.log('─'.repeat(65))
    console.log(result.stealthPrivKey)
    console.log()
    console.log('⚠️  IMPORTANT: Store this private key securely!')
    console.log('   This key controls the funds at the stealth address.')

  } catch (error) {
    if (error instanceof ViewTagMismatchError) {
      console.error()
      console.error('❌ View Tag Mismatch!')
      console.error()
      console.error('This announcement was not intended for your keys.')
      console.error('Expected tag:', error.expectedTag)
      console.error('Actual tag:  ', error.actualTag)
      console.error()
      console.error('Possible causes:')
      console.error('  - Wrong view/spend private keys')
      console.error('  - Announcement is for a different recipient')
      console.error('  - Incorrect ephemeral public key or view tag')
      process.exit(1)
    }

    throw error
  }
}

main()
