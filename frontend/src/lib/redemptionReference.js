const PREFIX = "SCC1";

export function createCouponReference({ address, txid, vout }) {
  return [PREFIX, address, txid, vout].join("|");
}

export function parseCouponReference(value) {
  const [prefix, address, txid, vout, ...extra] = value.trim().split("|");
  if (prefix !== PREFIX || extra.length || !address || !/^[0-9a-fA-F]{64}$/.test(txid ?? "") || !/^\d+$/.test(vout ?? "")) {
    return null;
  }
  return { address, txid: txid.toLowerCase(), vout: Number(vout) };
}
