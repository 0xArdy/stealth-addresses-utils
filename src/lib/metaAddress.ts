/**
 * Stealth Meta-Address format (SECP256k1 variant, final ERC-5564):
 *
 * byte 0   : schemeId   (0x02 for secp256k1 w/ viewTags)
 * bytes1-33: spendPubKey  (compressed, 33 bytes)
 * bytes34-66: viewPubKey  (compressed, 33 bytes)
 * Total 67 bytes             => 134 hex chars => 0x + 134 = 136-char string
 *
 * NB: The spec allows future schemes; we lock to schemeId=0x02 here.
 */
export interface MetaAddress {
  scheme: number; // always 0x02 in this implementation
  spendPubkey: string; // 33-byte hex string, 0x-prefixed
  viewPubkey: string; // 33-byte hex string, 0x-prefixed
}

export function encodeMetaAddress(ma: MetaAddress): string {
  if (ma.scheme !== 0x02) throw new Error("unsupported scheme");
  const hex = [
    ma.scheme.toString(16).padStart(2, "0"),
    ma.spendPubkey.slice(2),
    ma.viewPubkey.slice(2),
  ].join("");
  return "0x" + hex;
}

export function parseMetaAddress(raw: string): MetaAddress {
  if (!/^0x[0-9a-f]{134}$/i.test(raw)) throw new Error("invalid length");
  const scheme = parseInt(raw.slice(2, 4), 16);
  const spendPubkey = "0x" + raw.slice(4, 4 + 66);
  const viewPubkey = "0x" + raw.slice(4 + 66);
  return { scheme, spendPubkey, viewPubkey };
}
