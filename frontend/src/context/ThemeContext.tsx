import { useState, useEffect } from 'react';
import { ThemeContext } from './themeStore';
import { type Theme } from './themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('inventra-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('inventra-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}