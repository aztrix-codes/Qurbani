
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Search, FileText, Eye, Camera, Upload } from 'lucide-react';
import { useTheme } from '../../themeContext';
import './ReceiptScreen.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const ReceiptScreen = ({ region = 1 }) => {
  const { activeTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [users, setUsers] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [showEyeModal, setShowEyeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [userViewDetail, setUserViewDetail] = useState(null);
  const [amountPerShare, setAmountPerShare] = useState(0);
  const [howMuchPaying, setHowMuchPaying] = useState(0);
  const [paidBy, setPaidBy] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [webcamReady, setWebcamReady] = useState(false);
  const [webcamLoading, setWebcamLoading] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  const [webcamReloadKey, setWebcamReloadKey] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingShares, setPendingShares] = useState(0); // Add this line
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const webcamVideoConstraints = React.useMemo(
    () => ({
      width: { ideal: 720 },
      height: { ideal: 960 },
      aspectRatio: 3 / 4,
      facingMode: { ideal: 'environment' },
    }),
    []
  );

  const resetWebcamState = useCallback(() => {
    setWebcamEnabled(false);
    setWebcamReady(false);
    setWebcamLoading(false);
    setWebcamError('');
  }, []);

  const startWebcam = useCallback(() => {
    setSelectedImage(null);
    setWebcamError('');
    setWebcamReady(false);
    setWebcamLoading(true);
    setWebcamEnabled(true);
    setWebcamReloadKey((current) => current + 1);
  }, []);

  const reloadWebcam = useCallback(() => {
    setWebcamError('');
    setWebcamReady(false);
    setWebcamLoading(true);
    setWebcamReloadKey((current) => current + 1);
  }, []);


  // Fetch areas
  const fetchAreas = useCallback(async () => {
    try {
      const response = await fetch('/api/areas', {
        headers: { Authorization: 'admin' },
      });
      if (!response.ok) throw new Error('Failed to fetch areas');
      const data = await response.json();
      setAreasList(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  }, []);

  // Fetch users (Optimized with region filter)
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/users?region=${region}`, {
        headers: { Authorization: 'admin' },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [region]);

  // Fetch customers (Optimized with region and status filter)
  const fetchCustomerData = useCallback(async () => {
    try {
      const response = await fetch(`/api/customers?region=${region}&status=true`, {
        headers: { Authorization: 'admin' },
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomerData(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, [region]);

  // Fetch receipts
  const fetchReceipts = useCallback(async () => {
    try {
      const response = await fetch('/api/receipts', {
        headers: { Authorization: 'admin' },
      });
      if (!response.ok) throw new Error('Failed to fetch receipts');
      const data = await response.json();
      setReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  }, []);

  // Create receipt
  const createReceipt = async (receiptData) => {
    try {
      setUploadingImage(true);
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'admin',
        },
        body: JSON.stringify(receiptData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create receipt');
      }

      await fetchReceipts();
      await fetchCustomerData();
      return data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Initial data fetch (Reduced polling to 5 mins)
  useEffect(() => {
    fetchAreas();
    fetchUsers();
    fetchCustomerData();
    fetchReceipts();
    const interval = setInterval(() => {
      fetchCustomerData();
      fetchReceipts();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchAreas, fetchUsers, fetchCustomerData, fetchReceipts]);

  // Set amount per share
  useEffect(() => {
    if (userViewDetail?.rate_r1 !== undefined && userViewDetail?.rate_r1 !== null) {
      setAmountPerShare(Math.ceil(parseFloat(userViewDetail.rate_r1) || 0));
    }
    if (selectedRowData) {
      const totalShares = selectedRowData?.length || 0;
      const sharesPaid = selectedRowData
        ? selectedRowData.filter((customer) => customer.payment_status).length
        : 0;
      setPendingShares(totalShares - sharesPaid);
    }
  }, [userViewDetail, selectedRowData]);

  // Get zone name from area (Memoized)
  const getZoneNameFromArea = useCallback((areaName) => {
    if (!areaName) return 'N/A';
    const matchedArea = areasList.find((area) => area.name === areaName);
    return matchedArea ? matchedArea.zone_name : 'Mumbai';
  }, [areasList]);

  // Modal handlers
  const handleEyeClick = (rowData, item) => {
    setSelectedRowData(rowData);
    setUserViewDetail(item);
    setShowEyeModal(true);
  };

  const handleReceiptClick = (rowData, item) => {
    setSelectedRowData(rowData);
    setUserViewDetail(item);
    setHowMuchPaying(0);
    setPaidBy('');
    setCollectedBy('');
    setSelectedImage(null);
    setFormErrors({});
    resetWebcamState();
    setShowReceiptModal(true);
  };

  const closeEyeModal = () => {
    setShowEyeModal(false);
    setSelectedRowData(null);
    setUserViewDetail(null);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedRowData(null);
    setUserViewDetail(null);
    setFormErrors({});
    resetWebcamState();
  };

  // Image handlers
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        resetWebcamState();
        setFormErrors({ ...formErrors, image: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (!webcamRef.current || !webcamReady) {
      setWebcamError('Camera preview is not ready yet. Try reloading the camera.');
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setSelectedImage(imageSrc);
      setWebcamError('');
      setFormErrors({ ...formErrors, image: '' });
      resetWebcamState();
    } else {
      setWebcamError('Unable to capture photo. Try reloading the camera preview.');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!Number.isInteger(howMuchPaying) || howMuchPaying < 1) {
      errors.howMuchPaying = 'Paying count must be at least 1';
    }

    if (howMuchPaying > pendingShares) {
      errors.howMuchPaying = `Cannot exceed pending shares (${pendingShares})`;
    }

    if (!paidBy.trim()) {
      errors.paidBy = 'Paid by is required';
    }

    if (!collectedBy.trim()) {
      errors.collectedBy = 'Collected by is required';
    }

    if (!selectedImage) {
      errors.image = 'Image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWebcamReady = () => {
    setWebcamReady(true);
    setWebcamLoading(false);
    setWebcamError('');
  };

  const handleWebcamError = (error) => {
    console.error('Webcam error:', error);
    setWebcamReady(false);
    setWebcamLoading(false);
    setWebcamError(
      error?.name === 'NotAllowedError'
        ? 'Camera access was blocked. Allow permission and reload the camera.'
        : 'Camera preview could not start. Try reloading the camera. If this device has no rear camera, the browser will fall back to the default camera.'
    );
  };

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const amount = Math.ceil(howMuchPaying * amountPerShare);
      const area = userViewDetail?.area_name;
      const zone = getZoneNameFromArea(area);
      const unpaidCustomers = (selectedRowData || []).filter(
        (customer) => !customer.payment_status
      );
      const customersToUpdate = unpaidCustomers.slice(0, howMuchPaying);
      const customerIdsToUpdate = customersToUpdate.map((customer) => customer.id);

      if (customerIdsToUpdate.length !== howMuchPaying) {
        throw new Error('Selected shares are no longer available. Please try again.');
      }

      const receiptData = {
        user_name: userViewDetail?.name,
        paid_by: paidBy.trim(),
        collected_by: collectedBy.trim(),
        img: selectedImage,
        rate: parseFloat(amountPerShare),
        hissa: parseInt(howMuchPaying, 10),
        total_amt: parseFloat(amount),
        region,
        area_name: area,
        area_incharge:
          areasList.find((area) => area.name === userViewDetail?.area_name)
            ?.area_incharge || '',
        zone_name: zone,
        zone_incharge: userViewDetail?.zone_incharge || '',
        phone: userViewDetail?.phone || null,
        email: userViewDetail?.email || null,
        customer_ids: customerIdsToUpdate,
      };

      await createReceipt(receiptData);

      setHowMuchPaying(0);
      setPaidBy('');
      setCollectedBy('');
    setSelectedImage(null);
    setFormErrors({});
    resetWebcamState();
    alert(
      `Payment of ${formatCurrency(amount)} for ${howMuchPaying} shares recorded successfully!`
    );
      closeReceiptModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Filter data for Mumbai region (Memoized)
  const filteredUsers = React.useMemo(() => {
    return users.filter((item) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        String(item.name || '').toLowerCase().includes(searchStr) ||
        String(item.area_name || '').toLowerCase().includes(searchStr) ||
        String(item.zone_name || '').toLowerCase().includes(searchStr)
      );
    });
  }, [users, searchTerm]);

  // Group customers by user (Optimized with Map and useMemo)
  const groupedCustomers = React.useMemo(() => {
    // 1. Create a map of customers by user name for O(1) lookup
    const customerMap = new Map();
    customerData.forEach(customer => {
      if (!customerMap.has(customer.user_name)) {
        customerMap.set(customer.user_name, []);
      }
      customerMap.get(customer.user_name).push(customer);
    });

    // 2. Map filtered users to their customers
    return filteredUsers.map(user => ({
      user,
      customers: customerMap.get(user.name) || []
    }));
  }, [filteredUsers, customerData]);

  // Calculate statistics (Memoized)
  const stats = React.useMemo(() => {
    const totalU = filteredUsers.length;
    const totalC = customerData.length; // Region/Status already filtered by API
    const paidC = customerData.filter(c => c.payment_status).length;
    return {
      totalUsers: totalU,
      totalCustomers: totalC,
      paidCustomers: paidC,
      pendingCustomers: totalC - paidC
    };
  }, [filteredUsers, customerData]);

  // Memoize theme styles to prevent unnecessary garbage collection and pressure
  const themeStyles = React.useMemo(() => ({
    container: { backgroundColor: activeTheme.bgPrimary },
    card: {
      backgroundColor: activeTheme.bgSecondary,
      border: `1px solid ${activeTheme.border}`,
    },
    header: {
      backgroundColor: activeTheme.pageHeaderBG,
      color: activeTheme.pageHeaderText,
    },
    statsBorder: { borderTop: `1px solid ${activeTheme.pageHeaderText}33` },
    statsLabel: { color: `${activeTheme.pageHeaderText}B3` },
    statsValue: { color: activeTheme.pageHeaderText },
    tableHeader: {
      backgroundColor: activeTheme.bgSecondary,
      borderBottom: `1px solid ${activeTheme.border}`,
    },
    tableLabel: { color: activeTheme.textSecondary },
    dataRowBorder: { borderBottom: `1px solid ${activeTheme.border}20` },
    textPrimary: { color: activeTheme.textPrimary },
    accentPrimary: { color: activeTheme.accentPrimary },
    badge: (hasPaid) => ({
      backgroundColor: hasPaid ? `${activeTheme.success}20` : `${activeTheme.highlight}30`,
      color: hasPaid ? activeTheme.success : activeTheme.accentPrimary,
    })
  }), [activeTheme]);

  return (
    <div
      className="receiptScreenContainer"
      style={themeStyles.container}
    >
      <div
        className="receiptScreenCard"
        style={themeStyles.card}
      >
        {/* Header Section */}
        <div
          className="receiptScreenHeader"
          style={themeStyles.header}
        >
          <div className="headerContent">
            <div className="headerTitle">
              <h1 style={{ color: activeTheme.pageHeaderText }}>
                Receipt Management - {region === 1 ? 'Mumbai' : 'Out of Mumbai'}
              </h1>
            </div>
            <div className="headerActions">
              <div className="searchContainer">
                <Search
                  size={16}
                  color={activeTheme.pageHeaderText}
                  className="searchIcon"
                />
                <input
                  type="text"
                  placeholder="Search users or areas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: `${activeTheme.bgSecondary}80`,
                    color: activeTheme.pageHeaderText,
                    border: `1px solid ${activeTheme.border}`,
                  }}
                  className="searchInput"
                />
              </div>
            </div>
          </div>
          <div
            className="stats"
            style={{ borderTop: `1px solid ${activeTheme.pageHeaderText}30` }}
          >
            <div style={{ color: `${activeTheme.pageHeaderText}90` }}>
              Total Users:{' '}
              <span style={{ color: activeTheme.pageHeaderText }}>{stats.totalUsers}</span>
            </div>
            <div style={{ color: `${activeTheme.pageHeaderText}90` }}>
              Total Customers:{' '}
              <span style={{ color: activeTheme.pageHeaderText }}>
                {stats.totalCustomers}
              </span>
            </div>
            <div style={{ color: `${activeTheme.pageHeaderText}90` }}>
              Paid:{' '}
              <span style={{ color: activeTheme.pageHeaderText }}>{stats.paidCustomers}</span>
            </div>
            <div style={{ color: `${activeTheme.pageHeaderText}90` }}>
              Pending:{' '}
              <span style={{ color: activeTheme.pageHeaderText }}>{stats.pendingCustomers}</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="tableContainer">
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
                ID
              </div>
              <div
                className="tableCell cellZone"
                style={{ color: activeTheme.textSecondary }}
              >
                ZONE
              </div>
              <div
                className="tableCell cellArea"
                style={{ color: activeTheme.textSecondary }}
              >
                AREA
              </div>
              <div
                className="tableCell cellSubmitted"
                style={{ color: activeTheme.textSecondary }}
              >
                SUBMITTED BY
              </div>
              <div
                className="tableCell cellHissa"
                style={{ color: activeTheme.textSecondary }}
              >
                HISSA
              </div>
              <div
                className="tableCell cellReceipt"
                style={{ color: activeTheme.textSecondary }}
              >
                RECEIPT
              </div>
              <div
                className="tableCell cellActions"
                style={{ color: activeTheme.textSecondary }}
              >
                VIEW
              </div>
            </div>
          </div>
          <div className="tableBody">
            {groupedCustomers.length > 0 ? (
              groupedCustomers.map((group, index) => {
                const totalShares = group.customers.length;
                const sharesPaid = group.customers.filter(
                  (customer) => customer.payment_status
                ).length;
                const zoneName = getZoneNameFromArea(group.user.area_name);

                return (
                  <div
                    key={group.user.id}
                    className="dataRow"
                    style={{ borderBottom: `1px solid ${activeTheme.border}20` }}
                  >
                    <div
                      className="tableCell cellId"
                      style={{ color: activeTheme.textPrimary }}
                    >
                      {index + 1}
                    </div>
                    <div
                      className="tableCell cellZone"
                      style={{ color: activeTheme.textPrimary }}
                    >
                      {zoneName}
                    </div>
                    <div
                      className="tableCell cellArea"
                      style={{ color: activeTheme.textPrimary }}
                    >
                      {group.user.area_name}
                    </div>
                    <div
                      className="tableCell cellSubmitted"
                      style={{ color: activeTheme.textPrimary }}
                    >
                      {group.user.name}
                    </div>
                    <div className="tableCell cellHissa">
                      <div
                        className="hissaBadge"
                        style={{
                          backgroundColor: `${activeTheme.highlight}30`,
                          color: activeTheme.accentPrimary,
                        }}
                      >
                        {sharesPaid > 0 ? `${sharesPaid}/${totalShares}` : totalShares}
                      </div>
                    </div>
                    <div className="tableCell cellReceipt">
                      <button
                        onClick={() =>
                          handleReceiptClick(group.customers, group.user)
                        }
                        className="actionButton"
                        style={{
                          backgroundColor: `${activeTheme.highlight}30`,
                          color: activeTheme.accentPrimary,
                        }}
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                    <div className="tableCell cellActions">
                      <button
                        onClick={() =>
                          handleEyeClick(group.customers, group.user)
                        }
                        className="actionButton"
                        style={{
                          backgroundColor: `${activeTheme.hover}30`,
                          color: activeTheme.textPrimary,
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="emptyState">
                <div
                  className="emptyIcon"
                  style={{
                    backgroundColor: `${activeTheme.highlight}20`,
                    color: activeTheme.accentPrimary,
                  }}
                >
                  <Search size={24} />
                </div>
                <h3 style={{ color: activeTheme.textPrimary }}>No records found</h3>
                <p style={{ color: activeTheme.textSecondary }}>
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Eye Modal */}
      {showEyeModal && (
        <div
          className="modalOverlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="modalContent"
            style={{ backgroundColor: activeTheme.bgPrimary }}
          >
            <div
              className="modalHeader"
              style={{ borderBottom: `1px solid ${activeTheme.border}` }}
            >
              <h2 className="modalHeaderTitle" style={{ color: activeTheme.textPrimary }}>
                View Record Details
              </h2>
              <button
                className="closeButton"
                onClick={closeEyeModal}
                style={{ color: activeTheme.textSecondary }}
              >
                &times;
              </button>
            </div>
            <div className="modalBody">
              <div className="recordDetails">
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Zone
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {getZoneNameFromArea(userViewDetail?.area_name)}
                  </div>
                </div>
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Area
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {userViewDetail?.area_name || 'N/A'}
                  </div>
                </div>
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Area Incharge
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {userViewDetail?.area_incharge || 'N/A'}
                  </div>
                </div>
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Incharge
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {userViewDetail?.name || 'N/A'}
                  </div>
                </div>
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Contact Number
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {userViewDetail?.phone || 'N/A'}
                  </div>
                </div>
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Email
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {userViewDetail?.email || 'N/A'}
                  </div>
                </div>
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Total Share Count
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {selectedRowData?.length || 0} Share(s)
                  </div>
                </div>
                <div className="recordItem">
                  <div className="recordLabel" style={{ color: activeTheme.textSecondary }}>
                    Total Animal Count
                  </div>
                  <div className="recordValue" style={{ color: activeTheme.textPrimary }}>
                    {Math.floor((selectedRowData?.length || 0) / 7)} Animal(s)
                  </div>
                </div>
              </div>

              <div
                className="recordTable"
                style={{ border: `1px solid ${activeTheme.border}` }}
              >
                <div
                  className="recordTableHeader"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderBottom: `1px solid ${activeTheme.border}`,
                  }}
                >
                  <div className="recordTableRow">
                    <div
                      className="recordTableCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Share Count
                    </div>
                    <div
                      className="recordTableCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Receipt ID
                    </div>
                    <div
                      className="recordTableCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Name
                    </div>
                    <div
                      className="recordTableCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Purpose
                    </div>
                    <div
                      className="recordTableCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Status
                    </div>
                  </div>
                </div>
                <div className="recordTableBody">
                  {selectedRowData && selectedRowData.length > 0 ? (
                    selectedRowData.map((record, index) => (
                      <div
                        key={record.id}
                        className="recordTableRow"
                        style={{ borderBottom: `1px solid ${activeTheme.border}20` }}
                      >
                        <div
                          className="recordTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {index + 1}
                        </div>
                        <div
                          className="recordTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {record.receipt || 'N/A'}
                        </div>
                        <div
                          className="recordTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {record.name}
                        </div>
                        <div
                          className="recordTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {record.type === 1 ? 'Qurbani' : record.type === 2 ? 'Aqeeqah Boy' : 'Aqeeqah Girl'}
                        </div>
                        <div className="recordTableCell">
                          <div
                            className="statusBadge"
                            style={{
                              backgroundColor: record.payment_status
                                ? `${activeTheme.success}20`
                                : `${activeTheme.error}20`,
                              color: record.payment_status
                                ? activeTheme.success
                                : activeTheme.error,
                            }}
                          >
                            {record.payment_status ? 'Paid' : 'Unpaid'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="noData"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      No records found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div
          className="modalOverlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="modalContent"
            style={{ backgroundColor: activeTheme.bgPrimary }}
          >
            <div
              className="modalHeader"
              style={{ borderBottom: `1px solid ${activeTheme.border}` }}
            >
              <h2 className="modalHeaderTitle" style={{ color: activeTheme.textPrimary }}>
                Receipt Records
              </h2>
              <button
                className="closeButton"
                onClick={closeReceiptModal}
                style={{ color: activeTheme.textSecondary }}
              >
                &times;
              </button>
            </div>
            <div className="modalBody">
              <div
                className="formSection"
                style={{ backgroundColor: activeTheme.bgSecondary }}
              >
                <form onSubmit={handleFormSubmit}>
                  <div className="receiptFormHeader">
                    <h3 style={{ color: activeTheme.textPrimary }}>Add New Receipt</h3>
                    <button
                      type="submit"
                      className="submitButton"
                      style={{
                        backgroundColor: activeTheme.accentPrimary,
                        color: activeTheme.bgPrimary,
                      }}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Submitting Receipt...' : 'Submit Receipt'}
                    </button>
                  </div>
                  <div className="receiptEntryLayout">
                    {(() => {
                      const totalShares = selectedRowData?.length || 0;
                      const sharesPaid = selectedRowData
                        ? selectedRowData.filter((customer) => customer.payment_status)
                            .length
                        : 0;
                      const pendingShares = totalShares - sharesPaid;
                      const totalAmount = Math.ceil(totalShares * amountPerShare);
                      const pendingAmount = Math.ceil(pendingShares * amountPerShare);
                      const payingAmount = Math.ceil(howMuchPaying * amountPerShare);

                      return (
                        <div className="receiptFieldsPanel">
                          <div
                            className="fieldSectionCard"
                            style={{
                              backgroundColor: `${activeTheme.bgPrimary}85`,
                              border: `1px solid ${activeTheme.border}`,
                            }}
                          >
                            <div className="fieldSectionHeader">
                              <h4 style={{ color: activeTheme.textPrimary }}>Share Summary</h4>
                              <p style={{ color: activeTheme.textSecondary }}>
                                Review the overall shares and remaining amount before collecting.
                              </p>
                            </div>
                            <div className="summaryGrid">
                              <div className="formGroup">
                                <label htmlFor="totalShares" style={{ color: activeTheme.textSecondary }}>
                                  Total Shares
                                </label>
                                <input id="totalShares" type="text" value={totalShares} readOnly className="formInput" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.border}` }} />
                              </div>
                              <div className="formGroup">
                                <label htmlFor="amountPerShare" style={{ color: activeTheme.textSecondary }}>
                                  Amount Per Share
                                </label>
                                <input id="amountPerShare" type="text" value={formatCurrency(amountPerShare)} readOnly className="formInput" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.border}` }} />
                              </div>
                              <div className="formGroup">
                                <label htmlFor="totalAmount" style={{ color: activeTheme.textSecondary }}>
                                  Total Amount
                                </label>
                                <input id="totalAmount" type="text" value={formatCurrency(totalAmount)} readOnly className="formInput" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.border}` }} />
                              </div>
                              <div className="formGroup">
                                <label htmlFor="paidShares" style={{ color: activeTheme.textSecondary }}>
                                  Paid Shares
                                </label>
                                <input id="paidShares" type="text" value={sharesPaid} readOnly className="formInput" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.border}` }} />
                              </div>
                              <div className="formGroup">
                                <label htmlFor="pendingShares" style={{ color: activeTheme.textSecondary }}>
                                  Pending Shares
                                </label>
                                <input id="pendingShares" type="text" value={pendingShares} readOnly className="formInput" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.border}` }} />
                              </div>
                              <div className="formGroup">
                                <label htmlFor="pendingAmount" style={{ color: activeTheme.textSecondary }}>
                                  Pending Amount
                                </label>
                                <input id="pendingAmount" type="text" value={formatCurrency(pendingAmount)} readOnly className="formInput" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.border}` }} />
                              </div>
                            </div>
                          </div>

                          <div
                            className="fieldSectionCard"
                            style={{
                              backgroundColor: `${activeTheme.bgPrimary}85`,
                              border: `1px solid ${activeTheme.border}`,
                            }}
                          >
                            <div className="fieldSectionHeader">
                              <h4 style={{ color: activeTheme.textPrimary }}>Collection Details</h4>
                              <p style={{ color: activeTheme.textSecondary }}>
                                Enter how many shares are being paid now and who handled the payment.
                              </p>
                            </div>
                            <div className="actionGrid">
                              <div className="formGroup">
                                <label htmlFor="howMuchPaying" style={{ color: activeTheme.textSecondary }}>
                                  Paying Count <span style={{ color: activeTheme.error }}>*</span>
                                </label>
                                <input
                                  id="howMuchPaying"
                                  type="number"
                                  min="0"
                                  max={pendingShares}
                                  value={howMuchPaying}
                                  onChange={(e) => {
                                    const value = Math.min(
                                      pendingShares,
                                      Math.max(0, parseInt(e.target.value) || 0)
                                    );
                                    setHowMuchPaying(value);
                                    setFormErrors({ ...formErrors, howMuchPaying: null });
                                  }}
                                  className="formInput"
                                  style={{
                                    backgroundColor: activeTheme.bgPrimary,
                                    color: activeTheme.textPrimary,
                                    border: `1px solid ${
                                      formErrors.howMuchPaying
                                        ? activeTheme.error
                                        : activeTheme.border
                                    }`,
                                  }}
                                  disabled={pendingShares <= 0}
                                />
                                {formErrors.howMuchPaying && (
                                  <div className="errorMessage" style={{ color: activeTheme.error }}>
                                    {formErrors.howMuchPaying}
                                  </div>
                                )}
                              </div>

                              <div className="formGroup">
                                <label htmlFor="payingAmount" style={{ color: activeTheme.textSecondary }}>
                                  Paying Amount
                                </label>
                                <input id="payingAmount" type="text" value={formatCurrency(payingAmount)} readOnly className="formInput" style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, border: `1px solid ${activeTheme.border}` }} />
                              </div>

                              <div className="formGroup">
                                <label htmlFor="paidBy" style={{ color: activeTheme.textSecondary }}>
                                  Paid By <span style={{ color: activeTheme.error }}>*</span>
                                </label>
                                <input
                                  id="paidBy"
                                  type="text"
                                  value={paidBy}
                                  onChange={(e) => {
                                    setPaidBy(e.target.value);
                                    setFormErrors({ ...formErrors, paidBy: null });
                                  }}
                                  className="formInput"
                                  style={{
                                    backgroundColor: activeTheme.bgPrimary,
                                    color: activeTheme.textPrimary,
                                    border: `1px solid ${
                                      formErrors.paidBy ? activeTheme.error : activeTheme.border
                                    }`,
                                  }}
                                />
                                {formErrors.paidBy && (
                                  <div className="errorMessage" style={{ color: activeTheme.error }}>
                                    {formErrors.paidBy}
                                  </div>
                                )}
                              </div>

                              <div className="formGroup">
                                <label htmlFor="collectedBy" style={{ color: activeTheme.textSecondary }}>
                                  Collected By <span style={{ color: activeTheme.error }}>*</span>
                                </label>
                                <input
                                  id="collectedBy"
                                  type="text"
                                  value={collectedBy}
                                  onChange={(e) => {
                                    setCollectedBy(e.target.value);
                                    setFormErrors({ ...formErrors, collectedBy: null });
                                  }}
                                  className="formInput"
                                  style={{
                                    backgroundColor: activeTheme.bgPrimary,
                                    color: activeTheme.textPrimary,
                                    border: `1px solid ${
                                      formErrors.collectedBy
                                        ? activeTheme.error
                                        : activeTheme.border
                                    }`,
                                  }}
                                />
                                {formErrors.collectedBy && (
                                  <div className="errorMessage" style={{ color: activeTheme.error }}>
                                    {formErrors.collectedBy}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="imageUploadSection">
                      <div className="imagePreviewPanel">
                        <div
                          className="imagePreview"
                          style={{
                            backgroundColor: `${activeTheme.bgSecondary}50`,
                            border: `1px dashed ${activeTheme.border}`,
                          }}
                        >
                          {selectedImage ? (
                            <img
                              src={selectedImage}
                              alt="Selected"
                              className="previewImage"
                            />
                          ) : webcamEnabled ? (
                            <div className="webcamPreviewShell">
                              <Webcam
                                key={webcamReloadKey}
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width={360}
                                height={480}
                                className="webcamPreview"
                                videoConstraints={webcamVideoConstraints}
                                onUserMedia={handleWebcamReady}
                                onUserMediaError={handleWebcamError}
                              />
                              {webcamLoading && (
                                <div
                                  className="webcamStatus"
                                  style={{ color: activeTheme.textSecondary }}
                                >
                                  Starting camera preview...
                                </div>
                              )}
                              {webcamError && (
                                <div
                                  className="webcamStatus webcamStatusError"
                                  style={{ color: activeTheme.error }}
                                >
                                  {webcamError}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className="placeholderImage"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              <Upload size={48} />
                              <div>No Photo Selected</div>
                            </div>
                          )}
                        </div>
                        {formErrors.image && (
                          <div
                            className="errorMessage"
                            style={{ color: activeTheme.error, textAlign: 'center' }}
                          >
                            {formErrors.image}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          style={{ display: 'none' }}
                        />
                        <div className="imageActions">
                          <button
                            type="button"
                            onClick={handleFileUpload}
                            className="button"
                            style={{
                              backgroundColor: activeTheme.accentPrimary,
                              color: activeTheme.bgPrimary,
                            }}
                          >
                            <Upload size={16} /> Upload from Device
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (webcamEnabled) {
                                resetWebcamState();
                              } else {
                                startWebcam();
                              }
                            }}
                            className="button"
                            style={{
                              backgroundColor: activeTheme.accentPrimary,
                              color: activeTheme.bgPrimary,
                            }}
                          >
                            <Camera size={16} /> {webcamEnabled ? 'Disable Webcam' : 'Open Camera'}
                          </button>
                          {webcamEnabled && (
                            <>
                              <button
                                type="button"
                                onClick={reloadWebcam}
                                className="button"
                                style={{
                                  backgroundColor: activeTheme.bgPrimary,
                                  color: activeTheme.accentPrimary,
                                  border: `1px solid ${activeTheme.accentPrimary}`,
                                }}
                              >
                                <Camera size={16} /> Reload Camera
                              </button>
                              <button
                                type="button"
                                onClick={handleCapture}
                                className="button"
                                style={{
                                  backgroundColor: activeTheme.accentPrimary,
                                  color: activeTheme.bgPrimary,
                                }}
                                disabled={!webcamReady}
                              >
                                <Camera size={16} /> Capture Photo
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              <div
                className="receiptTable"
                style={{ border: `1px solid ${activeTheme.border}` }}
              >
                <div
                  className="receiptTableHeader"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderBottom: `1px solid ${activeTheme.border}`,
                  }}
                >
                  <div className="receiptTableRow">
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Date
                    </div>
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Paid By
                    </div>
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Collected By
                    </div>
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Shares
                    </div>
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Amount
                    </div>
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Image
                    </div>
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Area
                    </div>
                    <div
                      className="receiptTableHeaderCell"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      Zone
                    </div>
                  </div>
                </div>
                <div className="receiptTableBody">
                  {receipts.length > 0 ? (
                    receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="receiptTableRow"
                        style={{ borderBottom: `1px solid ${activeTheme.border}20` }}
                      >
                        <div
                          className="receiptTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {new Date(receipt.created_at).toLocaleDateString()}
                        </div>
                        <div
                          className="receiptTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {receipt.paid_by}
                        </div>
                        <div
                          className="receiptTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {receipt.collected_by}
                        </div>
                        <div
                          className="receiptTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {receipt.hissa}
                        </div>
                        <div
                          className="receiptTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {formatCurrency(receipt.total_amt)}
                        </div>
                        <div className="receiptTableCell">
                          {receipt.img && (
                            <a
                              href={receipt.img}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: activeTheme.accentPrimary }}
                            >
                              View Image
                            </a>
                          )}
                        </div>
                        <div
                          className="receiptTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {receipt.area_name}
                        </div>
                        <div
                          className="receiptTableCell"
                          style={{ color: activeTheme.textPrimary }}
                        >
                          {receipt.zone_name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="noData"
                      style={{ color: activeTheme.textSecondary }}
                    >
                      No receipts found for this user.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptScreen;


