/**
 * About Page for KeyBlog
 * Provides information about the blog, its mission, and team
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const About = () => {
  const [stats, setStats] = useState({
    totalPosts: 500,
    totalViews: 10000,
    totalCategories: 50,
    totalReaders: 1000
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total posts count and some posts for view calculation
      const postsResponse = await apiService.getPosts({ page: 1, per_page: 20 });
      if (postsResponse.success) {
        const totalPosts = postsResponse.data.total || 0;
        const postsData = postsResponse.data.data || postsResponse.data;
        const totalViews = postsData.reduce((sum, post) => sum + (post.views || 0), 0);
        // Estimate total views based on sample (assuming similar view distribution)
        const estimatedTotalViews = totalPosts > 0 ? Math.round((totalViews / postsData.length) * totalPosts) : 0;
        
        setStats(prev => ({ 
          ...prev, 
          totalPosts,
          totalViews: estimatedTotalViews
        }));
      }

      // Get categories count
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.success) {
        const totalCategories = categoriesResponse.data.length || 0;
        setStats(prev => ({ ...prev, totalCategories }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Keep default values if API fails
    }
  };
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-4">
                About <span className="text-tanzania-yellow">KeyBlog</span>
              </h1>
              <p className="lead mb-4">
                Your gateway to engaging stories, diverse perspectives, and meaningful discussions from writers around the world.
              </p>
              <Link to="/posts" className="btn btn-tanzania btn-lg">
                <i className="fas fa-book-open me-2"></i>
                Explore Our Stories
              </Link>
            </div>
            <div className="col-lg-4">
              <div className="about-hero-image">
                <i className="fas fa-blog fa-6x text-tanzania-blue opacity-25"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">Our Mission</h2>
              <p className="mb-4">
                At KeyBlog, we believe in the power of storytelling to connect people, share knowledge, and inspire change.
                Our platform serves as a digital space where writers, thinkers, and creators can share their unique perspectives
                on topics that matter to our global community.
              </p>
              <p className="mb-4">
                We are committed to fostering meaningful conversations, promoting diverse voices, and creating a welcoming
                environment for readers and writers alike. Every story matters, and every voice deserves to be heard.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="mission-stats">
                <div className="row g-4">
                  <div className="col-6">
                    <div className="stat-card text-center p-4 bg-light rounded">
                      <i className="fas fa-users fa-2x text-tanzania-green mb-3"></i>
                      <h3 className="fw-bold mb-1">{Math.floor(stats.totalReaders / 100) * 100}+</h3>
                      <p className="text-muted mb-0">Community Members</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stat-card text-center p-4 bg-light rounded">
                      <i className="fas fa-pen-fancy fa-2x text-tanzania-blue mb-3"></i>
                      <h3 className="fw-bold mb-1">{stats.totalPosts}+</h3>
                      <p className="text-muted mb-0">Published Stories</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stat-card text-center p-4 bg-light rounded">
                      <i className="fas fa-globe fa-2x text-tanzania-yellow mb-3"></i>
                      <h3 className="fw-bold mb-1">{stats.totalCategories}+</h3>
                      <p className="text-muted mb-0">Categories</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stat-card text-center p-4 bg-light rounded">
                      <i className="fas fa-heart fa-2x text-danger mb-3"></i>
                      <h3 className="fw-bold mb-1">{Math.floor(stats.totalViews / 1000)}K+</h3>
                      <p className="text-muted mb-0">Readers Engaged</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Our Values</h2>
            <p className="text-muted">The principles that guide everything we do</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="value-card text-center p-4">
                <div className="value-icon mb-3">
                  <i className="fas fa-users fa-3x text-tanzania-green"></i>
                </div>
                <h4 className="fw-bold mb-3">Community First</h4>
                <p className="text-muted">
                  We prioritize building a supportive community where everyone feels welcome to share their thoughts and ideas.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="value-card text-center p-4">
                <div className="value-icon mb-3">
                  <i className="fas fa-balance-scale fa-3x text-tanzania-blue"></i>
                </div>
                <h4 className="fw-bold mb-3">Diversity & Inclusion</h4>
                <p className="text-muted">
                  We celebrate diverse perspectives and ensure that voices from all backgrounds are represented and valued.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="value-card text-center p-4">
                <div className="value-icon mb-3">
                  <i className="fas fa-lightbulb fa-3x text-tanzania-yellow"></i>
                </div>
                <h4 className="fw-bold mb-3">Innovation & Creativity</h4>
                <p className="text-muted">
                  We encourage creative expression and innovative thinking in all forms of storytelling and content creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Meet Our Team</h2>
            <p className="text-muted">The passionate individuals behind KeyBlog</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-4 col-md-6">
              <div className="team-card text-center p-4 bg-light rounded">
                <div className="team-avatar mb-3">
                  <i className="fas fa-user-circle fa-4x text-tanzania-blue"></i>
                </div>
                <h5 className="fw-bold mb-1">Editorial Team</h5>
                <p className="text-muted mb-3">Content Curators & Editors</p>
                <p className="small text-muted">
                  Our editorial team carefully selects and curates the best stories to ensure quality and relevance for our readers.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="team-card text-center p-4 bg-light rounded">
                <div className="team-avatar mb-3">
                  <i className="fas fa-code fa-4x text-tanzania-green"></i>
                </div>
                <h5 className="fw-bold mb-1">Development Team</h5>
                <p className="text-muted mb-3">Platform Builders</p>
                <p className="small text-muted">
                  Our developers work tirelessly to create and maintain the platform that brings these stories to life.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="team-card text-center p-4 bg-light rounded">
                <div className="team-avatar mb-3">
                  <i className="fas fa-users-cog fa-4x text-tanzania-yellow"></i>
                </div>
                <h5 className="fw-bold mb-1">Community Managers</h5>
                <p className="text-muted mb-3">Engagement Specialists</p>
                <p className="small text-muted">
                  Dedicated to fostering positive interactions and building a thriving community of writers and readers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section py-5 bg-tanzania text-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Get In Touch</h2>
          <p className="mb-4">
            Have a story to share? Want to collaborate? We'd love to hear from you.
          </p>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="contact-item">
                <i className="fas fa-envelope fa-2x mb-3"></i>
                <h5>Write for Us</h5>
                <p>Share your story with our community</p>
                <Link to="/register" className="btn btn-light">
                  Become an Author
                </Link>
              </div>
            </div>
            <div className="col-md-4">
              <div className="contact-item">
                <i className="fas fa-comments fa-2x mb-3"></i>
                <h5>Community</h5>
                <p>Join the conversation</p>
                <Link to="/posts" className="btn btn-light">
                  Explore Stories
                </Link>
              </div>
            </div>
            <div className="col-md-4">
              <div className="contact-item">
                <i className="fas fa-newspaper fa-2x mb-3"></i>
                <h5>Newsletter</h5>
                <p>Stay updated with our latest content</p>
                <a href="#newsletter" className="btn btn-light">
                  Subscribe
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;