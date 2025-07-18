import { getSenderStealthAddress } from "../src/lib/stealth";
import "dotenv/config";

async function main() {
  const metaAddr = process.env.META_ADDRESS;

  if (!metaAddr) {
    console.error("Error: META_ADDRESS environment variable is required");
    console.error("Please set META_ADDRESS in your environment or .env file");
    process.exit(1);
  }

  console.log("Meta-Address:", metaAddr);

  // Sender derives stealth address
  const senderRes = await getSenderStealthAddress(metaAddr);
  console.log("Sender result:", senderRes);
}

main().catch(console.error);
