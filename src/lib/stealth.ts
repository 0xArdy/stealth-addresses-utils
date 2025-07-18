import { getAddress, hexlify, keccak256, toBeArray, toUtf8Bytes } from "ethers";
import * as secp from "@noble/secp256k1";
import {
  MetaAddress,
  encodeMetaAddress,
  parseMetaAddress,
} from "./metaAddress";
import { EPHEMERAL_TAG_LEN } from "./constants";

/**
 * Helper: convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Helper: hash(sharedSecret || secrecy)
 * We follow EIP-5564 recommendation: Keccak-256 of
 *   (32-byte ECDH sharedSecret || 1-byte viewTag)
 */
function hashSharedSecret(
  sharedSecret: Uint8Array,
  viewTag: Uint8Array
): bigint {
  const preimage = new Uint8Array(33);
  preimage.set(sharedSecret, 0);
  preimage.set(viewTag, 32);
  return BigInt("0x" + keccak256(preimage).slice(2));
}

/**
 * Sender-side:
 * 1. Choose random 32-byte ephemPriv
 * 2. Compute ephemPub = ephemPriv * G
 * 3. sharedSecret = ephemPriv * viewPub
 * 4. viewTag = firstByte(keccak256(sharedSecret))
 * 5. stealthPub  = spendPub + hash(sharedSecret||tag)*G
 */
export interface SenderDerivationResult {
  stealthAddress: string; // EOA 0x…
  stealthPubKey: string; // compressed pubkey hex
  viewTag: string; // 0x?? (1-byte)
  ephemPrivKey: string; // hex ( KEEP PRIVATE! )
  ephemPubKey: string; // compressed pubkey hex
}

/**
 * Derive the stealth EOA + viewTag for a recipient meta-address.
 */
export async function getSenderStealthAddress(
  metaAddrHex: string
): Promise<SenderDerivationResult> {
  const ma = parseMetaAddress(metaAddrHex);

  // 1. random ephemPriv
  const ephemPriv = secp.utils.randomPrivateKey(); // Uint8Array
  const ephemPrivHex = "0x" + hexlify(ephemPriv).slice(2).padStart(64, "0");

  // 2. ephemPub
  const ephemPubHex = "0x" + bytesToHex(secp.getPublicKey(ephemPriv, true));

  // 3. sharedSecret = ephemPriv * viewPub
  const viewPubBytes = toBeArray(ma.viewPubkey);
  const sharedSecret = secp.getSharedSecret(ephemPriv, viewPubBytes, true);
  // drop prefix byte per spec
  const ssStripped = sharedSecret.slice(1); // 32 bytes

  // 4. viewTag
  const viewTagByte = keccak256(ssStripped).slice(2, 4);
  const viewTag = "0x" + viewTagByte;
  const tagBytes = toBeArray(viewTag);

  // 5. stealthPub = spendPub + H*G
  const H = hashSharedSecret(ssStripped, tagBytes) % secp.CURVE.n;
  const tweakPoint = secp.Point.BASE.multiply(H);
  const spendPub = secp.Point.fromHex(ma.spendPubkey.slice(2));
  const stealthPoint = spendPub.add(tweakPoint);
  const stealthPubCompressed = "0x" + bytesToHex(stealthPoint.toRawBytes(true));

  // Ethereum address = last20( keccak256(uncompressed[1:]) )
  const stealthAddress = getAddress(
    "0x" + keccak256(stealthPoint.toRawBytes(false).slice(1)).slice(-40)
  );

  return {
    stealthAddress,
    stealthPubKey: stealthPubCompressed,
    viewTag,
    ephemPrivKey: ephemPrivHex,
    ephemPubKey: ephemPubHex,
  };
}

/**
 * Recipient-side key recovery:
 * 1. Observe announcement (ephemPub, metaAddress, ciphertext?, tag)
 * 2. sharedSecret = privView * ephemPub
 * 3. check Tag matches firstByte(keccak256(sharedSecret))
 * 4. stealthPriv = privSpend + hash(sharedSecret||tag)   (mod n)
 */
export interface KeyRecoveryInput {
  viewPrivKey: string; // recipient's private view key  (32-byte hex)
  spendPrivKey: string; // recipient's private spend key (32-byte hex)
  ephemPubKey: string; // taken from announcement
  viewTag: string; // taken from announcement (0x??)
}

export function recoverStealthPrivKey(input: KeyRecoveryInput): {
  stealthAddress: string;
  stealthPrivKey: string;
} {
  const viewPriv = BigInt(input.viewPrivKey);
  const spendPriv = BigInt(input.spendPrivKey);

  const ephemPubPoint = secp.Point.fromHex(input.ephemPubKey.slice(2));

  // sharedSecret = viewPriv * ephemPub
  const shared = ephemPubPoint.multiply(viewPriv).toRawBytes(true).slice(1);

  // verify tag
  const wantTag = "0x" + keccak256(shared).slice(2, 4);
  if (wantTag.toLowerCase() !== input.viewTag.toLowerCase()) {
    throw new Error("announcement not intended for this recipient");
  }

  const H = hashSharedSecret(shared, toBeArray(input.viewTag)) % secp.CURVE.n;
  const stealthPriv = (spendPriv + H) % secp.CURVE.n;

  const stealthPrivHex = "0x" + stealthPriv.toString(16).padStart(64, "0");
  // derive address for consistency
  const pub = secp.getPublicKey(stealthPrivHex.slice(2), true);
  const addr = getAddress(
    "0x" +
      keccak256(
        secp.getPublicKey(stealthPrivHex.slice(2), false).slice(1)
      ).slice(-40)
  );

  return { stealthPrivKey: stealthPrivHex, stealthAddress: addr };
}
