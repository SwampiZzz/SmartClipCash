import {
  Contract,
  ElectrumNetworkProvider,
  SignatureTemplate,
  TransactionBuilder,
} from "cashscript";

import { sha256 } from "@noble/hashes/sha2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import {
  cashAddressToLockingBytecode,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";

import couponArtifact from "../../../contracts/artifact/CouponRedeem.json";
import punchCardArtifact from "../../../contracts/artifact/PunchCardRedeem.json";

import { NETWORK } from "../config/appConfig";

/**
 * ------------------------------------------------------------------
 * Provider
 * ------------------------------------------------------------------
 */

const provider = new ElectrumNetworkProvider(NETWORK);

export function getProvider() {
  return provider;
}

/**
 * ------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------
 */

const MINER_FEE = 1000n;
const TOKEN_OUTPUT_SATOSHIS = 1000n;
const GENESIS_SEED_SATOSHIS = 2000n;

/**
 * ------------------------------------------------------------------
 * Wallet Helpers
 * ------------------------------------------------------------------
 */

/**
 * Creates a CashScript signer from a WIF.
 */
export function createSigner(wif) {
  return new SignatureTemplate(wif);
}

/**
 * Returns the compressed public key (hex) from a WIF.
 */
export function getPublicKeyHex(wif) {
  const signer = createSigner(wif);

  return bytesToHex(
    signer.getPublicKey()
  );
}

/**
 * Convenience helper for WalletContext.
 */
export function parseWallet(wallet) {
  return {
    signer: createSigner(wallet.wif),
    address: wallet.address,
    publicKey: getPublicKeyHex(wallet.wif),
    role: wallet.role,
  };
}

/**
 * ------------------------------------------------------------------
 * Byte Helpers
 * ------------------------------------------------------------------
 */

