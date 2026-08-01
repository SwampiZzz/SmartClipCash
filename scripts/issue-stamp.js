/**
 * Issues pre-created stamp tokens from the merchant reserve to a customer.
 * Run after genesis-stamp-token.js.
 *
 * Required environment variables:
 *   BUSINESS_WIF       WIF for the merchant wallet which holds the minting NFT
 *   BUSINESS_ADDRESS   Token-aware CashAddress for that merchant wallet
 *   CATEGORY_ID        Category ID printed by genesis-stamp-token.js
 *   CUSTOMER_ADDRESS   Token-aware CashAddress receiving the new stamps
 *
 * Optional environment variables:
 *   BCH_NETWORK        chipnet (default), mainnet, testnet3, testnet4, regtest
 *   STAMPS_TO_ISSUE    Number of reserve stamps to send (default: 1)
 *   TOKEN_OUTPUT_SATS  BCH carried by the customer token output (default: 1000)
 */

async function main() {
  const {
    ElectrumNetworkProvider,
    SignatureTemplate,
    TransactionBuilder,
  } = await import('cashscript');

  const required = [
    'BUSINESS_WIF',
    'BUSINESS_ADDRESS',
    'CATEGORY_ID',
    'CUSTOMER_ADDRESS',
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  const network = process.env.BCH_NETWORK ?? 'chipnet';
  const merchantAddress = process.env.BUSINESS_ADDRESS;
  const customerAddress = process.env.CUSTOMER_ADDRESS;
  const categoryId = process.env.CATEGORY_ID;
  const stampsToIssue = BigInt(process.env.STAMPS_TO_ISSUE ?? '1');
  const tokenOutputSatoshis = BigInt(process.env.TOKEN_OUTPUT_SATS ?? '1000');

  if (!/^[0-9a-fA-F]{64}$/.test(categoryId)) {
    throw new Error('CATEGORY_ID must be the 64-character hexadecimal ID printed by genesis.');
  }
  if (stampsToIssue < 1n) throw new Error('STAMPS_TO_ISSUE must be at least 1.');
  if (tokenOutputSatoshis < 800n) {
    throw new Error('TOKEN_OUTPUT_SATS must be at least 800 sats (token output dust limit).');
  }

  const provider = new ElectrumNetworkProvider(network);
  const signer = new SignatureTemplate(process.env.BUSINESS_WIF);
  const utxos = await provider.getUtxos(merchantAddress);

  const reserveUtxo = utxos.find((utxo) =>
    utxo.token?.category.toLowerCase() === categoryId.toLowerCase()
    && utxo.token.amount > 0n,
  );
  if (!reserveUtxo?.token) {
    throw new Error(`No stamp reserve for category ${categoryId} found at ${merchantAddress}.`);
  }
  if (reserveUtxo.token.amount < stampsToIssue) {
    throw new Error(`Insufficient stamp reserve: have ${reserveUtxo.token.amount}, need ${stampsToIssue}.`);
  }

  // The reserve UTXO only carries token dust BCH. Add BCH-only UTXOs to
  // fund the customer's token output and miner fee, without disturbing other tokens.
  const bchUtxos = utxos.filter((utxo) => !utxo.token);
  if (bchUtxos.length === 0) {
    throw new Error('No BCH-only UTXO available for the customer output and transaction fee. Fund the merchant wallet first.');
  }

  const tx = await new TransactionBuilder({ provider })
    .addInput(reserveUtxo, signer.unlockP2PKH())
    .addInputs(bchUtxos, signer.unlockP2PKH())
    // Return the unused reserve to the merchant. If this output also holds
    // the genesis minting NFT, preserve it unchanged.
    .addOutput({
      to: merchantAddress,
      amount: reserveUtxo.satoshis,
      token: {
        category: categoryId,
        amount: reserveUtxo.token.amount - stampsToIssue,
        ...(reserveUtxo.token.nft ? {
          nft: {
            capability: reserveUtxo.token.nft.capability,
            commitment: reserveUtxo.token.nft.commitment,
          },
        } : {}),
      },
    })
    .addOutput({
      to: customerAddress,
      amount: tokenOutputSatoshis,
      token: { category: categoryId, amount: stampsToIssue },
    })
    .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 })
    .send();

  console.log('\nStamp issued successfully.');
  console.log(`Network:          ${network}`);
  console.log(`Transaction:      ${tx.txid}`);
  console.log(`Category ID:      ${categoryId}`);
  console.log(`Customer:         ${customerAddress}`);
  console.log(`Stamps issued:    ${stampsToIssue}`);
  console.log(`Merchant reserve: ${reserveUtxo.token.amount - stampsToIssue} stamps remaining`);
}

main().catch((error) => {
  console.error(`Stamp issuance failed: ${error.message}`);
  process.exitCode = 1;
});
