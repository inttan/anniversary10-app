import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans:  ['var(--font-dm-sans)', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        heartFloat: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(0.6)' },
          '100%': { opacity: '0', transform: 'translateY(-140px) scale(1.3)' },
        },
      },
      animation: {
        fadeUp:     'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
        heartFloat: 'heartFloat 2s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config