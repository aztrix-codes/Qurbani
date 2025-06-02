'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { FiSun, FiMoon } from 'react-icons/fi';
import axios from 'axios';
import './areaStyles.css';
import { useTheme } from '../../themeContext';

export default function AreasPage() {
  // Use the theme context
  const { currentTheme, activeTheme, isLight, isMounted } = useTheme();

  // State management
  const [areas, setAreas] = useState([]);
  const [zones, setZones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    incharge: '',
    zone_id: '',
    zone_name: '',
    zone_incharge: '',
    phone: '',
    email: '',
    publish: 1 // Default to 1 (true)
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

  // Fetch areas on component mount
  useEffect(() => {
    fetchAreas();
    fetchZones();
  }, []);

  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/areas', authHeaders);
      // Map the API data to match our frontend structure
      const mappedAreas = response.data.map(area => ({
        id: area.id,
        name: area.name,
        incharge: area.incharge,
        zone_name: area.zone_name,
        zone_incharge: area.zone_incharge,
        phone: area.phone,
        email: area.email,
        publish: area.publish === 1,
        createdDate: formatDate(area.created_at)
      }));
      setAreas(mappedAreas);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching areas:', error);
      setErrorMessage('Failed to fetch areas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await axios.get('/api/zones', authHeaders);
      // Map the API data to match our dropdown needs
      const mappedZones = response.data.map(zone => ({
        id: zone.id,
        name: zone.name,
        incharge: zone.incharge
      }));
      setZones(mappedZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setErrorMessage('Failed to fetch zones for dropdown');
    }
  };

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.incharge.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.zone_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.phone.includes(searchTerm)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    const selectedZone = zones.find(zone => zone.id.toString() === zoneId);
    
    if (selectedZone) {
      setFormData(prev => ({
        ...prev,
        zone_id: zoneId,
        zone_name: selectedZone.name,
        zone_incharge: selectedZone.incharge
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        zone_id: '',
        zone_name: '',
        zone_incharge: ''
      }));
    }
  };

  const togglePublished = () => {
    setFormData(prev => ({ ...prev, publish: prev.publish === 1 ? 0 : 1 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      const requestData = {
        name: formData.name,
        incharge: formData.incharge,
        zone_name: formData.zone_name,
        zone_incharge: formData.zone_incharge,
        phone: formData.phone,
        email: formData.email,
        publish: formData.publish
      };
      
      let response;
      if (currentEditId) {
        response = await axios.put('/api/areas', {
          ...requestData,
          id: currentEditId
        }, authHeaders);
      } else {
        response = await axios.post('/api/areas', requestData, authHeaders);
      }
      
      await fetchAreas();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving area:', error);
      if (error.response) {
        setErrorMessage(`Failed to save area: ${error.response.data.error || error.message}`);
      } else {
        setErrorMessage(`Failed to save area: ${error.message}`);
      }
    }
  };

  const handleEdit = (area) => {
    const selectedZone = zones.find(zone => zone.name === area.zone_name);
    
    setFormData({
      name: area.name,
      incharge: area.incharge,
      zone_id: selectedZone ? selectedZone.id : '',
      zone_name: area.zone_name,
      zone_incharge: area.zone_incharge,
      phone: area.phone,
      email: area.email || '',
      publish: area.publish ? 1 : 0
    });
    setCurrentEditId(area.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this area?')) {
      try {
        await axios.delete('/api/areas', { data: { id: id } }, authHeaders);
        await fetchAreas();
        setErrorMessage('');
      } catch (error) {
        console.error('Error deleting area:', error);
        setErrorMessage('Failed to delete area');
      }
    }
  };

  const togglePublishedStatus = async (id) => {
    try {
      const area = areas.find(a => a.id === id);
      const newStatus = area.publish ? 0 : 1;
      
      await axios.put('/api/areas', {
        id: id,
        publish: newStatus
      }, authHeaders);
      
      // Update local state to reflect the change
      setAreas(areas.map(area =>
        area.id === id ? { ...area, publish: newStatus === 1 } : area
      ));
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      incharge: '',
      zone_id: '',
      zone_name: '',
      zone_incharge: '',
      phone: '',
      email: '',
      publish: 1
    });
    setCurrentEditId(null);
    setErrorMessage('');
  };

  // Theme-specific styles using activeTheme from context
  const themeStyles = {
    areaPage: {
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
      backgroundColor: isLight ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight
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
      backgroundColor: isLight ? activeTheme.highlight : activeTheme.neutralLight,
      borderBottomColor: activeTheme.border,
      color: isLight ? activeTheme.accentPrimary : activeTheme.textPrimary
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
      color: isLight ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight,
      backgroundColor: `${activeTheme.success}20`
    },
    deleteButton: {
      color: activeTheme.error
    },
    deleteButtonHover: {
      color: isLight ? '#b91c1c' : '#f87171',
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
    modalSelect: {
      backgroundColor: activeTheme.bgSecondary,
      color: activeTheme.textPrimary,
      borderColor: activeTheme.border
    },
    modalSelectFocus: {
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
      backgroundColor: isLight ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight
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

  // Prevent rendering until theme context is mounted
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="areas-page" style={themeStyles.areaPage}>
        <div className="page-header" style={themeStyles.pageHeader}>
          <h1>Manage Area</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="areas-page" style={themeStyles.areaPage}>
      <div className="page-header">
        <h1 style={themeStyles.pageHeader}>Manage Area</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="add-button" 
          style={themeStyles.addButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.addButtonHover.backgroundColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.addButton.backgroundColor}
        >
          <FiPlus /> Add Area
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
            placeholder="Search areas..."
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
          {filteredAreas.length} record(s) found
        </div>
      </div>

      <div className='table-container' style={themeStyles.tableContainer}>
        <div className='table-scroll-wrapper'>
          <div className='table-heads' style={themeStyles.tableHeads}>
            <div className='table-cell'>Sr no.</div>
            <div className='table-cell'>Area</div>
            <div className='table-cell'>Incharge</div>
            <div className='table-cell'>Zone</div>
            <div className='table-cell'>Mobile</div>
            <div className='table-cell'>Publish</div>
            <div className='table-cell'>Created Date</div>
            <div className='table-cell'>Actions</div>
          </div>
          <div className='table-body'>
            {filteredAreas.map((area, index) => (
              <div 
                className='table-body-item' 
                key={area.id}
                style={{ borderBottom: `1px solid ${themeStyles.tableRow.borderBottomColor}` }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover.backgroundColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className='table-cell'>{index + 1}</div>
                <div className='table-cell'>{area.name}</div>
                <div className='table-cell'>{area.incharge}</div>
                <div className='table-cell'>{area.zone_name}</div>
                <div className='table-cell'>{area.phone}</div>
                <div className='table-cell'>
                  <div 
                    onClick={() => togglePublishedStatus(area.id)}
                    className={`toggle-switch ${area.publish ? 'on' : 'off'}`}
                    style={{ 
                      backgroundColor: area.publish 
                        ? themeStyles.toggleSwitchOn.backgroundColor 
                        : themeStyles.toggleSwitch.backgroundColor 
                    }}
                  >
                    <span className="switch-thumb" />
                  </div>
                </div>
                <div className='table-cell'>{area.createdDate}</div>
                <div className='table-cell actions-cell'>
                  <button 
                    onClick={() => handleEdit(area)} 
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
                    onClick={() => handleDelete(area.id)} 
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
              <h2 style={themeStyles.modalHeader}>{currentEditId ? 'Edit Area' : 'Add New Area'}</h2>
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
                Area Name*
                <input 
                  name="name" 
                  required 
                  value={formData.name} 
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
                Area Incharge Name*
                <input 
                  name="incharge" 
                  required 
                  value={formData.incharge} 
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
                Zone*
                <select 
                  name="zone_id" 
                  required 
                  value={formData.zone_id} 
                  onChange={handleZoneChange} 
                  style={themeStyles.modalSelect}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalSelectFocus.borderColor;
                    e.currentTarget.style.boxShadow = themeStyles.modalSelectFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.modalSelect.borderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select a zone</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={themeStyles.modalLabel}>
                Phone Number*
                <input 
                  name="phone" 
                  type="tel" 
                  required 
                  value={formData.phone} 
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
                  {currentEditId ? 'Update Area' : 'Add Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}