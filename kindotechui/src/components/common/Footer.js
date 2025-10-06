/**
 * Modern Footer component with Tanzania-themed design and enhanced features
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalCategories: 0 });

  useEffect(() => {
    loadFooterData();
  }, []);

  const loadFooterData = async () => {
    try {
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.slice(0, 6)); // Show first 6 categories
        setStats(prev => ({ ...prev, totalCategories: categoriesResponse.data.length }));
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
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
                  <i className="fas fa-globe-africa"></i>
                  <span className="brand-name">kindoTech</span>
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
                    <div className="stat-number">50+</div>
                    <div className="stat-label">Stories</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">2</div>
                    <div className="stat-label">Languages</div>
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
                  <div className="input-group">
                    <input 
                      type="email" 
                      className="form-control newsletter-input" 
                      placeholder="Enter your email"
                      aria-label="Email address"
                    />
                    <button className="btn newsletter-btn" type="button">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
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