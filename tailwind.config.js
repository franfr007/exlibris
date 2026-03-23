/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#f5f0e8',
        sepia: {
          50: '#faf7f2',
          100: '#f5f0e8',
          200: '#e8dcc8',
          300: '#d4c4a0',
          400: '#bfa878',
          500: '#a68b55',
          600: '#8a7040',
          700: '#6e5a34',
          800: '#52432a',
          900: '#3a2f1f',
          950: '#1f1a12',
        },
        ink: {
          DEFAULT: '#2c2416',
          light: '#4a3f2f',
          lighter: '#6b5d4a',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
