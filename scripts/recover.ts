import { recoverStealthPrivKey } from "../src/lib/stealth";
import "dotenv/config";

async function main() {
  const viewPriv = process.env.VIEW_PRIVATE_KEY;
  const spendPriv = process.env.SPEND_PRIVATE_KEY;
  const ephemPubKey = process.env.EPHEMERAL_PUBLIC_KEY;
  const viewTag = process.env.VIEW_TAG;

  // Validate required environment variables
  const requiredVars = [
    { name: "VIEW_PRIVATE_KEY", value: viewPriv },
    { name: "SPEND_PRIVATE_KEY", value: spendPriv },
    { name: "EPHEMERAL_PUBLIC_KEY", value: ephemPubKey },
    { name: "VIEW_TAG", value: viewTag },
  ];

  const missingVars = requiredVars.filter((v) => !v.value);
  if (missingVars.length > 0) {
    console.error("Error: Missing required environment variables:");
    missingVars.forEach((v) => console.error(`  - ${v.name}`));
    console.error(
      "Please set these variables in your environment or .env file"
    );
    process.exit(1);
  }

  // Recipient sees announcement and recovers private key
  const rec = recoverStealthPrivKey({
    viewPrivKey: viewPriv!,
    spendPrivKey: spendPriv!,
    ephemPubKey: ephemPubKey!,
    viewTag: viewTag!,
  });
  console.log("Recovered:", rec);
}

main().catch(console.error);
