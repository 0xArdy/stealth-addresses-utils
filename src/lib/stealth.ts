import { getAddress, keccak256 } from 'viem'
import * as secp from '@noble/secp256k1'
import { parseMetaAddress } from './metaAddress'
import { ViewTagMismatchError } from './errors'
import { bytesToHex, hexToBytes, padHex } from './utils'
import type { SenderDerivationResult, KeyRecoveryInput, RecoveryResult } from './types'

/**
 * Computes the hash of a shared secret with a view tag
 *
 * @description
 * Follows ERC-5564 specification: Keccak-256 of (32-byte shared secret || 1-byte view tag)
 *
 * @internal
 */
function hashSharedSecret(sharedSecret: Uint8Array, viewTag: Uint8Array): bigint {
  const preimage = new Uint8Array(33)
  preimage.set(sharedSecret, 0)
  preimage.set(viewTag, 32)
  return BigInt(keccak256(preimage))
}

/**
 * Derives a stealth address for a recipient from their meta-address
 *
 * @description
 * Implements the sender-side of ERC-5564 stealth address generation:
 *
 * 1. Generate a random ephemeral private key
 * 2. Compute ephemeral public key: `ephemPub = ephemPriv * G`
 * 3. Compute shared secret: `S = ephemPriv * viewPub` (ECDH)
 * 4. Derive view tag: `tag = keccak256(S)[0]`
 * 5. Compute stealth public key: `stealthPub = spendPub + hash(S || tag) * G`
 * 6. Derive stealth address from public key
 *
 * The sender should:
 * - Send funds to `stealthAddress`
 * - Publish an announcement containing `ephemPubKey` and `viewTag`
 *
 * @param metaAddress - The recipient's stealth meta-address (0x-prefixed, 134 hex chars)
 * @returns Object containing the stealth address, keys, and view tag
 *
 * @throws {InvalidMetaAddressError} If the meta-address format is invalid
 *
 * @example
 * ```ts
 * import { getSenderStealthAddress } from 'stealth-addresses-utils'
 *
 * // Alice wants to send funds to Bob
 * const bobMetaAddress = '0x02...' // Bob's public meta-address
 *
 * const result = await getSenderStealthAddress(bobMetaAddress)
 *
 * // Send funds to this address
 * console.log('Send to:', result.stealthAddress)
 *
 * // Include in announcement so Bob can find it
 * console.log('Ephemeral pubkey:', result.ephemPubKey)
 * console.log('View tag:', result.viewTag)
 * ```
 *
 * @example
 * ```ts
 * // Using with viem to send a transaction
 * import { getSenderStealthAddress, encodeAnnouncementCalldata, ANNOUNCER_SINGLETON } from 'stealth-addresses-utils'
 * import { createWalletClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * const { stealthAddress, ephemPubKey, viewTag } = await getSenderStealthAddress(recipientMetaAddress)
 *
 * // Send funds
 * await client.sendTransaction({
 *   to: stealthAddress,
 *   value: parseEther('1.0')
 * })
 *
 * // Announce (so recipient can find it)
 * const calldata = encodeAnnouncementCalldata(ephemPubKey, recipientMetaAddress, viewTag)
 * await client.sendTransaction({
 *   to: ANNOUNCER_SINGLETON,
 *   data: calldata
 * })
 * ```
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564#generating-stealth-addresses
 */
export function getSenderStealthAddress(metaAddress: string): SenderDerivationResult {
  const ma = parseMetaAddress(metaAddress)

  // 1. Generate random ephemeral private key
  const ephemPrivBytes = secp.utils.randomPrivateKey()
  const ephemPrivKey = padHex(bytesToHex(ephemPrivBytes), 32)

  // 2. Compute ephemeral public key
  const ephemPubKey = bytesToHex(secp.getPublicKey(ephemPrivBytes, true))

  // 3. Compute shared secret via ECDH: S = ephemPriv * viewPub
  const viewPubBytes = hexToBytes(ma.viewPubkey)
  const sharedSecretFull = secp.getSharedSecret(ephemPrivBytes, viewPubBytes, true)
  // Drop the prefix byte per spec (compressed format has 0x02/0x03 prefix)
  const sharedSecret = sharedSecretFull.slice(1) // 32 bytes

  // 4. Derive view tag: first byte of keccak256(sharedSecret)
  const viewTag: `0x${string}` = `0x${keccak256(sharedSecret).slice(2, 4)}`
  const viewTagBytes = hexToBytes(viewTag)

  // 5. Compute stealth public key: stealthPub = spendPub + H * G
  // where H = hash(sharedSecret || viewTag) mod n
  const H = hashSharedSecret(sharedSecret, viewTagBytes) % secp.CURVE.n
  const tweakPoint = secp.ProjectivePoint.BASE.multiply(H)
  const spendPubPoint = secp.ProjectivePoint.fromHex(ma.spendPubkey.slice(2))
  const stealthPubPoint = spendPubPoint.add(tweakPoint)
  const stealthPubKey = bytesToHex(stealthPubPoint.toRawBytes(true))

  // 6. Derive Ethereum address from uncompressed public key
  // Address = last 20 bytes of keccak256(uncompressed_pubkey[1:])
  const stealthAddress = getAddress(
    `0x${keccak256(stealthPubPoint.toRawBytes(false).slice(1)).slice(-40)}`
  )

  return {
    stealthAddress,
    stealthPubKey,
    viewTag,
    ephemPrivKey,
    ephemPubKey,
  }
}

