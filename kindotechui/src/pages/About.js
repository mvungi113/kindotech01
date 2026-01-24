/**
 * About Page for KeyBlog
 * Provides information about the blog, its mission, and team
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const About = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalCategories: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [postsResponse, categoriesResponse] = await Promise.all([
        apiService.getPosts({ page: 1, per_page: 1 }),
        apiService.getCategories()
      ]);

      if (postsResponse.success) {
        setStats(prev => ({ 
          ...prev, 
          totalPosts: postsResponse.data.total || 0
        }));
      }

      if (categoriesResponse.success) {
        setStats(prev => ({ 
          ...prev, 
          totalCategories: categoriesResponse.data.length || 0 
        }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12 text-center">
              <h1 className="display-4 fw-bold mb-4">
                About KeyBlog
              </h1>
              <p className="lead mb-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
                A platform for engaging stories, diverse perspectives, and meaningful discussions from writers around the world.
              </p>
              <Link to="/posts" className="btn btn-primary btn-lg">
                <i className="fas fa-book-open me-2"></i>
                Explore Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-4 text-center">Our Mission</h2>
              <p className="mb-4 text-center">
                KeyBlog is a digital space where writers and creators share their unique perspectives
                on topics that matter to our global community. We believe in the power of storytelling 
                to connect people, share knowledge, and inspire change.
              </p>
              
              {/* Stats */}
              <div className="row g-4 mt-4">
                <div className="col-md-6">
                  <div className="stat-card text-center p-4 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    <i className="fas fa-newspaper fa-3x text-primary mb-3"></i>
                    <h3 className="fw-bold mb-1">{stats.totalPosts}</h3>
                    <p className="text-muted mb-0">Published Stories</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="stat-card text-center p-4 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    <i className="fas fa-folder-open fa-3x text-success mb-3"></i>
                    <h3 className="fw-bold mb-1">{stats.totalCategories}</h3>
                    <p className="text-muted mb-0">Categories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section py-5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">What We Stand For</h2>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-4 col-md-6">
              <div className="value-card text-center p-4">
                <div className="value-icon mb-3">
                  <i className="fas fa-users fa-3x text-primary"></i>
                </div>
                <h4 className="fw-bold mb-3">Community</h4>
                <p className="text-muted">
                  Building a supportive space where everyone can share their thoughts and ideas.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="value-card text-center p-4">
                <div className="value-icon mb-3">
                  <i className="fas fa-globe fa-3x text-success"></i>
                </div>
                <h4 className="fw-bold mb-3">Diversity</h4>
                <p className="text-muted">
                  Celebrating different perspectives and voices from all backgrounds.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="value-card text-center p-4">
                <div className="value-icon mb-3">
                  <i className="fas fa-pen-fancy fa-3x text-warning"></i>
                </div>
                <h4 className="fw-bold mb-3">Quality</h4>
                <p className="text-muted">
                  Encouraging creative expression and thoughtful content creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;