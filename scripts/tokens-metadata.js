// token-metadata.js
// Simple JSON-file-backed store mapping token identity -> display metadata.
// Punch cards are keyed by stampCategory (one category = one card type).
// Coupons are keyed by `${couponCategory}:${commitment}` since one category
// can have multiple differently-named coupons (commitment is hex string).

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'token-metadata.json');

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    return { punchCards: {}, coupons: {}, couponCategories: {} };
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (!db.couponCategories) db.couponCategories = {};
  return db;
}

function setCouponCategoryName(couponCategory, name, extra = {}) {
  const db = loadDb();
  db.couponCategories[couponCategory] = { name, ...extra };
  saveDb(db);
}

function getCouponCategoryName(couponCategory) {
  const db = loadDb();
  return db.couponCategories[couponCategory]?.name ?? null;
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function setPunchCardName(stampCategory, name, extra = {}) {
  const db = loadDb();
  db.punchCards[stampCategory] = { name, ...extra };
  saveDb(db);
}

function getPunchCardName(stampCategory) {
  const db = loadDb();
  return db.punchCards[stampCategory]?.name ?? null;
}

function setCouponName(couponCategory, commitment, name, extra = {}) {
  const db = loadDb();
  const key = `${couponCategory}:${commitment}`;
  db.coupons[key] = { name, ...extra };
  saveDb(db);
}

function getCouponName(couponCategory, commitment) {
  const db = loadDb();
  const key = `${couponCategory}:${commitment}`;
  return db.coupons[key]?.name ?? null;
}

function getAllMetadata() {
  return loadDb();
}

module.exports = {
  setPunchCardName,
  getPunchCardName,
  setCouponName,
  getCouponName,
  setCouponCategoryName,
  getCouponCategoryName,
  getAllMetadata,
};