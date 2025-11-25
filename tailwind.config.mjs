/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7f7",
          100: "#ffe4e4",
          200: "#ffc7c7",
          300: "#ffa0a0",
          400: "#ff7070",
          500: "#f4435f",
          600: "#d7244b",
          700: "#b0103c",
          800: "#82092d",
          900: "#4a041a"
        }
      }
    }
  },
  plugins: [],
};

export default config;
