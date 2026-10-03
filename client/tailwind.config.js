/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        floatBlink: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-5px)', opacity: '0.9' },
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'blink': 'blink 2s ease-in-out infinite',
        'float-blink': 'floatBlink 4s ease-in-out infinite',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a', // Deep navy
        },
        emergency: {
          500: '#ef4444', // Red
          600: '#dc2626',
        },
        warning: {
          500: '#f59e0b', // Amber/Orange
        },
        safe: {
          500: '#10b981', // Green
        },
      },
    },
  },
  plugins: [],
}
