import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--foreground)',
        leaf: '#2f7d4f',
        mint: 'var(--brand-primary-subtle)',
        soil: '#7a5c3f',
        sun: '#f4b740',
        sky: '#d9edf7',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          subtle: 'var(--primary-subtle)'
        },
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          elevated: 'var(--surface-elevated)'
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)'
        },
        ecosystem: {
          htxonline: 'var(--ecosystem-htxonline)',
          agripassport: 'var(--ecosystem-agripassport)',
          passport: 'var(--ecosystem-passport)'
        }
      },
      borderRadius: {
        control: 'var(--public-radius-control)',
        card: 'var(--public-radius-card)',
        surface: 'var(--public-radius-surface)'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--public-shadow-card)',
        'card-hover': 'var(--public-shadow-hover)'
      }
    }
  },
  plugins: []
};

export default config;
