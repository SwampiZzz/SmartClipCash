import { ElectrumNetworkProvider } from "cashscript";

import {
  NETWORK,
  STAMP_CATEGORY,
  COUPON_CATEGORY,
} from "../config/appConfig";

const provider = new ElectrumNetworkProvider(NETWORK);

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
      utxo.token.category.toLowerCase() ===
        STAMP_CATEGORY.toLowerCase()
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
      utxo.token.category.toLowerCase() ===
        COUPON_CATEGORY.toLowerCase()
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
    balance: Number(balance),
  };
}