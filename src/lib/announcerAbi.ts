/**
 * ABI for the ERC-5564 Announcer contract
 *
 * @description
 * The Announcer contract is a singleton deployed at the same address
 * across all EVM chains. It emits events that recipients can scan
 * to discover stealth payments sent to them.
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564#announcer-contract
 */
export const ANNOUNCER_ABI = [
  {
    type: 'event',
    name: 'Announcement',
    inputs: [
      { name: 'schemeId', type: 'uint256', indexed: true },
      { name: 'stealthAddress', type: 'address', indexed: true },
      { name: 'caller', type: 'address', indexed: true },
      { name: 'ephemeralPubKey', type: 'bytes', indexed: false },
      { name: 'metadata', type: 'bytes', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'announce',
    inputs: [
      { name: 'schemeId', type: 'uint256' },
      { name: 'stealthAddress', type: 'address' },
      { name: 'ephemeralPubKey', type: 'bytes' },
      { name: 'metadata', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * Legacy ABI format (for compatibility with older code)
 *
 * @deprecated Use ANNOUNCER_ABI instead
 */
export const ANNOUNCER_ABI_LEGACY = [
  'event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)',
  'function announce(uint256 schemeId, address stealthAddress, bytes ephemeralPubKey, bytes metadata) external',
] as const
