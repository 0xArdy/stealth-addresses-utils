# recoverStealthPrivKey

Recovers the private key for a stealth address from announcement data.

## Import

```typescript
import { recoverStealthPrivKey } from 'stealth-addresses-utils'
```

## Usage

```typescript
const result = recoverStealthPrivKey({
  viewPrivKey: '0x...',
  spendPrivKey: '0x...',
  ephemPubKey: '0x...',
  viewTag: '0x...',
})
```

## Returns

`RecoveryResult`

```typescript
interface RecoveryResult {
  /** The stealth address */
  stealthAddress: `0x${string}`
  /** The recovered private key */
  stealthPrivKey: `0x${string}`
}
```

## Parameters

### viewPrivKey

- **Type:** `` `0x${string}` ``
- **Required:** Yes

The recipient's view private key (32 bytes).

### spendPrivKey

- **Type:** `` `0x${string}` ``
- **Required:** Yes

The recipient's spend private key (32 bytes).

### ephemPubKey

- **Type:** `` `0x${string}` ``
- **Required:** Yes

The ephemeral public key from the announcement (33 bytes, compressed).

### viewTag

- **Type:** `` `0x${string}` ``
- **Required:** Yes

The view tag from the announcement (1 byte).

## Errors

### ViewTagMismatchError

Thrown when the view tag doesn't match the computed value. This indicates the announcement was not intended for this recipient.

```typescript
import { recoverStealthPrivKey, ViewTagMismatchError } from 'stealth-addresses-utils'

try {
  const result = recoverStealthPrivKey({
    viewPrivKey,
    spendPrivKey,
    ephemPubKey,
    viewTag,
  })
} catch (error) {
  if (error instanceof ViewTagMismatchError) {
    console.log('Not for us:', error.expectedTag, '!=', error.actualTag)
  }
}
```

## Examples

### Basic Recovery

```typescript
import { recoverStealthPrivKey } from 'stealth-addresses-utils'

const { stealthAddress, stealthPrivKey } = recoverStealthPrivKey({
  viewPrivKey: myViewPrivateKey,
  spendPrivKey: mySpendPrivateKey,
  ephemPubKey: announcement.ephemPubKey,
  viewTag: announcement.viewTag,
})

console.log('Recovered address:', stealthAddress)
console.log('Private key:', stealthPrivKey)
```

### Scanning Multiple Announcements

```typescript
import { recoverStealthPrivKey, ViewTagMismatchError } from 'stealth-addresses-utils'

const myPayments = []

for (const announcement of announcements) {
  try {
    const result = recoverStealthPrivKey({
      viewPrivKey,
      spendPrivKey,
      ephemPubKey: announcement.ephemPubKey,
      viewTag: announcement.viewTag,
    })
    myPayments.push(result)
  } catch (error) {
    if (error instanceof ViewTagMismatchError) {
      // Not for us, skip
      continue
    }
    throw error
  }
}

console.log(`Found ${myPayments.length} payments`)
```

### Using with viem Wallet

```typescript
import { recoverStealthPrivKey } from 'stealth-addresses-utils'
import { createWalletClient, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Recover the stealth private key
const { stealthAddress, stealthPrivKey } = recoverStealthPrivKey({
  viewPrivKey,
  spendPrivKey,
  ephemPubKey,
  viewTag,
})

// Create wallet client with the stealth key
const stealthWallet = createWalletClient({
  account: privateKeyToAccount(stealthPrivKey),
  chain: mainnet,
  transport: http(),
})

// Spend funds from the stealth address
await stealthWallet.sendTransaction({
  to: destinationAddress,
  value: parseEther('0.5'),
})
```

## How It Works

1. **Compute shared secret**: ECDH between view private key and ephemeral public key
2. **Verify view tag**: Check if first byte of `keccak256(sharedSecret)` matches
3. **Compute stealth private key**: `spendPriv + hash(sharedSecret || viewTag) mod n`
4. **Derive address**: Verify by deriving address from private key

## Security Considerations

- The recovered `stealthPrivKey` controls funds at `stealthAddress`
- Handle the private key with the same security as any other private key
- Consider using hardware wallets for production spend keys

## Related

- [getSenderStealthAddress](./getSenderStealthAddress.md) - Sender-side address derivation
- [scanAnnouncements](./scanAnnouncements.md) - Batch scanning helper
- [ERC-5564 Specification](https://eips.ethereum.org/EIPS/eip-5564)
