import { getProvider } from "./contract";

const provider = getProvider();

/**
 * Returns every UTXO owned by an address.
 */
export async function getWalletUtxos(address) {
  return await provider.getUtxos(address);
}

/**
 * Returns only stamp token UTXOs.
 */
export async function getStampUtxos(address) {
  const utxos = await getWalletUtxos(address);

  return utxos.filter(
    (utxo) =>
      utxo.token &&
      !utxo.token.nft
  );
}

/**
 * Returns only coupon NFTs.
 */
export async function getCouponUtxos(address) {
  const utxos = await getWalletUtxos(address);

  return utxos.filter(
    (utxo) =>
      utxo.token &&
      Boolean(utxo.token.nft)
  );
}

/**
 * Total punch card stamps.
 */
export async function getStampBalance(address) {
  const stamps = await getStampUtxos(address);

  return stamps.reduce(
    (total, utxo) => total + utxo.token.amount,
    0n
  );
}

/**
 * Coupon count.
 */
export async function getCouponCount(address) {
  const coupons = await getCouponUtxos(address);

  return coupons.length;
}

/**
 * Dashboard summary.
 */
export async function getCustomerSummary(address) {
  const stampBalance = await getStampBalance(address);
  const couponCount = await getCouponCount(address);

  return {
    punchCards: Number(stampBalance),
    coupons: couponCount,
  };
}

/**
 * BCH balance in satoshis.
 */
export async function getBchBalance(address) {
  const utxos = await getWalletUtxos(address);

  return utxos
    .filter((utxo) => !utxo.token)
    .reduce((sum, utxo) => sum + utxo.satoshis, 0n);
}

/**
 * Merchant stamp reserve.
 */
export async function getMerchantStampSupply(address) {
  return getStampBalance(address);
}

/**
 * Returns the total number of NFTs owned by the merchant,
 * regardless of category.
 */
export async function getMerchantNftCount(address) {
  const utxos = await getWalletUtxos(address);

  return utxos.filter(
    (utxo) => utxo.token?.nft
  ).length;
}

/**
 * Merchant dashboard summary.
 */
export async function getMerchantSummary(address) {
  const [
    stamps,
    coupons,
    balance,
  ] = await Promise.all([
    getMerchantStampSupply(address),
    getMerchantNftCount(address),
    getBchBalance(address),
  ]);

  return {
    stamps: Number(stamps),
    coupons,
    balance,
  };
}

/**
 * Returns every coupon NFT owned by the merchant.
 */
export async function getMerchantCoupons(address) {
  const utxos = await getCouponUtxos(address);

  return utxos.map((utxo) => ({
    txid: utxo.txid,
    vout: utxo.vout,

    category: utxo.token.category,

    commitment:
      utxo.token.nft?.commitment ?? "",

    capability:
      utxo.token.nft?.capability ?? "none",

    amount: Number(utxo.token.amount),

    satoshis: Number(utxo.satoshis),

    utxo,
  }));
}

/**
 * Returns every punch card reserve owned by the merchant.
 */
export async function getMerchantPunchCards(address) {
  const utxos = await getStampUtxos(address);

  return utxos.map((utxo) => ({
    txid: utxo.txid,
    vout: utxo.vout,

    category: utxo.token.category,

    capability:
      utxo.token.nft?.capability ?? "none",

    supply: Number(utxo.token.amount),

    satoshis: Number(utxo.satoshis),

    utxo,
  }));
}

/**
 * Coupons owned by a customer.
 */
export async function getCustomerCoupons(address) {
  const utxos = await getCouponUtxos(address);

  return utxos
    .filter((utxo) => utxo.token.nft?.capability === "none")
    .map((utxo) => ({
    txid: utxo.txid,
    vout: utxo.vout,

    category: utxo.token.category,

    commitment:
      utxo.token.nft?.commitment ?? "",

    capability:
      utxo.token.nft?.capability ?? "none",

    amount: Number(utxo.token.amount),

    satoshis: Number(utxo.satoshis),

      utxo,
    }));
}

/**
 * Punch card balances owned by a customer.
 */
export async function getCustomerPunchCards(address) {
  const utxos = await getStampUtxos(address);

  return utxos.map((utxo) => ({
    txid: utxo.txid,
    vout: utxo.vout,

    category: utxo.token.category,

    stamps: Number(utxo.token.amount),

    satoshis: Number(utxo.satoshis),

    utxo,
  }));
}

/**
 * Returns every CashToken owned by an address.
 */
export async function getTokenInventory(address) {
  const utxos = await getWalletUtxos(address);

  return utxos.filter((utxo) => utxo.token);
}

/**
 * Returns every UTXO matching a category.
 */
export async function getTokensByCategory(
  address,
  category
) {
  const utxos = await getTokenInventory(address);

  return utxos.filter(
    (utxo) =>
      utxo.token.category.toLowerCase() ===
      category.toLowerCase()
  );
}
