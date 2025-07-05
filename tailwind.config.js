/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito Sans"', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#F8F9FA',
          dark: '#1A202C',
        },
        text: {
          light: '#212529',
          dark: '#E2E8F0',
        },
        primary: {
          light: '#208B8A', // Muted Teal
          dark: '#4FD1C5',  // Soft Teal
        },
        accent: {
          DEFAULT: '#F2A68A', // Gentle Peach
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
