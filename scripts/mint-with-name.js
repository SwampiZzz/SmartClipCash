// mint-with-name.js
// Wraps your existing mint logic so the display name is written
// in the same step as minting -- never gets out of sync.
//
// Pass in your existing mint functions (from issue-stamp.js / issue-coupon.js)
// as `mintStampFn` / `mintCouponFn`. They should return whatever they
// currently return (e.g. { category, txid, ... }).

const { setPunchCardName, setCouponName } = require('./tokens-metadata.js');

async function mintPunchCardWithName(name, mintStampFn, ...mintArgs) {
  const result = await mintStampFn(...mintArgs);
  // result.category must be the stampCategory id your mint script produces
  setPunchCardName(result.category, name, { rewardDescription: name });
  return result;
}

async function mintCouponWithName(name, mintCouponFn, ...mintArgs) {
  const result = await mintCouponFn(...mintArgs);
  // result.category = coupon token category, result.commitment = hex commitment
  // (expiry ++ ownerPKH) that your issue-coupon.js already builds
  setCouponName(result.category, result.commitment, name);
  return result;
}

module.exports = { mintPunchCardWithName, mintCouponWithName };

// --- Example usage ---
//
// const { mintStamp } = require('./issue-stamp');       // your existing script
// const { issueCoupon } = require('./issue-coupon');     // your existing script
// const { mintPunchCardWithName, mintCouponWithName } = require('./mint-with-name');
//
// await mintPunchCardWithName('Ube Cafe Loyalty Card', mintStamp, businessSigner, ...);
// await mintCouponWithName('20% Off Burger Combo', issueCoupon, businessSigner, customerPk, expiry, ...);
