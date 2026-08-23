// Light/dark theme. Defaults to the system setting; an explicit choice is
// remembered in localStorage and stamped on <html> as data-theme.

const KEY = 'growthlist:theme';

function stored() {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null; // private mode, blocked storage — fall back to system.
  }
}

function systemTheme() {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function currentTheme() {
  return document.documentElement.dataset.theme || systemTheme();
}

export function applyTheme(theme) {
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
}

export function initTheme() {
  applyTheme(stored());

  const button = document.getElementById('theme-toggle');
  if (!button) return;

  const sync = () => {
    const theme = currentTheme();
    const next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${next} theme`);
    button.title = `Switch to ${next} theme`;
  };

  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Not persisting is acceptable; the choice still applies for this page.
    }
    sync();
  });

  // Follow the system while the visitor has not made an explicit choice.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!stored()) sync();
  });

  sync();
}