export function bytesToHex(bytes) {
  return Array.from(
    bytes,
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");
}

export function hexToBytes(hex) {
  const pairs = hex.match(/.{1,2}/g) ?? [];

  return Uint8Array.from(
    pairs.map((pair) => parseInt(pair, 16))
  );
}

/**
 * Explorer byte order
 *  ↓
 * Contract byte order
 */

export function reverseHexBytes(hex) {
  const bytes = hex.match(/.{1,2}/g) ?? [];
  return bytes.reverse().join("");
}

/** Converts either a standard or token-aware CashAddr to token-aware CashAddr. */
export function toTokenAddress(address) {
  const decoded = cashAddressToLockingBytecode(address);
  if (typeof decoded === "string") {
    throw new Error(`Invalid CashAddr: ${address}`);
  }

  const encoded = lockingBytecodeToCashAddress({
    prefix: decoded.prefix,
    bytecode: decoded.bytecode,
    tokenSupport: true,
  });

  if (typeof encoded === "string") {
    throw new Error(`Unable to create a token-aware address: ${encoded}`);
  }

  return encoded.address;
}

/**
 * ------------------------------------------------------------------
 * Crypto Helpers
 * ------------------------------------------------------------------
 *
 * Used when building coupon NFT commitments.
 *
 * We'll finish these in Part 2 after choosing the
 * hashing library the frontend will use.
 */

export function hash160(pubkeyHex) {
  const bytes = hexToBytes(pubkeyHex);

  const sha = sha256(bytes);

  const ripe = ripemd160(sha);

  return bytesToHex(ripe);
}

/**
 * Coupon NFT commitment
 *
 * bytes4 expiry (little-endian)
 * +
 * bytes20 ownerPKH
 */
export function buildCouponCommitment({
  expiryUnixSeconds,
  ownerPubkeyHex,
}) {
  const expiry = new Uint8Array(4);

  new DataView(expiry.buffer).setUint32(
    0,
    expiryUnixSeconds,
    true
  );

  const ownerPKH = hash160(ownerPubkeyHex);

  return bytesToHex(expiry) + ownerPKH;
}

export function getCouponExpiry(commitment) {
  if (!/^[0-9a-fA-F]{48}$/.test(commitment ?? "")) {
    return null;
  }

  return new DataView(hexToBytes(commitment.slice(0, 8)).buffer)
    .getUint32(0, true);
}

export function isCurrentCouponCommitment(commitment) {
  return getCouponExpiry(commitment) !== null;
}

/**
 * Creates a new CashToken category. CashTokens genesis is authorized by
 * spending output index 0; the category ID is the transaction ID of that
 * input. The minting NFT is retained so coupon NFTs can be issued later.
 */
export async function createRewardCategory({
  businessWif,
  businessAddress,
  type,
  initialSupply = 0,
}) {
  if (type !== "coupon" && type !== "punchcard") {
    throw new Error("Reward type must be coupon or punchcard.");
  }

  const supply = BigInt(initialSupply);
  if (type === "coupon" && supply !== 0n) {
    throw new Error("Coupon categories must start with zero fungible supply.");
  }
  if (type === "punchcard" && supply < 1n) {
    throw new Error("Punch cards need an initial stamp supply of at least one.");
  }

  const signer = createSigner(businessWif);
  const utxos = await provider.getUtxos(businessAddress);
  const bchUtxos = utxos.filter((utxo) => !utxo.token);
  let genesisInput = bchUtxos.find((utxo) => utxo.vout === 0);
  let preparationTxid = null;

  if (!genesisInput) {
    const available = bchUtxos.reduce((total, utxo) => total + utxo.satoshis, 0n);
    if (available < GENESIS_SEED_SATOSHIS + MINER_FEE) {
      throw new Error(
        `The merchant needs at least ${GENESIS_SEED_SATOSHIS + MINER_FEE} sats in BCH-only coins to prepare a new reward category.`,
      );
    }

    // A CashToken category must be seeded by an outpoint at vout 0. If the
    // wallet only has change outputs, first create a small BCH-only output at
    // index 0, then spend it immediately as the genesis input.
    const preparation = await new TransactionBuilder({ provider })
      .addInputs(bchUtxos, signer.unlockP2PKH())
      .addOutput({
        to: businessAddress,
        amount: GENESIS_SEED_SATOSHIS,
      })
      .addBchChangeOutputIfNeeded({ to: businessAddress, feeRate: 1 })
      .send();

    preparationTxid = preparation.txid;
    genesisInput = {
      txid: preparation.txid,
      vout: 0,
      satoshis: GENESIS_SEED_SATOSHIS,
    };
  }

  const category = genesisInput.txid;
  // Existing BCH inputs can fund genesis only when they were not already
  // consumed by the preparation transaction above.
  const fundingInputs = preparationTxid
    ? []
    : bchUtxos.filter((utxo) => utxo !== genesisInput);
  const transaction = new TransactionBuilder({ provider })
    // This must remain the first input: its outpoint defines the category.
    .addInput(genesisInput, signer.unlockP2PKH());
  if (fundingInputs.length) {
    transaction.addInputs(fundingInputs, signer.unlockP2PKH());
  }

  const tx = await transaction.addOutput({
      to: toTokenAddress(businessAddress),
      amount: TOKEN_OUTPUT_SATOSHIS,
      token: {
        category,
        amount: supply,
        nft: { capability: "minting", commitment: "" },
      },
    })
    .addBchChangeOutputIfNeeded({ to: businessAddress, feeRate: 1 })
    .send();

  return {
    txid: tx.txid,
    category,
    type,
    initialSupply: Number(supply),
    preparationTxid,
  };
}

/**
 * ------------------------------------------------------------------
 * Contract Builders
 * ------------------------------------------------------------------
 *
 * These are thin wrappers around the compiled artifacts.
 *
 * They intentionally receive every parameter instead of
 * relying on global variables, allowing multiple coupon
 * and punch-card categories.
 */

export function createCouponContract({
  businessPubKey,
  transferable,
  category,
  discountValue,
}) {
  return new Contract(
    couponArtifact,
    [
      businessPubKey,
      transferable,
      reverseHexBytes(category),
      BigInt(discountValue),
    ],
    {
      provider,
    }
  );
}

export function createPunchCardContract({
  businessPubKey,
  category,
  requiredStamps,
  rewardValue,
}) {
  return new Contract(
    punchCardArtifact,
    [
      businessPubKey,
      // CashToken categories exposed by the provider are in display order.
      // The covenant compares tx.inputs[0].tokenCategory, which uses the
      // serialized transaction byte order.
      reverseHexBytes(category),
      BigInt(requiredStamps),
      BigInt(rewardValue),
    ],
    {
      provider,
    }
  );
}

export async function getBchUtxo(address) {
  const utxos = await provider.getUtxos(address);

  const utxo = utxos.find(
    (u) => !u.token
  );

  if (!utxo) {
    throw new Error(
      "No BCH-only UTXO found."
    );
  }

  return utxo;
}

export async function getBchUtxos(address) {
  const utxos = await provider.getUtxos(address);

  return utxos.filter(
    (u) => !u.token
  );
}

/**
 * ------------------------------------------------------------------
 * Contract Funding
 * ------------------------------------------------------------------
 *
 * Every redemption contract requires a BCH UTXO.
 * If none exists yet, this helper funds it.
 *
 * The implementation comes in Part 2 because
 * coupon redemption will use it immediately.
 */

export async function fundContract({
  contractAddress,
  businessAddress,
  businessSigner,
  amount,
}) {
  const bchUtxos = await getBchUtxos(
    businessAddress
  );

  if (!bchUtxos.length) {
    throw new Error(
      "Merchant needs BCH to fund contract."
    );
  }

  await new TransactionBuilder({
    provider,
  })
    .addInputs(
      bchUtxos,
      businessSigner.unlockP2PKH()
    )
    .addOutput({
      to: contractAddress,
      amount,
    })
    .addBchChangeOutputIfNeeded({
      to: businessAddress,
      feeRate: 1,
    })
    .send();

  const utxos =
    await provider.getUtxos(contractAddress);

  const contractUtxo = utxos.find(
    (u) => !u.token
  );

  if (!contractUtxo) {
    throw new Error(
      "Contract funding UTXO not found."
    );
  }

  return contractUtxo;
}

export async function getOrFundContract({
  contract,
  businessAddress,
  businessSigner,
  amount,
}) {
  let contractUtxo = (
    await contract.getUtxos()
  ).find((u) => !u.token);

  if (contractUtxo) {
    return contractUtxo;
  }

  return await fundContract({
    contractAddress: contract.address,
    businessAddress,
    businessSigner,
    amount,
  });
}

export async function findCoupon({
  customerAddress,
  category,
  txid,
  vout,
}) {
  const utxos =
    await provider.getUtxos(customerAddress);

  return utxos.find(
    (u) =>
      u.token &&
      u.token.category.toLowerCase() ===
        category.toLowerCase() &&
      u.token.nft?.capability === "none" &&
      (!txid || (u.txid === txid && u.vout === vout))
  );
}

export async function findStampUtxos({
  customerAddress,
  category,
}) {
  const utxos =
    await provider.getUtxos(customerAddress);

  return utxos.filter(
    (u) =>
      u.token &&
      u.token.category.toLowerCase() ===
        category.toLowerCase() &&
      !u.token.nft
  );
}

export function calculateMerchantChange(
  contractValue,
  rewardValue
) {
  const change =
    BigInt(contractValue) -
    BigInt(rewardValue) -
    MINER_FEE;

  if (change < 0n) {
    throw new Error(
      "Contract funding insufficient."
    );
  }

  return change;
}

export async function issueCoupon({
  businessWif,
  businessAddress,
  customerAddress,
  customerPubKey,
  category,
  expiryUnixSeconds,
}) {
  if (!/^(02|03)[0-9a-fA-F]{64}$/.test(customerPubKey)) {
    throw new Error("Customer public key must be a compressed 33-byte hexadecimal key.");
  }
  if (!Number.isInteger(expiryUnixSeconds) || expiryUnixSeconds <= Math.floor(Date.now() / 1000)) {
    throw new Error("Coupon expiry must be a future Unix timestamp.");
  }

  const businessSigner = createSigner(businessWif);

  const utxos = await provider.getUtxos(
    businessAddress
  );

  const mintingNft = utxos.find(
    (utxo) =>
      utxo.token &&
      utxo.token.category.toLowerCase() ===
        category.toLowerCase() &&
      utxo.token.nft?.capability ===
        "minting"
  );

  if (!mintingNft) {
    throw new Error(
      "Coupon minting NFT not found."
    );
  }

  const bchUtxos = utxos.filter(
    (utxo) => !utxo.token
  );

  if (!bchUtxos.length) {
    throw new Error(
      "Merchant needs BCH to issue coupons."
    );
  }

  const tx = await new TransactionBuilder({
    provider,
  })
    .addInput(
      mintingNft,
      businessSigner.unlockP2PKH()
    )
    .addInputs(
      bchUtxos,
      businessSigner.unlockP2PKH()
    )
    .addOutput({
      to: toTokenAddress(businessAddress),
      amount: mintingNft.satoshis,
      token: {
        category,
        amount: mintingNft.token.amount,
        nft: {
          capability:
            mintingNft.token.nft.capability,
          commitment:
            mintingNft.token.nft.commitment,
        },
      },
    })
    .addOutput({
      to: toTokenAddress(customerAddress),
      amount: 1000n,
      token: {
        category,
        amount: 0n,
        nft: {
          capability: "none",
          commitment: buildCouponCommitment({
            expiryUnixSeconds,
            ownerPubkeyHex: customerPubKey,
          }),
        },
      },
    })
    .addBchChangeOutputIfNeeded({
      to: businessAddress,
      feeRate: 1,
    })
    .send();

  return {
    txid: tx.txid,
    category,
  };
}

/** Issues fungible punch-card stamps exactly as scripts/issue-stamp.js does. */
export async function issueStamps({
  businessWif,
  businessAddress,
  customerAddress,
  category,
  stamps = 1,
}) {
  const stampsToIssue = BigInt(stamps);
  if (stampsToIssue !== 1n) {
    throw new Error("Punch cards issue exactly one stamp per transaction.");
  }

  const businessSigner = createSigner(businessWif);
  const utxos = await provider.getUtxos(businessAddress);
  const reserveUtxo = utxos.find((utxo) =>
    utxo.token?.category.toLowerCase() === category.toLowerCase() &&
    utxo.token.amount >= stampsToIssue,
  );

  if (!reserveUtxo?.token) {
    throw new Error("Stamp reserve not found or does not contain enough stamps.");
  }

  const bchUtxos = utxos.filter((utxo) => !utxo.token);
  if (!bchUtxos.length) {
    throw new Error("Merchant needs BCH to issue stamps.");
  }

  const tx = await new TransactionBuilder({ provider })
    .addInput(reserveUtxo, businessSigner.unlockP2PKH())
    .addInputs(bchUtxos, businessSigner.unlockP2PKH())
    .addOutput({
      to: toTokenAddress(businessAddress),
      amount: reserveUtxo.satoshis,
      token: {
        category,
        amount: reserveUtxo.token.amount - stampsToIssue,
        ...(reserveUtxo.token.nft ? { nft: reserveUtxo.token.nft } : {}),
      },
    })
    .addOutput({
      to: toTokenAddress(customerAddress),
      amount: 1000n,
      token: { category, amount: stampsToIssue },
    })
    .addBchChangeOutputIfNeeded({ to: businessAddress, feeRate: 1 })
    .send();

  return { txid: tx.txid, category, stamps: Number(stampsToIssue) };
}

export async function redeemCoupon({
  businessWif,
  businessAddress,
  customerWif,
  customerAddress,
  category,
  transferable = false,
  discountValue,
  couponTxid,
  couponVout,
}) {
  const businessSigner = createSigner(businessWif);
  const customerSigner = createSigner(customerWif);

  const businessPubKey =
    getPublicKeyHex(businessWif);

  const customerPubKey =
    getPublicKeyHex(customerWif);

  const contract = createCouponContract({
    businessPubKey,
    transferable,
    category,
    discountValue,
  });

  const couponUtxo =
    await findCoupon({
      customerAddress,
      category,
      txid: couponTxid,
      vout: couponVout,
    });

  if (!couponUtxo) {
    throw new Error(
      "Customer does not own this coupon."
    );
  }

  const expiry = getCouponExpiry(couponUtxo.token.nft?.commitment);
  if (expiry === null) {
    throw new Error(
      "This is a legacy coupon without the expiry/owner commitment required by the current contract. Reissue it before redeeming."
    );
  }
  if (expiry <= Math.floor(Date.now() / 1000)) {
    throw new Error("This coupon has expired.");
  }

  const contractFunding =
    BigInt(discountValue) +
    MINER_FEE +
    5000n;

  const contractUtxo =
    await getOrFundContract({
      contract,
      businessAddress,
      businessSigner,
      amount: contractFunding,
    });

  const merchantChange =
    calculateMerchantChange(
      contractUtxo.satoshis,
      BigInt(discountValue)
    );

  const tx =
    await new TransactionBuilder({
      provider,
    })
      // IMPORTANT:
      // Coupon MUST remain input 0.
      .addInput(
        couponUtxo,
        customerSigner.unlockP2PKH()
      )
      .addInput(
        contractUtxo,
        contract.unlock.redeem(
          businessSigner,
          customerPubKey,
          customerSigner
        )
      )
      .addOutput({
        to: customerAddress,
        amount: BigInt(discountValue),
      })
      .addOutput({
        to: businessAddress,
        amount: merchantChange,
      })
      .send();

  return {
    txid: tx.txid,
  };
}

/** Redeems a completed punch card, consolidating the customer's stamps when needed. */
export async function redeemPunchCard({
  businessWif,
  businessAddress,
  customerWif,
  customerAddress,
  category,
  requiredStamps,
  rewardValue,
}) {
  const required = BigInt(requiredStamps);
  const reward = BigInt(rewardValue);
  if (required < 1n || reward < 800n) {
    throw new Error("Punch card configuration is invalid.");
  }

  const businessSigner = createSigner(businessWif);
  const customerSigner = createSigner(customerWif);
  const businessPubKey = getPublicKeyHex(businessWif);
  const customerPubKey = getPublicKeyHex(customerWif);
  const contract = createPunchCardContract({
    businessPubKey,
    category,
    requiredStamps: required,
    rewardValue: reward,
  });
  const contractUtxo = await getOrFundContract({
    contract,
    businessAddress,
    businessSigner,
    amount: reward + 5000n,
  });

  let stampUtxos = await findStampUtxos({ customerAddress, category });
  let stampUtxo = stampUtxos.find((utxo) => utxo.token.amount >= required);
  if (!stampUtxo) {
    const total = stampUtxos.reduce((sum, utxo) => sum + utxo.token.amount, 0n);
    if (total < required) {
      throw new Error(`Customer needs ${required} stamps to redeem this reward.`);
    }
    const selected = [];
    let selectedAmount = 0n;
    for (const utxo of stampUtxos) {
      selected.push(utxo);
      selectedAmount += utxo.token.amount;
      if (selectedAmount >= required) break;
    }
    await new TransactionBuilder({ provider })
      .addInputs(selected, customerSigner.unlockP2PKH())
      .addOutput({
        to: toTokenAddress(customerAddress),
        amount: 1000n,
        token: { category, amount: selectedAmount },
      })
      .addBchChangeOutputIfNeeded({ to: customerAddress, feeRate: 1 })
      .send();
    stampUtxos = await findStampUtxos({ customerAddress, category });
    stampUtxo = stampUtxos.find((utxo) => utxo.token.amount >= required);
  }
  if (!stampUtxo?.token) {
    throw new Error("Unable to prepare customer stamps for redemption.");
  }

  const leftover = stampUtxo.token.amount - required;
  const transaction = new TransactionBuilder({
    provider,
    allowImplicitFungibleTokenBurn: true,
  })
    .addInput(stampUtxo, customerSigner.unlockP2PKH())
    .addInput(
      contractUtxo,
      contract.unlock.redeem(businessSigner, customerPubKey, customerSigner),
    );
  if (leftover > 0n) {
    transaction.addOutput({
      to: toTokenAddress(customerAddress),
      amount: 1000n,
      token: { category, amount: leftover },
    });
  }
  transaction
    .addOutput({ to: customerAddress, amount: reward })
    .addBchChangeOutputIfNeeded({ to: businessAddress, feeRate: 1 });
  const tx = await transaction.send();
  return { txid: tx.txid, stampsBurned: Number(required) };
}

/**
 * ------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------
 */

export {
  provider,
  MINER_FEE,
  couponArtifact,
  punchCardArtifact,
};
