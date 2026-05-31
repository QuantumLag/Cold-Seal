import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cold-bg': '#0A0A0F',
        'cold-panel': '#111118',
        'cold-border': 'rgba(255, 180, 50, 0.12)',
        'cold-amber': '#F5A623',
        'cold-amber-strong': '#FFB432',
        'cold-orange': '#FF6B35',
        'cold-green': '#00D68F',
        'cold-text': '#F0F0F0',
        'cold-muted': '#888899',
        'cold-glow': 'rgba(245, 166, 35, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
      boxShadow: {
        'card-shadow': '0 0 0 1px rgba(255,180,50,0.05), 0 8px 32px rgba(0,0,0,0.4)',
        'card-shadow-hover': '0 0 24px rgba(245,166,35,0.08), 0 12px 40px rgba(0,0,0,0.55)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
        slide: 'slide 0.3s ease-out',
        breathe: 'breathe 2s ease-in-out infinite',
        'breach-pulse': 'breach-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        slide: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'breach-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,53,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255,107,53,0)' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
