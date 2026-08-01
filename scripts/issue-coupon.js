/**
 * Issues one single-use coupon NFT to a customer, using the merchant's
 * minting NFT for the coupon token category (created by genesis-coupon-token.js).
 *
 * The commitment packs bytes4 expiry (little-endian unix timestamp) followed
 * by bytes20 ownerPKH, matching CouponRedeem.cash's expected layout.
 * IMPORTANT: little-endian, not big-endian — CashScript's int() cast expects
 * bytes in the same byte order Bitcoin Script numbers use.
 *
 * Required: BUSINESS_WIF, BUSINESS_ADDRESS (token address, z...), CUSTOMER_ADDRESS (token address, z...), CUSTOMER_PKH_HEX
 * Optional: BCH_NETWORK (default: chipnet), COUPON_OUTPUT_SATS (default: 1000), EXPIRY_SECONDS_FROM_NOW (default: 3600)
 */

function buildCommitment({ expiryUnixSeconds, ownerPKHHex }) {
  const expiryBuf = Buffer.alloc(4);
  expiryBuf.writeUInt32LE(expiryUnixSeconds, 0); // little-endian to match CashScript's int() decoding
  return Buffer.concat([expiryBuf, Buffer.from(ownerPKHHex, 'hex')]).toString('hex');
}

async function main() {
  const { ElectrumNetworkProvider, SignatureTemplate, TransactionBuilder } = await import('cashscript');
  const required = ['BUSINESS_WIF', 'BUSINESS_ADDRESS', 'CUSTOMER_ADDRESS', 'CUSTOMER_PKH_HEX', 'COUPON_CATEGORY'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);

  const network = process.env.BCH_NETWORK ?? 'chipnet';
  const merchantAddress = process.env.BUSINESS_ADDRESS; // token address (z...)
  const customerAddress = process.env.CUSTOMER_ADDRESS; // token address (z...)
  const outputSats = BigInt(process.env.COUPON_OUTPUT_SATS ?? '1000');
  const expirySecondsFromNow = Number(process.env.EXPIRY_SECONDS_FROM_NOW ?? '3');
  const expiryUnixSeconds = Math.floor(Date.now() / 1000) + expirySecondsFromNow;

  const commitment = buildCommitment({
    expiryUnixSeconds,
    ownerPKHHex: process.env.CUSTOMER_PKH_HEX,
  });

  const provider = new ElectrumNetworkProvider(network);
  const signer = new SignatureTemplate(process.env.BUSINESS_WIF);

  const utxos = await provider.getUtxos(merchantAddress);
  const mintingUtxos = utxos.filter((utxo) => utxo.token?.nft?.capability === 'minting');
  const mintingUtxo = mintingUtxos.find((utxo) => utxo.token.category === process.env.COUPON_CATEGORY);
  if (!mintingUtxo) {
    console.error('\nCOUPON_CATEGORY did not match any minting UTXO in this wallet.');
    console.error(`You passed: ${process.env.COUPON_CATEGORY}`);
    console.error('Minting UTXOs actually present in this wallet:');
    for (const u of mintingUtxos) {
      console.error(`  category: ${u.token.category}  (satoshis: ${u.satoshis}, fungible amount: ${u.token.amount})`);
    }
    throw new Error('No coupon minting NFT found matching COUPON_CATEGORY. Copy one of the full category values logged above.');
  }

  // The minting UTXO alone rarely carries enough sats to fund both outputs
  // plus the fee — it only needs to be present to authorize the mint. Add a
  // second, plain-BCH UTXO to actually cover the value being sent.
  const shortfallEstimate = outputSats * 2n + 500n; // rough: two outputs + fee buffer
  const fundingUtxo = utxos.find(
    (utxo) => !utxo.token && utxo.satoshis > shortfallEstimate
  );
  if (!fundingUtxo) {
    throw new Error(
      `No BCH-only UTXO large enough to fund coupon issuance (need > ${shortfallEstimate} sats). ` +
      'Fund the merchant wallet with more BCH.'
    );
  }

  const category = mintingUtxo.token.category;

  const tx = await new TransactionBuilder({ provider })
    .addInput(mintingUtxo, signer.unlockP2PKH())
    .addInput(fundingUtxo, signer.unlockP2PKH())
    .addOutput({
      // Recreate the minting authority so more coupons can be issued later
      to: merchantAddress,
      amount: outputSats,
      token: {
        category,
        amount: 0n,
        nft: { capability: 'minting', commitment: '' },
      },
    })
    .addOutput({
      // The actual coupon sent to the customer — single-use (capability 'none')
      to: customerAddress,
      amount: outputSats,
      token: {
        category,
        amount: 0n,
        nft: { capability: 'none', commitment },
      },
    })
    .addBchChangeOutputIfNeeded({ to: merchantAddress, feeRate: 1 })
    .send();

  console.log('\nCoupon issued.');
  console.log(`Transaction: ${tx.txid}`);
  console.log(`Category:    ${category}`);
  console.log(`Sent to:     ${customerAddress}`);
  console.log(`Expires:     ${new Date(expiryUnixSeconds * 1000).toISOString()}`);
  console.log(`Commitment:  ${commitment}`);
}

main().catch((error) => {
  console.error(`Coupon issuance failed: ${error.message}`);
  process.exitCode = 1;
});