#!/usr/bin/env node
/**
 * THE ENTITY AXIS — individual / institution / vendor.
 *
 *   node scripts/derive-entity.mjs            report, with confidence
 *   node scripts/derive-entity.mjs --write     apply the confident ones only
 *
 * `role` conflated two different things. 201 of 233 records say `specialist`,
 * and among them are a working dermatologist and a subscription piano school.
 * That is not a vocabulary nicety: the depth-3 allocator flags a category when
 * its two creators AGREE — same role, overlapping stance signals — so an
 * institution and an individual teacher read as agreeing when they may be the
 * widest disagreement the category has to offer. `injury-rehab` is the case
 * that showed the test was worth having; this is the case that would have
 * broken it.
 *
 * WHAT THE AXES MEAN, kept separate on purpose:
 *   role   — what they do for the reader (specialist / generalist / critic)
 *   entity — who is speaking (individual / institution / vendor)
 *
 *   individual  : one named person is the author and the teacher.
 *   institution : an organisation whose channel is not primarily selling its
 *                 own product to the viewer — a non-profit, a university, a
 *                 professional body, a research group, a publication.
 *   vendor      : an organisation whose channel exists to sell its own product
 *                 or service to the viewer. Pianote, Buzzsprout, PremiumBeat.
 *
 * DERIVED FROM EVIDENCE, NOT GUESSED. The channel's own description is the
 * source: a person writes "I" and "my", an organisation writes "we" and "our".
 * Where that evidence is absent or contradictory the record is FLAGGED for
 * judgement rather than assigned — the whole point of the exercise is that a
 * wrong entity value corrupts the allocator, and a guess is worse than a gap.
 */

import { getChannelByHandle, quotaUsed } from './lib/youtube.mjs';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'data/creators');
const WRITE = process.argv.includes('--write');

/* AN EVIDENCE LADDER, NOT A FLAT TEST. The first version weighed first-person
 * and corporate markers equally and flagged 95 of 233 — including Rex Krueger
 * ("My name is Rex Krueger and like many of you, I am human") and Stephen
 * Woodford, both flagged because an individual using an editorial "we" tripped
 * the corporate rule. Someone naming themselves is stronger evidence than any
 * word choice around it, so the rules are ordered by strength and the first one
 * to fire wins. */

/** 1. Strongest: the person names themselves. */
const SELF_NAMED = /\b(?:I'?m|I am|My name is|This is)\s+(?:Dr\.?\s+)?[A-Z][a-z]+/;
/** 2. Our own record already encodes a person: "3Blue1Brown (Grant Sanderson)",
 *     "Stumpy Nubs (James Hamilton)". Judged at research time, from evidence. */
const NAME_HAS_PERSON = /\(([^)]*\b(?:Dr\.?|[A-Z][a-z]+)\s+[A-Z][a-z]+[^)]*)\)/;
/** 3. The organisation describes itself in the third person: "X is a ...",
 *     "Since 1924, X has ...". */
