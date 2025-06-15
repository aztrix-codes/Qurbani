
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

const ReceiptScreen = ({ region = 2 }) => {
  const { activeTheme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [areasList, setAreasList] = useState([]);
  const [users, setUsers] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [showEyeModal, setShowEyeModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [userViewDetail, setUserViewDetail] = useState(null);
  const [amountPerShare, setAmountPerShare] = useState(0);
  const [howMuchPaying, setHowMuchPaying] = useState(0);
  const [paidBy, setPaidBy] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingShares, setPendingShares] = useState(0); // Add this line
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  // Authentication check
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('superAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.replace('/auth/superadmin');
    }
  }, [router]);

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

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: 'admin' },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Fetch customers
  const fetchCustomerData = useCallback(async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomerData(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  // Fetch receipts
  const fetchReceipts = useCallback(async () => {
    try {
      const response = await fetch('/api/receipts');
      if (!response.ok) throw new Error('Failed to fetch receipts');
      const data = await response.json();
      setReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  }, []);

  // Upload image to imgbb
  const uploadToImgbb = async (imageData) => {
    try {
      setUploadingImage(true);
      
      // Convert base64 image to blob
      const base64Data = imageData.split(',')[1];
      
      // Create form data for imgbb API
      const formData = new FormData();
      formData.append('image', base64Data);
      formData.append('key', 'YOUR_IMGBB_API_KEY'); // Replace with your imgbb API key
      
      // Upload to imgbb
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data && data.data && data.data.url) {
        setUploadingImage(false);
        return data.data.url;
      } else {
        throw new Error('Failed to get image URL from imgbb');
      }
    } catch (error) {
      console.error('Error uploading image to imgbb:', error);
      setUploadingImage(false);
      throw error;
    }
  };

  // Update payment status
  const updatePaymentStatus = async (customerIds) => {
    try {
      await Promise.all(
        customerIds.map((id) =>
          fetch('/api/customers', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'admin',
            },
            body: JSON.stringify({
              id,
              payment_status: true,
            }),
          })
        )
      );
      await fetchCustomerData();
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  };

  // Create receipt
  const createReceipt = async (receiptData) => {
    try {
      // Upload image first if it's a base64 string
      if (receiptData.img && receiptData.img.startsWith('data:image')) {
        const imageUrl = await uploadToImgbb(receiptData.img);
        receiptData.img = imageUrl;
      }
      
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'admin',
        },
        body: JSON.stringify(receiptData),
      });
      if (!response.ok) throw new Error('Failed to create receipt');
      await fetchReceipts();
      return await response.json();
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAreas();
    fetchUsers();
    fetchCustomerData();
    fetchReceipts();
    const interval = setInterval(() => {
      fetchAreas();
      fetchUsers();
      fetchCustomerData();
      fetchReceipts();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchAreas, fetchUsers, fetchCustomerData, fetchReceipts]);

  // Set amount per share
  useEffect(() => {
    if (userViewDetail && userViewDetail.rate_r1) {
      setAmountPerShare(Math.ceil(parseFloat(userViewDetail.rate_r1)));
    }
    if (selectedRowData) {
      const totalShares = selectedRowData?.length || 0;
      const sharesPaid = selectedRowData
        ? selectedRowData.filter((customer) => customer.payment_status).length
        : 0;
      setPendingShares(totalShares - sharesPaid);
    }
  }, [userViewDetail, selectedRowData]);

  // Get zone name from area
  const getZoneNameFromArea = (areaName) => {
    if (!areaName) return 'N/A';
    const matchedArea = areasList.find((area) => area.name === areaName);
    return matchedArea ? matchedArea.zone_name : 'Mumbai';
  };

  // Modal handlers
  const handleEyeClick = (rowId, rowData, item) => {
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    setUserViewDetail(item);
    setShowEyeModal(true);
  };

  const handleReceiptClick = (rowId, rowData, item) => {
    setSelectedRowId(rowId);
    setSelectedRowData(rowData);
    setUserViewDetail(item);
    setHowMuchPaying(0);
    setPaidBy('');
    setCollectedBy('');
    setSelectedImage(null);
    setFormErrors({});
    setWebcamEnabled(false);
    setShowReceiptModal(true);
  };

  const closeEyeModal = () => {
    setShowEyeModal(false);
    setSelectedRowId(null);
    setSelectedRowData(null);
    setUserViewDetail(null);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedRowId(null);
    setSelectedRowData(null);
    setUserViewDetail(null);
    setFormErrors({});
    setWebcamEnabled(false);
  };

  // Image handlers
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setFormErrors({ ...formErrors, image: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setSelectedImage(imageSrc);
      setFormErrors({ ...formErrors, image: '' });
      setWebcamEnabled(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const totalShares = selectedRowData?.length || 0;
    const sharesPaid = selectedRowData
      ? selectedRowData.filter((customer) => customer.payment_status).length
      : 0;
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

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const amount = Math.ceil(howMuchPaying * amountPerShare);
      const area = userViewDetail?.area_name;
      const zone = getZoneNameFromArea(area);
      const currentYear = new Date().getFullYear();
      const purpose = `Qurbani (${currentYear})`;

      const receiptData = {
        user_name: userViewDetail?.name,
        paid_by: paidBy.trim(),
        collected_by: collectedBy.trim(),
        img: selectedImage,
        rate: parseFloat(amountPerShare),
        hissa: parseInt(howMuchPaying, 10),
        total_amt: parseFloat(amount),
        area_name: area,
        area_incharge:
          areasList.find((area) => area.name === userViewDetail?.area_name)
            ?.area_incharge || null,
        zone_name: zone,
        zone_incharge: userViewDetail?.zone_incharge || null,
        phone: userViewDetail?.phone || null,
        email: userViewDetail?.email || null,
        purpose,
      };

      await createReceipt(receiptData);

      const unpaidCustomers = selectedRowData.filter(
        (customer) => !customer.payment_status
      );
      const customersToUpdate = unpaidCustomers.slice(0, howMuchPaying);
      const customerIdsToUpdate = customersToUpdate.map((customer) => customer.id);

      if (customerIdsToUpdate.length > 0) {
        const updated = await updatePaymentStatus(customerIdsToUpdate);
        if (!updated) {
          alert('Receipt created but failed to update payment status.');
        }
      }

      setHowMuchPaying(0);
      setPaidBy('');
      setCollectedBy('');
      setSelectedImage(null);
      setFormErrors({});
      setWebcamEnabled(false);
      alert(
        `Payment of ${formatCurrency(amount)} for ${howMuchPaying} shares recorded successfully!`
      );
      closeReceiptModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Filter data for Mumbai region
  const filteredData = users
    .filter((item) => item.regions_incharge_of === region || item.regions_incharge_of === 0)
    .filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  // Group customers by user
  const groupedCustomers = filteredData.map((user) => {
    const userCustomers = customerData.filter(
      (customer) =>
        customer.user_name === user.name &&
        customer.region === region &&
        customer.status
    );
    return {
      user,
      customers: userCustomers,
    };
  });

  // Calculate statistics
  const totalUsers = filteredData.length;
  const totalCustomers = customerData.filter(
    (customer) => customer.region === region && customer.status
  ).length;
  const paidCustomers = customerData.filter(
    (customer) => customer.region === region && customer.status && customer.payment_status
  ).length;
  const pendingCustomers = totalCustomers - paidCustomers;

  return (
    <div
      className="receiptScreenContainer"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div
        className="receiptScreenCard"
        style={{
          backgroundColor: activeTheme.bgSecondary,
          border: `1px solid ${activeTheme.border}`,
        }}
      >
        {/* Header Section */}
        <div
          className="receiptScreenHeader"
          style={{
            backgroundColor: activeTheme.pageHeaderBG,
            color: activeTheme.pageHeaderText,
          }}
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
              <span style={{ color: activeTheme.pageHeaderText }}>{totalUsers}</span>
            </div>
            <div style={{ color: `${activeTheme.pageHeaderText}90` }}>
              Total Customers:{' '}
              <span style={{ color: activeTheme.pageHeaderText }}>
                {totalCustomers}
              </span>
            </div>
            <div style={{ color: `${activeTheme.pageHeaderText}90` }}>
              Paid:{' '}
              <span style={{ color: activeTheme.pageHeaderText }}>{paidCustomers}</span>
            </div>
            <div style={{ color: `${activeTheme.pageHeaderText}90` }}>
              Pending:{' '}
              <span style={{ color: activeTheme.pageHeaderText }}>{pendingCustomers}</span>
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
                          handleReceiptClick(group.user.id, group.customers, group.user)
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
                          handleEyeClick(group.user.id, group.customers, group.user)
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
                    {(() => {
                      const matchedArea = areasList.find(
                        (area) => area.name === userViewDetail?.area_name
                      );
                      return matchedArea ? matchedArea.area_incharge : 'N/A';
                    })()}
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
                          {record.type || 'Qurbani'}
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
                <h3 style={{ color: activeTheme.textPrimary }}>Add New Receipt</h3>
                <form onSubmit={handleFormSubmit}>
                  <div className="formGrid">
                    {(() => {
                      // Calculate all share variables
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
                        <>
                          <div className="formGroup">
                            <label
                              htmlFor="totalShares"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              Total Shares
                            </label>
                            <input
                              id="totalShares"
                              type="text"
                              value={totalShares}
                              readOnly
                              className="formInput"
                              style={{
                                backgroundColor: activeTheme.bgPrimary,
                                color: activeTheme.textPrimary,
                                border: `1px solid ${activeTheme.border}`,
                              }}
                            />
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="amountPerShare"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              Amount Per Share
                            </label>
                            <input
                              id="amountPerShare"
                              type="text"
                              value={formatCurrency(amountPerShare)}
                              readOnly
                              className="formInput"
                              style={{
                                backgroundColor: activeTheme.bgPrimary,
                                color: activeTheme.textPrimary,
                                border: `1px solid ${activeTheme.border}`,
                              }}
                            />
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="totalAmount"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              Total Amount
                            </label>
                            <input
                              id="totalAmount"
                              type="text"
                              value={formatCurrency(totalAmount)}
                              readOnly
                              className="formInput"
                              style={{
                                backgroundColor: activeTheme.bgPrimary,
                                color: activeTheme.textPrimary,
                                border: `1px solid ${activeTheme.border}`,
                              }}
                            />
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="paidShares"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              Paid Shares
                            </label>
                            <input
                              id="paidShares"
                              type="text"
                              value={sharesPaid}
                              readOnly
                              className="formInput"
                              style={{
                                backgroundColor: activeTheme.bgPrimary,
                                color: activeTheme.textPrimary,
                                border: `1px solid ${activeTheme.border}`,
                              }}
                            />
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="pendingShares"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              Pending Shares
                            </label>
                            <input
                              id="pendingShares"
                              type="text"
                              value={pendingShares}
                              readOnly
                              className="formInput"
                              style={{
                                backgroundColor: activeTheme.bgPrimary,
                                color: activeTheme.textPrimary,
                                border: `1px solid ${activeTheme.border}`,
                              }}
                            />
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="pendingAmount"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              Pending Amount
                            </label>
                            <input
                              id="pendingAmount"
                              type="text"
                              value={formatCurrency(pendingAmount)}
                              readOnly
                              className="formInput"
                              style={{
                                backgroundColor: activeTheme.bgPrimary,
                                color: activeTheme.textPrimary,
                                border: `1px solid ${activeTheme.border}`,
                              }}
                            />
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="howMuchPaying"
                              style={{ color: activeTheme.textSecondary }}
                            >
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
                              <div
                                className="errorMessage"
                                style={{ color: activeTheme.error }}
                              >
                                {formErrors.howMuchPaying}
                              </div>
                            )}
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="payingAmount"
                              style={{ color: activeTheme.textSecondary }}
                            >
                              Paying Amount
                            </label>
                            <input
                              id="payingAmount"
                              type="text"
                              value={formatCurrency(payingAmount)}
                              readOnly
                              className="formInput"
                              style={{
                                backgroundColor: activeTheme.bgPrimary,
                                color: activeTheme.textPrimary,
                                border: `1px solid ${activeTheme.border}`,
                              }}
                            />
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="paidBy"
                              style={{ color: activeTheme.textSecondary }}
                            >
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
                                  formErrors.paidBy
                                    ? activeTheme.error
                                    : activeTheme.border
                                }`,
                              }}
                            />
                            {formErrors.paidBy && (
                              <div
                                className="errorMessage"
                                style={{ color: activeTheme.error }}
                              >
                                {formErrors.paidBy}
                              </div>
                            )}
                          </div>

                          <div className="formGroup">
                            <label
                              htmlFor="collectedBy"
                              style={{ color: activeTheme.textSecondary }}
                            >
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
                              <div
                                className="errorMessage"
                                style={{ color: activeTheme.error }}
                              >
                                {formErrors.collectedBy}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="imageUploadSection">
                    <h4 style={{ color: activeTheme.textPrimary }}>Upload Image</h4>
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
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          width={320}
                          height={240}
                          videoConstraints={{
                            facingMode: 'environment',
                          }}
                        />
                      ) : (
                        <div
                          className="placeholderImage"
                          style={{ color: activeTheme.textSecondary }}
                        >
                          <Upload size={48} />
                          <div>No Image Selected</div>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    {formErrors.image && (
                      <div
                        className="errorMessage"
                        style={{ color: activeTheme.error, textAlign: 'center' }}
                      >
                        {formErrors.image}
                      </div>
                    )}
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
                        onClick={() => setWebcamEnabled(!webcamEnabled)}
                        className="button"
                        style={{
                          backgroundColor: activeTheme.accentPrimary,
                          color: activeTheme.bgPrimary,
                        }}
                      >
                        <Camera size={16} /> {webcamEnabled ? 'Disable Webcam' : 'Use Webcam'}
                      </button>
                      {webcamEnabled && (
                        <button
                          type="button"
                          onClick={handleCapture}
                          className="button"
                          style={{
                            backgroundColor: activeTheme.accentPrimary,
                            color: activeTheme.bgPrimary,
                          }}
                        >
                          <Camera size={16} /> Capture Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="formActions">
                    <button
                      type="submit"
                      className="submitButton"
                      style={{
                        backgroundColor: activeTheme.accentPrimary,
                        color: activeTheme.bgPrimary,
                      }}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading Image...' : 'Submit Receipt'}
                    </button>
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
                      Purpose
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
                          {receipt.purpose}
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


