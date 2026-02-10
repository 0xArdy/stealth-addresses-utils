import { InvalidMetaAddressError, UnsupportedSchemeError } from './errors'
import { SCHEME_ID } from './constants'
import type { MetaAddress } from './types'

/**
 * Encodes a stealth meta-address from its components
 *
 * @description
 * Creates an ERC-5564 compliant stealth meta-address by concatenating:
 * - 1 byte: scheme ID (0x02 for secp256k1 with view tags)
 * - 33 bytes: compressed spend public key
 * - 33 bytes: compressed view public key
 *
 * The resulting meta-address can be shared publicly (e.g., in ENS records)
 * to allow others to derive stealth addresses for you.
 *
 * @param metaAddress - The meta-address components
 * @returns The encoded meta-address as a 0x-prefixed hex string (67 bytes / 134 hex chars)
 *
 * @throws {UnsupportedSchemeError} If scheme is not 0x02
 *
 * @example
 * ```ts
 * import { encodeMetaAddress, generateStealthKeyPairs } from 'stealth-addresses-utils'
 *
 * const { spend, view } = generateStealthKeyPairs()
 *
 * const metaAddress = encodeMetaAddress({
 *   scheme: 0x02,
 *   spendPubkey: spend.publicKey,
 *   viewPubkey: view.publicKey,
 * })
 *
 * console.log(metaAddress)
 * // '0x02<33-byte spend pubkey><33-byte view pubkey>'
 * ```
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564#stealth-meta-address-format
 */
export function encodeMetaAddress(metaAddress: MetaAddress): `0x${string}` {
  if (metaAddress.scheme !== SCHEME_ID) {
    throw new UnsupportedSchemeError(metaAddress.scheme)
  }

  const hex = [
    metaAddress.scheme.toString(16).padStart(2, '0'),
    metaAddress.spendPubkey.slice(2),
    metaAddress.viewPubkey.slice(2),
  ].join('')

  return `0x${hex}`
}

/**
 * Parses a stealth meta-address into its components
 *
 * @description
 * Decodes an ERC-5564 stealth meta-address, extracting:
 * - The scheme ID
 * - The spend public key
 * - The view public key
 *
 * @param raw - The raw meta-address string (0x-prefixed, 134 hex chars)
 * @returns The parsed meta-address components
 *
 * @throws {InvalidMetaAddressError} If the format is invalid
 *
 * @example
 * ```ts
 * import { parseMetaAddress } from 'stealth-addresses-utils'
 *
 * const parsed = parseMetaAddress('0x02...')
 *
 * console.log(parsed.scheme)      // 2 (0x02)
 * console.log(parsed.spendPubkey) // '0x02...' or '0x03...'
 * console.log(parsed.viewPubkey)  // '0x02...' or '0x03...'
 * ```
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564#stealth-meta-address-format
 */
export function parseMetaAddress(raw: string): MetaAddress {
  if (!/^0x[0-9a-f]{134}$/i.test(raw)) {
    throw new InvalidMetaAddressError(
      `Invalid meta-address format. Expected 0x + 134 hex characters, got ${raw.length} characters.`
    )
  }

  const scheme = parseInt(raw.slice(2, 4), 16)
  const spendPubkey: `0x${string}` = `0x${raw.slice(4, 4 + 66)}`
  const viewPubkey: `0x${string}` = `0x${raw.slice(4 + 66)}`

  return { scheme, spendPubkey, viewPubkey }
}

// Re-export the type for convenience
export type { MetaAddress } from './types'
