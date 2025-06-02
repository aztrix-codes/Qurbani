'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import '../../loginStyle.css';

function SupervisorLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem('supervisorLoggedIn') === 'true';
    const supervisorData = localStorage.getItem('supervisorData');
    
    if (isLoggedIn && supervisorData) {
      router.push('/supervisor/zones');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/login', {
        auth: 'supervisor', // Specify this is a supervisor login
        identifier: username,
        password: password
      });

      if (response.data.userType === 'supervisor') {
        localStorage.setItem('supervisorLoggedIn', 'true');
        // Store the supervisor data without password
        const { password: _, ...supervisorWithoutPassword } = response.data.user;
        localStorage.setItem('supervisorData', JSON.stringify(supervisorWithoutPassword));
        
        // Store summary data if needed
        if (response.data.summary) {
          localStorage.setItem('supervisorSummaryData', JSON.stringify(response.data.summary));
        }
        
        router.push('/supervisor/zones');
      } else {
        setError('Invalid supervisor credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('supervisorLoggedIn');
      localStorage.removeItem('supervisorData');
      
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
        <div className="admin-login-circle1"></div>
        <div className="admin-login-circle2"></div>
        <div className="admin-login-circle3"></div>
        <div className="admin-login-circle4"></div>
        
        <div className="admin-login-form-container">
          <h2 className="admin-login-form-title">Supervisor Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="admin-login-form-group">
              <label className="admin-login-form-label" htmlFor="username">Username</label>
              <input
                className="admin-login-form-input"
                type="text"
                id="username"
                placeholder="Enter supervisor username"
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
          <h1 className="admin-login-brand-title">Supervisor Portal</h1>
          <p className="admin-login-brand-subtitle">
            Access the supervisor dashboard to monitor operations and manage teams.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SupervisorLoginPage;