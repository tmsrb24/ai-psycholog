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
        sans: ['Inter', 'sans-serif'], // Nastavení Inter jako výchozího sans-serif fontu
      },
      backgroundImage: {
        'main-gradient-light': 'linear-gradient(135deg, #E0F2FE 0%, #A5F3FC 50%, #67E8F9 100%)', 
        'main-gradient-dark': 'linear-gradient(135deg, #082f49 0%, #0C4A6E 50%, #0E7490 100%)', 
        'hero-gradient-light': 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)', // Nový gradient pro Hero light (blue-400, blue-500, blue-600)
        'hero-gradient-dark': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E3A8A 100%)', // Nový gradient pro Hero dark (blue-600, blue-700, blue-800)
        'cta-gradient-light': 'linear-gradient(135deg, #A5F3FC 0%, #67E8F9 50%, #22D3EE 100%)', 
        'cta-gradient-dark': 'linear-gradient(135deg, #0E7490 0%, #155E75 50%, #0891B2 100%)', 
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
