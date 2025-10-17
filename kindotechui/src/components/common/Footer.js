/**
 * Modern Footer component with Tanzania-themed design and enhanced features
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import Logo from './Logo';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ 
    totalPosts: 0, 
    totalCategories: 0, 
    publishedPosts: 0, 
    totalViews: 0
  });
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      // Load categories and recent posts to get accurate stats
      const [categoriesResponse, postsResponse] = await Promise.all([
        apiService.getCategories(),
        apiService.getPosts({ per_page: 1 }) // Just get first page to get total count
      ]);
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.slice(0, 6)); // Show first 6 categories
        setStats(prev => ({ 
          ...prev, 
          totalCategories: categoriesResponse.data.length 
        }));
      }
      
      if (postsResponse.success) {
        const totalPosts = postsResponse.data.total || 0;
        setStats(prev => ({ 
          ...prev, 
          publishedPosts: totalPosts,
          totalPosts: totalPosts
        }));
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscribeMessage('Please enter a valid email address.');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setSubscribeMessage('Please enter a valid email address.');
      return;
    }
    
    try {
      setSubscribing(true);
      setSubscribeMessage('');
      
      // Call the actual API
      const response = await apiService.subscribeToNewsletter(email.trim(), 'footer');
      
      if (response.success) {
        setSubscribeMessage(response.message);
        setEmail('');
      } else {
        setSubscribeMessage(response.message || 'Sorry, there was an error subscribing. Please try again.');
      }
      
    } catch (error) {
      setSubscribeMessage('Sorry, there was an error subscribing. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-modern">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="row g-4">
            {/* Brand Section */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand">
                <div className="brand-logo">
                  <Logo size="large" />
                </div>
                <p className="brand-description">
                  Discover the latest in technology, innovation, and digital transformation. 
                  Your gateway to cutting-edge tech insights and solutions.
                </p>
                <div className="footer-stats">
                  <div className="stat-item">
                    <div className="stat-number">{stats.totalCategories}+</div>
                    <div className="stat-label">Categories</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.publishedPosts}+</div>
                    <div className="stat-label">Stories</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.totalViews}K+</div>
                    <div className="stat-label">Readers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6">
              <div className="footer-section">
                <h5 className="footer-title">Quick Links</h5>
                <ul className="footer-links">
                  <li>
                    <Link to="/" className="footer-link">
                      <i className="fas fa-home"></i>
                      <span>Home</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/posts" className="footer-link">
                      <i className="fas fa-newspaper"></i>
                      <span>All Stories</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/posts?featured=true" className="footer-link">
                      <i className="fas fa-star"></i>
                      <span>Featured</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/categories" className="footer-link">
                      <i className="fas fa-th-large"></i>
                      <span>Categories</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="footer-link">
                      <i className="fas fa-info-circle"></i>
                      <span>About Us</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Categories */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-section">
                <h5 className="footer-title">Popular Categories</h5>
                <ul className="footer-categories">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link to={`/categories/${category.slug}`} className="category-link">
                        <span className="category-name">{category.name}</span>
                        {category.posts_count > 0 && (
                          <span className="category-count">{category.posts_count}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                  {categories.length === 0 && (
                    <li className="loading-text">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Loading categories...
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Newsletter & Social */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-section">
                <h5 className="footer-title">Stay Connected</h5>
                <p className="newsletter-description">
                  Get the latest stories and updates delivered to your inbox.
                </p>
                
                {/* Newsletter Form */}
                <div className="newsletter-form">
                  {subscribeMessage && (
                    <div className={`alert ${subscribeMessage.includes('Thank you') ? 'alert-success' : 'alert-warning'} alert-sm mb-2`}>
                      <small>{subscribeMessage}</small>
                    </div>
                  )}
                  <form onSubmit={handleNewsletterSubscribe}>
                    <div className="input-group">
                      <input 
                        type="email" 
                        className="form-control newsletter-input" 
                        placeholder="Enter your email"
                        aria-label="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={subscribing}
                        required
                      />
                      <button 
                        className="btn newsletter-btn" 
                        type="submit"
                        disabled={subscribing}
                      >
                        {subscribing ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-paper-plane"></i>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Social Links */}
                <div className="social-section">
                  <h6 className="social-title">Follow Us</h6>
                  <div className="social-links">
                    <a href="#" className="social-link facebook" aria-label="Facebook">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="social-link twitter" aria-label="Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="social-link instagram" aria-label="Instagram">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#" className="social-link youtube" aria-label="YouTube">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="#" className="social-link linkedin" aria-label="LinkedIn">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="copyright">
                <p className="mb-0">
                  &copy; {currentYear} kindoTech. All rights reserved.
                </p>
                <p className="swahili-text mb-0">
                  Haki zote zimehifadhiwa
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-links">
                <Link to="/privacy" className="bottom-link">Privacy Policy</Link>
                <Link to="/terms" className="bottom-link">Terms of Service</Link>
                <Link to="/contact" className="bottom-link">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;