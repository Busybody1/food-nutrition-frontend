/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0AC5D7',
          strong: '#0891A3',
          soft: '#8FE8F0',
          muted: '#E8FBFD',
          foreground: '#1E1E1E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        ink: {
          DEFAULT: '#1E1E1E',
          muted: '#52525B',
          dim: '#9CA3AF',
        },
        primary: {
          50: '#E8FBFD',
          100: '#D0F7FB',
          200: '#8FE8F0',
          300: '#5CDCE8',
          400: '#2DD4E0',
          500: '#0AC5D7',
          600: '#0891A3',
          700: '#067A88',
          800: '#055F6B',
          900: '#044550',
        },
        accent: {
          orange: '#FF8C42',
          green: '#22C55E',
          red: '#EF4444',
        },
        success: {
          500: '#22C55E',
          600: '#16A34A',
        },
        error: {
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        brand: '12px',
        card: '8px',
        pill: '9999px',
      },
      boxShadow: {
        glow: '0 0 32px rgba(10, 197, 215, 0.2)',
        'glow-lg': '0 0 48px rgba(10, 197, 215, 0.28)',
        glass: '0 4px 24px rgba(15, 23, 42, 0.06)',
        'glass-lg': '0 8px 32px rgba(15, 23, 42, 0.08)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        sidebar: '1px 0 0 rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        float: 'float 8s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite alternate',
        'ken-burns': 'kenBurns 24s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
