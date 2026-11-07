/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0b0b0c",
          900: "#121214",
          800: "#1b1b1e",
        },
      },
    },
  },
  plugins: [],
};
