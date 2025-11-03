/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        panel: "#0f1721",
        accent: "#6ee7ff",
        accent2: "#a78bfa"
      },
      boxShadow: {
        glow: "0 0 20px rgba(110,231,255,0.35)",
      }
    },
  },
  plugins: [],
};
