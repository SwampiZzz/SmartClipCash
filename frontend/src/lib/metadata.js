import metadata from "../data/tokenMetadata.json";

const LOCAL_METADATA_KEY = "smartclipcash.rewardMetadata";

function localMetadata() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_METADATA_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveRewardMetadata(category, value) {
  const current = localMetadata();
  current[category.toLowerCase()] = value;
  localStorage.setItem(LOCAL_METADATA_KEY, JSON.stringify(current));
}

function findCategory(collection, category) {
  const key = Object.keys(collection ?? {}).find(
    (candidate) => candidate.toLowerCase() === category.toLowerCase(),
  );
  return key ? collection[key] : undefined;
}

function findReward(category, collection) {
  return localMetadata()[category.toLowerCase()] ?? findCategory(collection, category);
}

/**
 * Returns the display name of a coupon category.
 */
export function getCouponCategoryName(category) {
  return (
    findReward(category, metadata.couponCategories)?.name ??
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
    findReward(category, metadata.punchCards)?.name ??
    "Unnamed Punch Card"
  );
}

export function getCouponRewardSats(category) {
  return findReward(category, metadata.couponCategories)?.rewardSats ?? 1000;
}

export function getPunchCardConfig(category) {
  return findReward(category, metadata.punchCards) ?? {
    requiredStamps: 2,
    rewardSats: 1000,
  };
}
