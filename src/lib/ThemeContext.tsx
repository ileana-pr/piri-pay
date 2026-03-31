import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  PIRI_THEME_STORAGE_KEY,
  readStoredPreference,
  resolveEffectiveDark,
  type ThemePreference,
} from './theme';

export type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  effectiveDark: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window !== 'undefined' ? readStoredPreference() : 'system',
  );
  const [effectiveDark, setEffectiveDark] = useState(() =>
    typeof window !== 'undefined' ? resolveEffectiveDark(readStoredPreference()) : false,
  );

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      localStorage.setItem(PIRI_THEME_STORAGE_KEY, p);
    } catch {
      /* */
    }
    const dark = resolveEffectiveDark(p);
    document.documentElement.classList.toggle('dark', dark);
    setEffectiveDark(dark);
  }, []);

  useEffect(() => {
    const apply = () => {
      const dark = resolveEffectiveDark(preference);
      document.documentElement.classList.toggle('dark', dark);
      setEffectiveDark(dark);
    };
    apply();
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [preference]);

  const value = useMemo(
    () => ({ preference, setPreference, effectiveDark }),
    [preference, setPreference, effectiveDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
