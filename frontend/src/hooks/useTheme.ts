import { useContext } from 'react';
import { ThemeContext } from '../context/themeStore';
import type { ThemeContextType } from '../context/themeStore';

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
