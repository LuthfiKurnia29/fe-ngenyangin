/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#046838',
        'primary-dark': '#0B3D2A',
        'primary-soft': '#E3F0E5',
        accent: '#D24F0F',
        'accent-dark': '#B03F08',
        'accent-soft': '#FCE9DF',
        background: '#F7F5F0',
        surface: '#FFFFFF',
        'surface-mint': '#EAF3EA',
        'text-primary': '#16241C',
        'text-secondary': '#5B6B62',
        border: '#DDE5DE',
        success: '#2E8B57',
        warning: '#E0A100',
        error: '#C62828',
        info: '#2F6DB5',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(4, 104, 56, 0.06)',
        'card-hover': '0 8px 24px rgba(4, 104, 56, 0.12)',
        modal: '0 16px 48px rgba(4, 104, 56, 0.15)',
        sidebar: '4px 0 24px rgba(4, 104, 56, 0.08)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
        section: '64px',
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        headline: ['28px', { lineHeight: '1.25', fontWeight: '600' }],
        title: ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        label: ['13px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      maxWidth: {
        content: '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
