/**
 * Categories page - displays all available categories
 * Users can browse and select categories to view posts
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      
      if (response.success) {
        setCategories(response.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Function to get appropriate icon for category
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();

    // Technology
    if (name.includes('technology') || name.includes('tech')) {
      return 'fas fa-microchip';
    }

    // Programming & Development
    if (name.includes('programming') || name.includes('development') || name.includes('coding')) {
      return 'fas fa-code';
    }

    // Artificial Intelligence & Machine Learning
    if (name.includes('artificial intelligence') || name.includes('machine learning') || name.includes('ai') || name.includes('ml')) {
      return 'fas fa-brain';
    }

    // Cybersecurity
    if (name.includes('cybersecurity') || name.includes('security') || name.includes('cyber')) {
      return 'fas fa-shield-alt';
    }

    // Web Development
    if (name.includes('web development') || name.includes('web')) {
      return 'fas fa-globe';
    }

    // Mobile App Development
    if (name.includes('mobile') || name.includes('app') || name.includes('android') || name.includes('ios')) {
      return 'fas fa-mobile-alt';
    }

    // Cloud & DevOps
    if (name.includes('cloud') || name.includes('devops') || name.includes('docker')) {
      return 'fas fa-cloud';
    }

    // Startups & Innovation
    if (name.includes('startup') || name.includes('innovation') || name.includes('business')) {
      return 'fas fa-rocket';
    }

    // Reviews & Recommendations
    if (name.includes('review') || name.includes('recommendation')) {
      return 'fas fa-star';
    }

    // How-To Guides
    if (name.includes('how-to') || name.includes('guide') || name.includes('tutorial')) {
      return 'fas fa-book-open';
    }

    // Default fallback
    return 'fas fa-folder';
  };

  if (loading) {
    return <LoadingSpinner text="Loading categories..." />;
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
          <button onClick={loadCategories} className="btn btn-tanzania">
            <i className="fas fa-redo me-2"></i>Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* Enhanced Hero Section */}
      <section className="categories-hero-modern position-relative overflow-hidden">
        <div className="hero-background-pattern"></div>
        <div className="hero-floating-elements">
          <div className="floating-icon floating-icon-1">
            <i className="fas fa-newspaper"></i>
          </div>
          <div className="floating-icon floating-icon-2">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="floating-icon floating-icon-3">
            <i className="fas fa-laptop-code"></i>
          </div>
          <div className="floating-icon floating-icon-4">
            <i className="fas fa-landmark"></i>
          </div>
        </div>
        <div className="container position-relative py-5">
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-7">
              <div className="hero-content text-white">
                <div className="hero-badge mb-3">
                  <i className="fas fa-compass me-2"></i>
                  Discover & Explore
                </div>
                <h1 className="display-3 fw-bold mb-4 hero-title">
                  Explore <span className="text-tanzania-yellow">Categories</span>
                </h1>
                <p className="lead mb-4 hero-description">
                  Dive into a world of organized content. From breaking news to cultural insights, 
                  discover stories that match your interests and passions.
                </p>
                <div className="hero-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>Curated Content</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>Multiple Languages</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>Regular Updates</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="hero-stats-modern">
                <div className="stats-container">
                  <div className="stat-card-modern">
                    <div className="stat-icon">
                      <i className="fas fa-th-large"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number-modern">{categories.length}</div>
                      <div className="stat-label-modern">Categories</div>
                    </div>
                  </div>
                  <div className="stat-card-modern">
                    <div className="stat-icon">
                      <i className="fas fa-globe-africa"></i>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number-modern">2</div>
                      <div className="stat-label-modern">Languages</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Categories Grid */}
      <section className="categories-modern-grid py-5">
        <div className="container">
          {categories.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="section-header text-center mb-5">
                <div className="section-subtitle">Choose Your Interest</div>
                <h2 className="section-title">Browse by Category</h2>
                <div className="section-divider"></div>
              </div>

              {/* Categories Masonry Grid */}
              <div className="categories-masonry">
                {categories.map((category, index) => (
                  <div key={category.id} className={`category-card-modern animate-fade-in-up delay-${index % 4}`}>
                    <Link 
                      to={`/categories/${category.slug}`}
                      className="text-decoration-none"
                    >
                      <div className="category-card-inner">
                        <div className="category-header">
                          <div className="category-icon-modern">
                            <i className={getCategoryIcon(category.name)}></i>
                          </div>
                          <div className="category-badge">
                            {category.posts_count || 0} posts
                          </div>
                        </div>
                        
                        <div className="category-body">
                          <h4 className="category-title-modern">{category.name}</h4>
                          {category.name_sw && (
                            <div className="category-subtitle-sw">{category.name_sw}</div>
                          )}
                          <p className="category-description-modern">
                            {category.description || `Discover amazing stories and insights about ${category.name.toLowerCase()}.`}
                          </p>
                        </div>
                        
                        <div className="category-footer">
                          <div className="category-action">
                            <span className="action-text">Explore Category</span>
                            <i className="fas fa-arrow-right action-arrow"></i>
                          </div>
                        </div>
                        
                        <div className="category-overlay"></div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Modern CTA Section */}
              <div className="cta-modern-section mt-5">
                <div className="cta-modern-container">
                  <div className="row align-items-center">
                    <div className="col-lg-7">
                      <div className="cta-content">
                        <h3 className="cta-title">Ready to Start Reading?</h3>
                        <p className="cta-description">
                          Join thousands of readers exploring amazing stories from Tanzania and around the world. 
                          Start your journey today with our curated content.
                        </p>
                        <div className="cta-features">
                          <div className="cta-feature">
                            <i className="fas fa-check me-2"></i>
                            <span>Fresh content daily</span>
                          </div>
                          <div className="cta-feature">
                            <i className="fas fa-check me-2"></i>
                            <span>Expert-curated stories</span>
                          </div>
                          <div className="cta-feature">
                            <i className="fas fa-check me-2"></i>
                            <span>Multiple perspectives</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div className="cta-actions">
                        <Link to="/posts" className="btn btn-cta-primary">
                          <i className="fas fa-book-open me-2"></i>
                          Browse All Stories
                          <i className="fas fa-arrow-right ms-2"></i>
                        </Link>
                        <Link to="/posts?featured=true" className="btn btn-cta-secondary">
                          <i className="fas fa-star me-2"></i>
                          Featured Posts
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state text-center py-5">
              <i className="fas fa-folder-open fa-4x text-muted mb-4"></i>
              <h3 className="text-muted mb-3">No Categories Yet</h3>
              <p className="text-muted mb-4">
                Categories will appear here once they're created by administrators.
              </p>
              <Link to="/" className="btn btn-tanzania">
                <i className="fas fa-home me-2"></i>
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Helper function to get appropriate icon for category
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('news') || name.includes('politics')) return 'fas fa-newspaper';
  if (name.includes('business') || name.includes('economy')) return 'fas fa-chart-line';
  if (name.includes('technology') || name.includes('tech')) return 'fas fa-laptop-code';
  if (name.includes('culture') || name.includes('heritage')) return 'fas fa-landmark';
  if (name.includes('sports')) return 'fas fa-futbol';
  if (name.includes('travel') || name.includes('tourism')) return 'fas fa-plane';
  if (name.includes('health')) return 'fas fa-heartbeat';
  if (name.includes('education')) return 'fas fa-graduation-cap';
  if (name.includes('entertainment')) return 'fas fa-music';
  if (name.includes('food')) return 'fas fa-utensils';
  if (name.includes('lifestyle')) return 'fas fa-coffee';
  if (name.includes('environment')) return 'fas fa-leaf';
  
  return 'fas fa-folder'; // Default icon
};

export default Categories;