/**
 * Reusable Newsletter Subscription Form Component
 * Can be used in Footer, PostDetail, or standalone pages
 */
import React, { useState } from 'react';
import { apiService } from '../../services/api';

const NewsletterForm = ({ 
  source = 'website', 
  title = 'Stay Updated',
  description = 'Get the latest posts from Kindo Tech delivered to your inbox.',
  showTitle = true,
  showDescription = true,
  className = '',
  buttonText = 'Subscribe to Newsletter',
  placeholder = 'Your email address'
}) => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage('Please enter a valid email address.');
      return;
    }
    
    try {
      setSubscribing(true);
      setMessage('');
      
      // Call the actual API
      const response = await apiService.subscribeToNewsletter(email.trim(), source);
      
      if (response.success) {
        setMessage(response.message);
        setEmail('');
      } else {
        setMessage(response.message || 'Sorry, there was an error subscribing. Please try again.');
      }
      
    } catch (error) {
      setMessage('Sorry, there was an error subscribing. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const clearMessage = () => {
    setMessage('');
  };

  return (
    <div className={`newsletter-subscription-form ${className}`}>
      {showTitle && (
        <h5 className="newsletter-title">
          <i className="fas fa-envelope me-2 text-tanzania"></i>
          {title}
        </h5>
      )}
      
      {showDescription && (
        <p className="newsletter-description text-muted">
          {description}
        </p>
      )}
      
      {message && (
        <div className={`alert ${message.includes('Thank you') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          <small>{message}</small>
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearMessage}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="newsletter-form">
        <div className="mb-3">
          <input 
            type="email" 
            className="form-control" 
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={subscribing}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-tanzania w-100"
          disabled={subscribing}
        >
          {subscribing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Subscribing...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              {buttonText}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NewsletterForm;