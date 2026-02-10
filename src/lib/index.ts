/**
 * stealth-addresses-utils
 *
 * TypeScript implementation of ERC-5564 Stealth Addresses for Ethereum privacy.
 *
 * @packageDocumentation
 * @see https://eips.ethereum.org/EIPS/eip-5564
 */

// ============================================================================
// Core Stealth Address Functions
// ============================================================================

export { getSenderStealthAddress, recoverStealthPrivKey } from './stealth'

// ============================================================================
// Meta-Address Utilities
// ============================================================================

export { encodeMetaAddress, parseMetaAddress } from './metaAddress'

// ============================================================================
// Announcement Utilities
// ============================================================================

export { scanAnnouncements } from './scan'

export { encodeAnnouncementCalldata, encodeMetadataWithViewTag } from './announcerPayload'

export { ANNOUNCER_ABI, ANNOUNCER_ABI_LEGACY } from './announcerAbi'

// ============================================================================
// Key Generation Utilities
// ============================================================================

export {
  generateKeyPair,
  generateStealthKeyPairs,
  derivePublicKey,
  bytesToHex,
  hexToBytes,
  isValidHex,
  isValidMetaAddress,
  padHex,
} from './utils'

// ============================================================================
// Constants
// ============================================================================

export {
  ANNOUNCER_SINGLETON,
  VIEW_TAG_LENGTH,
  SCHEME_ID,
  COMPRESSED_PUBLIC_KEY_LENGTH,
  PRIVATE_KEY_LENGTH,
  META_ADDRESS_LENGTH,
} from './constants'

// ============================================================================
// Errors
// ============================================================================

export {
  StealthAddressError,
  InvalidMetaAddressError,
  UnsupportedSchemeError,
  ViewTagMismatchError,
  InvalidPrivateKeyError,
  InvalidPublicKeyError,
} from './errors'

// ============================================================================
// Types
// ============================================================================

export type {
  MetaAddress,
  SenderDerivationResult,
  KeyRecoveryInput,
  RecoveryResult,
  ScanConfig,
  ScanMatch,
  KeyPair,
  StealthKeyPairs,
} from './types'
