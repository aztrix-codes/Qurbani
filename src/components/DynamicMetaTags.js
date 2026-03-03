'use client'

import { useTheme } from '@/context/themeContext';
import { useEffect } from 'react';

export default function DynamicMetaTags() {
  const { activeTheme, isMounted } = useTheme();

  useEffect(() => {
    if (isMounted && activeTheme?.accentPrimaryDark) {
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = activeTheme.accentPrimaryDark;

      let appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!appleStatusBarMeta) {
        appleStatusBarMeta = document.createElement('meta');
        appleStatusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
        document.head.appendChild(appleStatusBarMeta);
      }
      appleStatusBarMeta.content = activeTheme.accentPrimaryDark;
    }
  }, [activeTheme, isMounted]);

  return null;
}