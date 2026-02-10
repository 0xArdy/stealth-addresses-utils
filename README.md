# stealth-addresses-utils

TypeScript implementation of [ERC-5564 Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564) for Ethereum privacy.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![viem](https://img.shields.io/badge/viem-2.x-purple.svg)](https://viem.sh/)

## Features

- **Type-safe** - Full TypeScript support with comprehensive type definitions
- **Modern** - Built with [viem](https://viem.sh) for optimal Ethereum integration
- **Lightweight** - Minimal dependencies, tree-shakable
- **Complete** - Implements full ERC-5564 workflow (generate, derive, recover, scan)
- **Tested** - Comprehensive test suite with vitest

## Installation

```bash
# npm
npm install stealth-addresses-utils

# pnpm
pnpm add stealth-addresses-utils

# yarn
yarn add stealth-addresses-utils
```

## Quick Start

### 1. Generate Stealth Keypairs (Recipient)

```typescript
import { generateStealthKeyPairs, encodeMetaAddress, SCHEME_ID } from 'stealth-addresses-utils'

// Generate keypairs for receiving stealth payments
const { spend, view } = generateStealthKeyPairs()

// Create meta-address to share publicly
const metaAddress = encodeMetaAddress({
  scheme: SCHEME_ID, // 0x02 for secp256k1
  spendPubkey: spend.publicKey,
  viewPubkey: view.publicKey,
})

console.log('Share this meta-address:', metaAddress)
// Store private keys securely!
```

### 2. Derive Stealth Address (Sender)

```typescript
import { getSenderStealthAddress } from 'stealth-addresses-utils'

// Alice wants to send funds to Bob
const result = getSenderStealthAddress(bobMetaAddress)

console.log('Send funds to:', result.stealthAddress)
console.log('Ephemeral pubkey:', result.ephemPubKey) // for announcement
console.log('View tag:', result.viewTag) // for announcement
```

### 3. Recover Stealth Private Key (Recipient)

```typescript
import { recoverStealthPrivKey } from 'stealth-addresses-utils'

// Bob recovers the private key from announcement data
const { stealthAddress, stealthPrivKey } = recoverStealthPrivKey({
  viewPrivKey: bobViewPrivateKey,
  spendPrivKey: bobSpendPrivateKey,
  ephemPubKey: announcement.ephemPubKey,
  viewTag: announcement.viewTag,
})

// Bob can now spend from stealthAddress using stealthPrivKey
```

### 4. Full Example with viem

```typescript
import {
  getSenderStealthAddress,
  encodeAnnouncementCalldata,
  encodeMetadataWithViewTag,
  ANNOUNCER_SINGLETON,
} from 'stealth-addresses-utils'
import { createWalletClient, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const client = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: mainnet,
  transport: http(),
})

// 1. Derive stealth address
const { stealthAddress, ephemPubKey, viewTag } = getSenderStealthAddress(recipientMetaAddress)

// 2. Send funds
await client.sendTransaction({
  to: stealthAddress,
  value: parseEther('1.0'),
})

// 3. Publish announcement
const metadata = encodeMetadataWithViewTag(viewTag)
const calldata = encodeAnnouncementCalldata(stealthAddress, ephemPubKey, metadata)

await client.sendTransaction({
  to: ANNOUNCER_SINGLETON,
  data: calldata,
})
```

## API Reference

### Core Functions

| Function                                              | Description                                    |
| ----------------------------------------------------- | ---------------------------------------------- |
| [`getSenderStealthAddress`](#getsenderstealthaddress) | Derives a stealth address for a recipient      |
| [`recoverStealthPrivKey`](#recoverstealthprivkey)     | Recovers the private key for a stealth address |
| [`encodeMetaAddress`](#encodemetaaddress)             | Encodes a stealth meta-address                 |
| [`parseMetaAddress`](#parsemetaaddress)               | Parses a stealth meta-address                  |
| [`scanAnnouncements`](#scanannouncements)             | Scans logs for matching announcements          |

### Utilities

| Function                     | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `generateKeyPair`            | Generates a random secp256k1 keypair        |
| `generateStealthKeyPairs`    | Generates spend + view keypairs             |
| `derivePublicKey`            | Derives public key from private key         |
| `encodeAnnouncementCalldata` | Encodes calldata for the Announcer contract |
| `encodeMetadataWithViewTag`  | Encodes view tag as metadata                |

### Constants

| Constant              | Value           | Description                         |
| --------------------- | --------------- | ----------------------------------- |
| `ANNOUNCER_SINGLETON` | `0x5564...5564` | ERC-5564 Announcer contract address |
| `SCHEME_ID`           | `0x02`          | secp256k1 with view tags            |
| `VIEW_TAG_LENGTH`     | `1`             | View tag is 1 byte                  |

---

### `getSenderStealthAddress`

Derives a stealth address for a recipient from their meta-address.

```typescript
function getSenderStealthAddress(metaAddress: string): Promise<SenderDerivationResult>
```

**Parameters:**

- `metaAddress` - The recipient's stealth meta-address (0x-prefixed, 134 hex chars)

**Returns:**

- `stealthAddress` - The derived EOA address to send funds to
- `stealthPubKey` - Compressed public key of the stealth address
- `viewTag` - 1-byte tag for efficient scanning
- `ephemPubKey` - Ephemeral public key to include in announcement
- `ephemPrivKey` - Ephemeral private key (keep secret)

**Example:**

```typescript
const result = await getSenderStealthAddress('0x02...')
// {
//   stealthAddress: '0x1234...',
//   stealthPubKey: '0x02...',
//   viewTag: '0xab',
//   ephemPubKey: '0x03...',
//   ephemPrivKey: '0x...'
// }
```

---

### `recoverStealthPrivKey`

Recovers the private key for a stealth address from announcement data.

```typescript
function recoverStealthPrivKey(input: KeyRecoveryInput): RecoveryResult
```

**Parameters:**

- `viewPrivKey` - Recipient's view private key
- `spendPrivKey` - Recipient's spend private key
- `ephemPubKey` - Ephemeral public key from announcement
- `viewTag` - View tag from announcement

**Returns:**

- `stealthAddress` - The stealth address
- `stealthPrivKey` - The recovered private key

**Throws:**

- `ViewTagMismatchError` - If the announcement is not for this recipient

---

### `encodeMetaAddress`

Encodes a stealth meta-address from its components.

```typescript
function encodeMetaAddress(metaAddress: MetaAddress): string
```

**Parameters:**

- `scheme` - Scheme ID (must be `0x02`)
- `spendPubkey` - Compressed spend public key (33 bytes)
- `viewPubkey` - Compressed view public key (33 bytes)

**Throws:**

- `UnsupportedSchemeError` - If scheme is not `0x02`

---

### `parseMetaAddress`

Parses a stealth meta-address into its components.

```typescript
function parseMetaAddress(raw: string): MetaAddress
```

**Throws:**

- `InvalidMetaAddressError` - If the format is invalid

---

### `scanAnnouncements`

Scans announcement logs for stealth payments to a recipient.

```typescript
function scanAnnouncements(logs: Log[], config: ScanConfig): ScanMatch[]
```

## Scripts

The package includes CLI scripts for testing and demonstration:

```bash
# Run full demo (generates keys, derives stealth address, recovers)
pnpm demo

# Create a new stealth meta-address
pnpm create-sma

# Derive a stealth address from META_ADDRESS env var
pnpm create-stealth

# Recover private key from announcement data
pnpm recover
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Meta-address for deriving stealth addresses
META_ADDRESS=0x02...

# Private keys for recovery
VIEW_PRIVATE_KEY=0x...
SPEND_PRIVATE_KEY=0x...

# Announcement data for recovery
EPHEMERAL_PUBLIC_KEY=0x...
VIEW_TAG=0x...
```

## Related Resources

- [ERC-5564: Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564)
- [ERC-6538: Stealth Meta-Address Registry](https://eips.ethereum.org/EIPS/eip-6538)
- [Vitalik's post on stealth addresses](https://vitalik.eth.limo/general/2023/01/20/stealth.html)
- [viem documentation](https://viem.sh)

## License

[GNU AGPL v3.0](LICENSE)
