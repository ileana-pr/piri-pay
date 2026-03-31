import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import type { ThemePreference } from '../lib/theme';

const options: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
  { value: 'system', label: 'Match system theme', Icon: Monitor },
];

type Props = {
  className?: string;
};

export default function ThemeToggle({ className = '' }: Props) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      className={`inline-flex rounded-xl border-2 border-piri-border bg-piri-elevated p-0.5 shadow-sm ${className}`}
      role="group"
      aria-label="Color theme"
    >
      {options.map(({ value, label, Icon }) => {
        const on = preference === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={on}
            title={label}
            onClick={() => setPreference(value)}
            className={
              on
                ? 'rounded-lg bg-piri-cashapp p-2 text-white'
                : 'rounded-lg p-2 piri-muted hover:text-piri transition-colors'
            }
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
