/**
 * Create Stealth Address Script
 *
 * Derives a stealth address from a meta-address.
 * This is what a sender would do before sending funds.
 *
 * Environment variables (required):
 * - META_ADDRESS: The recipient's stealth meta-address
 *
 * Run with: pnpm create-stealth
 */

import 'dotenv/config'
import {
  getSenderStealthAddress,
  encodeAnnouncementCalldata,
  encodeMetadataWithViewTag,
  ANNOUNCER_SINGLETON,
  isValidMetaAddress,
} from '../src/lib/index'

function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║         Derive Stealth Address (Sender Side)                  ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log()

  // Get meta-address from environment
  const metaAddress = process.env.META_ADDRESS

  if (!metaAddress) {
    console.error('❌ Error: META_ADDRESS environment variable is required')
    console.error()
    console.error('Please set META_ADDRESS in your .env file or environment:')
    console.error('  META_ADDRESS=0x02...')
    console.error()
    console.error('You can generate one with: pnpm create-sma')
    process.exit(1)
  }

  // Validate meta-address format
  if (!isValidMetaAddress(metaAddress)) {
    console.error('❌ Error: Invalid meta-address format')
    console.error()
    console.error('Meta-address must be:')
    console.error('  - 0x-prefixed')
    console.error('  - 134 hex characters (67 bytes)')
    console.error()
    console.error('Received:', metaAddress)
    process.exit(1)
  }

  console.log('📬 Input Meta-Address')
  console.log('─'.repeat(65))
  console.log(metaAddress)
  console.log()

  // Derive stealth address
  console.log('🔐 Deriving Stealth Address...')
  console.log('─'.repeat(65))

  const result = getSenderStealthAddress(metaAddress)

  console.log('Stealth Address:    ', result.stealthAddress)
  console.log('Stealth Public Key: ', result.stealthPubKey)
  console.log('View Tag:           ', result.viewTag)
  console.log('Ephemeral Pub Key:  ', result.ephemPubKey)
  console.log()

  // Generate announcement calldata
  console.log('📢 Announcement Data')
  console.log('─'.repeat(65))

  const metadata = encodeMetadataWithViewTag(result.viewTag)
  const calldata = encodeAnnouncementCalldata(
    result.stealthAddress,
    result.ephemPubKey,
    metadata
  )

  console.log('Announcer Contract: ', ANNOUNCER_SINGLETON)
  console.log('Metadata (viewTag): ', metadata)
  console.log('Calldata:           ', calldata.slice(0, 66) + '...')
  console.log()

  console.log('📋 Next Steps')
  console.log('─'.repeat(65))
  console.log('1. Send funds to:   ', result.stealthAddress)
  console.log('2. Call announce() on the Announcer contract')
  console.log('3. Recipient will scan for the announcement using their view key')
  console.log()

  console.log('💡 For recipient to recover, save these values:')
  console.log('─'.repeat(65))
  console.log(`EPHEMERAL_PUBLIC_KEY=${result.ephemPubKey}`)
  console.log(`VIEW_TAG=${result.viewTag}`)
}

main()
