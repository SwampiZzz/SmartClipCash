# SmartClipCash

SmartClipCash is a programmable digital rewards platform built on Bitcoin Cash. It allows businesses to create and issue verifiable coupon NFTs and punch-card stamps, while CashScript contracts enforce redemption conditions directly on-chain.

The project was created for the **Paytaca / Cash 3.0 Builders Arena Hackathon**.

> **Current status:** Hackathon prototype running on Bitcoin Cash **chipnet**. The included wallets and keys are for demonstration only and must never be used with real funds.

## The challenge

### How can businesses issue digital vouchers, coupons, and punch cards that are verifiable, transferable when allowed, and automatically enforce their own redemption rules?

SmartClipCash represents rewards as native Bitcoin Cash **CashTokens** and protects their redemption value with **CashScript smart contracts**.

- **Verifiable:** Every reward is represented by an on-chain token. Customers and merchants can independently inspect its category, ownership, capability, commitment, and unspent status without trusting a private rewards database.
- **Transferable when allowed:** A business can configure the coupon contract as transferable or bind a coupon to the original customer's public-key hash. Punch-card stamps are fungible CashTokens and can follow the transfer policy chosen by the application.
- **Programmable redemption:** CashScript contracts validate token category, coupon expiry, signatures, stamp requirements, reward amount, and transaction output structure.
- **Single use:** Redeeming a coupon consumes its NFT without creating a replacement token output. The coupon is therefore burned and cannot be redeemed twice.
- **Transparent loyalty progress:** Punch-card progress is the customer's fungible token balance. Redeeming a completed card burns the required number of stamps and returns any excess stamps.
- **QR-assisted checkout:** A customer presents a QR code identifying an exact coupon UTXO. The merchant scans it, verifies the coupon on-chain, reviews it, and submits the redemption transaction.

This design moves reward ownership and critical redemption rules away from a mutable centralized database and into independently verifiable tokens and contracts.

## Core features

- Merchant and customer roles
- On-chain coupon category creation
- On-chain punch-card category and stamp-supply creation
- Coupon NFT issuance with expiry and owner commitment
- Fungible punch-card stamp issuance
- Customer reward inventory and loyalty progress
- Customer coupon QR presentation
- Merchant camera-based QR scanning with manual fallback
- Coupon expiry and ownership validation
- Single-use NFT burning during coupon redemption
- Punch-card stamp consolidation and redemption
- Responsive mobile and desktop interface
- Chipnet transaction history and explorer links

## How it works

### Coupons

1. The merchant creates a CashToken category and retains its minting NFT.
2. The merchant issues an immutable NFT to a customer.
3. The NFT commitment contains:
   - 4-byte little-endian Unix expiry time
   - 20-byte customer public-key hash
4. The customer opens the coupon and presents its QR code.
5. The QR code carries an `SCC1` reference containing the customer address, transaction ID, and output index.
6. The merchant scans the code and the application loads that exact UTXO from chipnet.
7. The merchant confirms redemption.
8. The coupon contract verifies the category, expiry, merchant signature, customer signature, reward value, and outputs.
9. The NFT is consumed without replacement, permanently preventing double redemption.

### Punch cards

1. The merchant creates a CashToken category with an initial fungible stamp supply.
2. Stamps are transferred from the merchant reserve to customers.
3. The customer's token balance represents punch-card progress.
4. When the balance reaches the configured threshold, the redemption contract validates and burns the required stamps.
5. Any unused stamps are returned to the customer and the reward is paid.

## Architecture

```text
Customer interface                 Merchant interface
  View rewards                       Create reward categories
  Present coupon QR                  Issue coupons and stamps
  Track punch-card progress          Scan coupon QR
           |                         Review and redeem
           +-------------+-------------------+
                         |
                  React application
                         |
             CashScript transaction SDK
                         |
            Public Electrum network provider
                         |
              Bitcoin Cash chipnet
                         |
        CashTokens + redemption contracts
```

The frontend communicates with public Electrum servers through CashScript's `ElectrumNetworkProvider`; running a local Bitcoin Cash node is not required for development.

## Technology stack

| Area | Technology |
| --- | --- |
| Blockchain | Bitcoin Cash chipnet |
| Tokens | CashTokens fungible tokens and NFTs |
| Contracts | CashScript 0.13 |
| Frontend | React 19 and Vite 8 |
| Styling | Tailwind CSS 4 |
| BCH utilities | CashScript, Libauth, Noble hashes |
| QR generation | `qrcode` |
| QR scanning | ZXing Browser |
| Network access | Public Electrum servers |

## Local installation

### Prerequisites

Install the following before starting:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 20 or newer
- npm, included with Node.js
- A modern browser such as Chrome, Edge, Firefox, or Safari
- Optional: chipnet BCH if you intend to broadcast transactions

