import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'mint' | 'lavender'; // Rozšíření o nová témata

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void; // Změna z toggleTheme na setTheme
}

const defaultTheme: Theme = 'light'; // Výchozí téma

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && ['light', 'dark', 'mint', 'lavender'].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    } else {
      setThemeState(defaultTheme); // Fallback na výchozí téma
    }
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    const root = document.documentElement;
    // Odstranit všechny možné třídy témat
    root.classList.remove('light', 'dark', 'theme-mint', 'theme-lavender');
    // Přidat aktuální třídu tématu (pokud není 'light', protože 'light' je výchozí bez třídy)
    if (theme !== 'light') {
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setNewTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setNewTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
