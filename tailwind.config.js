/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4B91F1',
          DEFAULT: '#1677ff',
          dark: '#0958d9',
        },
      },
    },
  },
  plugins: [],
} 