/**
 * Recovers the private key for a stealth address
 *
 * @description
 * Implements the recipient-side of ERC-5564 stealth address key recovery:
 *
 * 1. Compute shared secret: `S = viewPriv * ephemPub` (ECDH)
 * 2. Verify view tag matches: `tag == keccak256(S)[0]`
 * 3. Compute stealth private key: `stealthPriv = spendPriv + hash(S || tag) mod n`
 * 4. Derive stealth address from private key
 *
 * @param input - The recovery parameters
 * @returns Object containing the stealth address and private key
 *
 * @throws {ViewTagMismatchError} If the view tag doesn't match (announcement not for this recipient)
 *
 * @example
 * ```ts
 * import { recoverStealthPrivKey } from 'stealth-addresses-utils'
 *
 * // Bob sees an announcement and wants to check if it's for him
 * const result = recoverStealthPrivKey({
 *   viewPrivKey: bobViewPrivateKey,
 *   spendPrivKey: bobSpendPrivateKey,
 *   ephemPubKey: announcement.ephemPubKey,
 *   viewTag: announcement.viewTag,
 * })
 *
 * // Now Bob can spend from this address
 * console.log('Stealth address:', result.stealthAddress)
 * console.log('Private key:', result.stealthPrivKey)
 * ```
 *
 * @example
 * ```ts
 * // Handling the case where announcement is not for you
 * import { recoverStealthPrivKey, ViewTagMismatchError } from 'stealth-addresses-utils'
 *
 * try {
 *   const result = recoverStealthPrivKey({ ... })
 *   console.log('Found funds at:', result.stealthAddress)
 * } catch (error) {
 *   if (error instanceof ViewTagMismatchError) {
 *     // This announcement is not for us, skip it
 *   } else {
 *     throw error
 *   }
 * }
 * ```
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564#parsing-stealth-addresses
 */
export function recoverStealthPrivKey(input: KeyRecoveryInput): RecoveryResult {
  const viewPriv = BigInt(input.viewPrivKey)
  const spendPriv = BigInt(input.spendPrivKey)

  // 1. Compute shared secret: S = viewPriv * ephemPub
  const ephemPubPoint = secp.ProjectivePoint.fromHex(input.ephemPubKey.slice(2))
  const sharedSecret = ephemPubPoint.multiply(viewPriv).toRawBytes(true).slice(1) // 32 bytes

  // 2. Verify view tag
  const expectedTag = `0x${keccak256(sharedSecret).slice(2, 4)}`
  if (expectedTag.toLowerCase() !== input.viewTag.toLowerCase()) {
    throw new ViewTagMismatchError(expectedTag, input.viewTag)
  }

  // 3. Compute stealth private key: stealthPriv = spendPriv + H mod n
  const viewTagBytes = hexToBytes(input.viewTag)
  const H = hashSharedSecret(sharedSecret, viewTagBytes) % secp.CURVE.n
  const stealthPriv = (spendPriv + H) % secp.CURVE.n

  const stealthPrivKey = padHex(`0x${stealthPriv.toString(16)}`, 32)

  // 4. Derive address for verification
  const stealthPubBytes = secp.getPublicKey(stealthPrivKey.slice(2), false)
  const stealthAddress = getAddress(`0x${keccak256(stealthPubBytes.slice(1)).slice(-40)}`)

  return {
    stealthPrivKey,
    stealthAddress,
  }
}

// Re-export types for convenience
export type { SenderDerivationResult, KeyRecoveryInput, RecoveryResult } from './types'
