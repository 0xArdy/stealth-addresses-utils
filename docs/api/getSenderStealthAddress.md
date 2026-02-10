# getSenderStealthAddress

Derives a stealth address for a recipient from their meta-address.

## Import

```typescript
import { getSenderStealthAddress } from 'stealth-addresses-utils'
```

## Usage

```typescript
const result = getSenderStealthAddress(metaAddress)
```

## Returns

`SenderDerivationResult`

```typescript
interface SenderDerivationResult {
  /** The derived stealth EOA address to send funds to */
  stealthAddress: `0x${string}`
  /** Compressed public key of the stealth address */
  stealthPubKey: `0x${string}`
  /** View tag for efficient scanning (1 byte) */
  viewTag: `0x${string}`
  /** Ephemeral private key (KEEP SECRET) */
  ephemPrivKey: `0x${string}`
  /** Ephemeral public key for announcement */
  ephemPubKey: `0x${string}`
}
```

## Parameters

### metaAddress

- **Type:** `string`
- **Required:** Yes

The recipient's stealth meta-address. Must be a valid ERC-5564 meta-address:
- 0x-prefixed
- 134 hex characters (67 bytes)
- Starts with scheme ID (0x02)

```typescript
const result = await getSenderStealthAddress(
  '0x02...' // 134 hex chars
)
```

## Errors

### InvalidMetaAddressError

Thrown when the meta-address format is invalid.

```typescript
import { getSenderStealthAddress, InvalidMetaAddressError } from 'stealth-addresses-utils'

try {
  await getSenderStealthAddress('invalid')
} catch (error) {
  if (error instanceof InvalidMetaAddressError) {
    console.error('Invalid format:', error.message)
  }
}
```

## Examples

### Basic Usage

```typescript
import { getSenderStealthAddress } from 'stealth-addresses-utils'

const recipientMetaAddress = '0x02...'

const {
  stealthAddress,
  stealthPubKey,
  viewTag,
  ephemPubKey,
} = getSenderStealthAddress(recipientMetaAddress)

console.log('Send funds to:', stealthAddress)
console.log('Include in announcement:', ephemPubKey, viewTag)
```

### With viem Transaction

```typescript
import { getSenderStealthAddress, encodeAnnouncementCalldata, ANNOUNCER_SINGLETON } from 'stealth-addresses-utils'
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
const txHash = await client.sendTransaction({
  to: stealthAddress,
  value: parseEther('1.0'),
})

// 3. Publish announcement
const calldata = encodeAnnouncementCalldata(stealthAddress, ephemPubKey, viewTag)
await client.sendTransaction({
  to: ANNOUNCER_SINGLETON,
  data: calldata,
})
```

### Generating Multiple Stealth Addresses

Each call generates a unique stealth address using a fresh ephemeral key:

```typescript
const result1 = getSenderStealthAddress(metaAddress)
const result2 = getSenderStealthAddress(metaAddress)

// Different addresses, different ephemeral keys
console.log(result1.stealthAddress !== result2.stealthAddress) // true
```

## How It Works

1. **Generate ephemeral key**: A random 32-byte private key is generated
2. **Compute shared secret**: ECDH between ephemeral private key and recipient's view public key
3. **Derive view tag**: First byte of `keccak256(sharedSecret)`
4. **Compute stealth public key**: `spendPub + hash(sharedSecret || viewTag) * G`
5. **Derive address**: Standard Ethereum address derivation from public key

## Related

- [recoverStealthPrivKey](./recoverStealthPrivKey.md) - Recipient-side key recovery
- [encodeAnnouncementCalldata](./encodeAnnouncementCalldata.md) - Encode announcement data
- [ERC-5564 Specification](https://eips.ethereum.org/EIPS/eip-5564)
