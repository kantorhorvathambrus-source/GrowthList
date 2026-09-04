#!/usr/bin/env node
/**
 * Bulk handle verification.
 *
 *   node scripts/check-handles.mjs @one @two @three
 *   node scripts/check-handles.mjs --file handles.txt
 *
 * Resolves each handle against the API and reports what is actually there.
 * A handle that does not resolve is dropped, never guessed at — the smoke
 * test found @vinhgiang does not exist while the real channel is @askvinh,
 * which is exactly why candidates are probed rather than trusted.
 *
 * 1 quota unit per handle.
 */

import { getChannelByHandle, quotaUsed, redact, genericNameCollision } from './lib/youtube.mjs';
import { readFileSync } from 'node:fs';

let handles = process.argv.slice(2);
// Optional: --for <category-id> turns on the generic-name-collision warning,
// which is worth passing whenever a handle was guessed from a category name.
let forCategory = null;
const forAt = handles.indexOf('--for');
if (forAt !== -1) { forCategory = handles[forAt + 1] ?? null; handles.splice(forAt, 2); }
if (handles[0] === '--file') {
  handles = readFileSync(handles[1], 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
}
if (!handles.length) {
  console.error('usage: node scripts/check-handles.mjs @one @two  |  --file list.txt');
  process.exit(1);
}

const found = [];
const missing = [];

for (const handle of handles) {
  try {
    const c = await getChannelByHandle(handle);
    if (!c) {
      missing.push(handle);
      console.log(`MISSING  ${handle}`);
      continue;
    }
    found.push(c);
    const subs = c.hiddenSubscriberCount ? 'hidden' : c.sizeBucket;
    const collision = genericNameCollision(c.title, forCategory);
    console.log(
      `OK       ${handle.padEnd(28)} ${String(c.title).slice(0, 30).padEnd(31)} ` +
      `${String(subs).padEnd(10)} ${c.country ?? '--'}  ${c.videoCount} vids`
    );
    if (collision) console.log(`         ${collision}`);
  } catch (err) {
    console.log(`ERROR    ${handle}  ${redact(err.message).slice(0, 90)}`);
  }
}

console.log(`\nresolved ${found.length}/${handles.length}   quota ${JSON.stringify(quotaUsed())}`);
if (missing.length) console.log(`missing: ${missing.join(' ')}`);
