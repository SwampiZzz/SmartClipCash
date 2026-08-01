async function main() {
const {
  ElectrumNetworkProvider,
  SignatureTemplate,
  TransactionBuilder,
} = await import('cashscript');

const required = ['BUSINESS_WIF', 'BUSINESS_ADDRESS'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

const network = process.env.BCH_NETWORK ?? 'chipnet';
const merchantAddress = process.env.BUSINESS_ADDRESS;
const stampAmount = BigInt(process.env.INITIAL_STAMPS ?? '1000');
const outputSatoshis = BigInt(process.env.GENESIS_OUTPUT_SATS ?? '1000');

if (stampAmount < 1n) throw new Error('INITIAL_STAMPS must be at least 1.');
if (outputSatoshis < 800n) {
  throw new Error('GENESIS_OUTPUT_SATS must be at least 800 sats (token output dust limit).');
}

const provider = new ElectrumNetworkProvider(network);
const signer = new SignatureTemplate(process.env.BUSINESS_WIF);

// A CashToken category is the transaction ID of the first input. Never use
// an existing token UTXO here: genesis must not move or burn another token.
const availableUtxos = await provider.getUtxos(merchantAddress);
const bchUtxos = availableUtxos.filter((utxo) => !utxo.token);
if (bchUtxos.length === 0) {
  throw new Error(`No BCH-only UTXOs found for ${merchantAddress}. Fund this address first.`);
}

const genesisInput = bchUtxos[0];
const categoryId = genesisInput.txid;

const tx = await new TransactionBuilder({ provider })
  .addInput(genesisInput, signer.unlockP2PKH())
  .addOutput({
    to: merchantAddress,
    amount: outputSatoshis,
    token: {
      category: categoryId,
      amount: stampAmount,
      nft: { capability: 'minting', commitment: '' },
    },
  })
  .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 })
  .send();

console.log('\nSmartClipCash stamp token created.');
console.log(`Network:       ${network}`);
console.log(`Transaction:   ${tx.txid}`);
console.log(`Category ID:   ${categoryId}`);
console.log(`Initial stamps:${stampAmount}`);
console.log('Minting NFT:   retained at the merchant address in the genesis output');
console.log('\nSave CATEGORY_ID for issue-stamp.js and PunchCardRedeem deployment.');
}

main().catch((error) => {
  console.error(`Genesis failed: ${error.message}`);
  process.exitCode = 1;
});
