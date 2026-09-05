import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Some binary assets are stored in this repo as base64 text because the tool
 * used to commit them could not push raw binaries. This runs before the Vite
 * build and materialises them back into public/ so the build sees real files.
 *
 * Each source is scripts/encoded-assets/<name>.b64 and decodes to
 * public/images/<name>.
 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'scripts/encoded-assets');
const OUT_DIR = path.join(ROOT, 'public/images');

function fail(message) {
  console.error('\n[decode-assets] BUILD FAILED: ' + message + '\n');
  process.exit(1);
}

if (!fs.existsSync(SRC_DIR)) {
  console.log('[decode-assets] nothing to decode.');
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
for (const file of fs.readdirSync(SRC_DIR)) {
  if (!file.endsWith('.b64')) continue;
  const outName = file.replace(/\.b64$/, '');
  const raw = fs.readFileSync(path.join(SRC_DIR, file), 'utf-8').replace(/\s+/g, '');
  if (!raw) fail(file + ' is empty.');

  const bytes = Buffer.from(raw, 'base64');
  // Round-trip guard: a truncated or corrupted paste would otherwise ship a
  // broken image and only surface as a blank hero in production.
  if (bytes.toString('base64').replace(/=+$/, '') !== raw.replace(/=+$/, '')) {
    fail(file + ' did not round-trip; the base64 is truncated or corrupted.');
  }
  if (bytes.length < 1024) fail(file + ' decoded to only ' + bytes.length + ' bytes.');

  fs.writeFileSync(path.join(OUT_DIR, outName), bytes);
  console.log('[decode-assets] ' + outName + '  ' + bytes.length.toLocaleString() + ' bytes');
  count += 1;
}

console.log('[decode-assets] OK. Materialised ' + count + ' asset(s).');
