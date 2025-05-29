/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'main-gradient-light': 'linear-gradient(to bottom right, #E0F2FE, #A5F3FC, #67E8F9)', // Světle modrá až tyrkysová
        'main-gradient-dark': 'linear-gradient(to bottom right, #0C4A6E, #0E7490, #155E75)', // Tmavě modrá až tmavě tyrkysová
      },
      colors: {
        'gradient-dark-start': '#0C4A6E', // Tmavě modrá (začátek tmavého gradientu)
        'gradient-dark-mid': '#0E7490',   // Střed tmavého gradientu
        'gradient-dark-end': '#155E75',   // Tmavě tyrkysová (konec tmavého gradientu)
        'gradient-light-start': '#E0F2FE', // Světle modrá (začátek světlého gradientu)
        'gradient-light-mid': '#A5F3FC',    // Střed světlého gradientu
        'gradient-light-end': '#67E8F9',    // Světle tyrkysová (konec světlého gradientu)
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
