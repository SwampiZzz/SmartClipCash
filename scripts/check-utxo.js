const { ElectrumNetworkProvider } = await import('cashscript');
const provider = new ElectrumNetworkProvider('chipnet');
const utxos = await provider.getUtxos('bchtest:qrcdyfeuuqlzjvh4w3h3wrm70rqxqcp9252ynmtfs5');
console.log(JSON.stringify(utxos, (key, value) =>
  typeof value === 'bigint' ? value.toString() : value
, 2));