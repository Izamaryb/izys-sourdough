import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--color-background)',
        'background-soft': 'var(--color-background-soft)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surfaceBorder: 'var(--color-border)',
        button: 'var(--color-button)',
        'button-hover': 'var(--color-button-hover)',
        'button-text': 'var(--color-button-text)',
      },
      fontFamily: {
        heading: ['var(--font-lora)', 'serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.15', fontWeight: '700' }],
        h2: ['26px', { lineHeight: '1.2', fontWeight: '700' }],
        h3: ['20px', { lineHeight: '1.3', fontWeight: '700' }],
        body: ['18px', { lineHeight: '1.6' }],
        small: ['16px', { lineHeight: '1.5' }],
        cta: ['16px', { lineHeight: '1.25', fontWeight: '500' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '8px',
        md: '8px',
        lg: '8px',
        xl: '8px',
      },
      boxShadow: {
        card: '0 10px 30px rgb(74 59 47 / 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
