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

export function createPunchCardReference({ address, category }) {
  return [PREFIX, "PUNCH", address, category].join("|");
}

export function parseRedemptionReference(value) {
  const parts = value.trim().split("|");
  if (parts[0] !== PREFIX) return null;

  if (parts[1] === "PUNCH") {
    const [, , address, category, ...extra] = parts;
    if (extra.length || !address || !/^[0-9a-fA-F]{64}$/.test(category ?? "")) return null;
    return { type: "punchcard", address, category: category.toLowerCase() };
  }

  const coupon = parseCouponReference(value);
  return coupon ? { type: "coupon", ...coupon } : null;
}
