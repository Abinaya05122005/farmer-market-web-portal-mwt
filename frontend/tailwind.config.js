/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2f8f4',
          100: '#e1f0e6',
          200: '#c5e2ce',
          300: '#9bcead',
          400: '#6bb387',
          500: '#479766',
          600: '#347b51',
          700: '#2a6242',
          800: '#244e36',
          900: '#1e412e',
          950: '#0e2319',
        },
        harvest: {
          gold: '#e9c46a',
          orange: '#f4a261',
          coral: '#e76f51',
          cream: '#fcfbf7',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
      }
    },
  },
  plugins: [],
}
