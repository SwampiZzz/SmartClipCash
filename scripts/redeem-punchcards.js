async function main() {
  const path = await import('node:path');
  const { compileFile } = await import('cashc');
  const {
    Contract,
    ElectrumNetworkProvider,
    SignatureTemplate,
    TransactionBuilder,
  } = await import('cashscript');

  const required = [
    'BUSINESS_WIF',
    'BUSINESS_ADDRESS',
    'CUSTOMER_WIF',
    'CUSTOMER_ADDRESS',
    'CATEGORY_ID',
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  const network = process.env.BCH_NETWORK ?? 'chipnet';
  const merchantAddress = process.env.BUSINESS_ADDRESS;
  const customerAddress = process.env.CUSTOMER_ADDRESS;
  const categoryId = process.env.CATEGORY_ID;
  const requiredStamps = BigInt(process.env.REQUIRED_STAMPS ?? '2');
  const rewardSats = BigInt(process.env.REWARD_SATS ?? '1000');
  const fundingSats = BigInt(process.env.CONTRACT_FUNDING_SATS ?? String(rewardSats + 5000n));
  const tokenOutputSats = BigInt(process.env.TOKEN_OUTPUT_SATS ?? '1000');

  if (!/^[0-9a-fA-F]{64}$/.test(categoryId)) {
    throw new Error('CATEGORY_ID must be a 64-character hexadecimal category ID.');
  }
  if (requiredStamps < 1n || rewardSats < 800n || tokenOutputSats < 800n) {
    throw new Error('REQUIRED_STAMPS must be positive; BCH output amounts must be at least 800 sats.');
  }
  if (fundingSats <= rewardSats) {
    throw new Error('CONTRACT_FUNDING_SATS must exceed REWARD_SATS to cover the fee and BCH change.');
  }

  const provider = new ElectrumNetworkProvider(network);
  const businessSigner = new SignatureTemplate(process.env.BUSINESS_WIF);
  const customerSigner = new SignatureTemplate(process.env.CUSTOMER_WIF);
  const businessPk = Buffer.from(businessSigner.getPublicKey()).toString('hex');
  const customerPk = Buffer.from(customerSigner.getPublicKey()).toString('hex');
  const artifact = compileFile(path.resolve(process.cwd(), 'contracts', 'PunchCardRedeem.cash'));
  const contract = new Contract(
    artifact,
    [businessPk, categoryId, requiredStamps, rewardSats],
    { provider },
  );

  // The merchant funds the covenant once. The script returns its remaining BCH
  // to the merchant after redemption, so this is not a permanent lock-up.
  let contractUtxo = (await contract.getUtxos()).find((utxo) => !utxo.token);
  if (!contractUtxo) {
    const merchantUtxos = await provider.getUtxos(merchantAddress);
    const bchUtxos = merchantUtxos.filter((utxo) => !utxo.token);
    if (bchUtxos.length === 0) {
      throw new Error('Merchant needs a BCH-only UTXO to fund the redemption contract.');
    }

    const fundingTx = await new TransactionBuilder({ provider })
      .addInputs(bchUtxos, businessSigner.unlockP2PKH())
      .addOutput({ to: contract.address, amount: fundingSats })
      .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 })
      .send();
    console.log(`Funded redemption contract: ${fundingTx.txid}`);

    contractUtxo = (await contract.getUtxos()).find((utxo) => !utxo.token);
    if (!contractUtxo) {
      throw new Error(`Funding broadcast, but no spendable contract UTXO was returned at ${contract.address}. Retry shortly.`);
    }
  }

  let customerUtxos = await provider.getUtxos(customerAddress);
  let stampUtxo = customerUtxos.find((utxo) =>
    utxo.token?.category.toLowerCase() === categoryId.toLowerCase()
    && utxo.token.amount >= requiredStamps,
  );

  // The covenant validates only tx.inputs[0], so it needs one UTXO containing
  // the full redemption amount. Customers can naturally receive one stamp per
  // purchase, so merge enough same-category UTXOs before attempting redemption.
  if (!stampUtxo) {
    const stampUtxos = customerUtxos.filter((utxo) =>
      utxo.token?.category.toLowerCase() === categoryId.toLowerCase(),
    );
    const totalStamps = stampUtxos.reduce((total, utxo) => total + utxo.token.amount, 0n);
    if (totalStamps >= requiredStamps) {
      const selectedUtxos = [];
      let selectedStamps = 0n;
      for (const utxo of stampUtxos) {
        selectedUtxos.push(utxo);
        selectedStamps += utxo.token.amount;
        if (selectedStamps >= requiredStamps) break;
      }

      const consolidationTx = await new TransactionBuilder({ provider })
        .addInputs(selectedUtxos, customerSigner.unlockP2PKH())
        .addOutput({
          to: customerAddress,
          amount: tokenOutputSats,
          token: { category: categoryId, amount: selectedStamps },
        })
        .addBchChangeOutputIfNeeded({ to: customerAddress, feeRate: 1 })
        .send();
      console.log(`Consolidated ${selectedStamps} customer stamps: ${consolidationTx.txid}`);

      customerUtxos = await provider.getUtxos(customerAddress);
      stampUtxo = customerUtxos.find((utxo) =>
        utxo.token?.category.toLowerCase() === categoryId.toLowerCase()
        && utxo.token.amount >= requiredStamps,
      );
    }
  }
  if (!stampUtxo?.token) {
    throw new Error(`Customer needs one stamp UTXO containing at least ${requiredStamps} stamps.`);
  }

  const leftover = stampUtxo.token.amount - requiredStamps;
  const transaction = new TransactionBuilder({
    provider,
    allowImplicitFungibleTokenBurn: true,
  })
    // Must stay first: the covenant checks tx.inputs[0].
    .addInput(stampUtxo, customerSigner.unlockP2PKH())
    .addInput(
      contractUtxo,
      contract.unlock.redeem(businessSigner, customerPk, customerSigner),
    );

  if (leftover > 0n) {
    transaction.addOutput({
      to: customerAddress,
      amount: tokenOutputSats,
      token: { category: categoryId, amount: leftover },
    });
  }
  transaction
    .addOutput({ to: customerAddress, amount: rewardSats })
    // Required by the contract's output-count rules; it also pays the miner fee.
    .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 });

  const tx = await transaction.send();
  console.log('\nPunch-card redemption complete.');
  console.log(`Network:          ${network}`);
  console.log(`Contract address: ${contract.address}`);
  console.log(`Transaction:      ${tx.txid}`);
  console.log(`Stamps burned:    ${requiredStamps}`);
  console.log(`Stamps returned:  ${leftover}`);
  console.log(`Reward paid:      ${rewardSats} sats`);
}

main().catch((error) => {
  console.error(`Redemption failed: ${error.message}`);
  process.exitCode = 1;
});
