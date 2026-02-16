/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF8F0',
          100: '#F5F1E8',
          200: '#E8DCC6',
          300: '#D4A574',
          400: '#C8956D',
          500: '#B8926A',
          600: '#A67C5A',
          700: '#8B6B4F',
          800: '#6B5240',
          900: '#4A3A2F',
        },
        warm: {
          50: '#FFFBF5',
          100: '#FFF5EB',
          200: '#FFE4CC',
          300: '#FFD4AD',
          400: '#FFC48E',
          500: '#FFB570',
        },
        ink: {
          50: '#F7F7F7',
          100: '#E3E3E3',
          200: '#C8C8C8',
          300: '#A4A4A4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'Source Han Serif SC', 'serif'],
        'sans': ['Noto Sans SC', 'Source Han Sans SC', 'sans-serif'],
      },
      backgroundImage: {
        'ancient-pattern': "url('/patterns/ancient.svg')",
        'gradient-warm': 'linear-gradient(135deg, #FFF8F0 0%, #FFE4CC 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
