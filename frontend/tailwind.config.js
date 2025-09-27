/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Swiss Red Variants
        'swiss-red': '#FF0000',
        'swiss-red-dark': '#CC0000',
        'swiss-red-light': '#FF3333',
        'swiss-red-pale': '#FFE6E6',
        
        // Alpine Colors
        'alpine-white': '#FFFFFF',
        'glacier-blue': '#E6F3FF',
        'mountain-gray': '#8B9DC3',
        'snow-white': '#FAFBFC',
        
        // Swiss Government Colors
        'swiss-gray': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        
        // Additional Swiss Colors
        'swiss-blue': '#0066CC',
        'swiss-green': '#059669',
        'swiss-yellow': '#D97706',
        'swiss-orange': '#EA580C',
      },
      fontFamily: {
        'swiss': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-1': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-2': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'swiss': '0.5rem',
        'swiss-lg': '1rem',
        'swiss-xl': '1.5rem',
      },
      boxShadow: {
        'swiss': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'swiss-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'swiss-red': '0 4px 12px rgba(255, 0, 0, 0.3)',
        'swiss-red-lg': '0 6px 20px rgba(255, 0, 0, 0.4)',
      },
      animation: {
        'cow-walk': 'cowWalk 3s ease-in-out infinite',
        'train-move': 'trainMove 4s linear infinite',
        'swiss-cross': 'swissCross 2s ease-in-out infinite',
        'cable-car': 'cableCar 5s ease-in-out infinite',
        'cheese-roll': 'cheeseRoll 2s linear infinite',
      },
      keyframes: {
        cowWalk: {
          '0%': { transform: 'translateX(-100px)' },
          '50%': { transform: 'translateX(50vw) scale(1.1)' },
          '100%': { transform: 'translateX(calc(100vw + 100px))' },
        },
        trainMove: {
          '0%': { transform: 'translateX(-200px)' },
          '100%': { transform: 'translateX(calc(100vw + 200px))' },
        },
        swissCross: {
          '0%, 100%': { transform: 'rotate(0deg)', opacity: '1' },
          '50%': { transform: 'rotate(180deg)', opacity: '0.8' },
        },
        cableCar: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        cheeseRoll: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
