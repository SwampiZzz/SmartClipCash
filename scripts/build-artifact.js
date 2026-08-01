// scripts/build-artifact.js
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compileFile } from 'cashc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contracts = ['CouponRedeem', 'PunchCardRedeem'];

for (const name of contracts) {
  const artifact = compileFile(path.resolve(__dirname, `../contracts/${name}.cash`));
  fs.writeFileSync(
    path.resolve(__dirname, `../contracts/artifact/${name}.json`),
    JSON.stringify(artifact, null, 2),
  );
  console.log(`Artifact written to contracts/artifact/${name}.json`);
}
