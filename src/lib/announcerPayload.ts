import { Interface, zeroPadValue } from "ethers";
import { ANNOUNCER_ABI } from "./announcerAbi";

/** Encodes calldata to call announce() */
export function encodeAnnouncementCalldata(
  ephemPubKey: string,
  metaAddr: string,
  viewTag: string,
  metadata: string = "0x"
): string {
  const iface = new Interface(ANNOUNCER_ABI);
  return iface.encodeFunctionData("announce", [
    ephemPubKey,
    metaAddr,
    parseInt(viewTag, 16),
    metadata,
  ]);
}
