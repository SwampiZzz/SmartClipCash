// token-name-lookup.js
// Frontend-side helper: takes UTXOs from provider.getUtxos() and attaches
// the human-readable name from the metadata JSON.
//
// Serve token-metadata.json as a static asset (or a thin API endpoint that
// returns getAllMetadata()) and fetch it once, cache it, then look up by key.

let metadataCache = null;

async function loadMetadata(metadataUrl = '/token-metadata.json') {
  if (metadataCache) return metadataCache;
  const res = await fetch(metadataUrl);
  metadataCache = await res.json();
  return metadataCache;
}

async function getPunchCardDisplayName(stampCategory, metadataUrl) {
  const db = await loadMetadata(metadataUrl);
  return db.punchCards[stampCategory]?.name ?? 'Unnamed Punch Card';
}

async function getCouponDisplayName(couponCategory, commitment, metadataUrl) {
  const db = await loadMetadata(metadataUrl);
  const key = `${couponCategory}:${commitment}`;
  return db.coupons[key]?.name ?? 'Unnamed Coupon';
}

// Example: attach names to a list of UTXOs before rendering
async function attachNames(utxos, metadataUrl) {
  const db = await loadMetadata(metadataUrl);
  return utxos.map((utxo) => {
    const isNft = !!utxo.token?.nft;
    const name = isNft
      ? db.coupons[`${utxo.token.category}:${utxo.token.nft.commitment}`]?.name ?? 'Unnamed Coupon'
      : db.punchCards[utxo.token?.category]?.name ?? 'Unnamed Punch Card';
    return { ...utxo, displayName: name };
  });
}

export { loadMetadata, getPunchCardDisplayName, getCouponDisplayName, attachNames };