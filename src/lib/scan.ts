/**
 * Offline scanner that filters StealthAddressAnnounced logs,
 * attempts key-recovery and returns matches for recipient keys.
 */
import { Log } from "ethers";
import { recoverStealthPrivKey } from "./stealth";

export interface ScanConfig {
  viewPrivKey: string;
  spendPrivKey: string;
}

export function scanAnnouncements(logs: Array<Log>, cfg: ScanConfig) {
  const matches: Array<{
    log: Log;
    stealthAddress: string;
    stealthPrivKey: string;
  }> = [];
  for (const log of logs) {
    try {
      const ephemPub = log.topics[1]; // depends on indexing; adjust if needed
      const tag = "0x" + log.topics[3].slice(2).slice(-2);
      const res = recoverStealthPrivKey({
        viewPrivKey: cfg.viewPrivKey,
        spendPrivKey: cfg.spendPrivKey,
        ephemPubKey: ephemPub,
        viewTag: tag,
      });
      matches.push({ log, ...res });
    } catch {
      /* not for us */
    }
  }
  return matches;
}
