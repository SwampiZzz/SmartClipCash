// frontend/src/lib/contract.js
//
// This is the ONLY file that should know whether punch cards are implemented
// as a fungible stamp-token balance or a per-card NFT commitment counter.
// Components call the three exported functions below and never touch
// `Contract`, `TransactionBuilder`, or token internals directly. Swapping
// the underlying model later means rewriting the *insides* of these three
// functions (plus the .cash contract and the issuance scripts) without
// touching any component.

import { Contract, ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } from 'cashscript';
import punchCardArtifact from '../../contracts/artifact/PunchCardRedeem.json';

const NETWORK = import.meta.env?.VITE_BCH_NETWORK ?? 'chipnet';
const REQUIRED_STAMPS = Number(import.meta.env?.VITE_REQUIRED_STAMPS ?? 10);
const STAMP_CATEGORY = import.meta.env?.VITE_STAMP_CATEGORY; // 64-char hex, "unreversed" on-chain form

function getProvider() {
  return new ElectrumNetworkProvider(NETWORK);
}

function getContract({ businessPk, provider }) {
  // --- FUNGIBLE-STAMP-MODEL constructor args (today's implementation) ---
  // Swap this args array (and PunchCardRedeem.cash itself) to switch models.
  return new Contract(
    punchCardArtifact,
    [businessPk, STAMP_CATEGORY, REQUIRED_STAMPS],
    { provider },
  );
}

/**
 * Reads a customer's current punch-card progress.
 * Returns a model-agnostic shape: { current, required }.
 * Components render a progress bar off this and never know which
 * underlying representation (fungible balance vs NFT commitment) produced it.
 */
export async function checkStatus({ customerAddress }) {
  const provider = getProvider();
  const utxos = await provider.getUtxos(customerAddress);

  // --- FUNGIBLE-STAMP-MODEL: sum fungible token amounts for STAMP_CATEGORY ---
  const current = utxos
    .filter((utxo) => utxo.token?.category?.toLowerCase() === STAMP_CATEGORY?.toLowerCase())
    .reduce((sum, utxo) => sum + BigInt(utxo.token.amount ?? 0), 0n);

  // --- NFT-COMMITMENT-MODEL would instead be something like: ---
  // const cardUtxo = utxos.find((u) => u.token?.category === STAMP_CATEGORY && u.token.nft);
  // const current = cardUtxo ? decodePunchCount(cardUtxo.token.nft.commitment) : 0;

  return { current: Number(current), required: REQUIRED_STAMPS };
}

/**
 * Business issues one stamp to a customer.
 * Wraps genesis/issue-stamp mechanics behind a stable signature so
 * MerchantIssueView never needs to know how a "stamp" is represented.
 */
export async function issueStamp({ businessWif, businessAddress, customerAddress }) {
  const provider = getProvider();
  const businessSigner = new SignatureTemplate(businessWif);

  // --- FUNGIBLE-STAMP-MODEL: mint 1 fungible token from the minting-NFT baton ---
  const mintingUtxos = await provider.getUtxos(businessAddress);
  const batonUtxo = mintingUtxos.find(
    (u) => u.token?.category?.toLowerCase() === STAMP_CATEGORY?.toLowerCase()
      && u.token.nft?.capability === 'minting',
  );
  if (!batonUtxo) throw new Error('No minting baton found at business address — run genesis-stamp-token.js first.');

  const tx = await new TransactionBuilder({ provider })
    .addInput(batonUtxo, businessSigner.unlockP2PKH())
    .addOutput({
      to: businessAddress,
      amount: batonUtxo.satoshis,
      token: { category: batonUtxo.token.category, amount: 0n, nft: batonUtxo.token.nft },
    })
    .addOutput({
      to: customerAddress,
      amount: 1000n,
      token: { category: batonUtxo.token.category, amount: 1n },
    })
    .send();

  return { txid: tx.txid };
}

/**
 * Redeems a completed punch card: business + customer co-sign, reward lands,
 * required stamps are consumed.
 */
export async function redeemPunchCard({ businessWif, businessAddress, customerWif, customerAddress }) {
  const provider = getProvider();
  const businessSigner = new SignatureTemplate(businessWif);
  const customerSigner = new SignatureTemplate(customerWif);
  const businessPk = Buffer.from(businessSigner.getPublicKey()).toString('hex');
  const customerPk = Buffer.from(customerSigner.getPublicKey()).toString('hex');

  const contract = getContract({ businessPk, provider });

  // --- FUNGIBLE-STAMP-MODEL: gather enough stamp-token UTXOs to cover REQUIRED_STAMPS ---
  const customerUtxos = await provider.getUtxos(customerAddress);
  const stampUtxos = customerUtxos.filter(
    (u) => u.token?.category?.toLowerCase() === STAMP_CATEGORY?.toLowerCase() && !u.token.nft,
  );
  const totalStamps = stampUtxos.reduce((sum, u) => sum + BigInt(u.token.amount ?? 0), 0n);
  if (totalStamps < BigInt(REQUIRED_STAMPS)) {
    throw new Error(`Not enough stamps: have ${totalStamps}, need ${REQUIRED_STAMPS}.`);
  }

  const contractUtxo = (await contract.getUtxos()).find((u) => !u.token);
  if (!contractUtxo) throw new Error('Punch card reward contract is unfunded — top it up first.');

  // NOTE: mirrors the exact-change lesson from CouponRedeem — compute the
  // reward/change arithmetic here to match whatever PunchCardRedeem.cash
  // hardcodes on-chain, rather than relying on auto-calculated change.
  const minerFee = 1000n;
  const rewardSats = 1000n; // keep in sync with .env / contract constant
  const merchantChange = BigInt(contractUtxo.satoshis) - rewardSats - minerFee;
  if (merchantChange < 0n) throw new Error('Contract funding too low to cover reward + fee.');

  const tx = await new TransactionBuilder({ provider })
    .addInputs(stampUtxos, customerSigner.unlockP2PKH())
    .addInput(contractUtxo, contract.unlock.redeem(businessSigner, customerPk, customerSigner))
    .addOutput({ to: customerAddress, amount: rewardSats })
    .addOutput({ to: businessAddress, amount: merchantChange })
    .send();

  return { txid: tx.txid };
}