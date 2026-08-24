#!/usr/bin/env node
/**
 * Secret guard. Zero dependencies, plain node.
 *
 *   node scripts/check-secrets.mjs            # scan tracked + staged files
 *   node scripts/check-secrets.mjs --staged   # staged only (pre-commit hook)
 *
 * Exits non-zero if anything that looks like a credential is about to be
 * committed, or if .env is tracked at all.
 *
 * This is a backstop, not the primary defence — .env is gitignored and the
 * research scripts redact the key from every line they print. It exists
 * because a leaked key is unrecoverable: it must be rotated, not un-pushed.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const stagedOnly = process.argv.includes('--staged');

const PATTERNS = [
  // Google API keys: AIza + 35 chars. This is the one that matters here.
  { name: 'Google API key', re: /AIza[0-9A-Za-z_\-]{35}/ },
  // Generic assignments that should never be literal in a tracked file.
  { name: 'YOUTUBE_API_KEY assignment', re: /YOUTUBE_API_KEY\s*[=:]\s*["']?[A-Za-z0-9_\-]{20,}/ },
  { name: 'Google OAuth client secret', re: /GOCSPX-[0-9A-Za-z_\-]{20,}/ },
  { name: 'Bearer token', re: /\bBearer\s+[A-Za-z0-9._\-]{30,}/ },
  { name: 'Private key block', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const problems = [];

// 1. .env must never be tracked, staged, or committed anywhere in history.
const tracked = git('ls-files').split('\n').filter(Boolean);
for (const file of tracked) {
  if (/^\.env(\..*)?$/.test(file) && file !== '.env.example') {
    problems.push(`${file} is TRACKED by git — it must be gitignored, not committed.`);
  }
}

// 2. Scan file contents.
const files = stagedOnly
  ? git('diff --cached --name-only --diff-filter=ACM').split('\n').filter(Boolean)
  : tracked;

for (const file of files) {
  // .env.example is allowed to name the variable, but not to hold a value.
  const path = join(ROOT, file);
  if (!existsSync(path)) continue;

  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    continue; // binary or unreadable
  }

  for (const { name, re } of PATTERNS) {
    if (file === '.env.example' && name === 'YOUTUBE_API_KEY assignment') continue;
    const match = text.match(re);
    if (match) {
      const line = text.slice(0, match.index).split('\n').length;
      problems.push(`${file}:${line} — possible ${name}`);
    }
  }
}

// 3. If a key is present in the environment, make sure its literal value is
//    nowhere in the tree. Catches a key pasted into a comment or a fixture.
const live = process.env.YOUTUBE_API_KEY;
if (live && live.length >= 20) {
  for (const file of files) {
    const path = join(ROOT, file);
    if (!existsSync(path)) continue;
    try {
      if (readFileSync(path, 'utf8').includes(live)) {
        problems.push(`${file} — contains the LIVE value of YOUTUBE_API_KEY. Rotate the key.`);
      }
    } catch {
      /* ignore */
    }
  }
}

if (problems.length) {
  console.error('SECRET CHECK FAILED\n');
  for (const p of problems) console.error(`  x ${p}`);
  console.error('\nNothing was committed. If a key was exposed, rotate it — do not just amend.');
  process.exit(1);
}

console.log(`Secret check clean (${files.length} file${files.length === 1 ? '' : 's'} scanned).`);
