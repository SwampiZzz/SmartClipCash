import metadata from "../data/tokenMetadata.json";

function findCategory(collection, category) {
  const key = Object.keys(collection ?? {}).find(
    (candidate) => candidate.toLowerCase() === category.toLowerCase(),
  );
  return key ? collection[key] : undefined;
}

/**
 * Returns the display name of a coupon category.
 */
export function getCouponCategoryName(category) {
  return (
    findCategory(metadata.couponCategories, category)?.name ??
    "Unnamed Coupon"
  );
}

/**
 * Returns the display name of a coupon NFT.
 */
export function getCouponName(
  category,
  commitment
) {
  const key = `${category}:${commitment}`;

  return (
    metadata.coupons?.[key]?.name ??
    getCouponCategoryName(category)
  );
}

/**
 * Returns the display name of a punch card.
 */
export function getPunchCardName(category) {
  return (
    findCategory(metadata.punchCards, category)?.name ??
    "Unnamed Punch Card"
  );
}

export function getCouponRewardSats(category) {
  return findCategory(metadata.couponCategories, category)?.rewardSats ?? 1000;
}

export function getPunchCardConfig(category) {
  return findCategory(metadata.punchCards, category) ?? {
    requiredStamps: 2,
    rewardSats: 1000,
  };
}
