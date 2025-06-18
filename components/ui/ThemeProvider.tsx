import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark'; // Pouze dark theme

interface ThemeContextType {
  theme: Theme;
  // toggleTheme již není potřeba
}

const ثابتTheme: Theme = 'dark'; // Konstanta pro tmavý motiv

const ThemeContext = createContext<ThemeContextType>({
  theme: ثابتTheme,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Stav pro téma již není potřeba, vždy bude 'dark'
  // const [theme, setThemeState] = useState<Theme>(ثابتTheme);

  useEffect(() => {
    // Vždy aplikovat třídu 'dark' na root element
    const root = document.documentElement;
    root.classList.add('dark');
    // Odstranit 'light', pokud by tam z nějakého důvodu byla
    root.classList.remove('light'); 
    // localStorage již není potřeba pro ukládání tématu
    // localStorage.setItem('theme', 'dark'); 
  }, []); // Spustí se jen jednou po mountnutí

  // toggleTheme funkce již není potřeba
  // const toggleTheme = () => {
  //   setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  // };

  return (
    // Hodnota kontextu nyní poskytuje pouze 'dark' téma a žádnou funkci pro přepnutí
    <ThemeContext.Provider value={{ theme: ثابتTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
