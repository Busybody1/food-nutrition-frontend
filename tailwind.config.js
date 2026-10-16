
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

          strong: '#067A88',
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
        dash: {
          canvas: '#F4F6F9',
          card: '#FFFFFF',
          border: '#E7EAF0',
          'border-strong': '#D9DEE7',
          hover: '#F8F9FB',
          pill: '#EEF1F5',
          grid: '#EEF1F6',
          ink: '#101828',
          body: '#344054',
          muted: '#5B6475',
          dim: '#8A93A3',
          teal: '#0AC5D7',
          'teal-strong': '#067A88',
          'teal-soft': '#E7F9FB',
          indigo: '#4F46E5',
          'indigo-soft': '#EEF0FF',
          violet: '#7C6CF0',
          positive: '#067647',
          'positive-soft': '#ECFDF3',
          negative: '#C01048',
          'negative-soft': '#FFF1F3',
          warning: '#B54708',
          'warning-soft': '#FFFAEB',
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
        dash: '0 1px 2px rgba(16, 24, 40, 0.04)',
        'dash-pop': '0 16px 40px -12px rgba(16, 24, 40, 0.18), 0 2px 6px rgba(16, 24, 40, 0.05)',
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
