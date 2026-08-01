async function main() {
  const { ElectrumNetworkProvider } = await import('cashscript');

  const required = ['ADDRESS', 'CATEGORY_ID'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  const address = process.env.ADDRESS;
  const categoryId = process.env.CATEGORY_ID;
  const network = process.env.BCH_NETWORK ?? 'chipnet';

  if (!/^[0-9a-fA-F]{64}$/.test(categoryId)) {
    throw new Error('CATEGORY_ID must be a 64-character hexadecimal category ID.');
  }

  const provider = new ElectrumNetworkProvider(network);
  const utxos = await provider.getUtxos(address);
  const stampUtxos = utxos.filter((utxo) =>
    utxo.token?.category.toLowerCase() === categoryId.toLowerCase(),
  );
  const balance = stampUtxos.reduce((total, utxo) => total + utxo.token.amount, 0n);

  console.log('\nSmartClipCash stamp balance');
  console.log(`Network:       ${network}`);
  console.log(`Address:       ${address}`);
  console.log(`Category ID:   ${categoryId}`);
  console.log(`Stamp balance: ${balance}`);
  console.log(`Token UTXOs:   ${stampUtxos.length}`);

  if (stampUtxos.length > 0) {
    console.log('\nMatching UTXOs:');
    for (const utxo of stampUtxos) {
      console.log(`- ${utxo.txid}:${utxo.vout} | ${utxo.token.amount} stamps | ${utxo.satoshis} sats`);
    }
  }
}

main().catch((error) => {
  console.error(`Balance check failed: ${error.message}`);
  process.exitCode = 1;
});
