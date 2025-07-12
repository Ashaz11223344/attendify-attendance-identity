import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark';
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark');
  const [actualTheme] = useState<'dark'>('dark');
  const [isSystemTheme] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    const updateTheme = () => {
      // Remove all theme classes first
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Always add dark theme
      root.classList.add('dark');
      body.classList.add('dark');
      
      // Set data attribute for CSS targeting
      root.setAttribute('data-theme', 'dark');
      body.setAttribute('data-theme', 'dark');
      
      // Force update CSS custom properties for dark mode
      root.style.setProperty('--theme-bg-primary', '#111827');
      root.style.setProperty('--theme-bg-secondary', '#1f2937');
      root.style.setProperty('--theme-bg-tertiary', '#374151');
      root.style.setProperty('--theme-text-primary', '#ffffff');
      root.style.setProperty('--theme-text-secondary', '#d1d5db');
      root.style.setProperty('--theme-border-primary', '#374151');
      root.style.setProperty('--theme-border-secondary', '#4b5563');
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      const themeColor = '#111827';
      
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = themeColor;
        document.head.appendChild(meta);
      }
    };

    updateTheme();
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    // Always dark mode, no-op
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: 'dark', 
      setTheme: handleSetTheme, 
      actualTheme: 'dark', 
      isSystemTheme: false 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
