
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/themeContext'; // Assuming themeContext is one level up
import './dashboard.css'; // Import the CSS file we created
// Import icons from lucide-react
import { RefreshCw, Lock, Unlock } from 'lucide-react';


// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

// Helper to format timestamp
const formatTimestamp = (date) => {
  if (!date) return '';
  // Format like 10:37:13 am (adjust locale/options if needed)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); 
};

function Dashboard() {
  const { activeTheme, isLight } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isLocked, setIsLocked] = useState(false); // State for lock toggle

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching dashboard data from /api/dashboard...");
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result && result.length > 0) {
        setData(result[0]);
        setLastRefreshed(new Date()); // Update timestamp on success
        console.log("Data fetched successfully:", result[0]);
      } else {
        console.warn("API returned empty or unexpected data:", result);
        setData({}); 
        setError("Received no data from the server.");
        setLastRefreshed(null); // Clear timestamp on error/empty
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(`Failed to load dashboard data: ${err.message}`);
      setData(null); 
      setLastRefreshed(null); // Clear timestamp on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle function for the lock button
  const toggleLock = () => {
    setIsLocked(prev => !prev);
    console.log(`Dashboard lock toggled: ${!isLocked ? 'Locked' : 'Unlocked'}`);
    // Add any side effects of locking/unlocking here in the future
  };

  // Card Data Mapping
  const cardData = data ? [
    { title: 'Animals (Out of Mumbai)', value: data.animals_out_mumbai, secondaryValue: null, key: 'oom_animals' },
    { title: 'Shares (Out of Mumbai)', value: data.shares_out_mumbai, secondaryValue: formatCurrency(data.total_amount_out_mumbai), key: 'oom_shares' },
    { title: 'Paid (Out of Mumbai)', value: data.paid_out_mumbai, secondaryValue: formatCurrency(data.paid_amount_out_mumbai), key: 'oom_paid' },
    { title: 'Pending (Out of Mumbai)', value: data.pending_out_mumbai, secondaryValue: formatCurrency(data.pending_amount_out_mumbai), key: 'oom_pending' },
    { title: 'Animals (Mumbai)', value: data.animals_mumbai, secondaryValue: null, key: 'mum_animals' },
    { title: 'Shares (Mumbai)', value: data.shares_mumbai, secondaryValue: formatCurrency(data.total_amount_mumbai), key: 'mum_shares' },
    { title: 'Paid (Mumbai)', value: data.paid_mumbai, secondaryValue: formatCurrency(data.paid_amount_mumbai), key: 'mum_paid' },
    { title: 'Pending (Mumbai)', value: data.pending_mumbai, secondaryValue: formatCurrency(data.pending_amount_mumbai), key: 'mum_pending' },
  ] : [];

  // Render Logic
  if (loading && !data) { // Show loading only on initial load
    return <div className="loadingState" style={{ color: activeTheme.textSecondary }}>Loading Dashboard...</div>;
  }

  if (error && !data) { // Show error prominently if initial load fails
    return (
        <div className="errorState" style={{ color: activeTheme.error }}>
            {error} 
            <button 
                onClick={fetchData} 
                style={{
                    backgroundColor: activeTheme.error, 
                    color: activeTheme.bgPrimary, 
                    border: 'none'
                }}
            >
                Retry
            </button>
        </div>
    );
  }

  // Determine button colors based on theme
  const primaryButtonBg = activeTheme.accentPrimary;
  const primaryButtonText = activeTheme.bgPrimary; 
  const primaryButtonHoverBg = activeTheme.accentPrimaryDark || activeTheme.accentPrimary; 

  const secondaryButtonBg = activeTheme.bgSecondary;
  const secondaryButtonText = activeTheme.textPrimary;
  const secondaryButtonHoverBg = activeTheme.hover;
  
  // Lock button specific colors (using success for locked state as per image)
  const lockButtonBg = activeTheme.success;
  const lockButtonText = activeTheme.bgPrimary;
  const lockButtonHoverBg = activeTheme.success; // Or a darker success shade if available

  const unlockButtonBg = activeTheme.bgSecondary; // Use secondary for unlocked
  const unlockButtonText = activeTheme.textPrimary;
  const unlockButtonHoverBg = activeTheme.hover;

  return (
    <div className="dashboardContainer">
      <div className="dashboardHeader">
        <h2 className="dashboardTitle" style={{ color: activeTheme.textPrimary }}>Dashboard</h2>
        
        <div className="headerActions">
          {/* Refresh Button with Time Inside */}
          <button 
            className="actionButton refreshButton" 
            onClick={fetchData} 
            disabled={loading} 
            style={{
              // Use secondary background for refresh button itself
              backgroundColor: secondaryButtonBg,
              color: secondaryButtonText,
              border: `1px solid ${activeTheme.border}`,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = secondaryButtonHoverBg)}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = secondaryButtonBg)}
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={16} color={secondaryButtonText} /> {/* Lucide Icon */} 
            {lastRefreshed && (
              <span className="refreshTimestamp" style={{ color: activeTheme.textSecondary }}>
                {formatTimestamp(lastRefreshed)}
              </span>
            )}
            {/* Hide text label for refresh button to match image */}
            {/* <span>{loading ? 'Refreshing...' : 'Refresh'}</span> */}
          </button>

          {/* Lock/Unlock Button (Now uses Lucide icons) */}
          <button 
            className="actionButton lockButton" 
            onClick={toggleLock} 
            style={{
              backgroundColor: isLocked ? lockButtonBg : unlockButtonBg,
              color: isLocked ? lockButtonText : unlockButtonText,
              border: `1px solid ${isLocked ? lockButtonBg : activeTheme.border}`
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isLocked ? lockButtonHoverBg : unlockButtonHoverBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isLocked ? lockButtonBg : unlockButtonBg}
            title={isLocked ? 'Unlock Dashboard (Visual Only)' : 'Lock Dashboard (Visual Only)'}
          >
            {isLocked ? 
              <Lock size={16} color={lockButtonText} /> : 
              <Unlock size={16} color={unlockButtonText} />
            }
            <span>{isLocked ? 'Lock' : 'Unlock'}</span> {/* Changed text to match image */} 
          </button>
        </div>
      </div>

      {/* Display error inline if fetch fails after initial load */}
      {error && data && (
          <div style={{ color: activeTheme.error, marginBottom: '1rem', textAlign: 'center' }}>
              {error} (Showing last available data)
          </div>
      )}

      <div className="dashboardGrid">
        {cardData.map(card => (
          <div 
            key={card.key}
            className="dashboardCard"
            style={{
              backgroundColor: activeTheme.bgSecondary,
              color: activeTheme.textPrimary,
              border: `1px solid ${activeTheme.border}`,
            }}
          >
            <div className="cardHeader">
              <span 
                className="cardDot"
                style={{ backgroundColor: activeTheme.success }}
              ></span>
              <span 
                className="cardLiveBadge"
                style={{
                  backgroundColor: activeTheme.success,
                  color: activeTheme.bgPrimary
                }}
              >
                Live
              </span>
            </div>
            {/* Wrap content for flexbox alignment */}
            <div className="cardContent">
              <div className="cardTitle" style={{ color: activeTheme.textSecondary }}>
                {card.title}
              </div>
              <div className="cardValue" style={{ color: activeTheme.accentPrimary }}>
                {card.value !== null && card.value !== undefined ? String(card.value) : '-'}
              </div>
              {card.secondaryValue && (
                <div className="cardSecondaryValue" style={{ color: activeTheme.textSecondary }}>
                  {card.secondaryValue}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

