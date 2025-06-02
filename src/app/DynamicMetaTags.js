'use client'

import { useTheme } from './themeContext';
import { useEffect } from 'react';

export default function DynamicMetaTags() {
  const { activeTheme, isMounted } = useTheme();

  useEffect(() => {
    if (isMounted && activeTheme?.accentPrimaryDark) {
      console.log('Updating theme color to:', activeTheme.accentPrimaryDark); // Debug log
      
      // Update theme-color meta tag
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        // Create the meta tag if it doesn't exist
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = activeTheme.accentPrimaryDark;

      // Update apple-mobile-web-app-status-bar-style meta tag
      let appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!appleStatusBarMeta) {
        // Create the meta tag if it doesn't exist
        appleStatusBarMeta = document.createElement('meta');
        appleStatusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
        document.head.appendChild(appleStatusBarMeta);
      }
      appleStatusBarMeta.content = activeTheme.accentPrimaryDark;
    }
  }, [activeTheme, isMounted]);

  return null; // This component doesn't render anything visible
}