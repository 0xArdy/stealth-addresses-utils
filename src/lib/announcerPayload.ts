import { encodeFunctionData, type Hex } from 'viem'
import { ANNOUNCER_ABI } from './announcerAbi'
import { SCHEME_ID } from './constants'

/**
 * Encodes calldata for the Announcer contract's announce function
 *
 * @description
 * Creates the calldata needed to call the `announce` function on the
 * ERC-5564 Announcer contract. This should be called after sending
 * funds to a stealth address to allow the recipient to discover it.
 *
 * @param stealthAddress - The stealth address that received funds
 * @param ephemeralPubKey - The ephemeral public key from getSenderStealthAddress
 * @param metadata - Optional metadata (default: '0x'). Can include the view tag or other data.
 * @param schemeId - The scheme ID (default: 0x02 for secp256k1)
 * @returns The encoded calldata to send to the Announcer contract
 *
 * @example
 * ```ts
 * import {
 *   getSenderStealthAddress,
 *   encodeAnnouncementCalldata,
 *   ANNOUNCER_SINGLETON
 * } from 'stealth-addresses-utils'
 * import { createWalletClient, http } from 'viem'
 *
 * const client = createWalletClient({ ... })
 *
 * // 1. Derive stealth address
 * const { stealthAddress, ephemPubKey, viewTag } = await getSenderStealthAddress(metaAddress)
 *
 * // 2. Send funds to stealth address
 * await client.sendTransaction({
 *   to: stealthAddress,
 *   value: parseEther('1.0')
 * })
 *
 * // 3. Publish announcement (include viewTag in metadata)
 * const calldata = encodeAnnouncementCalldata(
 *   stealthAddress,
 *   ephemPubKey,
 *   viewTag  // viewTag as metadata
 * )
 *
 * await client.sendTransaction({
 *   to: ANNOUNCER_SINGLETON,
 *   data: calldata
 * })
 * ```
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564#announcer-contract
 */
export function encodeAnnouncementCalldata(
  stealthAddress: `0x${string}`,
  ephemeralPubKey: `0x${string}`,
  metadata: Hex = '0x',
  schemeId: number = SCHEME_ID
): Hex {
  return encodeFunctionData({
    abi: ANNOUNCER_ABI,
    functionName: 'announce',
    args: [BigInt(schemeId), stealthAddress, ephemeralPubKey, metadata],
  })
}

/**
 * Encodes metadata with view tag for announcement
 *
 * @description
 * Helper to encode the view tag as metadata for the announcement.
 * The view tag allows recipients to quickly filter announcements
 * without performing expensive elliptic curve operations.
 *
 * @param viewTag - The 1-byte view tag from getSenderStealthAddress
 * @param additionalData - Optional additional metadata to append
 * @returns Encoded metadata bytes
 *
 * @example
 * ```ts
 * import { encodeMetadataWithViewTag } from 'stealth-addresses-utils'
 *
 * const metadata = encodeMetadataWithViewTag('0xab')
 * // Use this metadata in encodeAnnouncementCalldata
 * ```
 */
export function encodeMetadataWithViewTag(viewTag: `0x${string}`, additionalData: Hex = '0x'): Hex {
  const viewTagHex = viewTag.slice(2).padStart(2, '0')
  const additionalHex = additionalData.slice(2)
  return `0x${viewTagHex}${additionalHex}`
}
