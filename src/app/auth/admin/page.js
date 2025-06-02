'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '../../loginStyle.css';

function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/login', {
        auth: 'admin', // Specify this is an admin login
        identifier: username,
        password: password
      });

      if (response.data.userType === 'admin') {
        localStorage.setItem('adminLoggedIn', 'true');
        // Store the admin data if needed
        localStorage.setItem('adminData', JSON.stringify(response.data.user));
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      localStorage.setItem('adminLoggedIn', 'false');
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.status === 400) {
          setError(err.response.data.error || 'Missing credentials');
        } else {
          setError(err.response.data.error || 'Server error');
        }
      } else if (err.request) {
        setError('Network error - please check your connection');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="admin-login-container">
      {/* Right Panel - Form */}
      <div className="admin-login-right-panel">
        {/* Circle decorations */}
        <div className="admin-login-circle1"></div>
        <div className="admin-login-circle2"></div>
        <div className="admin-login-circle3"></div>
        <div className="admin-login-circle4"></div>
        
        <div className="admin-login-form-container">
          <h2 className="admin-login-form-title">Admin Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="admin-login-form-group">
              <label className="admin-login-form-label" htmlFor="username">Username</label>
              <input
                className="admin-login-form-input"
                type="text"
                id="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                required
              />
            </div>
            
            <div className="admin-login-form-group">
              <label className="admin-login-form-label" htmlFor="password">Password</label>
              <input
                className="admin-login-form-input"
                type="password"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
                required
              />
            </div>
            
            <button
              className={`admin-login-submit-button ${buttonHovered ? 'admin-login-submit-button:hover' : ''}`}
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
            {error && <p className="admin-login-error-text">{error}</p>}
          </form>
        </div>
      </div>

      {/* Left Panel - Branding */}
      <div className="admin-login-left-panel">
        <div className="admin-login-left-circle1"></div>
        <div className="admin-login-left-circle2"></div>
        <div style={{ textAlign: 'center', maxWidth: '80%', zIndex: 1 }}>
          <h1 className="admin-login-brand-title">Admin Portal</h1>
          <p className="admin-login-brand-subtitle">
            Access the administrative dashboard to manage users, content, and system settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;