/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0F1A',
          deep: '#06080F',
          soft: '#1A1F2E',
          card: '#14182A',
        },
        paper: {
          DEFAULT: '#F5F2EB',
          warm: '#ECE7DB',
          cool: '#FAFAF7',
        },
        accent: {
          DEFAULT: '#FF4D2E',
          deep: '#D63B1F',
          soft: '#FFE8E1',
        },
        electric: {
          DEFAULT: '#4F46E5',
          soft: '#E7E5FB',
        },
        mist: {
          DEFAULT: '#C9C4B8',
          dark: '#7A7468',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '1.05' }],
        '5xl': ['3.25rem', { lineHeight: '1.05' }],
        '6xl': ['4rem', { lineHeight: '1' }],
        '7xl': ['5rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        mono: '0.04em',
        wide2: '0.1em',
      },
      borderRadius: {
        sharp: '0px',
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        stamp: '0 0 0 1px #0B0F1A inset',
        soft: '0 1px 0 0 rgba(11,15,26,0.04), 0 8px 24px -8px rgba(11,15,26,0.12)',
        pop: '0 12px 40px -10px rgba(255,77,46,0.4)',
      },
    },
  },
  plugins: [],
};
