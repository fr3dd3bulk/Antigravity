/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#571B0A',
        'primary-dark': '#3d1307',
        'primary-light': '#7a2610',
      },
    },
  },
  plugins: [],
}
