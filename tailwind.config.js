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
        'main-gradient-light': 'linear-gradient(135deg, #E0F2FE 0%, #A5F3FC 50%, #67E8F9 100%)', // Světle modrá až tyrkysová, upraven úhel
        'main-gradient-dark': 'linear-gradient(135deg, #082f49 0%, #0C4A6E 50%, #0E7490 100%)', // Tmavší modrá až tmavě tyrkysová, upraven úhel
        'hero-gradient-light': 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 50%, #60A5FA 100%)', // Pro Hero sekci - světlá
        'hero-gradient-dark': 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)', // Pro Hero sekci - tmavá (původní z index.tsx)
        'cta-gradient-light': 'linear-gradient(135deg, #A5F3FC 0%, #67E8F9 50%, #22D3EE 100%)', // Pro CTA sekci - světlá
        'cta-gradient-dark': 'linear-gradient(135deg, #0E7490 0%, #155E75 50%, #0891B2 100%)', // Pro CTA sekci - tmavá
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
  ],
};