const ORG_SELF = /\b(?:is a|is an|is the|has been|was founded|Since \d{4})\b[^.]{0,60}\b(?:company|platform|solution|organi[sz]ation|non-?profit|charity|association|institute|society|school|studio|agency|publication|magazine|consultancy|network|clinic|hospital|university|college)\b/i;
/** 4. Plain first-person singular, no self-naming. */
const FIRST_PERSON = /\b(?:I've|I'll|I |my |me)\b/;
/** 5. Plain corporate voice. */
const CORPORATE = /\b(?:we |we're|our |Inc\.|Ltd|LLC|GmbH)\b/i;
/** Selling its own product TO THE VIEWER — what separates vendor from
 *  institution once we know we are looking at an organisation. */
const SELLS_TO_VIEWER = /\b(?:subscription|free trial|FREE for|our (?:app|platform|courses?|software|plans?|membership|tool)|sign up|start your|try (?:it )?free|pricing|podcast hosting|web hosting)\b/i;

/** 3b. OUR OWN PROSE, written from an evidence dump at research time, when it
 *      opens by asserting what the creator IS. "A literary fiction writer and
 *      MFA student…", "A subscription piano school's channel…". Deliberately
 *      narrow: only the opening noun phrase counts, because that is the one
 *      place the sentence is making an identity claim rather than describing
 *      output. "Long, unhurried Python tutorials…" says nothing about who is
 *      speaking, and is left to fall through to a flag. */
const PERSON_NOUN = /^(?:An?|The)\s+(?:[a-z-]+\s+){0,4}(writer|academic|champion|coach|cyclist|dietitian|physician|dermatologist|therapist|teacher|pianist|guitarist|engineer|physiotherapist|psychologist|psychiatrist|gastroenterologist|ergonomist|obstetrician|paramedic|lawyer|journalist|professor|monk|student|athlete|developer|designer|photographer|musician|author|instructor|trainer|pharmacist|nutritionist|surgeon|nurse|editor|academic|lecturer|scientist|clinician|founder|host|essayist|critic|analyst|consultant)\b/i;
const ORG_NOUN = /^(?:An?|The)\s+(?:[a-z-]+\s+){0,4}(organisation|organization|company|school|agency|studio|consultancy|publisher|non-?profit|institute|association|network|platform|publication|magazine|firm|charity|university|college|clinic|hospital)\b/i;

function classify(rec, desc) {
  // VENDOR IS ABOUT THE ENTITY, NOT THE CREATOR'S BUSINESS MODEL. The first
  // version accepted the `sells-course` signal as evidence and classified E3
  // Rehab — practising physical therapists publishing free protocols who also
  // sell programmes — as a vendor alongside Pianote. Plenty of individuals and
  // small practices sell courses; that does not make the channel a sales
  // vehicle for a product. Only the channel's own description counts, and it
  // has to be selling something to the viewer.
  const sells = SELLS_TO_VIEWER.test(desc);
  const org = () => (sells ? 'vendor' : 'institution');
  if (SELF_NAMED.test(desc)) return ['individual', 'names themselves in the channel description', true];
  if (NAME_HAS_PERSON.test(rec.name)) return ['individual', `our own record names the person: ${rec.name}`, true];
  // OUR OWN IDENTITY SENTENCE OUTRANKS THE CHANNEL DESCRIPTION. ORG_SELF was
  // above this and classified Cal Newport, Conor Neill and a college professor
  // as institutions, because a person describing their affiliation writes "is a
  // professor of computer science at Georgetown University" and the pattern saw
  // "is a … university". A person's employer is not their entity.
  const ours = String(rec.shortDescription ?? '');
  // PERSON BEFORE ORG. "A college professor and research scientist teaching…"
  // matched ORG_NOUN on the word `college` and made a professor into an
  // institution. A person noun in the opening phrase is the stronger claim; an
  // organisation's opening reads "A subscription piano school's channel" or
  // "A non-profit's archive", which PERSON_NOUN cannot match.
  if (PERSON_NOUN.test(ours)) return ['individual', `our own opening sentence calls them a person: "${ours.slice(0, 60)}…"`, true];
  if (ORG_NOUN.test(ours)) return [org(), `our own opening sentence calls it an organisation: "${ours.slice(0, 60)}…"`, true];
  if (ORG_SELF.test(desc)) return [org(), `describes itself in the third person as an organisation${sells ? ', and sells its own product to the viewer' : ''}`, true];
  if (FIRST_PERSON.test(desc) && !CORPORATE.test(desc)) return ['individual', 'first-person singular throughout, no corporate voice', true];
  // NOT CONFIDENT, DELIBERATELY. This rule classified Cal Newport as an
  // institution: a professor whose channel description happens to say "our"
  // and never "I". Plenty of individuals write that way, and a wrong entity
  // value corrupts the allocator this axis exists to protect — which is worse
  // than a gap. So corporate voice ALONE only proposes; it is reported with
  // its reasoning and left for judgement.
  if (CORPORATE.test(desc) && !FIRST_PERSON.test(desc)) {
    return [null, `corporate voice and no first-person singular — would suggest ${org()}, but that alone is not enough to assign`, false];
  }
  if (FIRST_PERSON.test(desc) && CORPORATE.test(desc)) return [null, 'both voices, and no self-naming to break the tie', false];
  return [null, desc.trim() ? 'description carries no voice evidence either way' : 'channel description is empty', false];
}

const files = readdirSync(DIR).filter((f) => /^batch-\d{2}\.json$/.test(f)).sort();
const rows = [];

for (const f of files) {
  const list = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  for (const rec of list) {
    let ch;
    try { ch = await getChannelByHandle(rec.handle); } catch { ch = null; }
    const desc = ch?.description ?? '';
    const [entity, why, confident] = classify(rec, desc);

    rows.push({ file: f, id: rec.id, name: rec.name, entity, why, confident, role: rec.role, desc: desc.slice(0, 110).replace(/\s+/g, ' ') });
    // CLEAR FIRST, ALWAYS. The first version only ever SET entity, so when the
    // vendor rule was tightened the records classified by the old rule kept
    // their old value — a stored fact that stopped being queried, introduced
    // by me, in the script written to fix that exact class. A re-derivation is
    // authoritative: what it cannot establish this time becomes unset again.
    if (WRITE) {
      delete rec.entity;
      if (confident) rec.entity = entity;
    }
  }
  if (WRITE) writeFileSync(join(DIR, f), JSON.stringify(list, null, 2) + '\n');
}

const tally = {};
for (const r of rows) tally[r.entity ?? 'FLAGGED'] = (tally[r.entity ?? 'FLAGGED'] ?? 0) + 1;
console.log('\nderived from the channel descriptions:', tally);

const flagged = rows.filter((r) => !r.confident);
console.log(`\n${flagged.length} FLAGGED for judgement — deliberately left unset:\n`);
for (const r of flagged) console.log(`  ${r.name}\n    ${r.why}\n    "${r.desc}"`);
console.log('\nquota', JSON.stringify(quotaUsed()));
