'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '../../loginStyle.css';

function UserLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userData = localStorage.getItem('userData');
    
    if (isLoggedIn && userData) {
      router.push('/user');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/login', {
        auth: 'user', // Specify this is a user login
        identifier: identifier, // Can be email or phone
        password: password
      });

      if (response.data.userType === 'user') {
        localStorage.setItem('userLoggedIn', 'true');
        // Store user data without password
        const { password: _, ...userWithoutPassword } = response.data.user;
        localStorage.setItem('userData', JSON.stringify(userWithoutPassword));
        
        // Store customer data if available
        if (response.data.customers) {
          localStorage.setItem('userCustomers', JSON.stringify(response.data.customers));
        }
        
        router.push('/user');
      } else {
        setError('Invalid user credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('userData');
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid email/phone or password');
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
        <div className="admin-login-circle1"></div>
        <div className="admin-login-circle2"></div>
        <div className="admin-login-circle3"></div>
        <div className="admin-login-circle4"></div>
        
        <div className="admin-login-form-container">
          <h2 className="admin-login-form-title">User Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="admin-login-form-group">
              <label className="admin-login-form-label" htmlFor="identifier">Email / Phone</label>
              <input
                className="admin-login-form-input"
                type="text"
                id="identifier"
                placeholder="Enter your email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
          <h1 className="admin-login-brand-title">Welcome Back</h1>
          <p className="admin-login-brand-subtitle">
            Log in to access your account and manage your activities.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserLoginPage;