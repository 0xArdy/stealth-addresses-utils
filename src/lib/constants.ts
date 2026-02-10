/**
 * ERC-5564 Announcer singleton contract address
 *
 * @description
 * This is the canonical address of the ERC-5564 Announcer contract
 * deployed across all EVM chains. Senders publish announcements to
 * this contract so recipients can discover stealth payments.
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564
 */
export const ANNOUNCER_SINGLETON = '0x55649E01B5Df198D18D95b5cc5051630cfD45564' as const

/**
 * Length of the view tag in bytes
 *
 * @description
 * The view tag is a 1-byte value derived from the shared secret.
 * It allows recipients to quickly filter announcements without
 * performing full elliptic curve operations.
 */
export const VIEW_TAG_LENGTH = 1 as const

/**
 * Scheme ID for secp256k1 with view tags
 *
 * @description
 * ERC-5564 defines scheme IDs to support different cryptographic schemes.
 * Scheme 0x02 indicates:
 * - secp256k1 elliptic curve
 * - View tags enabled for efficient scanning
 *
 * This is currently the only supported scheme in this implementation.
 */
export const SCHEME_ID = 0x02 as const

/**
 * Length of a compressed secp256k1 public key in bytes
 */
export const COMPRESSED_PUBLIC_KEY_LENGTH = 33 as const

/**
 * Length of a private key in bytes
 */
export const PRIVATE_KEY_LENGTH = 32 as const

/**
 * Total length of a meta-address in bytes (1 + 33 + 33)
 */
export const META_ADDRESS_LENGTH = 67 as const
