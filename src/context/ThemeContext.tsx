import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { guardarDato, obtenerDato } from '../utils/storage';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'narbus_theme_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const initTheme = async () => {
      try {
        const storedTheme = await obtenerDato(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
          applyTheme(storedTheme);
        } else {
          // Por defecto la aplicación utiliza el tema oscuro corporativo
          setThemeState('dark');
          applyTheme('dark');
        }
      } catch (err) {
        console.error('Error cargando tema:', err);
        setThemeState('dark');
        applyTheme('dark');
      }
    };

    initTheme();
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      root.classList.add('dark', 'theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
      root.classList.remove('dark', 'theme-dark');
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await guardarDato(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}
