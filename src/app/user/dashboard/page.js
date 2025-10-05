'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../themeContext';
import { TrendingUp, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import './style.css'; // Import the new stylesheet

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatTimestamp = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
};


const DashboardShimmer = () => {
  const { activeTheme } = useTheme();
  return (
    <div className="dashboard-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="dashboard-card" style={{ backgroundColor: activeTheme.bgSecondary, border: `1px solid ${activeTheme.border}` }}>
          <div className="shimmer-base" style={{ height: '1.25rem', width: '60%', marginBottom: '1rem', backgroundColor: activeTheme.hover }} />
          <div className="shimmer-base" style={{ height: '2rem', width: '40%', marginBottom: '0.5rem', backgroundColor: activeTheme.hover }} />
          <div className="shimmer-base" style={{ height: '1.5rem', width: '50%', backgroundColor: activeTheme.hover }} />
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { activeTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setDashboardData(data[0]);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      if (isInitialLoad) setLoading(false);
      // Add a small delay to ensure the animation is visible
      setTimeout(() => setIsFetching(false), 500);
    }
  }, []);

  useEffect(() => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (storedUserData) setUserData(storedUserData);
    } catch (err) {
      console.error("Failed to parse user data from local storage", err);
    }

    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const region = userData?.regions_incharge_of;
  const isMumbai = region === 1;
  const isOutOfMumbai = region === 2;
  const isBoth = region === 0;

  const cards = [];
  if (dashboardData) {
    if (isMumbai || isBoth) {
      cards.push(
        { title: 'Total Shares (Mumbai)', value: dashboardData.shares_mumbai, secondaryValue: formatCurrency(dashboardData.total_amount_mumbai), icon: <TrendingUp />, key: 'mum_shares' },
        { title: 'Paid Shares (Mumbai)', value: dashboardData.paid_mumbai, secondaryValue: formatCurrency(dashboardData.paid_amount_mumbai), icon: <CheckCircle />, key: 'mum_paid' },
        { title: 'Pending Shares (Mumbai)', value: dashboardData.pending_mumbai, secondaryValue: formatCurrency(dashboardData.pending_amount_mumbai), icon: <Clock />, key: 'mum_pending' }
      );
    }
    if (isOutOfMumbai || isBoth) {
      cards.push(
        { title: 'Total Shares (Out of Mumbai)', value: dashboardData.shares_out_mumbai, secondaryValue: formatCurrency(dashboardData.total_amount_out_mumbai), icon: <TrendingUp />, key: 'oom_shares' },
        { title: 'Paid Shares (Out of Mumbai)', value: dashboardData.paid_out_mumbai, secondaryValue: formatCurrency(dashboardData.paid_amount_out_mumbai), icon: <CheckCircle />, key: 'oom_paid' },
        { title: 'Pending Shares (Out of Mumbai)', value: dashboardData.pending_out_mumbai, secondaryValue: formatCurrency(dashboardData.pending_amount_out_mumbai), icon: <Clock />, key: 'oom_pending' }
      );
    }
  }

  return (
    <>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 50% { opacity: .5; } }
      `}</style>
      <div className="dashboard-container" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary }}>
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="title" style={{ color: activeTheme.textPrimary }}>Dashboard</h1>
            <p className="subtitle" style={{ color: activeTheme.textSecondary }}>
              Welcome back, <strong style={{ color: activeTheme.accentPrimary }}>{userData?.name || 'User'}</strong>! Here's an overview of your Qurbani shares.
            </p>
          </div>
          <div className="header-right">
            <button
              className="refresh-button"
              onClick={() => fetchData(false)}
              disabled={isFetching}
              style={{
                backgroundColor: activeTheme.bgSecondary,
                color: activeTheme.textSecondary,
                borderColor: activeTheme.border,
              }}
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              {lastRefreshed && (
                <span className="last-updated">
                  {formatTimestamp(lastRefreshed)}
                </span>
              )}
            </button>
          </div>
        </div>

        {loading && <DashboardShimmer />}
        
        {error && <div className="error-message" style={{ backgroundColor: `${activeTheme.error}20`, color: activeTheme.error }}>{error}</div>}

        {!loading && !error && dashboardData && (
          <div className="dashboard-grid">
            {cards.map(card => (
              <div
                key={card.key}
                className="dashboard-card"
                style={{
                  backgroundColor: activeTheme.bgSecondary,
                  border: `1px solid ${activeTheme.border}`,
                }}
              >
                <div>
                  <div className="card-header">
                    <p className="card-title" style={{ color: activeTheme.textSecondary }}>{card.title}</p>
                    <div className="card-icon" style={{ color: activeTheme.accentPrimary }}>
                      {React.cloneElement(card.icon, { size: 24 })}
                    </div>
                  </div>
                  <h2 className="card-value" style={{ color: activeTheme.textPrimary }}>{card.value}</h2>
                </div>
                <p className="card-secondary-value" style={{ color: activeTheme.textSecondary }}>{card.secondaryValue}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}