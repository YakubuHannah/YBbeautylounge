/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        vanilla: {
          50: '#F8F4EF',
          100: '#EFE6DD',
          200: '#E3D7CA',
          300: '#D2C3B2',
          400: '#B8A693',
        },
        violet: {
          900: '#1E1223',
          800: '#321847',
          600: '#4E2E68',
          200: '#C9BDD4',
          50: '#F0EBF4',
        },
        cherry: {
          // Dark wine — toned down from bright red to blend with the violet palette.
          600: '#7A1F35',
          700: '#581425',
          200: '#E3C7CD',
          50: '#F6EDEF',
        },
        ink: '#2A1416',
        'ink-muted': '#6B5A50',
        'admin-success': '#2F5A1E',
      },
      borderRadius: {
        DEFAULT: '2px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
}
