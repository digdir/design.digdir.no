import fs from 'node:fs';
import path from 'node:path';
import { buildExports, packageRoot } from './exports.ts';

const file = path.join(packageRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));

packageJson.exports = buildExports();
fs.writeFileSync(file, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`Wrote ${Object.keys(packageJson.exports).length} exports.`);
