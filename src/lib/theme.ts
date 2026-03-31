/** persisted appearance: light, dark, or follow os */
export const PIRI_THEME_STORAGE_KEY = 'piri-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

export function readStoredPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(PIRI_THEME_STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* private mode etc. */
  }
  return 'system';
}

export function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
}

export function resolveEffectiveDark(preference: ThemePreference): boolean {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return systemPrefersDark();
}

export function applyThemeToDocument(preference: ThemePreference): boolean {
  const dark = resolveEffectiveDark(preference);
  document.documentElement.classList.toggle('dark', dark);
  return dark;
}
