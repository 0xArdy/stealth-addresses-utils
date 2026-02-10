import * as secp from '@noble/secp256k1'
import type { KeyPair, StealthKeyPairs } from './types'

/**
 * Converts a Uint8Array to a 0x-prefixed hex string
 *
 * @param bytes - The bytes to convert
 * @returns 0x-prefixed hex string
 *
 * @example
 * ```ts
 * const hex = bytesToHex(new Uint8Array([0x12, 0x34]))
 * console.log(hex) // '0x1234'
 * ```
 */
export function bytesToHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * Converts a hex string to a Uint8Array
 *
 * @param hex - The hex string (with or without 0x prefix)
 * @returns Uint8Array of bytes
 *
 * @example
 * ```ts
 * const bytes = hexToBytes('0x1234')
 * console.log(bytes) // Uint8Array([0x12, 0x34])
 * ```
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Generates a random secp256k1 keypair
 *
 * @description
 * Creates a cryptographically secure random private key and derives
 * the corresponding compressed public key.
 *
 * @returns A keypair with private key (32 bytes) and compressed public key (33 bytes)
 *
 * @example
 * ```ts
 * import { generateKeyPair } from 'stealth-addresses-utils'
 *
 * const { privateKey, publicKey } = generateKeyPair()
 * console.log(privateKey) // '0x...' (64 hex chars)
 * console.log(publicKey)  // '0x02...' or '0x03...' (66 hex chars)
 * ```
 */
export function generateKeyPair(): KeyPair {
  const privateKeyBytes = secp.utils.randomPrivateKey()
  const publicKeyBytes = secp.getPublicKey(privateKeyBytes, true) // compressed

  return {
    privateKey: bytesToHex(privateKeyBytes),
    publicKey: bytesToHex(publicKeyBytes),
  }
}

/**
 * Generates a complete set of stealth keypairs (spend + view)
 *
 * @description
 * Creates both the spend and view keypairs needed to receive stealth payments.
 * The spend key is used to derive the final stealth private key, while the
 * view key allows for efficient scanning of announcements.
 *
 * @returns Object containing spend and view keypairs
 *
 * @example
 * ```ts
 * import { generateStealthKeyPairs, encodeMetaAddress } from 'stealth-addresses-utils'
 *
 * // Generate keypairs for receiving stealth payments
 * const { spend, view } = generateStealthKeyPairs()
 *
 * // Create meta-address to share with senders
 * const metaAddress = encodeMetaAddress({
 *   scheme: 0x02,
 *   spendPubkey: spend.publicKey,
 *   viewPubkey: view.publicKey,
 * })
 *
 * // Store private keys securely!
 * console.log('Spend private key:', spend.privateKey)
 * console.log('View private key:', view.privateKey)
 * console.log('Meta-address:', metaAddress)
 * ```
 */
export function generateStealthKeyPairs(): StealthKeyPairs {
  return {
    spend: generateKeyPair(),
    view: generateKeyPair(),
  }
}

/**
 * Derives a public key from a private key
 *
 * @param privateKey - The private key (32 bytes, 0x-prefixed hex)
 * @param compressed - Whether to return compressed format (default: true)
 * @returns The derived public key
 *
 * @example
 * ```ts
 * const publicKey = derivePublicKey('0x...')
 * console.log(publicKey) // '0x02...' (compressed)
 * ```
 */
export function derivePublicKey(privateKey: `0x${string}`, compressed = true): `0x${string}` {
  const publicKeyBytes = secp.getPublicKey(privateKey.slice(2), compressed)
  return bytesToHex(publicKeyBytes)
}

/**
 * Validates if a string is a valid hex format
 *
 * @param value - The value to check
 * @param expectedLength - Expected byte length (optional)
 * @returns True if valid hex format
 *
 * @example
 * ```ts
 * isValidHex('0x1234')      // true
 * isValidHex('0x1234', 2)   // true (2 bytes)
 * isValidHex('0x1234', 3)   // false (not 3 bytes)
 * isValidHex('invalid')     // false
 * ```
 */
export function isValidHex(value: string, expectedLength?: number): boolean {
  if (!/^0x[0-9a-f]*$/i.test(value)) {
    return false
  }

  if (expectedLength !== undefined) {
    const actualLength = (value.length - 2) / 2
    return actualLength === expectedLength
  }

  return true
}

/**
 * Validates if a value is a valid meta-address format
 *
 * @param value - The value to check
 * @returns True if valid meta-address format (0x + 134 hex chars)
 *
 * @example
 * ```ts
 * isValidMetaAddress('0x02...')  // true (if 67 bytes)
 * isValidMetaAddress('0x1234')   // false (too short)
 * ```
 */
export function isValidMetaAddress(value: string): boolean {
  return /^0x[0-9a-f]{134}$/i.test(value)
}

/**
 * Pads a hex string to a specific byte length
 *
 * @param hex - The hex string to pad
 * @param bytes - The target byte length
 * @returns Padded hex string
 *
 * @example
 * ```ts
 * padHex('0x1', 32) // '0x0000...0001' (32 bytes)
 * ```
 */
export function padHex(hex: string, bytes: number): `0x${string}` {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  return `0x${cleanHex.padStart(bytes * 2, '0')}`
}
