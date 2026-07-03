import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211b',
        leaf: '#2f7d4f',
        mint: '#e7f6ee',
        soil: '#7a5c3f',
        sun: '#f4b740',
        sky: '#d9edf7'
      },
      boxShadow: {
        soft: '0 16px 40px rgba(23, 33, 27, 0.10)'
      }
    }
  },
  plugins: []
};

export default config;
