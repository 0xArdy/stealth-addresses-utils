import { encodeMetaAddress } from "../src/lib/metaAddress";
import { hexlify, randomBytes } from "ethers";
import "dotenv/config";

async function main() {
  // Use predefined keys from env if available, otherwise generate random ones
  const spendPriv =
    process.env.PREDEFINED_SPEND_PRIVATE_KEY || hexlify(randomBytes(32));
  const viewPriv =
    process.env.PREDEFINED_VIEW_PRIVATE_KEY || hexlify(randomBytes(32));

  console.log(
    spendPriv === process.env.PREDEFINED_SPEND_PRIVATE_KEY
      ? "Using predefined spend private key from environment"
      : "Generated random spend private key"
  );
  console.log(
    viewPriv === process.env.PREDEFINED_VIEW_PRIVATE_KEY
      ? "Using predefined view private key from environment"
      : "Generated random view private key"
  );
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
}

main().catch(console.error);
