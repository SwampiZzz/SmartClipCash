import {
  getMerchantCoupons,
  getMerchantPunchCards,
} from "./token";

import {
  getCouponName,
  getPunchCardName,
} from "./metadata";

/**
 * Merchant coupon inventory.
 */
export async function getMerchantCouponInventory(address) {
  const coupons =
    await getMerchantCoupons(address);

  return coupons.map((coupon) => ({
    ...coupon,

    name: getCouponName(
      coupon.category,
      coupon.commitment
    ),

    description: "Blockchain Coupon",

    transferable:
      coupon.capability !== "none",
  }));
}

/**
 * Merchant punch card inventory.
 */
export async function getMerchantPunchInventory(
  address
) {
  const cards =
    await getMerchantPunchCards(address);

  return cards.map((card) => ({
    ...card,

    name: getPunchCardName(
      card.category
    ),

    description: "Punch Card",

    required: 5,
  }));
}