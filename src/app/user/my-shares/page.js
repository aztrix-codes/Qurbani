'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../themeContext';
import { Search, List } from 'lucide-react';
import './style.css';

// Shimmer component defined directly inside the file
const Shimmer = () => {
    const { activeTheme } = useTheme();
    const shimmerRow = (
        <div className="table-row" style={{ borderBottomColor: activeTheme.border }}>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, width: '60%' }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, width: '80%' }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, width: '70%' }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, width: '50%', height: '1.5rem', borderRadius: '99px' }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, width: '60%' }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, width: '50%', height: '1.5rem', borderRadius: '99px' }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, width: '50%', height: '1.5rem', borderRadius: '99px' }} /></div>
        </div>
    );
    return (
         <div className="my-shares-container" style={{ backgroundColor: activeTheme.bgPrimary }}>
            <div className="content-wrapper" style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}>
                <div className="header">
                    <div className="header-left">
                        <div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, height: '2rem', width: '250px', borderRadius: '0.5rem' }} />
                        <div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, height: '1.25rem', width: '350px', marginTop: '0.5rem', borderRadius: '0.5rem' }} />
                    </div>
                     <div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, height: '3rem', width: '350px', borderRadius: '0.5rem' }} />
                </div>
                <div className="table-container">
                    <div className="table-header" style={{ borderBottomColor: activeTheme.border, color: activeTheme.textSecondary }}>
                        <div className="table-cell">Receipt #</div>
                        <div className="table-cell">Name</div>
                        <div className="table-cell">Phone</div>
                        <div className="table-cell">Type</div>
                        <div className="table-cell">Region</div>
                        <div className="table-cell">Payment</div>
                        <div className="table-cell">Verified</div>
                    </div>
                    <div className="table-body">
                        {Array(8).fill(0).map((_, index) => <React.Fragment key={index}>{shimmerRow}</React.Fragment>)}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function MySharesPage() {
  const { activeTheme } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    try {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      } else {
        // Handle case where user data is not found, maybe redirect
        console.warn("User data not found in local storage.");
      }
    } catch (e) {
      console.error("Could not parse user data from local storage", e);
    }
    

    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchCustomers();
  }, []);

  const userCustomers = userData
    ? customers.filter(customer => customer.user_name === userData.name)
    : [];

  const filteredCustomers = userCustomers.filter(customer =>
    (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.receipt?.toString() || '').includes(searchTerm) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const getRegionText = (region) => {
    if (region === 1) return 'Mumbai';
    if (region === 2) return 'Out of Mumbai';
    return 'N/A';
  };

  const getTypePill = (type) => {
    let style = {};
    let text = '';
    switch (type) {
      case 1:
        style = { backgroundColor: `${activeTheme.accentPrimary}20`, color: activeTheme.accentPrimary };
        text = 'Qurbani';
        break;
      case 2:
        style = { backgroundColor: `${activeTheme.info}20`, color: activeTheme.info };
        text = 'Aqeeqah (Boy)';
        break;
      case 3:
        style = { backgroundColor: `${activeTheme.highlight}20`, color: activeTheme.accentSecondary };
        text = 'Aqeeqah (Girl)';
        break;
      default:
        return null;
    }
    return <span className="type-pill" style={style}>{text}</span>;
  };
  
  const getStatusPill = (status, type) => {
    let text = '';
    let style = {};
    if (type === 'payment') {
        text = status ? 'Paid' : 'Unpaid';
        style = {
            backgroundColor: status ? `${activeTheme.success}20` : `${activeTheme.error}20`,
            color: status ? activeTheme.success : activeTheme.error,
        };
    } else { // 'verified'
        text = status ? 'Verified' : 'Pending';
        style = {
            backgroundColor: status ? `${activeTheme.success}20` : `${activeTheme.warning}20`,
            color: status ? activeTheme.success : activeTheme.warning,
        };
    }
    return <span className="status-pill" style={style}>{text}</span>;
  };

  if (loading) {
    return <Shimmer />;
  }
  
  return (
    <div className="my-shares-container" style={{ backgroundColor: activeTheme.bgPrimary }}>
      <div className="content-wrapper" style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}>
        <div className="header">
          <div className="header-left">
            <h1 className="title" style={{ color: activeTheme.textPrimary }}>My Submitted Shares</h1>
            <p className="subtitle" style={{ color: activeTheme.textSecondary }}>A list of all the shares you have submitted.</p>
          </div>
          <div className="search-container">
            <Search className="search-icon" style={{ color: activeTheme.textSecondary }} size={20} />
            <input
              type="text"
              placeholder="Search by name, receipt, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                backgroundColor: activeTheme.bgPrimary,
                color: activeTheme.textPrimary,
                borderColor: activeTheme.border
              }}
            />
          </div>
        </div>

        {error && <p className="error-message" style={{ color: activeTheme.error }}>Error: {error}</p>}

        <div className="table-container">
          <div className="table-header" style={{ borderBottomColor: activeTheme.border, color: activeTheme.textSecondary }}>
            <div className="table-cell">Receipt #</div>
            <div className="table-cell">Name</div>
            <div className="table-cell">Phone</div>
            <div className="table-cell">Type</div>
            <div className="table-cell">Region</div>
            <div className="table-cell">Payment</div>
            <div className="table-cell">Verified</div>
          </div>
          <div className="table-body">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <div className="table-row" key={customer.id} style={{ borderBottomColor: activeTheme.border }}>
                  <div className="table-cell receipt-cell" style={{ color: activeTheme.accentPrimary }}>{customer.receipt}</div>
                  <div className="table-cell name-cell" style={{ color: activeTheme.textPrimary }}>{customer.name}</div>
                  <div className="table-cell" style={{ color: activeTheme.textSecondary }}>{customer.phone || 'N/A'}</div>
                  <div className="table-cell">{getTypePill(customer.type)}</div>
                  <div className="table-cell" style={{ color: activeTheme.textSecondary }}>{getRegionText(customer.region)}</div>
                  <div className="table-cell">{getStatusPill(customer.payment_status, 'payment')}</div>
                  <div className="table-cell">{getStatusPill(customer.status, 'verified')}</div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ color: activeTheme.textSecondary }}>
                <List size={48} />
                <p>No shares found.</p>
                {searchTerm && <p>Try adjusting your search.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
