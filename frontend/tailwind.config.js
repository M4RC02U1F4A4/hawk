// tailwind.config.js
const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {},
      },
      dark: {
        colors: {
          primary: "#1cf1fb",
          danger: "#c91e1e",
          success: "#3ABC31",
          info: "#5188FF",
          warning: "#FFDC00",
          background: "#141a26",
          default: 
          {
            900: '#e8f9fc',
            800: '#cae1e8',
            700: '#a9cad5',
            600: '#87b2c5',
            500: '#669ab4',
            400: '#4d7d9b',
            300: '#3b6079',
            200: '#2a4357',
            100: '#172735',
            50: '#040f16',
          }
        },
      },
    },
  })],
};
