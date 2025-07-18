# ERC-5564 Stealth Addresses

A TypeScript implementation of ERC-5564 stealth addresses.

## Repository Structure

```
├── src/lib/          # Core library functionality
│   ├── index.ts      # Main exports
│   ├── stealth.ts    # Core stealth address logic
│   ├── metaAddress.ts # Meta-address encoding/parsing
│   ├── scan.ts       # Scanner for announcements
│   ├── constants.ts  # Protocol constants
│   ├── announcerAbi.ts # Contract ABI
│   └── announcerPayload.ts # Payload utilities
├── scripts/          # Example scripts and demos
│   ├── demo.ts       # Full demonstration
│   ├── createSma.ts  # Create stealth meta-address
│   ├── createStealth.ts # Generate stealth address
│   └── recover.ts    # Recover stealth private key
└── package.json      # Dependencies and scripts
```

## Usage

### Environment Setup

Copy the example environment file and configure your parameters:

```bash
cp env.example .env
```

Edit `.env` to set your parameters:

- `META_ADDRESS` - Meta-address for generating stealth addresses
- `VIEW_PRIVATE_KEY` - View private key for recovery
- `SPEND_PRIVATE_KEY` - Spend private key for recovery
- `EPHEMERAL_PUBLIC_KEY` - Ephemeral public key for recovery
- `VIEW_TAG` - View tag for recovery
- `PREDEFINED_SPEND_PRIVATE_KEY` (optional) - Use specific spend key in create script
- `PREDEFINED_VIEW_PRIVATE_KEY` (optional) - Use specific view key in create script

### Running Examples

```bash
# Run the full demo (uses hardcoded values)
npm run demo

# Create a stealth meta-address (uses env vars if available, otherwise random)
npm run create-sma

# Generate a stealth address (requires META_ADDRESS env var)
npm run create-stealth

# Recover a stealth private key (requires recovery env vars)
npm run recover
```

### Using the Library

```typescript
import {
  getSenderStealthAddress,
  recoverStealthPrivKey,
  encodeMetaAddress,
} from "./src/lib";

// Your code here...
```

## Scripts

- `npm run demo` - Runs the complete demo showing key generation, stealth address creation, and recovery (uses hardcoded values)
- `npm run create-sma` - Creates a stealth meta-address (uses env vars if provided, otherwise generates random keys)
- `npm run create-stealth` - Generates a stealth address from META_ADDRESS environment variable
- `npm run recover` - Recovers stealth private key using environment variables (VIEW_PRIVATE_KEY, SPEND_PRIVATE_KEY, etc.)
- `npm run build` - Compiles TypeScript to JavaScript

### Dependencies

The scripts automatically load environment variables using the `dotenv` package. Environment variables are loaded from `.env` file.

### Security

⚠️ **Important**: The `.env` file contains private keys and sensitive data. Make sure:

- Never commit `.env` files to version control (already added to `.gitignore`)
- Use test/development keys only - never production private keys
- Keep your `.env` file secure and private
