/*
 * npm run test
 */
import { encodeMetaAddress } from "../src/lib/metaAddress";
import {
  getSenderStealthAddress,
  recoverStealthPrivKey,
} from "../src/lib/stealth";
import { hexlify, randomBytes } from "ethers";

async function main() {
  // 1. Recipient sets up keys & meta-address
  const spendPriv = hexlify(randomBytes(32));
  const viewPriv = hexlify(randomBytes(32));
  const secp = await import("@noble/secp256k1");
  const spendPubBytes = secp.getPublicKey(spendPriv.slice(2), true);
  const viewPubBytes = secp.getPublicKey(viewPriv.slice(2), true);
  const spendPub =
    "0x" +
    Array.from(spendPubBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  const viewPub =
    "0x" +
    Array.from(viewPubBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  const metaAddr = encodeMetaAddress({
    scheme: 0x02,
    spendPubkey: spendPub,
    viewPubkey: viewPub,
  });
  console.log("Meta-Address:", metaAddr);
  console.log("Spend Pub:", spendPub);
  console.log("View Pub:", viewPub);
  console.log("Spend Priv:", spendPriv);
  console.log("View Priv:", viewPriv);

  // 2. Sender derives stealth address
  const senderRes = await getSenderStealthAddress(metaAddr);
  console.log("Sender result:", senderRes);

  // 3. Recipient sees announcement and recovers private key
  const rec = recoverStealthPrivKey({
    viewPrivKey: viewPriv,
    spendPrivKey: spendPriv,
    ephemPubKey: senderRes.ephemPubKey,
    viewTag: senderRes.viewTag,
  });
  console.log("Recovered:", rec);

  console.assert(
    rec.stealthAddress === senderRes.stealthAddress,
    "address mismatch"
  );
}

main().catch(console.error);
