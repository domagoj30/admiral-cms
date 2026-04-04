/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        admiral: {
          dark: '#080e1e',
          primary: '#0d1a33',
          card: '#111f3a',
          accent: '#f5c518',
          gold: '#ffd700',
          blue: '#0f2952',
          'blue-light': '#1a3d6e',
          'blue-border': '#1c3a65',
          green: '#00c853',
          red: '#ff2e00',
        }
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
        'barlow-c': ['Barlow Condensed', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
