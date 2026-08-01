async function main() {
  const { ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } = await import('cashscript');
  const missing = ['BUSINESS_WIF', 'BUSINESS_ADDRESS'].filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);

  const network = process.env.BCH_NETWORK ?? 'chipnet';
  const merchantAddress = process.env.BUSINESS_ADDRESS;
  const seedAmount = BigInt(process.env.SEED_AMOUNT_SATS ?? '2000');

  const provider = new ElectrumNetworkProvider(network);
  const signer = new SignatureTemplate(process.env.BUSINESS_WIF);
  const utxos = await provider.getUtxos(merchantAddress);

  console.log('Current UTXOs:', utxos.map((u) => ({ txid: u.txid, vout: u.vout, satoshis: u.satoshis, hasToken: !!u.token })));

  const alreadyHasVoutZero = utxos.some((u) => !u.token && u.vout === 0);
  if (alreadyHasVoutZero) {
    console.log('\nA vout:0 UTXO already exists — no need to seed one. Re-run the genesis script.');
    return;
  }

  const fundingInput = utxos.find((utxo) => !utxo.token && utxo.satoshis > seedAmount + 500n);
  if (!fundingInput) {
    throw new Error(
      `No spendable BCH-only UTXO large enough to fund a fresh vout:0 output ` +
      `(need > ${seedAmount + 500n} sats). Fund the merchant wallet first.`
    );
  }

  const tx = await new TransactionBuilder({ provider })
    .addInput(fundingInput, signer.unlockP2PKH())
    .addOutput({ to: merchantAddress, amount: seedAmount }) // lands at vout 0
    .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 }) // change lands after
    .send();

  console.log(`\nSeeded a fresh vout:0 UTXO.`);
  console.log(`Transaction: ${tx.txid}`);
  console.log('Wait for it to confirm (or be relayed on chipnet), then re-run genesis-coupon-token.js.');
}

main().catch((error) => {
  console.error(`Seeding failed: ${error.message}`);
  process.exitCode = 1;
});