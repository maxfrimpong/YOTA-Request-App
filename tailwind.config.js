/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#00a88f',
          dark: '#006680',
          orange: '#fa4515',
        }
      }
    },
  },
  plugins: [],
}