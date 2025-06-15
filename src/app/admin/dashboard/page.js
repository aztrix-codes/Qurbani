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
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isLocked, setIsLocked] = useState(false); 
  const [lockLoading, setLockLoading] = useState(false); 

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
      setData(null); 
      setLastRefreshed(null); 
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLockStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/lock");
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

  const primaryButtonBg = activeTheme.accentPrimary;
  const primaryButtonText = activeTheme.bgPrimary; 
  const primaryButtonHoverBg = activeTheme.accentPrimaryDark || activeTheme.accentPrimary; 

  const secondaryButtonBg = activeTheme.bgSecondary;
  const secondaryButtonText = activeTheme.textPrimary;
  const secondaryButtonHoverBg = activeTheme.hover;
  
  const lockButtonBg = activeTheme.success;
  const lockButtonText = activeTheme.bgPrimary;
  const lockButtonHoverBg = activeTheme.success; 

  const unlockButtonBg = activeTheme.bgSecondary; 
  const unlockButtonText = activeTheme.textPrimary;
  const unlockButtonHoverBg = activeTheme.hover;

  return (
    <div className="dashboardContainer">
      <div className="dashboardHeader">
        <h2 className="dashboardTitle" style={{ color: activeTheme.textPrimary }}>Dashboard</h2>
        
        <div className="headerActions">
          <button 
            className="actionButton refreshButton" 
            onClick={fetchData} 
            disabled={loading} 
            style={{
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
            <RefreshCw size={16} color={secondaryButtonText} /> 
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
              backgroundColor: isLocked ? lockButtonBg : unlockButtonBg,
              color: isLocked ? lockButtonText : unlockButtonText,
              border: `1px solid ${isLocked ? lockButtonBg : activeTheme.border}`,
              opacity: lockLoading ? 0.6 : 1,
              cursor: lockLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !lockLoading && (e.currentTarget.style.backgroundColor = isLocked ? lockButtonHoverBg : unlockButtonHoverBg)}
            onMouseLeave={(e) => !lockLoading && (e.currentTarget.style.backgroundColor = isLocked ? lockButtonBg : unlockButtonBg)}
            title={isLocked ? 'Unlock Dashboard' : 'Lock Dashboard'}
          >
            {isLocked ? 
              <Lock size={16} color={lockButtonText} /> : 
              <Unlock size={16} color={unlockButtonText} />
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