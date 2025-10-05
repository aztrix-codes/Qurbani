'use client'
import React, { useState, useEffect } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import './style.css'
import { useRouter } from 'next/navigation';

function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState({ name: '', userId: 0, isAuthenticated: false, status: 0 });
  const [feedback, setFeedback] = useState('');
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 3000; // Maximum characters allowed

  const router = useRouter();
  
//     // Get user data from localStorage
//     try {
//       const storedUserData = JSON.parse(localStorage.getItem('userData'));
//       if (storedUserData) {
//         setUserData(storedUserData);
        
//         // Redirect if user is not authenticated
//         if (
//           storedUserData.userId === 0 &&
//           storedUserData.isAuthenticated === false &&
//           storedUserData.status === 0
//         ) {
//           router.replace('/');
//         }
//       }
//     } catch (error) {
//       console.error('Error accessing localStorage:', error);
//     }
//   }, [router]);

  const handleFeedbackChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setFeedback(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      // Validate feedback
      if (!feedback.trim()) {
        setErrorMessage('Please enter your feedback');
        setIsLoading(false);
        return;
      }
      
      // Send data to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.name || 'Anonymous User',
          feedback: feedback
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }
      
      // Show success message
      setFormSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormSubmitted(false);
        setFeedback('');
      }, 3000);
      
    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error submitting feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-wrapper">
        {/* Main Content */}
        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info">


            {/* Technical Issues */}
            <div className="contact-section">
              <h2>Technical Issues</h2>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Faraz Shaikh</div>
                  <div className="contact-value">+919833401654</div>
                </div>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Asad Khan</div>
                  <div className="contact-value">+918080859144</div>
                </div>
              </div>
            </div>
            

            {/* Qurbani Issues */}
            <div className="contact-section">
              <h2>Qurbani Issues</h2>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Ilyas Razvi</div>
                  <div className="contact-value">+918291110603</div>
                </div>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <div className="contact-details">
                  <div className="contact-name">Imran Rathod</div>
                  <div className="contact-value">+919324896595</div>
                </div>
              </div>
            </div>

            

            {/* Additional Contact Methods */}
            <div className="contact-methods">
              <div className="contact-method">
                <Mail className="method-icon" size={20} />
                <div className="method-info">
                  <h3>Email Us</h3>
                  <p>info@example.com</p>
                </div>
              </div>
              <div className="contact-method">
                <MapPin className="method-icon" size={20} />
                <div className="method-info">
                  <h3>Location</h3>
                  <p>Mumbai, India</p>
                </div>
              </div>
              <div className="contact-method">
                <Clock className="method-icon" size={20} />
                <div className="method-info">
                  <h3>Office Hours</h3>
                  <p>Mon - Fri • 9am - 5pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="contact-form-section">
            <form className="contact-form" onSubmit={handleSubmit}>
              {formSubmitted ? (
                <div className="form-success">
                  <center>
                    <CheckCircle size={'3vw'} className="success-icon" />
                    <h3>Feedback Submitted!</h3>
                    <p>Thank you for sharing your thoughts with us.</p>
                  </center>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <label htmlFor="feedback" className="form-label">Your Feedback</label>
                    <div className="char-counter">
                      <span className={charCount > MAX_CHARS * 0.8 ? "char-limit-warning" : ""}>
                        {charCount}/{MAX_CHARS}
                      </span>
                    </div>
                    </div>
                    <textarea 
                      id="feedback" 
                      className="form-input" 
                      placeholder="Please share your thoughts, suggestions, or issues..."
                      value={feedback}
                      onChange={handleFeedbackChange}
                      maxLength={MAX_CHARS}
                      required
                    ></textarea>
                  </div>
                  {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                  )}
                  <button 
                    type="submit" 
                    className={`submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading-text">Sending...</span>
                    ) : (
                      <>
                        <Send size={18} style={{ marginRight: '8px' }} />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage