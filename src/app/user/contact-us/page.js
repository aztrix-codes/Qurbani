'use client'
import React, { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Building, Wrench } from 'lucide-react'
import './style.css'
import { useRouter } from 'next/navigation';
import { useTheme } from '../../themeContext';

function ContactPage() {
  const { activeTheme } = useTheme();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState({ name: 'Guest' });
  const [feedback, setFeedback] = useState('');
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 3000;
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (storedUserData && storedUserData.name) {
        setUserData(storedUserData);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  const handleFeedbackChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setFeedback(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      if (!feedback.trim()) {
        setErrorMessage('Please enter your feedback');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userData.name, feedback: feedback }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit feedback');
      
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFeedback('');
        setCharCount(0);
      }, 3000);
      
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-page-container" style={{ backgroundColor: activeTheme.bgPrimary }}>
      <div className="contact-grid">
        {/* Left Side: Contact Info */}
        <div className="contact-info-panel" style={{ color: activeTheme.textPrimary }}>
          <h1 className="main-title" style={{ color: activeTheme.textPrimary }}>Get in Touch</h1>
          <p className="main-subtitle" style={{ color: activeTheme.textSecondary }}>
            For immediate assistance, please contact the relevant department below. For general feedback, please use the form.
          </p>

          <div className="info-section">
            <h2 className="section-title" style={{ borderBottomColor: activeTheme.border }}>
              <Wrench size={20} className="section-icon" style={{ color: activeTheme.accentPrimary }} />
              Technical Support
            </h2>
            <div className="contact-list">
              <div className="contact-person">
                <p className="contact-name">Faraz Shaikh</p>
                <p className="contact-number" style={{ color: activeTheme.textSecondary }}>+91 98334 01654</p>
              </div>
              <div className="contact-person">
                <p className="contact-name">Asad Khan</p>
                <p className="contact-number" style={{ color: activeTheme.textSecondary }}>+91 80808 59144</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2 className="section-title" style={{ borderBottomColor: activeTheme.border }}>
              <Building size={20} className="section-icon" style={{ color: activeTheme.accentPrimary }} />
              Qurbani Matters
            </h2>
            <div className="contact-list">
              <div className="contact-person">
                <p className="contact-name">Ilyas Razvi</p>
                <p className="contact-number" style={{ color: activeTheme.textSecondary }}>+91 82911 10603</p>
              </div>
              <div className="contact-person">
                <p className="contact-name">Imran Rathod</p>
                <p className="contact-number" style={{ color: activeTheme.textSecondary }}>+91 93248 96595</p>
              </div>
            </div>
          </div>

          <div className="general-info-grid">
            <div className="info-item"><Mail size={18} /><span>info@example.com</span></div>
            <div className="info-item"><MapPin size={18} /><span>Mumbai, India</span></div>
            <div className="info-item"><Clock size={18} /><span>Mon - Fri • 9am - 5pm</span></div>
          </div>
        </div>

        {/* Right Side: Feedback Form */}
        <div className="contact-form-panel" style={{ backgroundColor: activeTheme.bgSecondary }}>
          {formSubmitted ? (
            <div className="form-success-message">
              <CheckCircle size={48} style={{ color: activeTheme.success }} />
              <h3 style={{ color: activeTheme.textPrimary }}>Feedback Submitted!</h3>
              <p style={{ color: activeTheme.textSecondary }}>Thank you for sharing your thoughts with us.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              <h2 className="form-title" style={{ color: activeTheme.textPrimary }}>Send Us a Message</h2>
              <p className="form-subtitle" style={{ color: activeTheme.textSecondary }}>
                Submitting as: <strong style={{ color: activeTheme.accentPrimary }}>{userData.name}</strong>
              </p>
              <div className="form-group">
                <div className="label-wrapper">
                  <label htmlFor="feedback" className="form-label" style={{ color: activeTheme.textPrimary }}>Your Feedback</label>
                  <div className="char-counter" style={{ color: activeTheme.textSecondary }}>
                    <span className={charCount > MAX_CHARS * 0.9 ? "char-limit-warning" : ""}>{charCount}/{MAX_CHARS}</span>
                  </div>
                </div>
                <textarea
                  id="feedback"
                  className="form-textarea"
                  placeholder="Please share your thoughts, suggestions, or issues..."
                  value={feedback}
                  onChange={handleFeedbackChange}
                  maxLength={MAX_CHARS}
                  required
                  style={{ backgroundColor: activeTheme.bgPrimary, color: activeTheme.textPrimary, borderColor: activeTheme.border }}
                ></textarea>
              </div>
              {errorMessage && (
                <div className="error-message" style={{ backgroundColor: `${activeTheme.error}20`, color: activeTheme.error }}>{errorMessage}</div>
              )}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
                style={{ backgroundColor: activeTheme.accentPrimary, color: activeTheme.bgPrimary }}
              >
                {isLoading ? 'Sending...' : 'Submit Feedback'}
                {!isLoading && <Send size={18} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactPage;