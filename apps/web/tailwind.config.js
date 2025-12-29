/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1A4D2E',
          light: '#2D6A4F',
          dark: '#0F2E1B',
        },
        sand: {
          DEFAULT: '#F4F1EA',
          dark: '#E8E4C9',
        },
        offwhite: '#FAF9F6',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