Camera scanning works on `localhost`. A deployed version must use HTTPS for browser camera permission.

### 1. Clone the repository

```bash
git clone https://github.com/SwampiZzz/SmartClipCash.git
cd SmartClipCash
```

### 2. Install contract dependencies

From the repository root:

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

To make the development server reachable from another device on the same network:

```bash
npm run dev -- --host
```

Use the network URL printed by Vite. Camera access from another device may require HTTPS depending on the browser; `localhost` is treated as a secure development context.

### 5. Create a production build

From `frontend/`:

```bash
npm run build
npm run preview
```

The production assets are generated in `frontend/dist/`.

### 6. Run code checks

```bash
npm run lint
npm run build
```

## Compile the smart contracts

Contract source files live in `contracts/`. From the repository root, run:

```bash
npm run build:artifacts
```

This compiles:

- `contracts/CouponRedeem.cash`
- `contracts/PunchCardRedeem.cash`

and writes their artifacts to `contracts/artifact/`.

Rebuild the artifacts whenever a `.cash` contract changes.

## Demo wallets and security warning

The hackathon frontend currently reads demonstration chipnet wallets from:

```text
frontend/src/constants/wallets.js
```

These credentials are public because they are bundled into browser JavaScript. They are suitable only for disposable chipnet testing.

Before production use:

- Remove all WIF private keys from frontend source.
- Integrate a real BCH wallet provider or signing protocol.
- Never send a customer's private key to the merchant application.
- Keep merchant and customer signing on their respective devices.
- Add secure metadata storage and validation.
- Perform a contract and transaction security review.
- Change `frontend/src/config/appConfig.js` only after completing mainnet readiness work.

The current merchant redemption flow can automatically sign only for the configured demo customer. QR scanning identifies a real customer's coupon but does not replace the customer's required cryptographic signature.

## Command-line transaction scripts

The `scripts/` directory contains lower-level chipnet utilities for creating, issuing, inspecting, and redeeming tokens outside the frontend.

Node does not automatically load `.env` files in these scripts. With Node.js 20+, use:

```bash
node --env-file=.env scripts/<script-name>.js
```

Alternatively, export the variables in your shell before running a script.

### Example `.env`

Create `.env` in the repository root. It is ignored by Git.

```dotenv
BCH_NETWORK=chipnet

BUSINESS_WIF=your_chipnet_merchant_wif
BUSINESS_ADDRESS=bchtest:your_merchant_address

CUSTOMER_WIF=your_chipnet_customer_wif
CUSTOMER_ADDRESS=bchtest:your_customer_address
CUSTOMER_PKH_HEX=40_hex_character_customer_public_key_hash
ADDRESS=bchtest:address_to_inspect

CATEGORY_ID=64_hex_character_stamp_category
COUPON_CATEGORY=64_hex_character_coupon_category
COUPON_CATEGORY_ID=64_hex_character_coupon_category

INITIAL_STAMPS=1000
STAMPS_TO_ISSUE=1
REQUIRED_STAMPS=5
EXPIRY_SECONDS_FROM_NOW=3600
REWARD_SATS=1000
TRANSFERABLE=false

GENESIS_OUTPUT_SATS=1000
SEED_AMOUNT_SATS=2000
TOKEN_OUTPUT_SATS=1000
COUPON_OUTPUT_SATS=1000
CONTRACT_FUNDING_SATS=6000
```

Never commit `.env`, WIFs, seed phrases, or production secrets.

### Typical CLI workflow

From the repository root:

```bash
# Inspect the hardcoded demo merchant UTXOs
node --env-file=.env scripts/check-utxo.js

# If necessary, create a genesis-eligible BCH output
node --env-file=.env scripts/fund-genesis-utxo.js

# Create a coupon category
node --env-file=.env scripts/genesis-coupon-token.js

# Create a punch-card category and initial stamp supply
node --env-file=.env scripts/genesis-stamp-token.js

# Issue a coupon NFT
node --env-file=.env scripts/issue-coupon.js

# Issue punch-card stamps
node --env-file=.env scripts/issue-stamp.js

# Inspect a stamp balance
node --env-file=.env scripts/check-balance.js

# Redeem a coupon
node --env-file=.env scripts/redeem-coupon.js

# Redeem a completed punch card
node --env-file=.env scripts/redeem-punchcards.js
```

Each script validates its required variables and reports missing configuration.

## CashTokens genesis requirement

A new CashToken category is derived from the outpoint used as the transaction's first input. The genesis UTXO must be a BCH-only output at index `0` (`vout: 0`).

If category creation reports that no eligible genesis coin exists:

1. Fund the merchant with chipnet BCH.
2. Run `scripts/fund-genesis-utxo.js`, or send a fresh transaction whose first output belongs to the merchant.
3. Wait until the Electrum provider can see the new UTXO.
4. Retry the genesis transaction.

