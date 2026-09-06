/**
 * THE UNREAD-DATA SWEEP.
 *
 * The Sadler case: a channel's own description said "new channel", we fetched
 * that description on every audit run for fifty-nine batches, and nothing ever
 * read it. That is not a stale fact and not an unproduced number — it is data
 * we already hold and have never looked at.
 *
 * This script sweeps the class. It asks the API for everything the free parts
 * return, including the parts the library never requests, and reports for each
 * field: how often it is present, what reader-relevant claim it could support
 * or contradict, and whether anything in this repo currently reads it.
 *
 * `--fetch` does the API work and writes a raw dump. Without it the script
 * recomputes findings from the dump on disk, so the analysis can be reworked
 * without spending quota.
 *
 * Cost: one unit per creator for channels.list, plus one per fifty videos.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, getUploads, redact, subsToBucket, durationToMinutes } from './lib/youtube.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DUMP = join(ROOT, '.cache', 'unread-fields-dump.json');
const OUT = join(ROOT, 'data', 'unread-data-audit.json');

const argv = process.argv.slice(2);
const FETCH = argv.includes('--fetch');
const WINDOWS = argv.includes('--windows');
const LIMIT = Number(argv.find((a) => /^--limit=/.test(a))?.split('=')[1] ?? Infinity);

const creators = JSON.parse(readFileSync(join(ROOT, 'data', 'creators.json'), 'utf8'));

// ---------------------------------------------------------------- fetch

async function fetchAll() {
  const rows = [];
  let n = 0;
  for (const c of creators) {
    if (n >= LIMIT) break;
    n += 1;
    const clean = String(c.handle).replace(/^@/, '');
    let data;
    try {
      data = await api('channels', {
        part: 'snippet,statistics,contentDetails,topicDetails,status,brandingSettings',
        forHandle: `@${clean}`,
      });
    } catch (err) {
      // An error is an error. It is not a domain value: mapping a network
      // failure to "channel missing" is how this project once reported a live
      // 168-upload channel as gone.
      if (/QUOTA EXCEEDED/.test(String(err.message))) {
        console.error('QUOTA EXCEEDED — stopping with a partial dump.');
        break;
      }
      rows.push({ id: c.id, handle: c.handle, error: redact(err.message).slice(0, 160) });
      continue;
    }
    const item = data.items?.[0] ?? null;
    rows.push({ id: c.id, handle: c.handle, item });
    if (n % 25 === 0) console.error(`  ${n}/${creators.length}`);
  }

  // Every video we point a reader at, plus every trailer the creators chose
  // for themselves.
  const ours = new Set();
  for (const c of creators) for (const m of c.categories) if (m.entryVideo?.videoId) ours.add(m.entryVideo.videoId);
  const trailers = new Set();
  for (const r of rows) {
    const t = r.item?.brandingSettings?.channel?.unsubscribedTrailer;
    if (t) trailers.add(t);
  }

  const ids = [...new Set([...ours, ...trailers])];
  const videos = {};
  for (let i = 0; i < ids.length; i += 50) {
    const data = await api('videos', {
      part: 'snippet,contentDetails,status,statistics,topicDetails',
      id: ids.slice(i, i + 50).join(','),
    });
    for (const item of data.items ?? []) videos[item.id] = item;
  }

  // Where does the creator's own trailer sit in their upload history? Our
  // entry-video picker only ever sees the 50 most recent uploads, so a
  // trailer older than that window is a video we could not have chosen. One
  // unit per channel.
  const windows = [];
  if (WINDOWS) {
    for (const r of rows) {
      const trailer = r.item?.brandingSettings?.channel?.unsubscribedTrailer;
      const playlist = r.item?.contentDetails?.relatedPlaylists?.uploads;
      const published = videos[trailer]?.snippet?.publishedAt;
      if (!trailer || !playlist || !published) continue;
      const ups = await getUploads(playlist, { max: 50 });
      if (!ups.length) continue;
      const oldest = ups.map((u) => u.publishedAt).sort()[0];
      windows.push({
        id: r.id,
        trailer,
        trailerPublished: published.slice(0, 10),
        windowOldest: String(oldest).slice(0, 10),
        inWindow: ups.some((u) => u.videoId === trailer),
        olderThanWindow: new Date(published) < new Date(oldest),
      });
    }
  }

  mkdirSync(dirname(DUMP), { recursive: true });
  writeFileSync(DUMP, JSON.stringify({ at: new Date().toISOString(), rows, videos, windows, ours: [...ours], trailers: [...trailers] }, null, 2));
  console.error(`dump: ${rows.length} channels, ${Object.keys(videos).length} videos`);
}

// ---------------------------------------------------------------- analysis

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

function analyse() {
  if (!existsSync(DUMP)) throw new Error('no dump — run with --fetch first');
  const dump = JSON.parse(readFileSync(DUMP, 'utf8'));
  const rows = dump.rows.filter((r) => r.item);
  const byId = new Map(creators.map((c) => [c.id, c]));

  const report = { at: dump.at, channelsExamined: rows.length, findings: {}, fields: [] };

  // --- customUrl vs the handle we store and link to
  const handleMismatch = [];
  for (const r of rows) {
    const custom = r.item.snippet?.customUrl ?? null;
    if (!custom) continue;
    if (custom.toLowerCase() !== String(r.handle).toLowerCase()) {
      handleMismatch.push({ id: r.id, weLink: r.handle, theirCanonical: custom });
    }
  }

  // --- publishedAt: channel age
  const ages = [];
  for (const r of rows) {
    const p = r.item.snippet?.publishedAt;
    if (!p) continue;
    ages.push({ id: r.id, publishedAt: p, years: +(((Date.now() - new Date(p)) / 31_557_600_000)).toFixed(1) });
  }
  ages.sort((a, b) => b.years - a.years);
  const young = ages.filter((a) => a.years < 3);

  // A channel younger than the body of work our own prose describes is the
  // shape of the Sadler miss: the record is accurate about the person and
  // points at the wrong channel of theirs. Cheap detector — our prose cites a
  // year, and the channel did not exist in it.
  const predatesChannel = [];
  for (const r of rows) {
    const c = byId.get(r.id);
    if (!c || !r.item.snippet?.publishedAt) continue;
    const createdYear = new Date(r.item.snippet.publishedAt).getFullYear();
    const prose = [c.shortDescription, c.longDescription, c.notFor, c.caveats,
      ...c.categories.map((m) => `${m.why} ${m.evidence}`)].join(' ');
    const cited = [...new Set([...prose.matchAll(/\b(19[5-9]\d|20[0-2]\d)\b/g)]
      .map((m) => Number(m[1])).filter((y) => y < createdYear))].sort();
    if (cited.length) {
      predatesChannel.push({ id: r.id, channelCreated: createdYear, citedInOurProse: cited, gapYears: createdYear - cited[0] });
    }
  }
  predatesChannel.sort((a, b) => b.gapYears - a.gapYears);

  // --- viewCount: reach per video, against the size bucket we print
  const reach = [];
  for (const r of rows) {
    const views = Number(r.item.statistics?.viewCount ?? 0);
    const vids = Number(r.item.statistics?.videoCount ?? 0);
    if (!views || !vids) continue;
    reach.push({ id: r.id, bucket: byId.get(r.id)?.sizeBucket ?? null, avgViews: Math.round(views / vids), videos: vids });
  }
  // A big subscriber bucket with small per-video reach: the bucket is the only
  // scale figure a reader sees, and it can overstate how many people actually
  // watch.
  const BIG = new Set(['500k-1M', '1M-5M', '5M-20M', '>20M']);
  const overstated = reach.filter((r) => BIG.has(r.bucket) && r.avgViews < 50_000).sort((a, b) => a.avgViews - b.avgViews);

  // --- subscriber bucket drift since the record was written
  const bucketDrift = [];
  for (const r of rows) {
    const now = subsToBucket(r.item.statistics?.subscriberCount);
    const stored = byId.get(r.id)?.sizeBucket ?? null;
    if (now && stored && now !== stored) bucketDrift.push({ id: r.id, stored, now });
  }

  // --- topicCategories: YouTube's own classification of the channel
  const topics = new Map();
  let withTopics = 0;
  for (const r of rows) {
    const t = r.item.topicDetails?.topicCategories ?? [];
    if (t.length) withTopics += 1;
    for (const url of t) {
      const name = decodeURIComponent(url.split('/').pop() ?? '').replace(/_/g, ' ');
      topics.set(name, (topics.get(name) ?? 0) + 1);
    }
  }

  // --- keywords the creator set for themselves
  let withKeywords = 0;
  for (const r of rows) if (r.item.brandingSettings?.channel?.keywords) withKeywords += 1;

  // --- madeForKids
  const kids = rows.filter((r) => r.item.status?.madeForKids).map((r) => r.id);

  // --- country: the API's, against ours
  const countryGap = [];
  for (const r of rows) {
    const theirs = r.item.snippet?.country ?? null;
    const ours = byId.get(r.id)?.country ?? null;
    if (theirs && ours && theirs !== ours) countryGap.push({ id: r.id, stored: ours, api: theirs });
    if (theirs && !ours) countryGap.push({ id: r.id, stored: null, api: theirs });
  }

  // --- the trailer the creator chose, against the entry video we chose
  const trailerRows = [];
  for (const r of rows) {
    const t = r.item.brandingSettings?.channel?.unsubscribedTrailer;
    if (!t) continue;
    const c = byId.get(r.id);
    const oursIds = (c?.categories ?? []).map((m) => m.entryVideo?.videoId).filter(Boolean);
    const v = dump.videos[t];
    trailerRows.push({
      id: r.id,
      trailer: t,
      trailerTitle: v?.snippet?.title ?? null,
      trailerMin: durationToMinutes(v?.contentDetails?.duration),
      trailerExists: Boolean(v),
      agrees: oursIds.includes(t),
      ourEntries: oursIds.length,
    });
  }

  const bands = { under3: 0, '3to9': 0, '10to29': 0, '30plus': 0, unknown: 0 };
  for (const t of trailerRows) {
    const m = t.trailerMin;
    if (m == null) bands.unknown += 1;
    else if (m < 3) bands.under3 += 1;
    else if (m < 10) bands['3to9'] += 1;
    else if (m < 30) bands['10to29'] += 1;
    else bands['30plus'] += 1;
  }
  const windows = dump.windows ?? [];

  // --- captions on the videos we send readers to
  const ourVideos = dump.ours.map((id) => dump.videos[id]).filter(Boolean);
  const noCaptions = ourVideos.filter((v) => v.contentDetails?.caption === 'false');
  const langs = new Map();
  for (const v of ourVideos) {
    const l = v.snippet?.defaultAudioLanguage ?? v.snippet?.defaultLanguage ?? '(unset)';
    langs.set(l, (langs.get(l) ?? 0) + 1);
  }
  const nonEnglishDeclared = ourVideos
    .map((v) => ({ id: v.id, lang: v.snippet?.defaultAudioLanguage ?? v.snippet?.defaultLanguage ?? null, title: v.snippet?.title }))
    .filter((v) => v.lang && !/^en/i.test(v.lang));

  const licences = new Map();
  for (const v of ourVideos) licences.set(v.status?.license ?? '(none)', (licences.get(v.status?.license ?? '(none)') ?? 0) + 1);

  report.findings = {
    handleMismatch: { count: handleMismatch.length, cases: handleMismatch },
    channelAge: {
      measured: ages.length,
      youngerThanThreeYears: young.length,
      youngest: ages.slice(-8).reverse(),
      oldest: ages.slice(0, 5),
    },
    proseOlderThanChannel: {
      count: predatesChannel.length,
      note: 'A flag, not a defect: prose that cites a practice or organisation older than the channel is usually correct. Each one has to be looked at.',
      cases: predatesChannel,
    },
    reachVsBucket: {
      measured: reach.length,
      bigBucketUnder50kAvgViews: overstated.length,
      cases: overstated.slice(0, 15),
    },
    sizeBucketDrift: { count: bucketDrift.length, cases: bucketDrift },
    topicCategories: {
      channelsWithAny: withTopics,
      pct: pct(withTopics, rows.length),
      distinctTopics: topics.size,
      top: [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, v]) => `${k} (${v})`),
    },
    selfSetKeywords: { channels: withKeywords, pct: pct(withKeywords, rows.length) },
    madeForKids: { count: kids.length, cases: kids },
    countryDisagreement: { count: countryGap.length, cases: countryGap },
    creatorChosenTrailer: {
      channelsWithTrailer: trailerRows.length,
      durationBands: bands,
      shorterThanOurThreeMinuteFloor: trailerRows.filter((t) => t.trailerMin != null && t.trailerMin < 3).length,
      windowMeasured: windows.length,
      insideOurFiftyUploadWindow: windows.filter((w) => w.inWindow).length,
      olderThanOurFiftyUploadWindow: windows.filter((w) => w.olderThanWindow).length,
      pct: pct(trailerRows.length, rows.length),
      agreesWithOurEntryVideo: trailerRows.filter((t) => t.agrees).length,
      trailerVideoUnavailable: trailerRows.filter((t) => !t.trailerExists).length,
      cases: trailerRows.slice(0, 40),
    },
    captions: {
      entryVideosMeasured: ourVideos.length,
      withoutCaptions: noCaptions.length,
      withoutCaptionsPct: pct(noCaptions.length, ourVideos.length),
      cases: noCaptions.slice(0, 20).map((v) => v.id),
    },
    declaredLanguage: {
      distribution: [...langs.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`),
      declaredNonEnglish: nonEnglishDeclared,
    },
    licence: { distribution: [...licences.entries()].map(([k, v]) => `${k}: ${v}`) },
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.findings, (k, v) => (Array.isArray(v) && v.length > 8 ? v.slice(0, 8).concat([`… ${v.length - 8} more`]) : v), 1));
}

if (FETCH) await fetchAll();
analyse();
