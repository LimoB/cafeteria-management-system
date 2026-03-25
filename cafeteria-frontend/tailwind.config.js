/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You might want these for a "Canteen" theme
        primary: "#e63946", // Red for food/appetite
        secondary: "#457b9d",
        accent: "#f1faee",
      }
    },
  },
  plugins: [],
}