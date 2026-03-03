'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import './style.css';
import { useTheme } from '@/context/themeContext';

// SVG Icons (can be moved to separate components if preferred)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

const FullscreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronRightIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const navigationStructure = [
  {
    title: "Dashboard",
    path: 'dashboard',
    type: 'single'
  },
  {
    title: "Mumbai",
    type: 'dropdown',
    key: 'mumbai',
    items: [
      { title: "Generate Receipt", path: 'receipt-mumbai' },
      { title: "Export Excel", path: 'export-excel-mumbai' },
      { title: "Payment Status", path: 'payment-status-mumbai' }
    ]
  },
  {
    title: "Out of Mumbai",
    type: 'dropdown',
    key: 'oom',
    items: [
      { title: "Generate Receipt", path: 'receipt-oom' },
      { title: "Export Excel", path: 'export-excel-oom' },
      { title: "Payment Status", path: 'payment-status-oom' }
    ]
  },
  {
    title: "Feedbacks",
    path: 'feedbacks',
    type: 'single'
  }
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    mumbai: false,
    oom: false
  });

  // Global Admin Authentication Check
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
      router.replace('/auth/admin');
    }
  }, [router, pathname]);

  const { activeTheme, isLight, toggleTheme, currentTheme, themes } = useTheme();

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const logout = () => {
    localStorage.setItem('adminLoggedIn', 'false');
    router.replace('/auth/admin');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // For mobile browsers, try multiple methods
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
          console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (element.webkitRequestFullscreen) { // Safari
        element.webkitRequestFullscreen().catch(err => {
          console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen().catch(err => {
          console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen().catch(err => {
          console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.log(`Error attempting to exit fullscreen: ${err.message}`);
        });
      } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen().catch(err => {
          console.log(`Error attempting to exit fullscreen: ${err.message}`);
        });
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen().catch(err => {
          console.log(`Error attempting to exit fullscreen: ${err.message}`);
        });
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen().catch(err => {
          console.log(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  const renderNavigationItem = useCallback((item, isMobile = false) => {
    if (item.type === 'single') {
      const isActive = pathname === `/admin/${item.path}` || (item.path === 'dashboard' && (pathname === '/admin' || pathname === '/admin/dashboard'));

      return (
        <Link
          key={item.path}
          href={`/admin/${item.path}`}
          className={`navItem ${isActive ? 'navItemActive' : ''}`}
          onClick={isMobile ? () => setMobileNavOpen(false) : undefined}
        >
          <span className="navItemText">{item.title}</span>
        </Link>
      );
    }

    if (item.type === 'dropdown') {
      const isOpen = openDropdowns[item.key];
      const hasActiveChild = item.items.some(subItem => pathname === `/admin/${subItem.path}`);

      return (
        <div key={item.key} className="navDropdownContainer">
          <button
            onClick={() => toggleDropdown(item.key)}
            className={`navItem navDropdownToggle ${hasActiveChild ? 'dropdownActive' : ''}`}
          >
            <span className="navItemText">{item.title}</span>
            <div className={`chevronIcon ${isOpen ? 'rotate' : ''}`}>
              <ChevronDownIcon />
            </div>
          </button>

          <div className={`navDropdownMenu ${isOpen ? 'menuOpen' : ''}`}>
            {item.items.map(subItem => {
              const isSubActive = pathname === `/admin/${subItem.path}`;
              return (
                <Link
                  key={subItem.path}
                  href={`/admin/${subItem.path}`}
                  className={`navSubItem ${isSubActive ? 'navSubActive' : ''}`}
                  onClick={isMobile ? () => setMobileNavOpen(false) : undefined}
                >
                  {subItem.title}
                </Link>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  }, [pathname, openDropdowns]);

  return (
    <div className="adminContainer" suppressHydrationWarning>
      {/* Desktop Navigation */}
      <nav className="wideNav">
        <div className="navHeader">
          <h1>Admin</h1>
        </div>

        <div className="navItems">
          {navigationStructure.map(item => renderNavigationItem(item, false))}
        </div>

        <div className="navFooter">
          <button onClick={logout} className="iconButton" aria-label="Logout">
            <LogoutIcon />
          </button>
          <button onClick={toggleTheme} className="iconButton" aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}>
            {currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <button onClick={toggleFullscreen} className="iconButton" aria-label="Toggle fullscreen">
            <FullscreenIcon />
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="mobileHeader">
        <button className="hamburger" onClick={toggleMobileNav} aria-label="Toggle menu">
          <MenuIcon />
        </button>
        <h1>Admin</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleTheme} className="iconButton" aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}>
            {currentTheme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobileNav ${mobileNavOpen ? 'open' : ''}`}>
        <div className="mobileNavHeader">
          <h1>Admin</h1>
          <button onClick={logout} className="iconButton" aria-label="Logout">
            <LogoutIcon />
          </button>
        </div>
        <div className="navItems">
          {navigationStructure.map(item => renderNavigationItem(item, true))}
        </div>
      </div>

      {/* Overlay for Mobile Nav */}
      <div
        className={`overlay ${mobileNavOpen ? 'open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
      ></div>

      {/* Main Content Area */}
      <main className="adminMainContent">
        {children}
      </main>
    </div>
  );
}