Existing token UTXOs must not be used as genesis funding inputs.

## QR redemption reference

SmartClipCash uses this versioned QR payload:

```text
SCC1|<customer-address>|<coupon-txid>|<vout>
```

The QR code contains no private key and grants no authority by itself. It only identifies the wallet and exact coupon output. The merchant application re-queries the blockchain and verifies that the UTXO still exists before allowing redemption.

## Project structure

```text
SmartClipCash/
├── contracts/
│   ├── CouponRedeem.cash          # Coupon expiry, ownership and burn rules
│   ├── PunchCardRedeem.cash       # Stamp threshold and reward rules
│   └── artifact/                  # Compiled CashScript artifacts
├── frontend/
│   ├── public/                    # Static browser assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── modals/            # Wallet, creation, issuance, QR and success dialogs
│   │   │   ├── navigations/       # Public and authenticated navigation
│   │   │   └── rewards/           # Reward tabs and cards
│   │   ├── config/                # Network configuration
│   │   ├── constants/             # Demo-only wallet configuration
│   │   ├── context/               # Active wallet and transaction state
│   │   ├── data/                  # Bundled display metadata
│   │   ├── layouts/               # Public, merchant and customer shells
│   │   ├── lib/                   # Contract, token, inventory, metadata and QR logic
│   │   ├── pages/
│   │   │   ├── customer/          # Customer dashboard and rewards
│   │   │   ├── merchant/          # Merchant dashboard, issuance and redemption
│   │   │   └── public/            # Landing and explanation pages
│   │   ├── routes/                # Routes and role protection
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   ├── build-artifact.js          # Compile CashScript contracts
│   ├── check-balance.js           # Inspect category balance
│   ├── check-utxo.js              # Inspect merchant UTXOs
│   ├── fund-genesis-utxo.js       # Prepare an eligible genesis output
│   ├── genesis-coupon-token.js    # Create a coupon token category
│   ├── genesis-stamp-token.js     # Create a stamp category and supply
│   ├── issue-coupon.js            # Issue an immutable coupon NFT
│   ├── issue-stamp.js             # Transfer stamps to a customer
│   ├── redeem-coupon.js           # Redeem and burn a coupon
│   ├── redeem-punchcards.js       # Redeem required stamps
│   └── tokens-metadata.js         # JSON-backed metadata helpers
├── package.json                   # Contract toolchain dependencies
└── README.md
```

Some `*2` components and older CSS files remain from earlier prototype iterations. The active application entry point is `frontend/src/main.jsx`, which renders `frontend/src/App.jsx`.

## Available npm commands

From the repository root:

| Command | Purpose |
| --- | --- |
| `npm install` | Install CashScript compiler and SDK dependencies |
| `npm run build:artifacts` | Compile both CashScript contracts |

From `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Generate a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Troubleshooting

### `No eligible genesis coin found`

Create a BCH-only merchant UTXO at output index `0`, then retry category creation.

### Merchant needs BCH

Fund the merchant's chipnet address. BCH is needed for token dust outputs, contract funding, and miner fees.

### Camera does not open

- Allow camera permission in the browser.
- Use `localhost` during local development.
- Use HTTPS when accessing a deployed site or testing from another device.
- Use the manual `SCC1` reference field if camera access is unavailable.

### Coupon reference is unavailable

The coupon may already be spent, transferred, burned, or referenced with the wrong transaction output. The merchant application checks the latest UTXO set rather than trusting the QR code alone.

### Real customer cannot complete merchant redemption

The prototype requires a customer signature and currently includes automatic signing only for its configured demo customer. A production deployment needs wallet-to-wallet signing or a partially signed transaction flow.

### Frontend cannot reach chipnet

Check network connectivity and retry. The application relies on public Electrum infrastructure, which can occasionally be unavailable or slow.

## Current limitations

- Chipnet-only configuration
- Demo WIFs stored in frontend source
- No production wallet connector or cross-device customer signing protocol
- Display metadata is local/off-chain rather than resolved from a shared registry
- Public Electrum availability affects reads and broadcasts
- The generic Vouchers tab is not yet backed by a separate voucher contract; current reward types are coupon NFTs and punch-card tokens
- No automated contract integration test suite is included

## Production roadmap

Before using SmartClipCash with real businesses or funds:

1. Integrate non-custodial merchant and customer wallets.
2. Implement customer-side transaction approval after QR scanning.
3. Remove all private keys from the browser bundle.
4. Add shared, authenticated reward metadata.
5. Add unit, contract, chipnet integration, and end-to-end tests.
6. Audit CashScript contracts and transaction construction.
7. Add monitoring and reliable Electrum/provider fallback.
8. Complete a deliberate chipnet-to-mainnet migration review.

## License

No license file is currently included. Add a license before distributing or reusing the project outside the hackathon team.
