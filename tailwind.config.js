/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        piri: {
          DEFAULT: 'var(--piri-text)',
          muted: 'var(--piri-text-muted)',
          bg: 'var(--piri-bg)',
          cream: 'var(--piri-cream)',
          elevated: 'var(--piri-elevated)',
          surface: 'var(--piri-surface)',
          'surface-dim': 'var(--piri-surface-dim)',
          border: 'var(--piri-border)',
          ink: '#2D0A00',
          fresa: '#FF6B9D',
          ethereum: '#FF6B9D',
          base: '#1D4ED8',
          venmo: '#0EA5E9',
          bitcoin: '#F59E0B',
          solana: '#9945FF',
          tezos: '#2B7DF7',
          cashapp: '#10B981',
          zelle: '#6D1ED4',
          paypal: '#003087',
        },
      },
      fontFamily: {
        'piri-display': ['Fredoka One', 'cursive'],
        'piri': ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
