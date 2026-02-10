/**
 * Base error class for stealth address operations
 *
 * @example
 * ```ts
 * try {
 *   await getSenderStealthAddress(invalidMetaAddress)
 * } catch (error) {
 *   if (error instanceof StealthAddressError) {
 *     console.error('Stealth address error:', error.message)
 *   }
 * }
 * ```
 */
export class StealthAddressError extends Error {
  override name = 'StealthAddressError'

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Error thrown when a meta-address has an invalid format
 *
 * @description
 * A valid meta-address must be:
 * - 0x-prefixed
 * - 134 hex characters (67 bytes)
 * - Start with a valid scheme ID
 *
 * @example
 * ```ts
 * // This will throw InvalidMetaAddressError
 * parseMetaAddress('0x1234') // Too short
 * parseMetaAddress('not-hex') // Invalid format
 * ```
 */
export class InvalidMetaAddressError extends StealthAddressError {
  override name = 'InvalidMetaAddressError'

  constructor(
    message = 'Invalid stealth meta-address format. Expected 0x-prefixed, 134 hex characters (67 bytes).'
  ) {
    super(message)
  }
}

/**
 * Error thrown when an unsupported scheme ID is encountered
 *
 * @description
 * Currently only scheme 0x02 (secp256k1 with view tags) is supported.
 * Other schemes may be added in future versions.
 *
 * @example
 * ```ts
 * // This will throw UnsupportedSchemeError
 * encodeMetaAddress({
 *   scheme: 0x01, // Unsupported
 *   spendPubkey: '0x...',
 *   viewPubkey: '0x...'
 * })
 * ```
 */
export class UnsupportedSchemeError extends StealthAddressError {
  override name = 'UnsupportedSchemeError'

  /** The unsupported scheme ID that was provided */
  scheme: number

  constructor(scheme: number) {
    super(
      `Unsupported scheme: 0x${scheme.toString(16).padStart(2, '0')}. Only scheme 0x02 (secp256k1 with view tags) is supported.`
    )
    this.scheme = scheme
  }
}

/**
 * Error thrown when the view tag doesn't match during key recovery
 *
 * @description
 * This error indicates that the announcement was not intended for the
 * recipient's keys. The view tag is a quick check to filter announcements
 * before attempting full key recovery.
 *
 * @example
 * ```ts
 * // This will throw ViewTagMismatchError if the announcement
 * // wasn't created for this recipient
 * recoverStealthPrivKey({
 *   viewPrivKey: myViewKey,
 *   spendPrivKey: mySpendKey,
 *   ephemPubKey: announcement.ephemPubKey,
 *   viewTag: announcement.viewTag
 * })
 * ```
 */
export class ViewTagMismatchError extends StealthAddressError {
  override name = 'ViewTagMismatchError'

  /** The expected view tag based on the shared secret */
  expectedTag: string
  /** The actual view tag from the announcement */
  actualTag: string

  constructor(expectedTag: string, actualTag: string) {
    super(
      `View tag mismatch: expected ${expectedTag}, got ${actualTag}. This announcement is not intended for this recipient.`
    )
    this.expectedTag = expectedTag
    this.actualTag = actualTag
  }
}

/**
 * Error thrown when a private key is invalid
 *
 * @description
 * Private keys must be valid 32-byte hex strings within the secp256k1 curve order.
 */
export class InvalidPrivateKeyError extends StealthAddressError {
  override name = 'InvalidPrivateKeyError'

  constructor(message = 'Invalid private key. Must be a valid 32-byte hex string.') {
    super(message)
  }
}

/**
 * Error thrown when a public key is invalid
 *
 * @description
 * Public keys must be valid compressed (33 bytes) or uncompressed (65 bytes)
 * points on the secp256k1 curve.
 */
export class InvalidPublicKeyError extends StealthAddressError {
  override name = 'InvalidPublicKeyError'

  constructor(
    message = 'Invalid public key. Must be a valid compressed (33 bytes) or uncompressed (65 bytes) secp256k1 point.'
  ) {
    super(message)
  }
}
