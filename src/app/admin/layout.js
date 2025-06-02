'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import './style.css';
import { useTheme } from '../themeContext';

// SVG Icons (can be moved to separate components if preferred)
const MenuIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const LogoutIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const SunIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-6 h-6">
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

const MoonIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

const FullscreenIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const ChevronDownIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronRightIcon = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    mumbai: false,
    oom: false
  });

  const route = useRouter()
  
  // Use the theme context instead of local state
  const { activeTheme, isLight, toggleTheme, currentTheme, themes } = useTheme();

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

  // Determine colors based on theme, especially for nav where light theme uses dark accent bg
  const navBgColor = isLight ? activeTheme.accentPrimaryDark : activeTheme.bgSecondary;
  // Use light text/icons on the dark nav background in light mode
  const navTextColor = isLight ? themes.dark.textPrimary : activeTheme.textPrimary;
  const navSecondaryTextColor = isLight ? themes.dark.textSecondary : activeTheme.textSecondary;
  const navIconColor = isLight ? themes.dark.textSecondary : activeTheme.neutralMedium;
  const navBorderColor = isLight ? activeTheme.accentPrimary : activeTheme.neutralLight;

  const mobileHeaderBgColor = isLight ? activeTheme.accentPrimaryDark : activeTheme.bgSecondary;
  const mobileHeaderTextColor = isLight ? themes.dark.textPrimary : activeTheme.textPrimary;

  const renderNavigationItem = (item, isMobile = false) => {
    if (item.type === 'single') {
      const isActive = pathname?.includes(`/admin/${item.path}`);
      const activeLinkColor = isLight ? activeTheme.highlight : activeTheme.accentPrimary;
      const activeLinkBg = isLight ? 'rgba(255, 255, 255, .1)' : 'rgba(255, 255, 255, 1)';

      return (
        <Link
          key={item.path}
          href={`/admin/${item.path}`}
          className={`navItem ${isActive ? 'navItemActive' : ''}`}
          style={{
            color: isActive ? activeLinkColor : navSecondaryTextColor,
            backgroundColor: isActive ? activeLinkBg : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.08)' : activeTheme.hover;
              e.currentTarget.style.color = navTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = navSecondaryTextColor;
            }
          }}
          onClick={isMobile ? () => setMobileNavOpen(false) : undefined}
        >
          {item.title}
        </Link>
      );
    }

    if (item.type === 'dropdown') {
      const isOpen = openDropdowns[item.key];
      const hasActiveChild = item.items.some(subItem => 
        pathname?.includes(`/admin/${subItem.path}`)
      );
      const activeLinkColor = isLight ? activeTheme.highlight : activeTheme.accentPrimary;
      // Active background for sub-items only
      const activeSubLinkBg = isLight ? 'rgba(255, 255, 255, .1)' : 'rgba(255, 255, 255, 1)'; 

      return (
        <div key={item.key} className="dropdownContainer">
          <button
            className={`dropdownToggle`}
            aria-expanded={isOpen}
            style={{
              // Only change color if a child is active, not background
              color: hasActiveChild ? activeLinkColor : navSecondaryTextColor,
              backgroundColor: 'transparent', // Always transparent for the toggle button itself
              border: 'none',
              cursor: 'pointer',
              width: '100%'
              // Other styles like display, align-items, etc., are now in CSS
            }}
            onClick={() => toggleDropdown(item.key)}
            onMouseEnter={(e) => {
              // Apply hover style only if no child is active (to avoid overriding active color)
              if (!hasActiveChild) {
                 e.currentTarget.style.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.08)' : activeTheme.hover;
                 e.currentTarget.style.color = navTextColor;
              }
            }}
            onMouseLeave={(e) => {
              // Revert hover style only if no child is active
              if (!hasActiveChild) {
                 e.currentTarget.style.backgroundColor = 'transparent';
                 e.currentTarget.style.color = navSecondaryTextColor;
              }
            }}
          >
            <span>{item.title}</span>
            {/* Chevron icon now styled via CSS class */}
            <div className="chevronIcon">
              <ChevronDownIcon color={hasActiveChild ? activeLinkColor : navIconColor} />
            </div>
          </button>
          
          {/* Dropdown menu content */}
          <div 
            className={`dropdownMenu ${isOpen ? 'open' : ''}`}
            // Background is now transparent via CSS
            // Other styles like border-radius, margin, overflow, transition, max-height, opacity are in CSS
          >
            {item.items.map((subItem) => {
              const isActive = pathname?.includes(`/admin/${subItem.path}`);
              return (
                <Link
                  key={subItem.path}
                  href={`/admin/${subItem.path}`}
                  className={`navSubItem ${isActive ? 'navItemActive' : ''}`}
                  style={{
                    color: isActive ? activeLinkColor : navSecondaryTextColor,
                    // Apply active background ONLY to the sub-item
                    backgroundColor: isActive ? activeSubLinkBg : 'transparent',
                    // Other styles like padding, display, text-decoration, font-size, font-weight, border-radius, margin, transition are in CSS
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isLight ? 'rgba(255, 255, 255, 0.1)' : activeTheme.hover;
                      e.currentTarget.style.color = navTextColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = navSecondaryTextColor;
                    }
                  }}
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
  };

  return (
    <div 
        className="adminContainer"
        style={{ backgroundColor: activeTheme.bgPrimary }} 
        suppressHydrationWarning
    >
      {/* Desktop Navigation */}
      <nav 
        className="wideNav"
        style={{
            backgroundColor: navBgColor,
        }}
      >
        <div 
            className="navHeader"
            style={{ borderBottom: `1px solid ${navBorderColor}` }}
        >
          <h1 style={{ color: navTextColor }}>Admin</h1>
        </div>

        <div className="navItems">
          {navigationStructure.map(item => renderNavigationItem(item, false))}
        </div>

        <div 
            className="navFooter"
            style={{ borderTop: `1px solid ${navBorderColor}` }}
        >
          <button onClick={logout} className="iconButton" aria-label="Logout">
            <LogoutIcon color={navIconColor} />
          </button>
          <button onClick={toggleTheme} className="iconButton" aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}>
            {currentTheme === 'light' ? <MoonIcon color={navIconColor} /> : <SunIcon color={navIconColor} />}
          </button>
          <button onClick={toggleFullscreen} className="iconButton" aria-label="Toggle fullscreen">
            <FullscreenIcon color={navIconColor} />
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header 
        className="mobileHeader"
        style={{ backgroundColor: mobileHeaderBgColor }}
      >
        <button className="hamburger" onClick={toggleMobileNav} aria-label="Toggle menu">
          <MenuIcon color={mobileHeaderTextColor} />
        </button>
        <h1 style={{ color: mobileHeaderTextColor }}>Admin</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleTheme} className="iconButton" aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}>
              {currentTheme === 'light' ? <MoonIcon color={mobileHeaderTextColor} /> : <SunIcon color={mobileHeaderTextColor} />}
          </button>
          {/* <button onClick={toggleFullscreen} className="iconButton" aria-label="Toggle fullscreen">
            <FullscreenIcon color={mobileHeaderTextColor} />
          </button> */}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`mobileNav ${mobileNavOpen ? 'open' : ''}`}
        style={{ backgroundColor: navBgColor }}
      >
        <div 
            className="mobileNavHeader"
            style={{ borderBottom: `1px solid ${navBorderColor}` }}
        >
          <h1 style={{ color: navTextColor }}>Admin</h1>
          <button onClick={logout} className="iconButton" aria-label="Logout">
            <LogoutIcon color={navTextColor} />
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
      <main 
        className="adminMainContent"
        style={{ backgroundColor: activeTheme.bgPrimary }} 
      >
        {children}
      </main>
    </div>
  );
}

