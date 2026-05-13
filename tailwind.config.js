/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        'vinotinto': {
          50: '#fdf2f2',
          100: '#fce8e8',
          200: '#fad1d1',
          400: '#8e1b2e',
          500: '#722f37',
          600: '#600010',
          700: '#50000d',
          800: '#40000d', // El tono profundo de nuestras barras
          900: '#300008',
          light: '#8b1522',
          DEFAULT: '#630d16',
          dark: '#3d080e',
        },
        'gold': {
          light: '#efbf3a',
          DEFAULT: '#b8860b',
          dark: '#8b6508',
          urbe: '#b8860b',
        },
        'vinotinto-urbe': '#630d16', // Compatibilidad con portal
        'vinotinto-dark': '#4a0a10',
        'gold-urbe': '#b8860b',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
