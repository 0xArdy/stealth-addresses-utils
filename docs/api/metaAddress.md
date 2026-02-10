# Meta-Address Functions

Functions for encoding and parsing ERC-5564 stealth meta-addresses.

## encodeMetaAddress

Encodes a stealth meta-address from its components.

### Import

```typescript
import { encodeMetaAddress } from 'stealth-addresses-utils'
```

### Usage

```typescript
const metaAddress = encodeMetaAddress({
  scheme: 0x02,
  spendPubkey: '0x02...',
  viewPubkey: '0x03...',
})
```

### Returns

`` `0x${string}` `` - The encoded meta-address (67 bytes / 134 hex chars)

### Parameters

#### scheme

- **Type:** `number`
- **Required:** Yes

The scheme ID. Must be `0x02` (secp256k1 with view tags).

#### spendPubkey

- **Type:** `` `0x${string}` ``
- **Required:** Yes

Compressed spend public key (33 bytes).

#### viewPubkey

- **Type:** `` `0x${string}` ``
- **Required:** Yes

Compressed view public key (33 bytes).

### Errors

#### UnsupportedSchemeError

Thrown when scheme is not `0x02`.

```typescript
import { encodeMetaAddress, UnsupportedSchemeError } from 'stealth-addresses-utils'

try {
  encodeMetaAddress({
    scheme: 0x01, // Invalid
    spendPubkey: '0x...',
    viewPubkey: '0x...',
  })
} catch (error) {
  if (error instanceof UnsupportedSchemeError) {
    console.error(`Scheme ${error.scheme} not supported`)
  }
}
```

### Example

```typescript
import { encodeMetaAddress, generateStealthKeyPairs, SCHEME_ID } from 'stealth-addresses-utils'

const { spend, view } = generateStealthKeyPairs()

const metaAddress = encodeMetaAddress({
  scheme: SCHEME_ID,
  spendPubkey: spend.publicKey,
  viewPubkey: view.publicKey,
})

console.log('Meta-address:', metaAddress)
// '0x02<66 hex chars><66 hex chars>'
```

---

## parseMetaAddress

Parses a stealth meta-address into its components.

### Import

```typescript
import { parseMetaAddress } from 'stealth-addresses-utils'
```

### Usage

```typescript
const parsed = parseMetaAddress('0x02...')
```

### Returns

`MetaAddress`

```typescript
interface MetaAddress {
  /** Scheme ID (0x02 for secp256k1) */
  scheme: number
  /** Compressed spend public key */
  spendPubkey: `0x${string}`
  /** Compressed view public key */
  viewPubkey: `0x${string}`
}
```

### Parameters

#### raw

- **Type:** `string`
- **Required:** Yes

The raw meta-address string to parse.

### Errors

#### InvalidMetaAddressError

Thrown when the format is invalid.

```typescript
import { parseMetaAddress, InvalidMetaAddressError } from 'stealth-addresses-utils'

try {
  parseMetaAddress('invalid')
} catch (error) {
  if (error instanceof InvalidMetaAddressError) {
    console.error('Invalid format:', error.message)
  }
}
```

### Example

```typescript
import { parseMetaAddress } from 'stealth-addresses-utils'

const metaAddress = '0x02abc...def'

const { scheme, spendPubkey, viewPubkey } = parseMetaAddress(metaAddress)

console.log('Scheme:', scheme)        // 2
console.log('Spend key:', spendPubkey) // '0x02...' or '0x03...'
console.log('View key:', viewPubkey)   // '0x02...' or '0x03...'
```

---

## Meta-Address Format

The ERC-5564 stealth meta-address format:

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Stealth Meta-Address (67 bytes)                  │
├──────────┬───────────────────────────────┬──────────────────────────┤
│ Scheme   │ Spend Public Key              │ View Public Key          │
│ (1 byte) │ (33 bytes, compressed)        │ (33 bytes, compressed)   │
├──────────┼───────────────────────────────┼──────────────────────────┤
│   0x02   │ 0x02... or 0x03...            │ 0x02... or 0x03...       │
└──────────┴───────────────────────────────┴──────────────────────────┘
```

- **Total size**: 67 bytes = 134 hex characters + "0x" prefix
- **Scheme 0x02**: secp256k1 curve with view tags enabled

## Related

- [generateStealthKeyPairs](./utils.md#generatestealthkeypairs) - Generate keypairs
- [getSenderStealthAddress](./getSenderStealthAddress.md) - Use meta-address
- [ERC-5564 Specification](https://eips.ethereum.org/EIPS/eip-5564)
