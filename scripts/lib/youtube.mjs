/**
 * YouTube Data API v3 client for Phase 2 research. Zero dependencies.
 *
 * SECRETS: the key comes from process.env.YOUTUBE_API_KEY (a configured
 * environment variable, not a file) and is never printed. Every
 * function that logs or throws routes its text through redact() first, because
 * API keys travel in the query string — an unredacted URL in an error message
 * is a leaked credential.
 *
 * The shipped site never imports this. It exists only to build verified data.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const API = 'https://www.googleapis.com/youtube/v3';

// ---------------------------------------------------------------- key

let KEY = null;

/** Read YOUTUBE_API_KEY from the environment, falling back to .env. */
export function loadKey() {
  if (KEY) return KEY;

  if (process.env.YOUTUBE_API_KEY?.trim()) {
    KEY = process.env.YOUTUBE_API_KEY.trim();
    return KEY;
  }

  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const match = line.match(/^\s*YOUTUBE_API_KEY\s*=\s*(.+?)\s*$/);
      if (match) {
        KEY = match[1].replace(/^["']|["']$/g, '').trim();
        if (KEY) return KEY;
      }
    }
  }

  throw new Error(
    'YOUTUBE_API_KEY is not set.\n' +
    'It is expected as a CONFIGURED ENVIRONMENT VARIABLE on the Claude Code ' +
    'environment, not as a .env file — see CLAUDE.md, "The YouTube API key".\n' +
    'Note that environment-variable changes require a fresh session; a key ' +
    'set mid-session will not appear in an already-running process.\n' +
    'Do NOT proceed with unverified research and do NOT ask for the key in ' +
    'chat — a key in a transcript must be rotated.'
  );
}

/** Strip the key from any string before it is printed or thrown. */
export function redact(text) {
  let out = String(text);
  if (KEY) out = out.split(KEY).join('[REDACTED_API_KEY]');
  // Belt and braces: catch any key-shaped token even if it isn't ours.
  return out.replace(/AIza[0-9A-Za-z_\-]{35}/g, '[REDACTED_API_KEY]');
}

// ---------------------------------------------------------------- transport

let calls = 0;
let units = 0;

export const quotaUsed = () => ({ calls, units });

const COST = { channels: 1, playlistItems: 1, videos: 1, search: 100 };

/**
 * One API call. Throws a redacted error on failure; never logs the URL.
 */
export async function api(endpoint, params, { retries = 2 } = {}) {
  const key = loadKey();
  const query = new URLSearchParams({ ...params, key });
  const url = `${API}/${endpoint}?${query}`;

  calls += 1;
  units += COST[endpoint] ?? 1;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { accept: 'application/json' } });
    } catch (err) {
      if (attempt === retries) throw new Error(redact(`network error on ${endpoint}: ${err.message}`));
      await sleep(500 * 2 ** attempt);
      continue;
    }

    if (res.status === 403) {
      const body = await res.text();
      // Quota exhaustion is terminal for the day — say so plainly rather than
      // retrying into the wall.
      if (/quota/i.test(body)) {
        throw new Error(redact(`QUOTA EXCEEDED on ${endpoint}. Stop and resume tomorrow.`));
      }
      throw new Error(redact(`403 on ${endpoint}: ${body.slice(0, 200)}`));
    }
    if (res.status === 429 || res.status >= 500) {
      if (attempt === retries) throw new Error(redact(`${res.status} on ${endpoint} after ${retries + 1} attempts`));
      await sleep(800 * 2 ** attempt);
      continue;
    }
    if (!res.ok) {
      throw new Error(redact(`${res.status} on ${endpoint}: ${(await res.text()).slice(0, 200)}`));
    }

    return res.json();
  }
  throw new Error(`unreachable`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- mapping

/**
 * Subscriber count → the bucket the schema stores. Never an exact figure.
 *
 * Returns null for a missing count rather than a bucket. Number(null) is 0,
 * so a naive conversion would label a channel with hidden subscriber counts
 * as "<100k" — inventing a fact about a real person. A null forces the caller
 * to record an honest gap instead.
 */
export function subsToBucket(count) {
  if (count == null || count === '') return null;
  const n = Number(count);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n < 100_000) return '<100k';
  if (n < 500_000) return '100k-500k';
  if (n < 1_000_000) return '500k-1M';
  if (n < 5_000_000) return '1M-5M';
  if (n < 20_000_000) return '5M-20M';
  return '>20M';
}

