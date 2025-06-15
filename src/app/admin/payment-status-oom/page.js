'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { useTheme } from '../../themeContext';
import ExcelJS from 'exceljs';
import axios from 'axios';
import './UserSummary.css';

const UserSummary = ({ region = 2 }) => {
  const { activeTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch user summary data
  const fetchUserSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user_summary');
      console.log('API Response:', response.data);
      setUserData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user summary data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSummary();
  }, []);

  // Filter data based on region and search term
  const filteredData = userData.filter(item => {
    // Include users with region = 0 (both regions) or matching region
    const hasRelevantRegion = item.region === 0 || item.region === region;

    // Apply search filter only if searchTerm is non-empty
    const matchesSearch = searchTerm.trim()
      ? Object.entries(item).some(([key, val]) =>
          ['user_name', 'area_name', 'zone_name'].includes(key) &&
          val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    console.log(`Filter Check (User ${item.user_id}, ${item.user_name}):`, {
      region,
      itemRegion: item.region,
      hasRelevantRegion,
      matchesSearch,
      searchTerm
    });

    return hasRelevantRegion && matchesSearch;
  });

  console.log('Filtered Data:', filteredData.map(item => ({
    user_id: item.user_id,
    user_name: item.user_name,
    region: item.region,
    shares: region === 1 ? item.shares_mumbai : item.shares_out_mumbai,
    paid_amount: region === 1 ? item.paid_amount_mumbai : item.paid_amount_out_mumbai,
    pending_amount: region === 1 ? item.pending_amount_mumbai : item.pending_amount_out_mumbai
  })));

  // Export to Excel
  const exportToExcel = async () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      setExportLoading(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('User Summary');

      worksheet.columns = [
        { header: 'Sr No.', key: 'sr_no', width: 10 },
        { header: 'Name', key: 'user_name', width: 20 },
        { header: 'Area', key: 'area_name', width: 15 },
        { header: 'Zone', key: 'zone_name', width: 15 },
        { header: `Shares (${region === 1 ? 'Mumbai' : 'Out of Mumbai'})`, key: 'shares', width: 15 },
        { header: `Paid Amount (${region === 1 ? 'Mumbai' : 'Out of Mumbai'})`, key: 'paid_amount', width: 20 },
        { header: `Pending Amount (${region === 1 ? 'Mumbai' : 'Out of Mumbai'})`, key: 'pending_amount', width: 20 },
      ];

      filteredData.forEach((user, index) => {
        worksheet.addRow({
          sr_no: index + 1,
          user_name: user.user_name,
          area_name: user.area_name,
          zone_name: user.zone_name,
          shares: region === 1 ? user.shares_mumbai : user.shares_out_mumbai,
          paid_amount: region === 1 ? user.paid_amount_mumbai : user.paid_amount_out_mumbai,
          pending_amount: region === 1 ? user.pending_amount_mumbai : user.pending_amount_out_mumbai,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `User_Summary_${region === 1 ? 'Mumbai' : 'OutOfMumbai'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportLoading(false);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setExportLoading(false);
      alert(`Failed to export data: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div 
      className="userSummaryContainer"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div 
        className="userSummaryCard"
        style={{
          backgroundColor: activeTheme.bgSecondary,
          border: `1px solid ${activeTheme.border}`,
        }}
      >
        <div 
          className="userSummaryHeader"
          style={{
            backgroundColor: activeTheme.pageHeaderBG,
            color: activeTheme.pageHeaderText,
          }}
        >
          <div className="headerContent">
            <div className="headerTitle">
              <h1 style={{ color: activeTheme.pageHeaderText }}>
                User Summary - {region === 1 ? 'Mumbai' : 'Out of Mumbai'}
              </h1>
            </div>
            
            <div className="headerActions">
              <div className="searchContainer">
                <Search 
                  size={16} 
                  color={`${activeTheme.pageHeaderText}B3`}
                  className="searchIcon" 
                />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: `${activeTheme.bgSecondary}33`,
                    color: activeTheme.pageHeaderText,
                    border: `1px solid ${activeTheme.pageHeaderText}33`,
                  }}
                  className="searchInput"
                />
              </div>
              
              <button 
                onClick={exportToExcel}
                style={{
                  backgroundColor: `${activeTheme.bgSecondary}33`,
                  color: activeTheme.pageHeaderText,
                  border: `1px solid ${activeTheme.pageHeaderText}33`,
                  opacity: exportLoading || filteredData.length === 0 ? 0.6 : 1,
                  cursor: exportLoading || filteredData.length === 0 ? 'not-allowed' : 'pointer',
                }}
                className="exportBtn"
                disabled={exportLoading || filteredData.length === 0}
              >
                {exportLoading ? (
                  <span>Exporting...</span>
                ) : (
                  <>
                    <Download size={16} />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div 
            className="stats"
            style={{ borderTop: `1px solid ${activeTheme.pageHeaderText}33` }}
          >
            <div style={{ color: `${activeTheme.pageHeaderText}CC` }}>
              Total Records: <span style={{ color: activeTheme.pageHeaderText }}>{filteredData.length}</span>
            </div>
          </div>
        </div>

        <div className="tableContainer">
          <div 
            className="tableHeader"
            style={{
              backgroundColor: activeTheme.bgSecondary,
              borderBottom: `1px solid ${activeTheme.border}`,
            }}
          >
            <div className="tableRow">
              <div className="tableCell cellSrNo" style={{ color: activeTheme.textSecondary }}>Sr No.</div>
              <div className="tableCell cellUserName" style={{ color: activeTheme.textSecondary }}>Name</div>
              <div className="tableCell cellArea" style={{ color: activeTheme.textSecondary }}>Area</div>
              <div className="tableCell cellZone" style={{ color: activeTheme.textSecondary }}>Zone</div>
              <div className="tableCell cellShares" style={{ color: activeTheme.textSecondary }}>
                Shares
              </div>
              <div className="tableCell cellPaidAmount" style={{ color: activeTheme.textSecondary }}>
                Paid Amount
              </div>
              <div className="tableCell cellPendingAmount" style={{ color: activeTheme.textSecondary }}>
                Pending Amount
              </div>
            </div>
          </div>

          <div className="tableBody">
            {loading ? (
              <div className="loadingState">
                <div className="spinner" style={{ borderTopColor: activeTheme.accentPrimary }}></div>
                <p style={{ color: activeTheme.textSecondary }}>Loading data...</p>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <div 
                  key={item.user_id} 
                  className="dataRow"
                  style={{ borderBottom: `1px solid ${activeTheme.border}` }}
                >
                  <div className="tableCell cellSrNo">
                    <span style={{ color: activeTheme.accentPrimary, fontWeight: 700 }}>{index + 1}</span>
                  </div>
                  <div className="tableCell cellUserName">
                    <span style={{ color: activeTheme.textPrimary, fontWeight: 500 }}>{item.user_name}</span>
                  </div>
                  <div className="tableCell cellArea">
                    <span style={{ color: activeTheme.textSecondary }}>{item.area_name}</span>
                  </div>
                  <div className="tableCell cellZone">
                    <span style={{ color: activeTheme.textSecondary }}>{item.zone_name}</span>
                  </div>
                  <div className="tableCell cellShares">
                    <span style={{ color: activeTheme.textSecondary }}>
                      {region === 1 ? item.shares_mumbai : item.shares_out_mumbai}
                    </span>
                  </div>
                  <div className="tableCell cellPaidAmount">
                    <span style={{ color: activeTheme.textSecondary }}>
                      {region === 1 ? item.paid_amount_mumbai : item.paid_amount_out_mumbai}
                    </span>
                  </div>
                  <div className="tableCell cellPendingAmount">
                    <span style={{ color: activeTheme.textSecondary }}>
                      {region === 1 ? item.pending_amount_mumbai : item.pending_amount_out_mumbai}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="emptyState">
                <div className="emptyIcon">
                  <Search size={48} color={activeTheme.textSecondary} />
                </div>
                <h3 style={{ color: activeTheme.textPrimary }}>No records found</h3>
                <p style={{ color: activeTheme.textSecondary }}>
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSummary;