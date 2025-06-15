'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { useTheme } from '../../themeContext';
import ExcelJS from 'exceljs';
import axios from 'axios';
import './CustomerManagement.css';

const CustomerManagement = ({ region = 2 }) => {
  const { activeTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch customer data
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/customers');
      
      // Filter for customers with status false/0 and matching region
      const filteredData = response.data.filter(customer => 
        (customer.status === false || customer.status === 0) && 
        customer.region === parseInt(region)
      );
      
      setCustomerData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [region]);

  // Export to Excel and update statuses
  const exportToExcel = async () => {
    if (customerData.length === 0) {
      alert('No data to export');
      return;
    }
    
    try {
      setExportLoading(true);
      
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customers');
      
      // Define columns
      worksheet.columns = [
        { header: 'Receipt', key: 'receipt', width: 10 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Area Incharge', key: 'area_incharge', width: 15 },
        { header: 'Area', key: 'area_name', width: 15 },
        { header: 'Zone Incharge', key: 'zone_incharge', width: 15 },
        { header: 'Zone ', key: 'zone_name', width: 15 },
      ];
      
      // Add rows from filtered data
      customerData.forEach(customer => {
        worksheet.addRow({
          receipt: customer.receipt,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          area_incharge: customer.area_incharge,
          area_name: customer.area_name,
          zone_incharge: customer.zone_incharge,
          zone_name: customer.zone_name,
        });
      });
      
      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create download link
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${region === 1 ? 'Mumbai' : 'OutOfMumbai'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update statuses to true for all filtered customers
      const updatePromises = customerData.map(customer =>
        axios.put('/api/customers', {
          id: customer.id,
          status: true,
        })
      );
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      // Refresh data to reflect status changes
      await fetchCustomerData();
      
      setExportLoading(false);
      alert('Data exported successfully and customer statuses updated!');
    } catch (error) {
      console.error('Error exporting to Excel or updating statuses:', error);
      setExportLoading(false);
      alert(`Failed to export data: ${error.message || 'Unknown error'}`);
    }
  };

  const filteredData = customerData.filter(item =>
    Object.values(item).some(val =>
      val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div 
      className="customerManagementContainer"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div 
        className="customerManagementCard"
        style={{
          backgroundColor: activeTheme.bgSecondary,
          border: `1px solid ${activeTheme.border}`,
        }}
      >
        {/* Header Section */}
        <div 
          className="customerManagementHeader"
          style={{
            backgroundColor: activeTheme.pageHeaderBG,
            color: activeTheme.pageHeaderText,
          }}
        >
          <div className="headerContent">
            <div className="headerTitle">
              <h1 style={{ color: activeTheme.pageHeaderText }}>
                Pending Records - {region === 1 ? 'Mumbai' : 'Out of Mumbai'}
              </h1>
            </div>
            
            <div className="headerActions">
              {/* Search */}
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
              
              {/* Export Button */}
              <button 
                onClick={exportToExcel}
                style={{
                  backgroundColor: `${activeTheme.bgSecondary}33`,
                  color: activeTheme.pageHeaderText,
                  border: `1px solid ${activeTheme.pageHeaderText}33`,
                  opacity: exportLoading || customerData.length === 0 ? 0.7 : 1,
                  cursor: exportLoading || customerData.length === 0 ? 'not-allowed' : 'pointer',
                }}
                className="exportBtn"
                disabled={exportLoading || customerData.length === 0}
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
          
          {/* Stats */}
          <div 
            className="stats"
            style={{ borderTop: `1px solid ${activeTheme.pageHeaderText}33` }}
          >
            <div style={{ color: `${activeTheme.pageHeaderText}CC` }}>
              Total Records: <span style={{ color: activeTheme.pageHeaderText }}>{customerData.length}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="tableContainer">
          {/* Table Header */}
          <div 
            className="tableHeader"
            style={{
              backgroundColor: activeTheme.bgSecondary,
              borderBottom: `1px solid ${activeTheme.border}`,
            }}
          >
            <div className="tableRow">
              <div 
                className="tableCell cellId"
                style={{ color: activeTheme.textSecondary }}
              >
                Sr no.
              </div>
              <div 
                className="tableCell cellName"
                style={{ color: activeTheme.textSecondary }}
              >
                NAME
              </div>
              <div 
                className="tableCell cellPhone"
                style={{ color: activeTheme.textSecondary }}
              >
                PHONE
              </div>
              <div 
                className="tableCell cellEmail"
                style={{ color: activeTheme.textSecondary }}
              >
                EMAIL
              </div>
              <div 
                className="tableCell cellArea"
                style={{ color: activeTheme.textSecondary }}
              >
                AREA
              </div>
              <div 
                className="tableCell cellZone"
                style={{ color: activeTheme.textSecondary }}
              >
                ZONE
              </div>
              <div 
                className="tableCell cellStatus"
                style={{ color: activeTheme.textSecondary }}
              >
                STATUS
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="tableBody">
            {loading ? (
              <div className="loadingState">
                <div className="spinner"></div>
                <p style={{ color: activeTheme.textSecondary }}>Loading data...</p>
              </div>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <div 
                  key={item.id} 
                  className="dataRow"
                  style={{
                    borderBottom: `1px solid ${activeTheme.border}`,
                  }}
                >
                  {/* ID */}
                  <div className="tableCell cellId">
                    <span style={{ color: activeTheme.accentPrimary, fontWeight: 700 }}>
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Name */}
                  <div className="tableCell cellName">
                    <span style={{ color: activeTheme.textPrimary, fontWeight: 500 }}>
                      {item.name}
                    </span>
                  </div>
                  
                  {/* Phone */}
                  <div className="tableCell cellPhone">
                    <span style={{ color: activeTheme.textSecondary }}>
                      {item.phone || 'N/A'}
                    </span>
                  </div>
                  
                  {/* Email */}
                  <div className="tableCell cellEmail">
                    <span style={{ color: activeTheme.textSecondary }}>
                      {item.email || 'N/A'}
                    </span>
                  </div>
                  
                  {/* Area */}
                  <div className="tableCell cellArea">
                    <span style={{ color: activeTheme.textSecondary }}>
                      {item.area_name}
                    </span>
                  </div>
                  
                  {/* Zone */}
                  <div className="tableCell cellZone">
                    <span style={{ color: activeTheme.textSecondary }}>
                      {item.zone_name}
                    </span>
                  </div>
                  
                  {/* Status */}
                  <div className="tableCell cellStatus">
                    <span 
                      className="statusBadgePending"
                      style={{
                        backgroundColor: `${activeTheme.warning}20`,
                        color: activeTheme.warning,
                        border: `1px solid ${activeTheme.warning}40`,
                      }}
                    >
                      Pending
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

export default CustomerManagement;