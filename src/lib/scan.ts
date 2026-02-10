import type { Log } from 'viem'
import { recoverStealthPrivKey } from './stealth'
import { ViewTagMismatchError } from './errors'
import type { ScanConfig, ScanMatch } from './types'

/**
 * Scans announcement logs to find stealth payments for a recipient
 *
 * @description
 * Filters through ERC-5564 announcement logs and attempts to recover
 * stealth private keys using the recipient's view and spend keys.
 * Announcements that don't match (wrong view tag) are silently skipped.
 *
 * For efficient scanning, consider using the view tag to pre-filter
 * logs before calling this function.
 *
 * @param logs - Array of announcement logs from the Announcer contract
 * @param config - The recipient's private keys for scanning
 * @returns Array of matching announcements with recovered private keys
 *
 * @example
 * ```ts
 * import { scanAnnouncements, ANNOUNCER_ABI, ANNOUNCER_SINGLETON } from 'stealth-addresses-utils'
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * // Fetch announcement logs
 * const logs = await client.getLogs({
 *   address: ANNOUNCER_SINGLETON,
 *   event: parseAbiItem('event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)'),
 *   fromBlock: 'earliest',
 * })
 *
 * // Scan for payments to us
 * const matches = scanAnnouncements(logs, {
 *   viewPrivKey: myViewPrivateKey,
 *   spendPrivKey: mySpendPrivateKey,
 * })
 *
 * for (const match of matches) {
 *   console.log('Found payment at:', match.stealthAddress)
 *   console.log('Private key:', match.stealthPrivKey)
 * }
 * ```
 *
 * @example
 * ```ts
 * // Optimized scanning with view tag pre-filtering
 * import { scanAnnouncements } from 'stealth-addresses-utils'
 *
 * // Pre-compute expected view tags for your view key
 * // (This is an optimization for high-volume scanning)
 * const relevantLogs = logs.filter(log => {
 *   // Extract view tag from metadata and do quick check
 *   const metadata = log.data
 *   const viewTag = metadata.slice(0, 4) // First byte
 *   return couldBeForUs(viewTag, myViewPrivKey)
 * })
 *
 * const matches = scanAnnouncements(relevantLogs, config)
 * ```
 *
 * @see https://eips.ethereum.org/EIPS/eip-5564#scanning
 */
export function scanAnnouncements(logs: Log[], config: ScanConfig): ScanMatch[] {
  const matches: ScanMatch[] = []

  for (const log of logs) {
    try {
      // Extract ephemeral public key and view tag from log
      // Note: The exact extraction depends on how your logs are structured
      // This is a generic implementation that may need adjustment
      const args = log as Log & {
        args?: {
          ephemeralPubKey?: `0x${string}`
          metadata?: `0x${string}`
        }
      }

      const ephemPubKey = args.args?.ephemeralPubKey
      const metadata = args.args?.metadata

      if (!ephemPubKey) {
        continue
      }

      // Extract view tag from metadata (first byte)
      const viewTag: `0x${string}` = metadata ? `0x${metadata.slice(2, 4)}` : '0x00'

      const result = recoverStealthPrivKey({
        viewPrivKey: config.viewPrivKey,
        spendPrivKey: config.spendPrivKey,
        ephemPubKey,
        viewTag,
      })

      matches.push({
        log,
        stealthAddress: result.stealthAddress,
        stealthPrivKey: result.stealthPrivKey,
      })
    } catch (error) {
      // Skip announcements that aren't for us (ViewTagMismatchError)
      // or have invalid data - silently continue
      if (!(error instanceof ViewTagMismatchError)) {
        // Unexpected errors are silently ignored in production
        // Users can wrap this function for custom error handling
      }
    }
  }

  return matches
}

// Re-export types for convenience
export type { ScanConfig, ScanMatch } from './types'
