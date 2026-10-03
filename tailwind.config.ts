import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefaf5',
          100: '#d3f3e5',
          500: '#1a9a70',
          600: '#0b6e4f',
          700: '#095a41',
          900: '#05352a',
        },
        gold: { 400: '#f2b134', 500: '#e09b12' },
      },
    },
  },
  plugins: [],
};
export default config;
