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
          600: '#9A0002',
          700: '#6B0102',
          200: '#E9C7C7',
          50: '#F8EDED',
        },
        ink: '#2A1416',
        'ink-muted': '#6B5A50',
        'admin-success': '#2F5A1E',
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
}
