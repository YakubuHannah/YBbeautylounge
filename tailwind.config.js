import { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif']
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.2em', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: '600' }],
        'sm': ['13px', '1.5rem', { letterSpacing: '0.02em' }],
        'base': ['15px', '1.6rem'],
        'lg': ['17px', '1.6rem'],
        'xl': ['19px', '1.3rem'],
        '2xl': ['24px', '1.2rem'],
        '3xl': ['32px', '1.15rem'],
        '4xl': ['40px', '1.1rem']
      },
      colors: {
        vanilla: {
          50: '#F8F4EF',
          100: '#EFE6DD',
          200: '#E3D7CA',
          300: '#D2C3B2',
          400: '#B8A693'
        },
        violet: {
          900: '#1E1223',
          800: '#321847',
          600: '#4E2E68',
          200: '#C9BDD4',
          50: '#F0EBF4'
        },
        cherry: {
          600: '#9A0002',
          700: '#6B0102',
          200: '#E9C7C7',
          50: '#F8EDED'
        },
        ink: '#2A1416',
        'ink-muted': '#6B5A50',
        'admin-success': '#2F5A1E'
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '48px',
        8: '64px',
        9: '96px',
        10: '128px'
      },
      borderRadius: {
        DEFAULT: '2px'
      },
      boxShadow: {
        focus: '0 0 0 2px #9A0002'
      }
    },
    container: {
      center: true,
      padding: '20px',
      screens: {
        sm: '375px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      }
    }
  },
  plugins: []
}

export default config