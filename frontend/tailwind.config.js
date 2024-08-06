/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'dark-bg-light': '#1e293b',
        'primary': '#0ea5e9',
        'text-light': '#e2e8f0',
        'light-bg': '#f8fafc',
        'light-bg-light': '#e2e8f0',
        'text-dark': '#1e293b',
      },
    },
  },
  plugins: [],
}
