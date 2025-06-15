
'use client';

import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiEye, FiEyeOff, FiUpload } from 'react-icons/fi'; // Added FiUpload
import axios from 'axios';
import './userStyles.css'; // Ensure this path is correct
import { useTheme } from '../../themeContext'; // Ensure this path is correct

export default function UsersPage() {
  // Use Theme Context
  const { activeTheme, isLight } = useTheme();

  // State management
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [defaultRates, setDefaultRates] = useState({
    mumbai_cost: 0,
    out_of_mumbai_cost: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    pfp: '', // Will store the URL from ImgBB or existing URL
    area_id: '',
    area_name: '',
    area_incharge: '',
    zone_name: '',
    zone_incharge: '',
    regions_incharge_of: 2,
    rate_r1: 0,
    rate_r2: 0,
    publish: 1
  });
  const [selectedPfpFile, setSelectedPfpFile] = useState(null); // State for the selected image file
  const [isUploading, setIsUploading] = useState(false); // State for upload indicator
  const [currentEditId, setCurrentEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null); // Ref for file input

  // Define authHeaders
  const authHeaders = {
    headers: {
      'Authorization': 'supervisor'
    }
  };

  // --- API Endpoints --- (Corrected based on user confirmation)
  const API_USERS_LIST = '/api/users'; // GET (list), POST (create)
  const API_USER_DYNAMIC = '/api/users'; // Base path for dynamic ID routes
  const API_COSTS = '/api/costs';
  const API_AREAS = '/api/areas';
  const IMGBB_API_KEY = '5d7b25beb20889d2109afe5aa0e19b31'; // User provided API key
  const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
  // ---------------------

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchAreas();
  }, []);

  // Fetch default rates when modal opens for a NEW user
  useEffect(() => {
    if (isModalOpen && !currentEditId) {
      fetchDefaultRates();
    }
  }, [isModalOpen, currentEditId]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_USERS_LIST, authHeaders);
      const mappedUsers = response.data.map(user => ({
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        pfp: user.pfp,
        area_name: user.area_name,
        area_incharge: user.area_incharge,
        zone_name: user.zone_name,
        zone_incharge: user.zone_incharge,
        regions_incharge_of: user.regions_incharge_of,
        rate_r1: user.rate_r1,
        rate_r2: user.rate_r2,
        publish: user.publish === 1,
        createdDate: formatDate(user.created_at)
      }));
      setUsers(mappedUsers);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to fetch users list');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    try {
      const response = await axios.get(API_AREAS, authHeaders);
      const mappedAreas = response.data.map(area => ({
        id: area.id,
        name: area.name,
        incharge: area.incharge,
        zone_name: area.zone_name,
        zone_incharge: area.zone_incharge
      }));
      setAreas(mappedAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setErrorMessage('Failed to fetch areas for dropdown');
    }
  };

  // Fetch default costs
  const fetchDefaultRates = async () => {
    try {
      const response = await axios.get(API_COSTS, authHeaders);
      const rates = {
        mumbai_cost: response.data.mumbai_cost || 0,
        out_of_mumbai_cost: response.data.out_of_mumbai_cost || 0
      };
      setDefaultRates(rates);
      if (!currentEditId) {
        setFormData(prev => ({
          ...prev,
          rate_r1: rates.mumbai_cost,
          rate_r2: rates.out_of_mumbai_cost
        }));
      }
    } catch (error) {
      console.error('Error fetching default rates:', error);
      if (error.response && error.response.status === 404) {
          setErrorMessage(`Failed to fetch default rates: Endpoint ${API_COSTS} not found.`);
      } else {
          setErrorMessage('Failed to fetch default rates.');
      }
    }
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.phone || '').includes(searchTerm) ||
    (user.area_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.zone_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePfpFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPfpFile(e.target.files[0]);
      // Optionally, display a preview (requires more state/logic)
    } else {
      setSelectedPfpFile(null);
    }
  };

  const handleAreaChange = (e) => {
    const areaId = e.target.value;
    const selectedArea = areas.find(area => area.id.toString() === areaId);
    setFormData(prev => ({
      ...prev,
      area_id: areaId,
      area_name: selectedArea ? selectedArea.name : '',
      area_incharge: selectedArea ? selectedArea.incharge : '',
      zone_name: selectedArea ? selectedArea.zone_name : '',
      zone_incharge: selectedArea ? selectedArea.zone_incharge : ''
    }));
  };

  const handleRegionChange = (e) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, regions_incharge_of: value }));
  };

  const togglePublished = () => {
    setFormData(prev => ({ ...prev, publish: prev.publish === 1 ? 0 : 1 }));
  };

  // Form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsUploading(false); // Reset upload status

    let finalPfpUrl = formData.pfp; // Start with existing URL or empty string

    // --- ImgBB Upload Logic --- 
    if (selectedPfpFile) {
      setIsUploading(true);
      const imgbbFormData = new FormData();
      imgbbFormData.append('image', selectedPfpFile);
      imgbbFormData.append('key', IMGBB_API_KEY);

      try {
        const imgbbResponse = await axios.post(IMGBB_UPLOAD_URL, imgbbFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (imgbbResponse.data && imgbbResponse.data.data && imgbbResponse.data.data.url) {
          finalPfpUrl = imgbbResponse.data.data.url; // Get URL from ImgBB
        } else {
          throw new Error('Invalid response from ImgBB');
        }
      } catch (uploadError) {
        console.error('Error uploading image to ImgBB:', uploadError);
        setErrorMessage(`Failed to upload profile picture: ${uploadError.response?.data?.error?.message || uploadError.message}`);
        setIsUploading(false);
        return; // Stop submission if upload fails
      }
      setIsUploading(false);
    }
    // --- End ImgBB Upload Logic ---

    try {
      const requestData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        pfp: finalPfpUrl, // Use the final URL (from upload or existing)
        area_name: formData.area_name,
        area_incharge: formData.area_incharge,
        zone_name: formData.zone_name,
        zone_incharge: formData.zone_incharge,
        regions_incharge_of: formData.regions_incharge_of,
        rate_r1: formData.rate_r1,
        rate_r2: formData.rate_r2,
        publish: formData.publish
      };

      if (currentEditId) {
        // Update User (PUT to dynamic route)
        await axios.put(`${API_USER_DYNAMIC}/${currentEditId}`, { 
          ...requestData,
          id: currentEditId // Include ID in body as well if backend expects it
        }, authHeaders);
      } else {
        // Create User (POST to list route)
        await axios.post(API_USERS_LIST, requestData, authHeaders);
      }
      
      await fetchUsers();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.response) {
        setErrorMessage(`Failed to save user: ${error.response.data.error || error.message}`);
      } else {
        setErrorMessage(`Failed to save user: ${error.message}`);
      }
    }
  };

  // Edit User - Fetch details and open modal
  const handleEdit = async (userFromList) => {
    setErrorMessage('');
    setCurrentEditId(userFromList.id);
    setIsModalOpen(true);
    setShowPassword(false);
    setSelectedPfpFile(null); // Clear selected file on edit
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input visually

    try {
      // Fetch full user details using the CORRECT dynamic endpoint
      const response = await axios.get(`${API_USER_DYNAMIC}/${userFromList.id}`, authHeaders);
      const fullUserData = response.data;
      const selectedArea = areas.find(area => area.name === fullUserData.area_name);

      setFormData({
        name: fullUserData.name || '',
        phone: fullUserData.phone || '',
        email: fullUserData.email || '',
        password: fullUserData.password || '', // Set plain text password
        pfp: fullUserData.pfp || '', // Set existing pfp URL
        area_id: selectedArea ? selectedArea.id : '',
        area_name: fullUserData.area_name || '',
        area_incharge: fullUserData.area_incharge || '',
        zone_name: fullUserData.zone_name || '',
        zone_incharge: fullUserData.zone_incharge || '',
        regions_incharge_of: fullUserData.regions_incharge_of !== undefined ? fullUserData.regions_incharge_of : 2,
        rate_r1: fullUserData.rate_r1 !== undefined ? fullUserData.rate_r1 : 0,
        rate_r2: fullUserData.rate_r2 !== undefined ? fullUserData.rate_r2 : 0,
        publish: fullUserData.publish !== undefined ? fullUserData.publish : 1
      });

    } catch (error) {
      console.error('Error fetching user details for edit:', error);
      // Provide more specific error message
      if (error.response && error.response.status === 404) {
          setErrorMessage(`Failed to load user details: User with ID ${userFromList.id} not found at ${API_USER_DYNAMIC}/${userFromList.id}.`);
      } else {
          setErrorMessage(`Failed to load user details for editing: ${error.message}`);
      }
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // Use DELETE on the dynamic route
        await axios.delete(`${API_USER_DYNAMIC}/${id}`, { 
            headers: authHeaders.headers,
            // ID is in the URL, no need for data payload unless backend requires it
            // data: { id: id } 
        });
        await fetchUsers();
        setErrorMessage('');
      } catch (error) {
        console.error('Error deleting user:', error);
        if (error.response) {
          setErrorMessage(`Failed to delete user: ${error.response.data.error || error.message}`);
        } else {
          setErrorMessage('Failed to delete user.');
        }
      }
    }
  };

  // Toggle Publish Status
  const togglePublishedStatus = async (id) => {
    try {
      const user = users.find(u => u.id === id);
      if (!user) return;
      const newStatus = user.publish ? 0 : 1;
      
      // Use PUT on the dynamic route for partial update
      await axios.put(`${API_USER_DYNAMIC}/${id}`, {
        // id: id, // ID is in URL
        publish: newStatus
      }, authHeaders);
      
      await fetchUsers(); 
      setErrorMessage('');
    } catch (error) {
      console.error('Error updating status:', error);
       if (error.response) {
          setErrorMessage(`Failed to update status: ${error.response.data.error || error.message}`);
        } else {
          setErrorMessage('Failed to update status.');
        }
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      name: '', phone: '', email: '', password: '', pfp: '',
      area_id: '', area_name: '', area_incharge: '', zone_name: '', zone_incharge: '',
      regions_incharge_of: 2,
      rate_r1: defaultRates.mumbai_cost,
      rate_r2: defaultRates.out_of_mumbai_cost,
      publish: 1
    });
    setCurrentEditId(null);
    setErrorMessage('');
    setShowPassword(false);
    setSelectedPfpFile(null); // Clear selected file
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input visually
  };

  // Get region text
  const getRegionText = (value) => {
    switch (value) {
      case 0: return 'Both';
      case 1: return 'Mumbai';
      case 2: return 'Out of Mumbai';
      default: return 'Unknown';
    }
  };

  // Theme styles (reduced for brevity - assume they exist as before)
  const themeStyles = {
     userPage: { backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary },
     pageHeader: { color: activeTheme.textPrimary },
     addButton: { backgroundColor: activeTheme.accentPrimary, color: 'white' },
     addButtonHover: { backgroundColor: isLight ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight },
     searchInput: { backgroundColor: activeTheme.bgSecondary, color: activeTheme.textPrimary, borderColor: activeTheme.border },
     searchInputFocus: { borderColor: activeTheme.accentPrimary, boxShadow: `0 0 0 2px ${activeTheme.accentSecondaryLight}` },
     searchIcon: { color: activeTheme.neutralMedium },
     searchCount: { color: activeTheme.textSecondary },
     tableContainer: { backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border },
     tableHeads: { backgroundColor: isLight ? activeTheme.highlight : activeTheme.neutralLight, borderBottomColor: activeTheme.border, color: isLight ? activeTheme.accentPrimary : activeTheme.textPrimary },
     tableRow: { borderBottomColor: activeTheme.border },
     tableRowHover: { backgroundColor: activeTheme.hover },
     toggleSwitchContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' },
     toggleSwitch: { position: 'relative', display: 'inline-block', width: '40px', height: '20px', backgroundColor: activeTheme.neutralLight, borderRadius: '10px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
     toggleSwitchSlider: { position: 'absolute', content: '""', height: '16px', width: '16px', left: '2px', bottom: '2px', backgroundColor: 'white', borderRadius: '50%', transition: 'transform 0.2s ease' },
     toggleSwitchInput: { opacity: 0, width: 0, height: 0 },
     toggleSwitchInputCheckedSlider: { transform: 'translateX(20px)' },
     toggleSwitchInputCheckedContainer: { backgroundColor: activeTheme.accentPrimary },
     actionButton: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 4px', transition: 'background-color 0.2s ease, color 0.2s ease' },
     editButton: { color: activeTheme.success },
     editButtonHover: { color: isLight ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight, backgroundColor: `${activeTheme.success}20` },
     deleteButton: { color: activeTheme.error },
     deleteButtonHover: { color: isLight ? '#b91c1c' : '#f87171', backgroundColor: `${activeTheme.error}20` },
     modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
     modal: { backgroundColor: activeTheme.bgPrimary, padding: '25px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', width: '90%', maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
     modalHeader: { color: activeTheme.accentPrimary, marginBottom: '20px', fontSize: '1.5rem', borderBottom: `1px solid ${activeTheme.border}`, paddingBottom: '10px' },
     closeButton: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: activeTheme.neutralMedium },
     closeButtonHover: { color: activeTheme.textPrimary },
     modalForm: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' },
     modalField: { display: 'flex', flexDirection: 'column' },
     modalLabel: { color: activeTheme.textPrimary, marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' },
     modalInput: { backgroundColor: activeTheme.bgSecondary, color: activeTheme.textPrimary, borderColor: activeTheme.border, borderWidth: '1px', borderStyle: 'solid', padding: '10px', borderRadius: '4px', fontSize: '1rem' },
     modalInputFocus: { outline: 'none', borderColor: activeTheme.accentPrimary, boxShadow: `0 0 0 2px ${activeTheme.accentSecondaryLight}` },
     modalSelect: { backgroundColor: activeTheme.bgSecondary, color: activeTheme.textPrimary, borderColor: activeTheme.border, borderWidth: '1px', borderStyle: 'solid', padding: '10px', borderRadius: '4px', fontSize: '1rem', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23${activeTheme.neutralMedium.substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '1em' },
     modalSelectFocus: { outline: 'none', borderColor: activeTheme.accentPrimary, boxShadow: `0 0 0 2px ${activeTheme.accentSecondaryLight}` },
     passwordInputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
     passwordInput: { flexGrow: 1, paddingRight: '40px' },
     passwordToggle: { position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: activeTheme.neutralMedium, padding: '5px' },
     passwordToggleHover: { color: activeTheme.textPrimary },
     regionOption: { color: activeTheme.textPrimary, padding: '10px', backgroundColor: activeTheme.bgSecondary },
     modalActions: { gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${activeTheme.border}` },
     cancelButton: { backgroundColor: activeTheme.neutralLight, color: activeTheme.textPrimary, padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
     cancelButtonHover: { backgroundColor: activeTheme.neutralMedium },
     submitButton: { backgroundColor: activeTheme.accentPrimary, color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
     submitButtonHover: { backgroundColor: isLight ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight },
     errorMessage: { color: activeTheme.error, backgroundColor: `${activeTheme.error}20`, padding: '10px', borderRadius: '4px', marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' },
     fileInputLabel: { /* Style for the file input label */
        display: 'inline-block',
        padding: '8px 12px',
        cursor: 'pointer',
        border: `1px solid ${activeTheme.border}`,
        borderRadius: '4px',
        backgroundColor: activeTheme.bgSecondary,
        color: activeTheme.textSecondary,
        textAlign: 'center',
        transition: 'background-color 0.2s ease'
     },
     fileInputLabelHover: {
        backgroundColor: activeTheme.hover
     },
     fileName: { /* Style for displaying the selected file name */
        marginLeft: '10px',
        fontSize: '0.9rem',
        color: activeTheme.textSecondary,
        fontStyle: 'italic'
     }
  };

  if (isLoading) {
    return (
      <div className="users-page" style={themeStyles.userPage}>
        <div className="page-header" style={themeStyles.pageHeader}>
          <h1>Manage Users</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page" style={themeStyles.userPage}>
      {/* Header */}
      <div className="page-header">
        <h1 style={themeStyles.pageHeader}>Manage Users</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="add-button" 
          style={themeStyles.addButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.addButtonHover.backgroundColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.addButton.backgroundColor}
        >
          <FiPlus /> Add User
        </button>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="error-message" style={themeStyles.errorMessage}>
          {errorMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="search-box">
        <div className="search-input">
          <FiSearch className="search-icon" style={themeStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={themeStyles.searchInput}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.searchInputFocus)}
            onBlur={(e) => Object.assign(e.target.style, themeStyles.searchInput)}
          />
        </div>
        <div className="search-count" style={themeStyles.searchCount}>
          {filteredUsers.length} record(s) found
        </div>
      </div>

      {/* Table Structure */}
      <div className='table-container' style={themeStyles.tableContainer}>
        <div className='table-scroll-wrapper'>
          {/* Table Header */}
          <div className='table-heads' style={themeStyles.tableHeads}>
            <div className='table-cell'>Sr no.</div>
            <div className='table-cell'>Name</div>
            <div className='table-cell'>Area</div>
            <div className='table-cell'>Zone</div>
            <div className='table-cell'>Region</div>
            <div className='table-cell'>Phone</div>
            <div className='table-cell'>Rate(M)</div>
            <div className='table-cell'>Rate(OOM)</div>
            <div className='table-cell'>Published</div>
            <div className='table-cell'>Actions</div>
          </div>
          {/* Table Body */}
          <div className='table-body'>
            {filteredUsers.map((user, index) => (
              <div 
                className='table-body-item' 
                key={user.id} 
                style={themeStyles.tableRow}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover.backgroundColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className='table-cell'>{index + 1}</div>
                <div className='table-cell'>{user.name}</div>
                <div className='table-cell'>{user.area_name}</div>
                <div className='table-cell'>{user.zone_name}</div>
                <div className='table-cell'>{getRegionText(user.regions_incharge_of)}</div>
                <div className='table-cell'>{user.phone}</div>
                <div className='table-cell'>{user.rate_r1}</div>
                <div className='table-cell'>{user.rate_r2}</div>
                <div className='table-cell'>
                  <div style={themeStyles.toggleSwitchContainer}>
                    <label 
                      style={{ ...themeStyles.toggleSwitch, ...(user.publish ? themeStyles.toggleSwitchInputCheckedContainer : {}) }}
                      onClick={(e) => { e.stopPropagation(); togglePublishedStatus(user.id); }}
                    >
                      <input type="checkbox" checked={user.publish} readOnly style={themeStyles.toggleSwitchInput} />
                      <span style={{ ...themeStyles.toggleSwitchSlider, ...(user.publish ? themeStyles.toggleSwitchInputCheckedSlider : {}) }}></span>
                    </label>
                  </div>
                </div>
                <div className='table-cell'>
                  <button 
                    onClick={() => handleEdit(user)} 
                    style={{...themeStyles.actionButton, ...themeStyles.editButton}}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, themeStyles.editButtonHover)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, themeStyles.editButton, {backgroundColor: 'transparent'})}
                    title="Edit User"
                  ><FiEdit2 size={16} /></button>
                  <button 
                    onClick={() => handleDelete(user.id)} 
                    style={{...themeStyles.actionButton, ...themeStyles.deleteButton}}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, themeStyles.deleteButtonHover)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, themeStyles.deleteButton, {backgroundColor: 'transparent'})}
                    title="Delete User"
                  ><FiTrash2 size={16} /></button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className='table-body-item' style={themeStyles.tableRow}>
                <div className='table-cell' style={{ width: '100%', justifyContent: 'center', padding: '20px' }}>
                  No users found matching your search criteria.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */} 
      {isModalOpen && (
        <div className="modal-overlay" style={themeStyles.modalOverlay}>
          <div className="modal" style={themeStyles.modal}>
            <button 
              onClick={() => { setIsModalOpen(false); resetForm(); }} 
              className="close-button" 
              style={themeStyles.closeButton}
              onMouseEnter={(e) => e.currentTarget.style.color = themeStyles.closeButtonHover.color}
              onMouseLeave={(e) => e.currentTarget.style.color = themeStyles.closeButton.color}
            ><FiX /></button>
            <h2 style={themeStyles.modalHeader}>{currentEditId ? 'Edit User' : 'Add New User'}</h2>
            
            {errorMessage && (
              <div className="error-message" style={{...themeStyles.errorMessage, marginBottom: '15px'}}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={themeStyles.modalForm}>
              {/* Form Fields */}
              <div style={themeStyles.modalField}>
                <label htmlFor="name" style={themeStyles.modalLabel}>Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required style={themeStyles.modalInput} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalInputFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalInput)} />
              </div>
              <div style={themeStyles.modalField}>
                <label htmlFor="phone" style={themeStyles.modalLabel}>Phone *</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required style={themeStyles.modalInput} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalInputFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalInput)} />
              </div>
              <div style={themeStyles.modalField}>
                <label htmlFor="email" style={themeStyles.modalLabel}>Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required style={themeStyles.modalInput} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalInputFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalInput)} />
              </div>
              <div style={themeStyles.modalField}>
                <label htmlFor="password" style={themeStyles.modalLabel}>{currentEditId ? 'Password (leave blank to keep current)' : 'Password *'}</label>
                <div style={themeStyles.passwordInputContainer}>
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} required={!currentEditId} style={{...themeStyles.modalInput, ...themeStyles.passwordInput}} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalInputFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalInput)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={themeStyles.passwordToggle} onMouseEnter={(e) => e.currentTarget.style.color = themeStyles.passwordToggleHover.color} onMouseLeave={(e) => e.currentTarget.style.color = themeStyles.passwordToggle.color} title={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
                </div>
              </div>
              <div style={themeStyles.modalField}>
                <label htmlFor="area_id" style={themeStyles.modalLabel}>Area</label>
                <select id="area_id" name="area_id" value={formData.area_id} onChange={handleAreaChange} style={themeStyles.modalSelect} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalSelectFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalSelect)}>
                  <option value="">Select Area</option>
                  {areas.map(area => (<option key={area.id} value={area.id} style={themeStyles.regionOption}>{area.name}</option>))}
                </select>
              </div>
              <div style={themeStyles.modalField}>
                <label htmlFor="regions_incharge_of" style={themeStyles.modalLabel}>Region Incharge Of</label>
                <select id="regions_incharge_of" name="regions_incharge_of" value={formData.regions_incharge_of} onChange={handleRegionChange} style={themeStyles.modalSelect} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalSelectFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalSelect)}>
                  <option value={0} style={themeStyles.regionOption}>Both</option>
                  <option value={1} style={themeStyles.regionOption}>Mumbai</option>
                  <option value={2} style={themeStyles.regionOption}>Out of Mumbai</option>
                </select>
              </div>
              <div style={themeStyles.modalField}>
                <label htmlFor="rate_r1" style={themeStyles.modalLabel}>Rate (Mumbai)</label>
                <input type="number" id="rate_r1" name="rate_r1" value={formData.rate_r1} onChange={handleInputChange} step="0.01" style={themeStyles.modalInput} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalInputFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalInput)} />
              </div>
              <div style={themeStyles.modalField}>
                <label htmlFor="rate_r2" style={themeStyles.modalLabel}>Rate (Out of Mumbai)</label>
                <input type="number" id="rate_r2" name="rate_r2" value={formData.rate_r2} onChange={handleInputChange} step="0.01" style={themeStyles.modalInput} onFocus={(e) => Object.assign(e.target.style, themeStyles.modalInputFocus)} onBlur={(e) => Object.assign(e.target.style, themeStyles.modalInput)} />
              </div>
              
              {/* --- Profile Picture Upload --- */}
              <div style={{...themeStyles.modalField, gridColumn: '1 / -1'}}> 
                <label htmlFor="pfpFile" style={themeStyles.modalLabel}>Profile Picture</label>
                <input
                  type="file"
                  id="pfpFile"
                  name="pfpFile"
                  accept="image/*" // Accept only image files
                  onChange={handlePfpFileChange}
                  ref={fileInputRef} // Assign ref
                  style={{ display: 'none' }} // Hide default input
                />
                <label 
                    htmlFor="pfpFile" 
                    style={themeStyles.fileInputLabel}
                    onMouseEnter={(e) => Object.assign(e.target.style, themeStyles.fileInputLabelHover)}
                    onMouseLeave={(e) => Object.assign(e.target.style, themeStyles.fileInputLabel)}
                >
                    <FiUpload style={{ marginRight: '8px' }} /> Choose Image
                </label>
                {selectedPfpFile && (
                    <span style={themeStyles.fileName}>{selectedPfpFile.name}</span>
                )}
                {!selectedPfpFile && formData.pfp && (
                    <span style={themeStyles.fileName}>Current: <a href={formData.pfp} target="_blank" rel="noopener noreferrer">View Image</a></span>
                )}
              </div>
              {/* --- End Profile Picture Upload --- */}

              <div style={{...themeStyles.modalField, gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                <label htmlFor="publish" style={{...themeStyles.modalLabel, marginBottom: 0}}>Published:</label>
                 <label 
                    style={{ ...themeStyles.toggleSwitch, ...(formData.publish === 1 ? themeStyles.toggleSwitchInputCheckedContainer : {}) }}
                    onClick={togglePublished}
                    >
                    <input type="checkbox" id="publish" checked={formData.publish === 1} readOnly style={themeStyles.toggleSwitchInput} />
                    <span style={{ ...themeStyles.toggleSwitchSlider, ...(formData.publish === 1 ? themeStyles.toggleSwitchInputCheckedSlider : {}) }}></span>
                </label>
              </div>

              {/* Modal Actions */}
              <div style={themeStyles.modalActions}>
                <button 
                  type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} 
                  style={themeStyles.cancelButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.cancelButtonHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.cancelButton.backgroundColor}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={themeStyles.submitButton}
                  disabled={isUploading} // Disable button while uploading
                  onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.backgroundColor = themeStyles.submitButtonHover.backgroundColor }}
                  onMouseLeave={(e) => { if (!isUploading) e.currentTarget.style.backgroundColor = themeStyles.submitButton.backgroundColor }}
                >
                  {isUploading ? 'Uploading...' : (currentEditId ? 'Update User' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

