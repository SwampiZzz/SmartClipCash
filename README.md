# SmartClipCash — Programmable Vouchers, Punch Cards & Coupons

Built at the **Paytaca / Cash 3.0 Builders Arena Hackathon** (Aug 1–2 2026, Robinsons Galleria, Philippines).

## What problem is this solving?

Businesses today run loyalty and voucher programs on physical cards or centralized
databases. Both are easy to abuse: physical cards get lost or duplicated, and
database-backed vouchers can be silently revoked, duplicated server-side, or lost
entirely if the business's app or backend goes away. There's no way for a customer
or a third party to independently verify a voucher is real, unused, and issued by
who it claims to be from.

**The hackathon brief:** design programmable digital vouchers, coupons, and punch
cards that are verifiable, transferable when the business allows it, and that
automatically enforce their own redemption rules — without relying on a trusted
central database.

**Our answer:** represent each voucher as a native Bitcoin Cash (CashTokens) token,
and gate redemption behind a CashScript smart contract. Ownership becomes a wallet
balance anyone can verify on-chain, and redemption rules are enforced by consensus
rather than by a business's backend.

- **Punch cards → fungible tokens.** One stamp = one unit of the business's
  fungible token category. Progress toward a reward is just the customer's token
  balance — naturally transferable, no manual state-tracking needed.
- **Coupons → NFTs.** Each coupon is a unique CashToken NFT. Redemption **burns**
  it, which is the double-redemption protection, for free, by construction.

Full write-up of the design decisions, bug history, and pitch content lives in
[`project-status-full.md`](./project-status-full.md) if you want the deep dive.

---

## Prerequisites

- **Node.js** v18 or later ([nodejs.org](https://nodejs.org))
- **npm** (comes with Node)
- A **Bitcoin Cash chipnet (testnet) wallet** with some test BCH funded to it —
  used to pay for genesis/mint/redeem transactions. Get chipnet coins from a
  chipnet faucet.
- Basic familiarity with the command line

You do **not** need to run your own BCH node — the scripts use
`ElectrumNetworkProvider`, which talks to public Electrum servers.

---

## 1. Clone and install

```bash
git clone <this-repo-url>
cd smartclipcash
npm install
```

This project depends on the [`cashscript`](https://cashscript.org) SDK, which is
listed in `package.json`.

---

## 2. Configure your environment

Create a `.env` file (or export these as shell environment variables) in the
project root:

```bash
# Required for all scripts
BUSINESS_WIF=cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   # chipnet WIF private key
BUSINESS_ADDRESS=bchtest:qXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   # matching chipnet address
BCH_NETWORK=chipnet                                                  # or 'mainnet' when ready

# Genesis scripts
GENESIS_OUTPUT_SATS=1000        # optional, defaults to 1000, must be >= 800
COUPON_NAME="20% Off Combo Meals"   # required when running genesis-coupon.js

# Coupon issuance / redemption (used by issue-coupon.js / redeem-coupon.js)
CUSTOMER_PKH_HEX=...            # 20-byte hash160 of the customer's pubkey — NOT the raw pubkey
COUPON_EXPIRY_UNIX=...          # unix timestamp, little-endian encoded into the NFT commitment
```

> ⚠️ **Never commit `.env` or paste real private keys into chat/logs.** During
> the hackathon, testnet WIFs were pasted into an AI chat session for debugging.
> That's fine for chipnet keys with no real value, but rotate any keys used this
> way before going anywhere near mainnet funds.

---

## 3. Get a genesis-eligible UTXO

CashTokens genesis requires the input to be **output index 0 (`vout: 0`)** of its
own parent transaction. A normal wallet UTXO often isn't at `vout: 0`. If the
genesis script errors with "no eligible genesis UTXO found," send a fresh payment
to `BUSINESS_ADDRESS` to create one (any wallet-to-wallet send where your address
is the sole/first output should land at `vout: 0`), then re-run.

---

## 4. Running the scripts

All scripts are run directly with Node (they use top-level `main()` + dynamic
`import('cashscript')`, so no build step is needed):

```bash
# Mint a new coupon token category (one-time per coupon type, e.g. "20% off")
node genesis-coupon.js

# Mint a new punch-card fungible token category (one-time per loyalty card type)
node genesis-punchcard.js

# Issue an individual coupon NFT to a customer
node issue-coupon.js

# Issue stamps (fungible tokens) to a customer's punch card
node issue-stamp.js

# Redeem a coupon (burns the NFT, pays out the reward)
node redeem-coupon.js

# Redeem a punch card (burns the required stamps, pays out the reward)
node redeem-punchcard.js
```

Each script prints the resulting transaction ID and category ID to the console —
copy these for use in later steps (e.g. the category ID from genesis is needed by
issuance scripts).

---

## 5. Display names (off-chain metadata)

Token categories and NFT commitments are just hex identifiers — not human
readable. This project stores display names off-chain in `token-metadata.json`,
written automatically by the mint/genesis scripts and read by the frontend.

```bash
# Verify the metadata store is working:
node test-metadata.js
```

- `token-metadata.js` — small JSON-backed store (`setPunchCardName`,
  `setCouponCategoryName`, `setCouponName`, and their `get*` counterparts).
- `mint-with-name.js` — wraps mint calls so the name is written in the same step
  as minting, so it can never drift out of sync.
- `token-name-lookup.js` — frontend helper that fetches `token-metadata.json` and
  attaches a `displayName` to each UTXO before rendering.

To make names visible in the frontend, copy/serve `token-metadata.json` as a
static file the frontend can `fetch()` (e.g. into your frontend's `public/`
folder), and copy it back after every mint so the two stay in sync.

---

## Known open risks (as of this writing)

- Expiry enforcement on coupon redemption was recently fixed
  (`.setLocktime(...)` was missing) — re-test both a valid and a deliberately
  expired coupon before relying on it for a demo.
- `PunchCardRedeem.cash`'s `stampCategory` constructor argument may need
  byte-reversal (CashScript contract `bytes32` constructor args use reverse/raw
  consensus byte order, while SDK-level UTXO fields use display/default byte
  order) — confirm before demoing.
- The defensive length check for `ownerPKH` (must be exactly 20 bytes / 40 hex
  chars) inside `buildCommitment()` is a recommended fix, not yet confirmed
  applied.

See `project-status-full.md` for the full bug history and rationale behind each
architecture decision.

---

## Project structure

```
.
├── README.md                  # this file
├── project-status-full.md     # full design log, bug history, pitch content
├── genesis-coupon.js          # mint a new coupon token category
├── genesis-punchcard.js       # mint a new punch-card token category
├── issue-coupon.js            # issue an individual coupon NFT
├── issue-stamp.js             # issue stamps to a punch card
├── redeem-coupon.js           # redeem + burn a coupon
├── redeem-punchcard.js        # redeem stamps for a reward
├── PunchCardRedeem.cash       # CashScript contract for punch cards
├── CouponRedeem.cash          # CashScript contract for coupons
├── token-metadata.js          # off-chain display-name store
├── token-metadata.json        # the data file itself (auto-updated on mint)
├── mint-with-name.js          # mint wrapper that records names on mint
├── token-name-lookup.js       # frontend helper to fetch + attach names
└── test-metadata.js           # quick manual test for the metadata store
```