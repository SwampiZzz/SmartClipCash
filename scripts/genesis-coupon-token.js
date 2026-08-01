async function main() {
  const { ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } = await import('cashscript');
  const missing = ['BUSINESS_WIF', 'BUSINESS_ADDRESS'].filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);

  const network = process.env.BCH_NETWORK ?? 'chipnet';
  const merchantAddress = process.env.BUSINESS_ADDRESS;
  const outputSatoshis = BigInt(process.env.GENESIS_OUTPUT_SATS ?? '1000');
  if (outputSatoshis < 800n) throw new Error('GENESIS_OUTPUT_SATS must be at least 800 sats.');

  const provider = new ElectrumNetworkProvider(network);
  const signer = new SignatureTemplate(process.env.BUSINESS_WIF);
  const utxos = await provider.getUtxos(merchantAddress);
  const genesisInput = utxos.find((utxo) => !utxo.token && utxo.vout === 0);
  if (!genesisInput) {
    throw new Error(
      'No eligible genesis UTXO found. A genesis input must be output index 0 ' +
      'of its parent transaction. Send the merchant wallet a fresh payment to ' +
      'create one, then re-run this script.'
    );
  }
  const categoryId = genesisInput.txid;

  console.log('genesisInput:', genesisInput);
  console.log('categoryId used:', categoryId);
  console.log('genesisInput.txid raw:', genesisInput.txid);
  const tx = await new TransactionBuilder({ provider })
    .addInput(genesisInput, signer.unlockP2PKH())
    .addOutput({
      to: merchantAddress,
      amount: outputSatoshis,
      token: {
        category: categoryId,
        amount: 0n,
        nft: { capability: 'minting', commitment: '' },
      },
    })
    .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 })
    .send();

  console.log('\nCoupon NFT category created.');
  console.log(`Network:     ${network}`);
  console.log(`Transaction: ${tx.txid}`);
  console.log(`Category ID: ${categoryId}`);
  console.log('Minting NFT: retained in the merchant wallet');
}

main().catch((error) => {
  console.error(`Coupon genesis failed: ${error.message}`);
  process.exitCode = 1;
});
