'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { FiSun, FiMoon } from 'react-icons/fi';
import axios from 'axios';
import './zoneStyles.css';
import { useTheme } from '../../themeContext'; // Import the theme hook

export default function ZonesPage() {
  // Get theme from context
  const { activeTheme, currentTheme, toggleTheme, isMounted } = useTheme();

  // State management
  const [zones, setZones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    zone: '',
    nigra: '',
    mobile: '',
    email: '',
    published: 1 // Default to 1 (true)
  });
  const [currentEditId, setCurrentEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const authHeaders = {
    headers: {
      'Authorization': 'supervisor'
    }
  };

  // Format date to "YYYY-MM-DD HH:MM am/pm" format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  // Fetch zones on component mount
  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/zones', authHeaders);
      // Map the API data to match our frontend structure
      const mappedZones = response.data.map(zone => ({
        id: zone.id,
        zone: zone.name,
        nigra: zone.incharge,
        mobile: zone.phone,
        email: zone.email,
        published: zone.publish === 1,
        createdDate: formatDate(zone.created_at)
      }));
      setZones(mappedZones);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching zones:', error);
      setErrorMessage('Failed to fetch zones');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.nigra.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.mobile.includes(searchTerm)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePublished = () => {
    setFormData(prev => ({ ...prev, published: prev.published === 1 ? 0 : 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const requestData = {
        name: formData.zone,
        incharge: formData.nigra,
        phone: formData.mobile,
        email: formData.email,
        created_date: formattedDate,
        publish: formData.published
      };
      
      let response;
      if (currentEditId) {
        response = await axios.put('/api/zones', {
          ...requestData,
          id: currentEditId
        }, authHeaders);
      } else {
        response = await axios.post('/api/zones', requestData, authHeaders);
      }
      
      await fetchZones();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving zone:', error);
      if (error.response) {
        setErrorMessage(`Failed to save zone: ${error.response.data.error || error.message}`);
      } else {
        setErrorMessage(`Failed to save zone: ${error.message}`);
      }
    }
  };

  const handleEdit = (zone) => {
    setFormData({
      zone: zone.zone,
      nigra: zone.nigra,
      mobile: zone.mobile,
      email: zone.email || '',
      published: zone.published ? 1 : 0
    });
    setCurrentEditId(zone.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      try {
        await axios.delete('/api/zones', { data: { id: id } }, authHeaders);
        await fetchZones();
        setErrorMessage('');
      } catch (error) {
        console.error('Error deleting zone:', error);
        setErrorMessage('Failed to delete zone');
      }
    }
  };

  const togglePublishedStatus = async (id) => {
    try {
      const zone = zones.find(z => z.id === id);
      const newStatus = zone.published ? 0 : 1;
      
      await axios.put('/api/zones', {
        id: id,
        publish: newStatus
      }, authHeaders);
      
      // Update local state to reflect the change
      setZones(zones.map(zone =>
        zone.id === id ? { ...zone, published: newStatus === 1 } : zone
      ));
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({ zone: '', nigra: '', mobile: '', email: '', published: 1 });
    setCurrentEditId(null);
    setErrorMessage('');
  };

  // Apply theme-specific styles (using activeTheme from context)
  const themeStyles = {
    zonePage: {
      backgroundColor: activeTheme.bgPrimary,
      color: activeTheme.textPrimary
    },
    pageHeader: {
      color: activeTheme.textPrimary
    },
    addButton: {
      backgroundColor: activeTheme.accentPrimary,
      color: 'white'
    },
    addButtonHover: {
      backgroundColor: currentTheme === 'light' ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight
    },
    searchInput: {
      backgroundColor: activeTheme.bgSecondary,
      color: activeTheme.textPrimary,
      borderColor: activeTheme.border
    },
    searchInputFocus: {
      borderColor: activeTheme.accentPrimary,
      boxShadow: `0 0 0 2px ${activeTheme.accentSecondaryLight}`
    },
    searchIcon: {
      color: activeTheme.neutralMedium
    },
    searchCount: {
      color: activeTheme.textSecondary
    },
    tableContainer: {
      backgroundColor: activeTheme.bgSecondary,
      borderColor: activeTheme.border
    },
    tableHeads: {
      backgroundColor: currentTheme === 'light' ? activeTheme.highlight : activeTheme.neutralLight,
      borderBottomColor: activeTheme.border,
      color: currentTheme === 'light' ? activeTheme.accentPrimary : activeTheme.textPrimary
    },
    tableRow: {
      borderBottomColor: activeTheme.border
    },
    tableRowHover: {
      backgroundColor: activeTheme.hover
    },
    toggleSwitch: {
      backgroundColor: activeTheme.neutralLight
    },
    toggleSwitchOn: {
      backgroundColor: activeTheme.accentPrimary
    },
    editButton: {
      color: activeTheme.success
    },
    editButtonHover: {
      color: currentTheme === 'light' ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight,
      backgroundColor: `${activeTheme.success}20`
    },
    deleteButton: {
      color: activeTheme.error
    },
    deleteButtonHover: {
      color: currentTheme === 'light' ? '#b91c1c' : '#f87171',
      backgroundColor: `${activeTheme.error}20`
    },
    modal: {
      backgroundColor: activeTheme.bgPrimary
    },
    modalHeader: {
      color: activeTheme.accentPrimary
    },
    closeButton: {
      color: activeTheme.neutralMedium
    },
    closeButtonHover: {
      color: activeTheme.textPrimary,
      backgroundColor: activeTheme.hover
    },
    modalLabel: {
      color: activeTheme.textPrimary
    },
    modalInput: {
      backgroundColor: activeTheme.bgSecondary,
      color: activeTheme.textPrimary,
      borderColor: activeTheme.border
    },
    modalInputFocus: {
      borderColor: activeTheme.accentPrimary,
      boxShadow: `0 0 0 2px ${activeTheme.accentSecondaryLight}`
    },
    cancelButton: {
      backgroundColor: activeTheme.neutralLight,
      color: activeTheme.textPrimary
    },
    cancelButtonHover: {
      backgroundColor: activeTheme.neutralMedium
    },
    submitButton: {
      backgroundColor: activeTheme.accentPrimary,
      color: 'white'
    },
    submitButtonHover: {
      backgroundColor: currentTheme === 'light' ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight
    },
    errorMessage: {
      color: activeTheme.error
    },
    themeToggle: {
      backgroundColor: 'transparent',
      color: activeTheme.accentPrimary,
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 10
    },
    themeToggleHover: {
      backgroundColor: activeTheme.hover
    }
  };

  if (!isMounted) {
    return null; // Prevent rendering until theme is determined
  }

  if (isLoading) {
    return (
      <div className="zones-page" style={themeStyles.zonePage}>
        <div className="page-header" style={themeStyles.pageHeader}>
          <h1>Manage Zone</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zones-page" style={themeStyles.zonePage}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={themeStyles.themeToggle}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.themeToggleHover.backgroundColor}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}
      >
        {currentTheme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
      </button>

      <div className="page-header">
        <h1 style={themeStyles.pageHeader}>Manage Zone</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="add-button" 
          style={themeStyles.addButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.addButtonHover.backgroundColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.addButton.backgroundColor}
        >
          <FiPlus /> Add Zone
        </button>
      </div>

      {errorMessage && (
        <div className="error-message" style={themeStyles.errorMessage}>
          {errorMessage}
        </div>
      )}

      <div className="search-box">
        <div className="search-input">
          <FiSearch className="search-icon" style={themeStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={themeStyles.searchInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = themeStyles.searchInputFocus.borderColor;
              e.currentTarget.style.boxShadow = themeStyles.searchInputFocus.boxShadow;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = themeStyles.searchInput.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <div className="search-count" style={themeStyles.searchCount}>
          {filteredZones.length} record(s) found
        </div>
      </div>

      <div className='table-container' style={themeStyles.tableContainer}>
        <div className='table-scroll-wrapper'>
          <div className='table-heads' style={themeStyles.tableHeads}>
            <div className='table-cell'>Sr no.</div>
            <div className='table-cell'>Nigra</div>
            <div className='table-cell'>Zone</div>
            <div className='table-cell'>Mobile</div>
            <div className='table-cell'>Publish</div>
            <div className='table-cell'>Created Date</div>
            <div className='table-cell'>Actions</div>
          </div>
          <div className='table-body'>
            {filteredZones.map((zone, index) => (
              <div 
                className='table-body-item' 
                key={zone.id}
                style={{ borderBottom: `1px solid ${themeStyles.tableRow.borderBottomColor}` }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover.backgroundColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className='table-cell'>{index + 1}</div>
                <div className='table-cell'>{zone.nigra}</div>
                <div className='table-cell'>{zone.zone}</div>
                <div className='table-cell'>{zone.mobile}</div>
                <div className='table-cell'>
                  <div 
                    onClick={() => togglePublishedStatus(zone.id)}
                    className={`toggle-switch ${zone.published ? 'on' : 'off'}`}
                    style={{ 
                      backgroundColor: zone.published 
                        ? themeStyles.toggleSwitchOn.backgroundColor 
                        : themeStyles.toggleSwitch.backgroundColor 
                    }}
                  >
                    <span className="switch-thumb" />
                  </div>
                </div>
                <div className='table-cell'>{zone.createdDate}</div>
                <div className='table-cell actions-cell'>
                  <button 
                    onClick={() => handleEdit(zone)} 
                    className="edit-button" 
                    title="Edit"
                    style={{ color: themeStyles.editButton.color }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeStyles.editButtonHover.color;
                      e.currentTarget.style.backgroundColor = themeStyles.editButtonHover.backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = themeStyles.editButton.color;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(zone.id)} 
                    className="delete-button" 
                    title="Delete"
                    style={{ color: themeStyles.deleteButton.color }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = themeStyles.deleteButtonHover.color;
                      e.currentTarget.style.backgroundColor = themeStyles.deleteButtonHover.backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = themeStyles.deleteButton.color;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={themeStyles.modal}>
            <div className="modal-header">
              <h2 style={themeStyles.modalHeader}>{currentEditId ? 'Edit Zone' : 'Add New Zone'}</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="close-button"
                style={themeStyles.closeButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = themeStyles.closeButtonHover.color;
                  e.currentTarget.style.backgroundColor = themeStyles.closeButtonHover.backgroundColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = themeStyles.closeButton.color;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label style={themeStyles.modalLabel}>
                Zone Name*
                <input 
                  name="zone" 
                  required 
                  value={formData.zone} 
                  onChange={handleInputChange} 
                  style={themeStyles.modalInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = themeStyles.modalInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInput.borderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </label>
              <label style={themeStyles.modalLabel}>
                Zonal Nigra Name*
                <input 
                  name="nigra" 
                  required 
                  value={formData.nigra} 
                  onChange={handleInputChange} 
                  style={themeStyles.modalInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = themeStyles.modalInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInput.borderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </label>
              <label style={themeStyles.modalLabel}>
                Phone Number*
                <input 
                  name="mobile" 
                  type="tel" 
                  required 
                  value={formData.mobile} 
                  onChange={handleInputChange} 
                  style={themeStyles.modalInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = themeStyles.modalInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInput.borderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </label>
              <label style={themeStyles.modalLabel}>
                Email
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  style={themeStyles.modalInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInputFocus.borderColor;
                    e.currentTarget.style.boxShadow = themeStyles.modalInputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalInput.borderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </label>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  style={themeStyles.cancelButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.cancelButtonHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.cancelButton.backgroundColor}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={themeStyles.submitButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.submitButtonHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.submitButton.backgroundColor}
                >
                  {currentEditId ? 'Update Zone' : 'Add Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}