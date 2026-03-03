'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import theme from '@/theme/theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('theme', currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme, isMounted]);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (themeName) => {
    if (theme[themeName]) {
      setCurrentTheme(themeName);
    } else {
      console.warn(`Theme "${themeName}" does not exist`);
    }
  };

  const activeTheme = isMounted ? theme[currentTheme] : theme.light;
  const isLight = currentTheme === 'light';
  const isDark = currentTheme === 'dark';

  const value = {
    currentTheme,
    activeTheme,
    toggleTheme,
    setTheme,
    isLight,
    isDark,
    isMounted,
    themes: theme,
  };

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
