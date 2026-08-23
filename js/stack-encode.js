// Encode a stack (a list of category ids) into a URL-safe base64 string so a
// stack is shareable as a plain link, with no server and no stored state.

/** Encode ["a","b"] -> URL-safe base64 of "a,b". */
export function encodeStack(ids) {
  if (!ids?.length) return '';
  const bytes = new TextEncoder().encode(ids.join(','));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode back to an array of ids. Returns [] on anything malformed. */
export function decodeStack(encoded) {
  if (!encoded) return [];
  try {
    let b64 = String(encoded).replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder()
      .decode(bytes)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
