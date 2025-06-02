'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import theme from './theme';

// Create the Theme Context
const ThemeContext = createContext();

// Custom hook to use the Theme Context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isMounted, setIsMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    setIsMounted(true);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('theme', currentTheme);
      // Optional: Add class to document.documentElement for global CSS variables
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme, isMounted]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setCurrentTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Set specific theme
  const setTheme = (themeName) => {
    if (theme[themeName]) {
      setCurrentTheme(themeName);
    } else {
      console.warn(`Theme "${themeName}" does not exist`);
    }
  };

  // Get current theme object
  const activeTheme = isMounted ? theme[currentTheme] : theme.light;

  // Helper function to check if current theme is light
  const isLight = currentTheme === 'light';

  // Helper function to check if current theme is dark
  const isDark = currentTheme === 'dark';

  const value = {
    currentTheme,
    activeTheme,
    toggleTheme,
    setTheme,
    isLight,
    isDark,
    isMounted,
    // Expose the entire theme object for direct access if needed
    themes: theme,
  };

  // Prevent flash of incorrect theme during hydration
  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};