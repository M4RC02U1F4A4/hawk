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
          primary: {
            900: '#d7faff',
            800: '#abf3ff',
            700: '#7ceffe',
            600: '#4beefd',
            500: '#1df1fb',
            400: '#04c9e2',
            300: '#0091af',
            200: '#005f7e',
            100: '#00354d',
            50: '#00111c',
            foreground: "#131925",
            DEFAULT: "#1CF1FB"
          },
          danger: {
            900: '#ffe9e5',
            800: '#fac2ba',
            700: '#f0988f',
            600: '#e96c63',
            500: '#e13d37',
            400: '#c81e1e',
            300: '#9c1d15',
            200: '#701a0e',
            100: '#461106',
            50: '#1e0800',
            DEFAULT: "#c91e1e"
          },
          success: {
            900: '#e4fce7',
            800: '#bef0c2',
            700: '#98e59b',
            600: '#70da70',
            500: '#4ed049',
            400: '#38b62f',
            300: '#248e24',
            200: '#18651e',
            100: '#0c3e14',
            50: '#001606',
            DEFAULT: "#3ABC31"
          },
          info: {
            900: '#e0ebff',
            800: '#b1c6ff',
            700: '#7fa4ff',
            600: '#4d85ff',
            500: '#1e53fe',
            400: '#072ce5',
            300: '#0014b3',
            200: '#000581',
            100: '#030050',
            50: '#050020',
            DEFAULT: "#5188FF"
          },
          warning: {
            900: '#fcffda',
            800: '#ffffad',
            700: '#fffb7d',
            600: '#fff24b',
            500: '#ffe81a',
            400: '#e6c600',
            300: '#b3a600',
            200: '#807f00',
            100: '#494d00',
            50: '#1a1c00',
            DEFAULT: "#FFDC00"
          },
          background: {
            900: '#ebedfc',
            800: '#cdcfe5',
            700: '#acb2d0',
            600: '#8c95bd',
            500: '#6c78ab',
            400: '#536191',
            300: '#404d72',
            200: '#2e3852',
            100: '#1a2232',
            50: '#070a15',
            DEFAULT: "#141a26" 
          },
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
