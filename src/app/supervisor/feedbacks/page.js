
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiMessageSquare, FiUser } from 'react-icons/fi'; // Removed FiClock
import './feedback.css'; // Ensure this path is correct
import { useTheme } from '../..//themeContext'; // Assuming theme context path

export default function FeedbackComponent() {
  const { activeTheme, isLight } = useTheme();
  const [feedbackList, setFeedbackList] = useState([]);
  const [formData, setFormData] = useState({ name: '', feedback: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_FEEDBACKS = '/api/feedbacks';

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; 
        return date.toLocaleString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
  };

  // Fetch feedback on mount
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Fetch feedback function
  const fetchFeedback = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.get(API_FEEDBACKS);
      const mappedFeedback = response.data.map(fb => ({
          ...fb,
          formattedDate: formatDate(fb.created_at)
      }));
      setFeedbackList(mappedFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setErrorMessage('Failed to load feedback.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.feedback) {
      setErrorMessage('Please fill in both name and feedback.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await axios.post(API_FEEDBACKS, {
        name: formData.name,
        feedback: formData.feedback
      });
      await fetchFeedback();
      setFormData({ name: '', feedback: '' });
      setSuccessMessage('Feedback submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response) {
        setErrorMessage(`Failed to submit feedback: ${error.response.data.error || error.message}`);
      } else {
        setErrorMessage(`Failed to submit feedback: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme-based styles (Inline styles for dynamic theme properties)
  const themeStyles = {
    // Keep existing theme style definitions from previous version...
    container: { backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, padding: '25px', fontFamily: '"Inter", sans-serif' },
    title: { color: activeTheme.accentPrimary, paddingBottom: '10px', marginBottom: '15px', fontSize: '1.8rem', fontWeight: '600' },
    formSection: { backgroundColor: activeTheme.bgSecondary, padding: '20px', borderRadius: '8px', boxShadow: `0 4px 15px ${activeTheme.shadow}15` },
    inputLabel: { display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '500', color: activeTheme.textSecondary },
    inputField: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: `1px solid ${activeTheme.border}`, backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, fontSize: '1rem', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' },
    inputFieldFocus: { outline: 'none', borderColor: activeTheme.accentPrimary, boxShadow: `0 0 0 3px ${activeTheme.accentSecondaryLight}` },
    textareaField: { minHeight: '100px', resize: 'vertical' },
    submitButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', borderRadius: '6px', backgroundColor: activeTheme.accentPrimary, color: 'white', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s ease, transform 0.1s ease' },
    submitButtonHover: { backgroundColor: isLight ? activeTheme.accentPrimaryDark : activeTheme.accentPrimaryLight },
    submitButtonDisabled: { backgroundColor: activeTheme.neutralLight, cursor: 'not-allowed' },
    feedbackListSection: { /* Styles applied via CSS */ },
    feedbackItem: { backgroundColor: activeTheme.bgSecondary, padding: '18px', borderRadius: '8px', marginBottom: '15px', borderLeft: `4px solid ${activeTheme.accentSecondary}`, boxShadow: `0 2px 8px ${activeTheme.shadow}10`, transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
    feedbackItemHover: { transform: 'translateY(-2px)', boxShadow: `0 5px 15px ${activeTheme.shadow}15` },
    feedbackHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: activeTheme.textSecondary, fontSize: '0.9rem' },
    feedbackName: { fontWeight: '600', color: activeTheme.textPrimary },
    feedbackText: { lineHeight: '1.6', color: activeTheme.textPrimary, whiteSpace: 'pre-wrap', wordWrap: 'break-word' },
    feedbackTimestamp: { marginLeft: 'auto', fontSize: '0.85rem' },
    loadingText: { textAlign: 'center', padding: '30px', fontSize: '1.1rem', color: activeTheme.textSecondary },
    message: { padding: '10px 15px', borderRadius: '6px', marginTop: '15px', textAlign: 'center', fontSize: '0.95rem' },
    errorMessage: { backgroundColor: `${activeTheme.error}20`, color: activeTheme.error, border: `1px solid ${activeTheme.error}50` },
    successMessage: { backgroundColor: `${activeTheme.success}20`, color: activeTheme.success, border: `1px solid ${activeTheme.success}50` }
  };

  return (
    <div className="feedback-page-container" style={themeStyles.container}>
      <h2 style={themeStyles.title}>Feedback</h2>

      {/* Main layout container (Flexbox for desktop, block for mobile) */} 
      <div className="feedback-layout-wrapper">
        
        {/* Left Column / Top Section (Form) */} 
        <div className="feedback-form-column">
          <div className="feedback-form-section" style={themeStyles.formSection}>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" style={themeStyles.inputLabel}>Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                  style={themeStyles.inputField}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFieldFocus)}
                  onBlur={(e) => Object.assign(e.target.style, themeStyles.inputField)}
                />
              </div>
              <div>
                <label htmlFor="feedback" style={themeStyles.inputLabel}>Your Feedback</label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  placeholder="Share your thoughts..."
                  required
                  style={{...themeStyles.inputField, ...themeStyles.textareaField}}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFieldFocus)}
                  onBlur={(e) => Object.assign(e.target.style, themeStyles.inputField)}
                />
              </div>
              
              {errorMessage && (
                <div style={{...themeStyles.message, ...themeStyles.errorMessage}}>{errorMessage}</div>
              )}
              {successMessage && (
                <div style={{...themeStyles.message, ...themeStyles.successMessage}}>{successMessage}</div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  ...themeStyles.submitButton,
                  ...(isSubmitting ? themeStyles.submitButtonDisabled : {}),
                  marginTop: '10px' // Add some space above button
                }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = themeStyles.submitButtonHover.backgroundColor }}
                onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = themeStyles.submitButton.backgroundColor }}
              >
                <FiSend size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column / Bottom Section (Feedback List) */} 
        <div className="feedback-list-column">
          <div className="feedback-list-section" style={themeStyles.feedbackListSection}>
            {/* Title moved inside the column for better mobile layout */} 
            <h3 style={{ marginBottom: '20px', color: activeTheme.textSecondary }}>Recent Feedback</h3>
            {isLoading ? (
              <p style={themeStyles.loadingText}>Loading feedback...</p>
            ) : feedbackList.length === 0 ? (
              <p style={themeStyles.loadingText}>No feedback yet. Be the first!</p>
            ) : (
              <div className="feedback-scroll-container"> {/* Added scroll container */} 
                {feedbackList.map((item) => (
                  <div 
                      key={item.id} 
                      className="feedback-item" 
                      style={themeStyles.feedbackItem}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, themeStyles.feedbackItemHover)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, themeStyles.feedbackItem, {transform: 'none', boxShadow: themeStyles.feedbackItem.boxShadow})}
                  >
                    <div style={themeStyles.feedbackHeader}>
                      <FiUser size={16} />
                      <span style={themeStyles.feedbackName}>{item.name}</span>
                      {/* Removed Clock Icon */} 
                      <span style={themeStyles.feedbackTimestamp}>{item.formattedDate}</span>
                    </div>
                    <p style={themeStyles.feedbackText}>{item.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div> 
    </div>
  );
}

