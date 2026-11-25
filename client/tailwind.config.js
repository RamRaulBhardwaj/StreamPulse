/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitch: {
          bg: '#0E0E10',
          sidebar: '#18181B',
          card: '#1F1F23',
          border: '#2F2F35',
          purple: '#9147FF',
          'purple-hover': '#772CE8',
          live: '#EB0400',
          text: '#EFEFF1',
          muted: '#ADADB8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roobert', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
