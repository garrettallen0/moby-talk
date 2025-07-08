/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        border: 'var(--border-color)',
        text: 'var(--text-color)',
        'text-secondary': 'var(--text-secondary)',
        background: 'var(--background-color)',
      }
    },
  },
  plugins: [],
}

