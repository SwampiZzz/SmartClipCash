async function main() {
  const path = await import('node:path');
  const { compileFile } = await import('cashc');
  const { Contract, ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } = await import('cashscript');
  const required = ['BUSINESS_WIF', 'BUSINESS_ADDRESS', 'CUSTOMER_WIF', 'CUSTOMER_ADDRESS', 'COUPON_CATEGORY_ID'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);

  const network = process.env.BCH_NETWORK ?? 'chipnet';
  const merchantAddress = process.env.BUSINESS_ADDRESS;
  const customerAddress = process.env.CUSTOMER_ADDRESS;
  // Use this value verbatim for SDK-level UTXO matching (utxo.token.category
  // uses "default" display order). The on-chain contract constructor needs
  // the OPPOSITE byte order — see categoryIdForContract below.
  const categoryId = process.env.COUPON_CATEGORY_ID;
  const categoryIdForContract = reverseHexBytes(categoryId);
  const transferable = (process.env.TRANSFERABLE ?? 'false').toLowerCase() === 'true';
  const rewardSats = BigInt(process.env.REWARD_SATS ?? '1000');
  const fundingSats = BigInt(process.env.CONTRACT_FUNDING_SATS ?? String(rewardSats + 5000n));
  const minerFee = 1000n; // MUST match the contract's hardcoded `minerFee` exactly
  if (!/^[0-9a-fA-F]{64}$/.test(categoryId)) throw new Error('COUPON_CATEGORY_ID must be a 64-character hexadecimal ID.');
  if (rewardSats < 800n || fundingSats <= rewardSats) throw new Error('Set REWARD_SATS >= 800 and CONTRACT_FUNDING_SATS > REWARD_SATS.');

  const provider = new ElectrumNetworkProvider(network);
  const businessSigner = new SignatureTemplate(process.env.BUSINESS_WIF);
  const customerSigner = new SignatureTemplate(process.env.CUSTOMER_WIF);
  const businessPk = Buffer.from(businessSigner.getPublicKey()).toString('hex');
  const customerPk = Buffer.from(customerSigner.getPublicKey()).toString('hex');
  const artifact = compileFile(path.resolve(process.cwd(), 'contracts', 'CouponRedeem.cash'));

  // 4 constructor args, matching the current contract: businessPk, transferable,
  // couponCategory, discountValue. ownerPk is no longer a constructor param —
  // it lives inside each coupon's own NFT commitment instead.
  // NOTE: couponCategory uses categoryIdForContract (script/raw byte order),
  // NOT categoryId (SDK/display order) — these are genuinely different values.
  const contract = new Contract(
    artifact,
    [businessPk, transferable, categoryIdForContract, rewardSats],
    { provider },
  );

  let contractUtxo = (await contract.getUtxos()).find((utxo) => !utxo.token);
  if (!contractUtxo) {
    const merchantUtxos = await provider.getUtxos(merchantAddress);
    const bchUtxos = merchantUtxos.filter((utxo) => !utxo.token);
    if (!bchUtxos.length) throw new Error('Merchant needs a BCH-only UTXO to fund the coupon contract.');
    const fundingTx = await new TransactionBuilder({ provider })
      .addInputs(bchUtxos, businessSigner.unlockP2PKH())
      .addOutput({ to: contract.address, amount: fundingSats })
      .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 })
      .send();
    console.log(`Funded coupon contract: ${fundingTx.txid}`);
    contractUtxo = (await contract.getUtxos()).find((utxo) => !utxo.token);
    if (!contractUtxo) throw new Error(`Funding broadcast, but no spendable contract UTXO was found at ${contract.address}. Retry shortly.`);
  }

  const customerUtxos = await provider.getUtxos(customerAddress);
  const couponUtxo = customerUtxos.find((utxo) =>
    utxo.token?.category === categoryId
    && utxo.token.nft?.capability === 'none',
  );
  if (!couponUtxo) {
    console.error('\nNo matching coupon found. Coupon-bearing UTXOs at this address:');
    for (const u of customerUtxos.filter((u) => u.token)) {
      console.error(`  category: ${u.token.category}  capability: ${u.token.nft?.capability}`);
    }
    throw new Error(`No immutable coupon NFT for category ${categoryId} found at the customer address.`);
  }

  const contractInputValue = BigInt(contractUtxo.satoshis ?? contractUtxo.value);
  const merchantChange = contractInputValue - rewardSats - minerFee;
  if (merchantChange < 0n) {
    throw new Error(`Contract funding (${contractInputValue} sats) is too low to cover reward (${rewardSats}) + fee (${minerFee}).`);
  }

  const tx = await new TransactionBuilder({ provider })
    // Coupon must be input 0 because CouponRedeem.cash introspects tx.inputs[0] explicitly.
    .addInput(couponUtxo, customerSigner.unlockP2PKH())
    .addInput(contractUtxo, contract.unlock.redeem(businessSigner, customerPk, customerSigner))
    .addOutput({ to: customerAddress, amount: rewardSats })
    .addOutput({ to: merchantAddress, amount: merchantChange }) // exact match to contract's math, not auto-calculated
    .send();

  console.log('\nCoupon redemption complete.');
  console.log(`Network:          ${network}`);
  console.log(`Contract address: ${contract.address}`);
  console.log(`Transaction:      ${tx.txid}`);
  console.log('Coupon NFT:       burned (single use enforced)');
  console.log(`Reward paid:      ${rewardSats} sats`);
  console.log(`Merchant change:  ${merchantChange} sats`);
}

main().catch((error) => {
  console.error(`Coupon redemption failed: ${error.message}`);
  process.exitCode = 1;
});

function reverseHexBytes(hex) {
  const bytes = hex.match(/.{1,2}/g);
  return bytes.reverse().join('');
}