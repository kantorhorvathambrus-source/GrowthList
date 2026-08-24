// Geometric ornament set from the design system.
//
// Inline SVG, `stroke: currentColor`, 1px hairlines, so each one themes off
// the same custom properties as everything else. Used as band ornament and
// step markers — never inside a repeating card (DESIGN.md, "Ornament").

const wrap = (viewBox, body, { size = 120, className = 'orn' } = {}) =>
  `<svg class="${className}" viewBox="${viewBox}" width="${size}" height="${size}"
        fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false">${body}</svg>`;

export const rings = (opts) =>
  wrap('0 0 64 64', `
    <circle cx="32" cy="32" r="30"/>
    <circle cx="32" cy="32" r="21"/>
    <circle cx="32" cy="32" r="12"/>
    <circle cx="32" cy="32" r="4"/>`, opts);

export const orbit = (opts) =>
  wrap('0 0 64 64', `
    <circle cx="32" cy="32" r="26"/>
    <ellipse cx="32" cy="32" rx="10" ry="26"/>
    <ellipse cx="32" cy="32" rx="26" ry="10"/>
    <circle cx="32" cy="6" r="2.5" fill="currentColor" stroke="none"/>`, opts);

export const starburst = (opts) =>
  wrap('0 0 64 64', `
    <path d="M32 2v60M2 32h60M11 11l42 42M53 11L11 53"/>
    <circle cx="32" cy="32" r="6"/>`, opts);

export const crosshair = (opts) =>
  wrap('0 0 64 64', `
    <circle cx="32" cy="32" r="18"/>
    <path d="M32 0v20M32 44v20M0 32h20M44 32h20"/>
    <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none"/>`, opts);

export const halfFill = (opts) =>
  wrap('0 0 64 64', `
    <circle cx="32" cy="32" r="26"/>
    <path d="M32 6a26 26 0 0 1 0 52z" fill="currentColor" stroke="none"/>`, opts);

/** The play mark used inside the wine video affordance. */
export const play = (size = 13) =>
  `<svg viewBox="0 0 12 12" width="${size}" height="${size}" aria-hidden="true" focusable="false">
     <path d="M4 2.6 9.2 6 4 9.4Z" fill="currentColor"/>
   </svg>`;

/** Small inline marks used on signal badges. */
export const badgeMark = (kind) => {
  const paths = {
    check: '<circle cx="6" cy="6" r="4.6"/><path d="M3.6 6.2 5.2 7.8 8.4 4.4"/>',
    doc: '<rect x="2.4" y="1.8" width="7.2" height="8.4"/><path d="M4.2 4.4h3.6M4.2 6.4h3.6M4.2 8.4h2"/>',
    diamond: '<path d="M6 1.6 10.4 6 6 10.4 1.6 6Z"/>',
    person: '<circle cx="6" cy="4.2" r="2.1"/><path d="M2.2 10.4c0-2.1 1.7-3.4 3.8-3.4s3.8 1.3 3.8 3.4"/>',
    tag: '<path d="M1.8 6.2 6 1.8h4.2V6L6 10.2Z"/><circle cx="8.2" cy="3.8" r=".8"/>',
    alert: '<path d="M6 1.8 11 10.2H1Z"/><path d="M6 5v2.2"/><circle cx="6" cy="8.8" r=".5" fill="currentColor" stroke="none"/>',
  };
  return `<svg viewBox="0 0 12 12" width="11" height="11" fill="none"
               stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false">${paths[kind] ?? paths.diamond}</svg>`;
};

/** Which mark each signal in the fixed vocabulary uses. */
export const SIGNAL_MARKS = {
  credentialed: 'check',
  'cites-research': 'doc',
  practitioner: 'person',
  'sells-course': 'tag',
  'sponsor-heavy': 'tag',
  'contested-claims': 'alert',
  'strong-ideological-frame': 'alert',
};

export const ORNAMENTS = { rings, orbit, starburst, crosshair, halfFill };

/** Deterministic ornament per key, so a given band always gets the same mark. */
export function ornamentFor(key, opts) {
  const names = Object.keys(ORNAMENTS);
  let hash = 0;
  for (let i = 0; i < String(key).length; i++) hash = (hash * 31 + String(key).charCodeAt(i)) >>> 0;
  return ORNAMENTS[names[hash % names.length]](opts);
}