/** ISO-8601 duration (PT18M42S) → whole minutes, rounded to nearest. */
export function durationToMinutes(iso) {
  const m = String(iso ?? '').match(/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const [, d = 0, h = 0, min = 0, s = 0] = m.map((v) => (v == null ? 0 : Number(v)));
  const total = d * 1440 + h * 60 + min + s / 60;
  return total > 0 ? Math.max(1, Math.round(total)) : null;
}

/** No uploads in ~2 years → the schema's "archive" status. */
export function statusFromLatestUpload(isoDate) {
  if (!isoDate) return null;
  const ageDays = (Date.now() - new Date(isoDate).getTime()) / 86_400_000;
  return ageDays > 730 ? 'archive' : 'active';
}

// ---------------------------------------------------------------- channel

/**
 * Resolve a handle to a channel. Returns null if the handle does not exist —
 * which is itself a useful result: it means the creator was misremembered and
 * must be dropped, not guessed at.
 */
export async function getChannelByHandle(handle) {
  const clean = String(handle).replace(/^@/, '');
  const data = await api('channels', {
    part: 'snippet,statistics,contentDetails',
    forHandle: `@${clean}`,
  });

  const item = data.items?.[0];
  if (!item) return null;

  return {
    channelId: item.id,
    title: item.snippet?.title ?? null,
    handle: `@${clean}`,
    channelUrl: `https://www.youtube.com/@${clean}`,
    country: item.snippet?.country ?? null,
    publishedAt: item.snippet?.publishedAt ?? null,
    description: item.snippet?.description ?? '',
    subscriberCount: item.statistics?.subscriberCount ?? null,
    hiddenSubscriberCount: Boolean(item.statistics?.hiddenSubscriberCount),
    sizeBucket: subsToBucket(item.statistics?.subscriberCount),
    videoCount: Number(item.statistics?.videoCount ?? 0),
    uploadsPlaylist: item.contentDetails?.relatedPlaylists?.uploads ?? null,
  };
}

/** Recent uploads, newest first. 1 quota unit per 50. */
export async function getUploads(playlistId, { max = 50 } = {}) {
  if (!playlistId) return [];
  const out = [];
  let pageToken;

  while (out.length < max) {
    const data = await api('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: String(Math.min(50, max - out.length)),
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of data.items ?? []) {
      out.push({
        videoId: item.contentDetails?.videoId,
        title: item.snippet?.title,
        publishedAt: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt,
        channelId: item.snippet?.channelId ?? null,
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out.filter((v) => v.videoId);
}

/** Full detail for up to 50 video ids in one call. */
export async function getVideos(ids) {
  const list = [...new Set(ids.filter(Boolean))];
  if (!list.length) return new Map();

  const out = new Map();
  for (let i = 0; i < list.length; i += 50) {
    const data = await api('videos', {
      part: 'snippet,contentDetails,status',
      id: list.slice(i, i + 50).join(','),
    });
    for (const item of data.items ?? []) {
      out.set(item.id, {
        videoId: item.id,
        title: item.snippet?.title ?? null,
        channelId: item.snippet?.channelId ?? null,
        channelTitle: item.snippet?.channelTitle ?? null,
        publishedAt: item.snippet?.publishedAt ?? null,
        defaultAudioLanguage: item.snippet?.defaultAudioLanguage ?? item.snippet?.defaultLanguage ?? null,
        durationMin: durationToMinutes(item.contentDetails?.duration),
        embeddable: item.status?.embeddable !== false,
        privacyStatus: item.status?.privacyStatus ?? null,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------- the gate

/**
 * THE ATTRIBUTION GATE — the rule this whole phase turns on.
 *
 * A video may only be used as a creator's entryVideo if the API says it
 * belongs to that creator's channel. `snippet.channelId` is authoritative;
 * a matching channel *title* is not, because titles are neither unique nor
 * stable. Anything that fails returns null and the caller must pick another
 * video from the channel's own uploads. A video that cannot be attributed is
 * never kept, never guessed at, and never "probably fine".
 *
 * Also rejects: videos the API doesn't return at all (deleted or private),
 * non-public videos, and videos with embedding disabled — the last because a
 * click-to-load embed that cannot play is a broken promise to the visitor.
 */
export function attributeVideo(video, expectedChannelId, { requireEmbeddable = true } = {}) {
  if (!video) return { ok: false, reason: 'video not returned by API (deleted, private, or bad id)' };
  if (!expectedChannelId) return { ok: false, reason: 'no expected channelId supplied' };

  if (video.channelId !== expectedChannelId) {
    return {
      ok: false,
      reason: `channelId mismatch: video belongs to ${video.channelId ?? 'unknown'} ` +
              `(${video.channelTitle ?? '?'}), expected ${expectedChannelId}`,
    };
  }
  if (video.privacyStatus && video.privacyStatus !== 'public') {
    return { ok: false, reason: `not public (${video.privacyStatus})` };
  }
  if (requireEmbeddable && !video.embeddable) {
    return { ok: false, reason: 'embedding disabled' };
  }
  return { ok: true, video };
}

/**
 * Pick an entry video from the channel's OWN uploads, verified through the
 * gate. `prefer` scores candidates by title; the highest-scoring one that
 * passes attribution wins. Returns null when nothing qualifies — an honest
 * gap, which is the correct outcome rather than a fabricated id.
 */
export async function pickEntryVideo(channel, { prefer = [], poolSize = 50, minMinutes = 3 } = {}) {
  const uploads = await getUploads(channel.uploadsPlaylist, { max: poolSize });
  if (!uploads.length) return null;

  const detail = await getVideos(uploads.map((u) => u.videoId));

  const score = (title = '') => {
    const lower = title.toLowerCase();
    let n = 0;
    for (const term of prefer) if (lower.includes(String(term).toLowerCase())) n += 2;
    return n;
  };

  const ranked = uploads
    .map((u) => ({ upload: u, video: detail.get(u.videoId) }))
    .filter(({ video }) => video)
    .map((entry) => ({ ...entry, score: score(entry.video.title) }))
    .sort((a, b) => b.score - a.score || new Date(b.video.publishedAt) - new Date(a.video.publishedAt));

  const rejected = [];
  for (const { video } of ranked) {
    // Skip Shorts and clips: a 40-second video is not an entry point.
    if (minMinutes && video.durationMin != null && video.durationMin < minMinutes) continue;

    const gate = attributeVideo(video, channel.channelId);
    if (gate.ok) return { video, rejected };
    rejected.push({ videoId: video.videoId, reason: gate.reason });
  }
  return null;
}
