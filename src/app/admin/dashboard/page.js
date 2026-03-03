'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './dashboard.css'; 
import { RefreshCw, Lock, Unlock } from 'lucide-react';
import { useTheme } from '../../themeContext';


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatTimestamp = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); 
};

function Dashboard() {
  const { activeTheme, isLight } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isLocked, setIsLocked] = useState(false); 
  const [lockLoading, setLockLoading] = useState(false); 

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setIsFetching(true);
    setError(null);
    console.log("Fetching dashboard data from /api/dashboard...");
    try {
      const response = await fetch("/api/dashboard", {
        headers: {
          'Authorization': 'admin'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result && result.length > 0) {
        setData(result[0]);
        setLastRefreshed(new Date()); 
        console.log("Data fetched successfully:", result[0]);
      } else {
        console.warn("API returned empty or unexpected data:", result);
        setData({}); 
        setError("Received no data from the server.");
        setLastRefreshed(null); 
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(`Failed to load dashboard data: ${err.message}`);
      // Don't clear data on refresh error so user can still see last known data
      if (isInitial) setData(null); 
      setLastRefreshed(null); 
    } finally {
      if (isInitial) setLoading(false);
      setIsFetching(false);
    }
  }, []);

  const fetchLockStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/lock", {
        headers: {
          'Authorization': 'admin'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result && result.length > 0) {
        setIsLocked(Boolean(result[0].lock_status));
        console.log("Lock status fetched:", result[0].lock_status);
      }
    } catch (err) {
      console.error("Error fetching lock status:", err);
    }
  }, []);

  const updateLockStatus = async (newLockStatus) => {
    setLockLoading(true);
    try {
      const response = await fetch("/api/lock", {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin'
        },
        body: JSON.stringify({ lock_status: newLockStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Lock status updated:", result);
      
      setIsLocked(Boolean(result.lock_status));
      
    } catch (err) {
      console.error("Error updating lock status:", err);
      setIsLocked(prev => !prev);
      setError(`Failed to update lock status: ${err.message}`);
    } finally {
      setLockLoading(false);
    }
  };

  const toggleLock = async () => {
    if (lockLoading) return; 
    
    const newLockStatus = !isLocked;
    
    setIsLocked(newLockStatus);
    
    await updateLockStatus(newLockStatus);
  };

  useEffect(() => {
    fetchData();
    fetchLockStatus(); 
  }, [fetchData, fetchLockStatus]);

  // Memoize card data to prevent recreation on every render
  const cardData = React.useMemo(() => {
    if (!data) return [];
    return [
      { title: 'Animals (Out of Mumbai)', value: data.animals_out_mumbai, secondaryValue: null, key: 'oom_animals' },
      { title: 'Shares (Out of Mumbai)', value: data.shares_out_mumbai, secondaryValue: formatCurrency(data.total_amount_out_mumbai), key: 'oom_shares' },
      { title: 'Paid (Out of Mumbai)', value: data.paid_out_mumbai, secondaryValue: formatCurrency(data.paid_amount_out_mumbai), key: 'oom_paid' },
      { title: 'Pending (Out of Mumbai)', value: data.pending_out_mumbai, secondaryValue: formatCurrency(data.pending_amount_out_mumbai), key: 'oom_pending' },
      { title: 'Animals (Mumbai)', value: data.animals_mumbai, secondaryValue: null, key: 'mum_animals' },
      { title: 'Shares (Mumbai)', value: data.shares_mumbai, secondaryValue: formatCurrency(data.total_amount_mumbai), key: 'mum_shares' },
      { title: 'Paid (Mumbai)', value: data.paid_mumbai, secondaryValue: formatCurrency(data.paid_amount_mumbai), key: 'mum_paid' },
      { title: 'Pending (Mumbai)', value: data.pending_mumbai, secondaryValue: formatCurrency(data.pending_amount_mumbai), key: 'mum_pending' },
    ];
  }, [data]);

  // Memoize theme styles to avoid recreation
  const themeStyles = React.useMemo(() => ({
    primaryBtn: {
      backgroundColor: activeTheme.accentPrimary,
      color: activeTheme.bgPrimary,
      hoverBg: activeTheme.accentPrimaryDark || activeTheme.accentPrimary
    },
    secondaryBtn: {
      backgroundColor: activeTheme.bgSecondary,
      color: activeTheme.textPrimary,
      border: `1px solid ${activeTheme.border}`,
      hoverBg: activeTheme.hover
    },
    lockBtn: {
      backgroundColor: activeTheme.success,
      color: activeTheme.bgPrimary,
      hoverBg: activeTheme.success
    },
    unlockBtn: {
      backgroundColor: activeTheme.bgSecondary,
      color: activeTheme.textPrimary,
      border: `1px solid ${activeTheme.border}`,
      hoverBg: activeTheme.hover
    }
  }), [activeTheme]);

  if (loading && !data) { 
    return <div className="loadingState" style={{ color: activeTheme.textSecondary }}>Loading Dashboard...</div>;
  }

  if (error && !data) { 
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

  return (
    <div className="dashboardContainer">
      <div className="dashboardHeader">
        <h2 className="dashboardTitle" style={{ color: activeTheme.textPrimary }}>Dashboard</h2>
        
        <div className="headerActions">
          <button 
            className="actionButton refreshButton" 
            onClick={() => fetchData(false)} 
            disabled={isFetching} 
            style={{
              ...themeStyles.secondaryBtn,
              opacity: isFetching ? 0.6 : 1,
              cursor: isFetching ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !isFetching && (e.currentTarget.style.backgroundColor = themeStyles.secondaryBtn.hoverBg)}
            onMouseLeave={(e) => !isFetching && (e.currentTarget.style.backgroundColor = themeStyles.secondaryBtn.backgroundColor)}
            title="Refresh Dashboard Data"
          >
            <RefreshCw size={16} color={themeStyles.secondaryBtn.color} className={isFetching ? 'animate-spin' : ''} /> 
            {lastRefreshed && (
              <span className="refreshTimestamp" style={{ color: activeTheme.textSecondary }}>
                {formatTimestamp(lastRefreshed)}
              </span>
            )}
          </button>

          <button 
            className="actionButton lockButton" 
            onClick={toggleLock} 
            disabled={lockLoading}
            style={{
              backgroundColor: isLocked ? themeStyles.lockBtn.backgroundColor : themeStyles.unlockBtn.backgroundColor,
              color: isLocked ? themeStyles.lockBtn.color : themeStyles.unlockBtn.color,
              border: isLocked ? `1px solid ${themeStyles.lockBtn.backgroundColor}` : themeStyles.unlockBtn.border,
              opacity: lockLoading ? 0.6 : 1,
              cursor: lockLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !lockLoading && (e.currentTarget.style.backgroundColor = isLocked ? themeStyles.lockBtn.hoverBg : themeStyles.unlockBtn.hoverBg)}
            onMouseLeave={(e) => !lockLoading && (e.currentTarget.style.backgroundColor = isLocked ? themeStyles.lockBtn.backgroundColor : themeStyles.unlockBtn.backgroundColor)}
            title={isLocked ? 'Unlock Dashboard' : 'Lock Dashboard'}
          >
            {isLocked ? 
              <Lock size={16} color={themeStyles.lockBtn.color} /> : 
              <Unlock size={16} color={themeStyles.unlockBtn.color} />
            }
            <span>{lockLoading ? 'Updating...' : (isLocked ? 'Locked' : 'Unlocked')}</span>
          </button>
        </div>
      </div>

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