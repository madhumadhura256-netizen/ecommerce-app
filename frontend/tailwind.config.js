/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff4ed',
          100: '#ffe6d5',
          200: '#fec9aa',
          300: '#fda174',
          400: '#fb6d3c',
          500: '#f94a16',
          600: '#ea2e0c',
          700: '#c2200c',
          800: '#9a1b12',
          900: '#7c1a12',
        },
        surface: {
          light: '#FFFBF7',
          dark:  '#0F0F0F',
        }
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-in':   'slideIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'bounce-sm':  'bounceSm 0.6s ease infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:  { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        bounceSm: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      boxShadow: {
        'card':      '0 2px 20px rgba(0,0,0,0.06)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.12)',
        'brand':     '0 4px 20px rgba(249,74,22,0.35)',
      },
    },
  },
  plugins: [],
};