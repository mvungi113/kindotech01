/**
 * Newsletter Thank You Component
 * Simple component to show subscription success message
 */
import React from 'react';

const NewsletterThankYou = ({ email, onClose }) => {
  return (
    <div className="newsletter-thank-you">
      <div className="card border-success">
        <div className="card-body text-center">
          <div className="mb-3">
            <i className="fas fa-check-circle fa-3x text-success"></i>
          </div>
          <h5 className="card-title text-success">Thank You for Subscribing!</h5>
          <p className="card-text">
            We've successfully added <strong>{email}</strong> to our newsletter list.
          </p>
          <p className="text-muted mb-4">
            You'll receive our latest blog posts and updates directly in your inbox.
          </p>
          
          <div className="d-flex justify-content-center gap-2">
            <button 
              className="btn btn-tanzania"
              onClick={onClose}
            >
              <i className="fas fa-times me-1"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterThankYou;