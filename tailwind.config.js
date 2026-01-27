/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
        colors: {
          primary: {
            DEFAULT: '#F3B7C4',
            pink: '#F3B7C4',
          },
          blush: {
            DEFAULT: '#FDF6F8',
          },
          lavender: {
            DEFAULT: '#D8C6E0',
          },
          teal: {
            DEFAULT: '#6FAFB5',
            medical: '#6FAFB5',
          },
          charcoal: {
            DEFAULT: '#333333',
          },
        },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
