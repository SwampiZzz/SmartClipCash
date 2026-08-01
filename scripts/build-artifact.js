// scripts/build-artifact.js
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compileFile } from 'cashc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifact = compileFile(path.resolve(__dirname, '../contracts/PunchCardRedeem.cash'));

fs.writeFileSync(
  path.resolve(__dirname, '../contracts/artifact/PunchCardRedeem.json'),
  JSON.stringify(artifact, null, 2),
);

console.log('Artifact written to contracts/artifact/PunchCardRedeem.json');