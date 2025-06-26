/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // fontFamily: { // Odstraněno, řeší next/font
      //   sans: ['Inter', 'sans-serif'], 
      // },
      backgroundImage: {
        'main-gradient-light': 'linear-gradient(135deg, #E0F2FE 0%, #A5F3FC 50%, #67E8F9 100%)', 
        'main-gradient-dark': 'linear-gradient(135deg, #082f49 0%, #0C4A6E 50%, #0E7490 100%)', 
        'hero-gradient-light': 'linear-gradient(135deg, #A5F3FC 0%, #67E8F9 50%, #22D3EE 100%)',
        'hero-gradient-dark': 'linear-gradient(135deg, #2a3a4a 0%, #2f5f7f 100%)', // Even lighter version
        'cta-gradient-light': 'linear-gradient(135deg, #A5F3FC 0%, #67E8F9 50%, #22D3EE 100%)', 
        'cta-gradient-dark': 'linear-gradient(135deg, #0E7490 0%, #155E75 50%, #0891B2 100%)', 
      },
      dropShadow: {
        'glow': '0 0 20px rgba(255, 255, 255, 0.15)',
      },
      colors: {
        'gradient-dark-start': '#082f49', // Tmavší modrá (začátek tmavého gradientu body)
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
    require('daisyui'),
  ],
};
