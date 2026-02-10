/**
 * Create Stealth Meta-Address Script
 *
 * Generates a new stealth meta-address that can be shared publicly.
 * Uses environment variables if provided, otherwise generates random keys.
 *
 * Environment variables:
 * - PREDEFINED_SPEND_PRIVATE_KEY: Use specific spend key
 * - PREDEFINED_VIEW_PRIVATE_KEY: Use specific view key
 *
 * Run with: pnpm create-sma
 */

import 'dotenv/config'
import {
  generateKeyPair,
  derivePublicKey,
  encodeMetaAddress,
  SCHEME_ID,
} from '../src/lib/index'

function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║         Create Stealth Meta-Address                           ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝')
  console.log()

  // Determine spend key
  let spendPrivateKey: `0x${string}`
  let spendPublicKey: `0x${string}`

  if (process.env.PREDEFINED_SPEND_PRIVATE_KEY) {
    console.log('📌 Using predefined SPEND private key from environment')
    spendPrivateKey = process.env.PREDEFINED_SPEND_PRIVATE_KEY as `0x${string}`
    spendPublicKey = derivePublicKey(spendPrivateKey)
  } else {
    console.log('🎲 Generating random SPEND keypair')
    const keypair = generateKeyPair()
    spendPrivateKey = keypair.privateKey
    spendPublicKey = keypair.publicKey
  }

  // Determine view key
  let viewPrivateKey: `0x${string}`
  let viewPublicKey: `0x${string}`

  if (process.env.PREDEFINED_VIEW_PRIVATE_KEY) {
    console.log('📌 Using predefined VIEW private key from environment')
    viewPrivateKey = process.env.PREDEFINED_VIEW_PRIVATE_KEY as `0x${string}`
    viewPublicKey = derivePublicKey(viewPrivateKey)
  } else {
    console.log('🎲 Generating random VIEW keypair')
    const keypair = generateKeyPair()
    viewPrivateKey = keypair.privateKey
    viewPublicKey = keypair.publicKey
  }

  console.log()
  console.log('─'.repeat(65))
  console.log()

  // Create meta-address
  const metaAddress = encodeMetaAddress({
    scheme: SCHEME_ID,
    spendPubkey: spendPublicKey,
    viewPubkey: viewPublicKey,
  })

  // Output results
  console.log('🔑 Keypairs')
  console.log('─'.repeat(65))
  console.log('Spend Private Key:', spendPrivateKey)
  console.log('Spend Public Key: ', spendPublicKey)
  console.log('View Private Key: ', viewPrivateKey)
  console.log('View Public Key:  ', viewPublicKey)
  console.log()

  console.log('📬 Stealth Meta-Address')
  console.log('─'.repeat(65))
  console.log(metaAddress)
  console.log()

  console.log('⚠️  IMPORTANT: Store your private keys securely!')
  console.log('   - Never share your private keys')
  console.log('   - The meta-address can be shared publicly')
  console.log()

  console.log('💡 To use in other scripts, add to your .env file:')
  console.log('─'.repeat(65))
  console.log(`META_ADDRESS=${metaAddress}`)
  console.log(`SPEND_PRIVATE_KEY=${spendPrivateKey}`)
  console.log(`VIEW_PRIVATE_KEY=${viewPrivateKey}`)
}

main()
