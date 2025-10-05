"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './layout.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isUserPage = pathname === '/user';
  
  const handleBackClick = () => {
    router.replace('/user');
  };
  
  const handleLogout = () => {

  };
  

  const [userData, setUserData] =useState({
    name: 'User',
    img: null
  });
  

  
  return (
    <div className="dashboard-container" suppressHydrationWarning>
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div
              className={`back-button ${!isUserPage ? 'visible' : ''}`}
              onClick={handleBackClick}
            >
              <img
                src='https://img.icons8.com/?size=100&id=85498&format=png&color=ffffff'
                style={{ width: '1.5rem' }}
                alt="Go back"
              />
            </div>
            
            <div className="user-info">
              <img
                src={userData?.img}
                alt="User profile"
                className="user-avatar"
              />
              <span className="username widescreen">{userData.name}</span>
              <span className="username mobilescreen">{userData.name.length > 20 ? userData.name.slice(0, 20 - 3) + '...' : userData.name}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <img
              src='https://img.icons8.com/?size=100&id=59995&format=png&color=ffffff'
              alt="Logout"
            />
          </button>
        </div>
      </header>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}