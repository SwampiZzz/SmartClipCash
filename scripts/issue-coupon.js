async function main() {
  const { ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } = await import('cashscript');
  const required = ['BUSINESS_WIF', 'BUSINESS_ADDRESS', 'COUPON_CATEGORY_ID', 'CUSTOMER_ADDRESS', 'CUSTOMER_PUBKEY'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);

  const network = process.env.BCH_NETWORK ?? 'chipnet';
  const merchantAddress = process.env.BUSINESS_ADDRESS;
  const customerAddress = process.env.CUSTOMER_ADDRESS;
  const categoryId = process.env.COUPON_CATEGORY_ID;
  const customerPk = process.env.CUSTOMER_PUBKEY;
  const outputSatoshis = BigInt(process.env.COUPON_OUTPUT_SATS ?? '1000');
  if (!/^[0-9a-fA-F]{64}$/.test(categoryId)) throw new Error('COUPON_CATEGORY_ID must be a 64-character hexadecimal ID.');
  if (!/^(02|03)[0-9a-fA-F]{64}$/.test(customerPk)) throw new Error('CUSTOMER_PUBKEY must be a 33-byte compressed public key in hexadecimal.');
  if (outputSatoshis < 800n) throw new Error('COUPON_OUTPUT_SATS must be at least 800 sats.');

  const provider = new ElectrumNetworkProvider(network);
  const signer = new SignatureTemplate(process.env.BUSINESS_WIF);
  const utxos = await provider.getUtxos(merchantAddress);
  const minterUtxo = utxos.find((utxo) =>
    utxo.token?.category.toLowerCase() === categoryId.toLowerCase()
    && utxo.token.nft?.capability === 'minting',
  );
  if (!minterUtxo?.token?.nft) throw new Error(`No coupon minting NFT for ${categoryId} found at the merchant address.`);

  const bchUtxos = utxos.filter((utxo) => !utxo.token);
  if (!bchUtxos.length) throw new Error('Merchant needs a BCH-only UTXO for the customer output and fee.');

  // The immutable coupon stores the recipient public key as its commitment.
  const tx = await new TransactionBuilder({ provider })
    .addInput(minterUtxo, signer.unlockP2PKH())
    .addInputs(bchUtxos, signer.unlockP2PKH())
    .addOutput({
      to: merchantAddress,
      amount: minterUtxo.satoshis,
      token: {
        category: categoryId,
        amount: minterUtxo.token.amount,
        nft: { capability: 'minting', commitment: minterUtxo.token.nft.commitment },
      },
    })
    .addOutput({
      to: customerAddress,
      amount: outputSatoshis,
      token: {
        category: categoryId,
        amount: 0n,
        nft: { capability: 'none', commitment: customerPk.toLowerCase() },
      },
    })
    .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 })
    .send();

  console.log('\nCoupon issued successfully.');
  console.log(`Network:         ${network}`);
  console.log(`Transaction:     ${tx.txid}`);
  console.log(`Coupon category: ${categoryId}`);
  console.log(`Recipient:       ${customerAddress}`);
  console.log('Coupon type:     immutable NFT');
}

main().catch((error) => {
  console.error(`Coupon issuance failed: ${error.message}`);
  process.exitCode = 1;
});
