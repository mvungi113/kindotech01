/**
 * Test page for Newsletter Subscription functionality
 * Displays both the reusable component and individual form
 */
import React from 'react';
import NewsletterForm from '../components/newsletter/NewsletterForm';

const NewsletterTest = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="text-center mb-5">
            <h1 className="display-4">Newsletter Subscription Test</h1>
            <p className="lead text-muted">
              Test the newsletter subscription functionality with different configurations
            </p>
          </div>

          {/* Default Newsletter Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Default Newsletter Form</h5>
            </div>
            <div className="card-body">
              <NewsletterForm source="test_page" />
            </div>
          </div>

          {/* Compact Newsletter Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Compact Newsletter Form (No Title/Description)</h5>
            </div>
            <div className="card-body">
              <NewsletterForm 
                source="test_compact"
                showTitle={false}
                showDescription={false}
                placeholder="Enter your email..."
                buttonText="Subscribe Now"
              />
            </div>
          </div>

          {/* Custom Newsletter Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Custom Newsletter Form</h5>
            </div>
            <div className="card-body bg-light">
              <NewsletterForm 
                source="test_custom"
                title="Join Our Community"
                description="Be the first to know about new articles, updates, and exclusive content from our Kindo Tech blog."
                placeholder="example@domain.com"
                buttonText="Join Newsletter"
                className="custom-newsletter"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="alert alert-info">
            <h6 className="alert-heading">
              <i className="fas fa-info-circle me-2"></i>
              Testing Instructions
            </h6>
            <ul className="mb-0">
              <li>Try subscribing with a valid email address</li>
              <li>Try subscribing with the same email again (should show "already subscribed")</li>
              <li>Try invalid email formats to test validation</li>
              <li>Check the browser network tab to see API calls</li>
              <li>Admin users can check subscribers in the Newsletter Management page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterTest;