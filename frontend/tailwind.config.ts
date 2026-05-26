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
        // Light mode B2B palette
        'bg-primary': '#f4f6f9',
        'bg-secondary': '#ffffff',
        'sidebar-navy': '#1e3a8a',
        'sidebar-navy-hover': '#1e40af',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'border-light': '#e5e7eb',
        'accent-blue': '#00a3e0',
        'accent-blue-hover': '#0088bb',
        'status-success': '#dcfce7',
        'status-success-text': '#166534',
        'status-warning': '#fef3c7',
        'status-warning-text': '#92400e',
        'status-error': '#fee2e2',
        'status-error-text': '#991b1b',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
      boxShadow: {
        'card-shadow': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-shadow-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
        slide: 'slide 0.3s ease-out',
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
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
