/**
 * Stealth Meta-Address structure
 *
 * @description
 * A stealth meta-address contains the public keys needed for others to
 * derive stealth addresses for you. It follows the ERC-5564 format:
 * - 1 byte scheme ID
 * - 33 bytes compressed spend public key
 * - 33 bytes compressed view public key
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564
 */
export interface MetaAddress {
  /**
   * Scheme identifier (0x02 for secp256k1 with view tags)
   */
  scheme: number
  /**
   * Compressed spend public key (33 bytes, 0x-prefixed hex)
   */
  spendPubkey: `0x${string}`
  /**
   * Compressed view public key (33 bytes, 0x-prefixed hex)
   */
  viewPubkey: `0x${string}`
}

/**
 * Result from generating a stealth address (sender-side)
 *
 * @description
 * Contains all the information a sender needs after deriving a stealth address:
 * - The stealth address to send funds to
 * - The ephemeral public key and view tag to include in the announcement
 * - The ephemeral private key (for verification only, should not be shared)
 */
export interface SenderDerivationResult {
  /**
   * The derived stealth EOA address (0x-prefixed, checksummed)
   *
   * @example '0x1234567890123456789012345678901234567890'
   */
  stealthAddress: `0x${string}`
  /**
   * Compressed public key of the stealth address (33 bytes)
   *
   * @example '0x02...'
   */
  stealthPubKey: `0x${string}`
  /**
   * View tag for efficient scanning (1 byte)
   *
   * @example '0xab'
   */
  viewTag: `0x${string}`
  /**
   * Ephemeral private key used in derivation
   *
   * @warning Keep this private! Only needed for verification purposes.
   * @example '0x...' (64 hex chars)
   */
  ephemPrivKey: `0x${string}`
  /**
   * Ephemeral public key to include in announcement (33 bytes compressed)
   *
   * @example '0x02...'
   */
  ephemPubKey: `0x${string}`
}

/**
 * Input parameters for recovering a stealth private key (recipient-side)
 *
 * @description
 * The recipient uses their private keys along with the announcement data
 * to recover the private key for a stealth address.
 */
export interface KeyRecoveryInput {
  /**
   * Recipient's private view key (32 bytes, 0x-prefixed hex)
   */
  viewPrivKey: `0x${string}`
  /**
   * Recipient's private spend key (32 bytes, 0x-prefixed hex)
   */
  spendPrivKey: `0x${string}`
  /**
   * Ephemeral public key from the announcement (33 bytes compressed)
   */
  ephemPubKey: `0x${string}`
  /**
   * View tag from the announcement (1 byte)
   */
  viewTag: `0x${string}`
}

/**
 * Result from recovering a stealth private key
 */
export interface RecoveryResult {
  /**
   * The stealth address (should match the address from the announcement)
   */
  stealthAddress: `0x${string}`
  /**
   * The recovered private key for the stealth address
   *
   * @warning Handle with care! This key controls the funds.
   */
  stealthPrivKey: `0x${string}`
}

/**
 * Configuration for scanning announcements
 */
export interface ScanConfig {
  /**
   * Recipient's private view key for checking view tags
   */
  viewPrivKey: `0x${string}`
  /**
   * Recipient's private spend key for deriving stealth private keys
   */
  spendPrivKey: `0x${string}`
}

/**
 * A matched announcement from scanning
 */
export interface ScanMatch {
  /**
   * The original log entry
   */
  log: unknown
  /**
   * The stealth address from this announcement
   */
  stealthAddress: `0x${string}`
  /**
   * The recovered private key for this stealth address
   */
  stealthPrivKey: `0x${string}`
}

/**
 * A keypair for stealth address operations
 */
export interface KeyPair {
  /**
   * Private key (32 bytes, 0x-prefixed hex)
   */
  privateKey: `0x${string}`
  /**
   * Compressed public key (33 bytes, 0x-prefixed hex)
   */
  publicKey: `0x${string}`
}

/**
 * Complete keypair set for a stealth address recipient
 */
export interface StealthKeyPairs {
  /**
   * Spend keypair - used to derive the final stealth private key
   */
  spend: KeyPair
  /**
   * View keypair - used for efficient scanning of announcements
   */
  view: KeyPair
}
