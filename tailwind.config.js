/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}", // include React files
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#C81A1F',  /* MAIN */
          700: '#A11216',  /* Hover/Darker */
          800: '#7f0e12',
          900: '#690a0d',
          950: '#3a0406'
        }
      }
    }
  },
  plugins: [],
}
