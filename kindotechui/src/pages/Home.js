/**
 * Modern Homepage component for Tanzania Blog
 * Features hero section, category navigation, featured posts, and recent posts
 * Fully responsive with modern card-based design
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import PostCard from '../components/posts/PostCard';
import PostCardSkeleton from '../components/posts/PostCardSkeleton';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    loadHomepageData();
  }, []);

  const loadHomepageData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [featuredResponse, recentResponse, categoriesResponse] = await Promise.all([
        apiService.getFeaturedPosts(),
        apiService.getPosts({ page: 1, per_page: 6 }), // Use getPosts with pagination instead of getRecentPosts
        apiService.getCategories()
      ]);

      if (featuredResponse.success) setFeaturedPosts(featuredResponse.data);
      if (recentResponse.success) {
        const postsData = recentResponse.data.data || recentResponse.data;
        setRecentPosts(postsData);
        // Check if there are more posts available
        if (recentResponse.data.last_page) {
          setHasMorePosts(recentResponse.data.current_page < recentResponse.data.last_page);
        }
        // Calculate basic stats from recent posts
        const totalPosts = recentResponse.data.total || postsData.length;
        const totalViews = postsData.reduce((sum, post) => sum + (post.views || 0), 0);
        setStats({ totalPosts, totalViews });
      }
      if (categoriesResponse.success) setCategories(categoriesResponse.data);

    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMorePosts) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      
      const response = await apiService.getPosts({ 
        page: nextPage, 
        per_page: 6 
      });
      
      if (response.success) {
        const newPosts = response.data.data || response.data;
        setRecentPosts(prev => [...prev, ...newPosts]);
        setCurrentPage(nextPage);
        
        // Check if there are more posts
        if (response.data.last_page) {
          setHasMorePosts(nextPage < response.data.last_page);
        } else {
          setHasMorePosts(newPosts.length === 6); // If we got less than requested, no more posts
        }
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading kindoTech..." />;
  }

  return (
    <div className="modern-homepage">
      {/* Modern Animated Hero Section */}
      <section className="home-hero-modern position-relative overflow-hidden">
        <div className="hero-background-pattern"></div>
        <div className="hero-floating-elements">
          <div className="floating-icon floating-icon-1">
            <i className="fas fa-laptop-code"></i>
          </div>
          <div className="floating-icon floating-icon-2">
            <i className="fas fa-rocket"></i>
          </div>
          <div className="floating-icon floating-icon-3">
            <i className="fas fa-lightbulb"></i>
          </div>
          <div className="floating-icon floating-icon-4">
            <i className="fas fa-cogs"></i>
          </div>
        </div>
        <div className="container position-relative py-5">
          <div className="row align-items-center min-vh-60">
            <div className="col-lg-7">
              <div className="hero-content text-white">
                <div className="hero-badge mb-3">
                  <i className="fas fa-globe-africa me-2"></i>
                  Technology Hub
                </div>
                <h1 className="display-3 fw-bold mb-4 hero-title">
                  Welcome to <span className="text-tanzania-yellow">kindoTech</span>
                </h1>
                <p className="lead mb-4 hero-description">
                  Discover the latest in technology, innovation, and digital solutions.
                  Your gateway to cutting-edge tech insights and expertise from around the world.
                </p>
                <div className="hero-features mb-4">
                  <div className="feature-item">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>Latest Tech News</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>Expert Insights</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>Innovation Stories</span>
                  </div>
                </div>
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/posts" className="btn btn-cta-primary">
                    <i className="fas fa-book-open me-2"></i>
                    Explore Stories
                    <i className="fas fa-arrow-right ms-2"></i>
                  </Link>
                  <Link to="/categories" className="btn btn-cta-primary">
                    <i className="fas fa-compass me-2"></i>
                    Browse Topics
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="hero-stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalPosts}+</div>
                  <div className="stat-label">Stories Shared</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{Math.floor(stats.totalViews / 1000)}K+</div>
                  <div className="stat-label">Readers Reached</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{categories.length}+</div>
                  <div className="stat-label">Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Navigation */}
      <section className="categories-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Explore by Category</h2>
            <p className="text-muted">Discover content that interests you most</p>
          </div>
          <div className="row g-4">
            {categories.slice(0, 6).map((category, index) => (
              <div key={category.id} className="col-lg-2 col-md-4 col-6">
                <Link 
                  to={`/categories/${category.slug}`}
                  className="text-decoration-none category-card-wrapper"
                >
                  <div className={`category-card animate-scale-hover delay-${index}`}>
                    <div className="category-icon">
                      <i className={`${category.icon || 'fas fa-folder'} fa-2x`}></i>
                    </div>
                    <h6 className="category-name">{category.display_name || category.name}</h6>
                    <div className="category-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="featured-section py-5">
        <div className="container">
          <div className="row align-items-center mb-5">
            <div className="col">
              <h2 className="fw-bold mb-2">
                <i className="fas fa-star me-3 text-warning"></i>
                Featured Stories
              </h2>
              <p className="text-muted">Hand-picked articles just for you</p>
            </div>
          </div>

          <div className="row g-4">
            {featuredPosts.length > 0 ? (
              featuredPosts.slice(0, 2).map((post, index) => (
                <div key={post.id} className="col-lg-6">
                  <PostCard post={post} featured={true} animationDelay={index * 100} />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="empty-state text-center py-5">
                  <i className="fas fa-star fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">No featured posts yet</h4>
                  <p className="text-muted">Check back soon for amazing stories!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="recent-posts-section py-5 bg-light">
        <div className="container">
          <div className="row align-items-center mb-5">
            <div className="col">
              <h2 className="fw-bold mb-2">
                <i className="fas fa-clock me-3 text-tanzania-blue"></i>
                Latest Stories
              </h2>
              <p className="text-muted">Stay up to date with our newest content</p>
            </div>
            <div className="col-auto">
              <Link to="/posts" className="btn btn-outline-tanzania">
                View All Stories <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>

          <div className="row g-4">
            {loading ? (
              // Show loading skeletons while loading
              Array.from({ length: 6 }, (_, index) => (
                <PostCardSkeleton key={index} />
              ))
            ) : recentPosts.length > 0 ? (
              // Show ALL loaded posts, not just first 6
              recentPosts.map((post, index) => (
                <div key={post.id} className="col-lg-4 col-md-6">
                  <PostCard post={post} animationDelay={index * 50} />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="empty-state text-center py-5">
                  <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">No posts yet</h4>
                  <p className="text-muted">Be the first to share your story!</p>
                </div>
              </div>
            )}
            
            {/* Show additional loading skeletons when loading more */}
            {loadingMore && (
              Array.from({ length: 6 }, (_, index) => (
                <div key={`loading-${index}`} className="col-lg-4 col-md-6">
                  <PostCardSkeleton />
                </div>
              ))
            )}
          </div>

          {!loading && (
            <div className="text-center mt-5">
              {hasMorePosts && (
                <button 
                  onClick={loadMorePosts} 
                  className="btn btn-outline-tanzania btn-lg px-4 me-3"
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Loading more...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      Load More Stories
                    </>
                  )}
                </button>
              )}
              
              <Link to="/posts" className="btn btn-outline-tanzania btn-lg px-4">
                <i className="fas fa-th-large me-2"></i>
                View All Stories
              </Link>
              
              <div className="mt-3 text-muted small">
                <span>Showing {recentPosts.length} of {stats.totalPosts || recentPosts.length} stories</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section py-5 bg-tanzania text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h3 className="fw-bold mb-2">Stay Connected with Tanzania</h3>
              <p className="mb-0">Get the latest stories and updates delivered to your inbox</p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <div className="d-flex gap-3 justify-content-lg-end">
                <Link to="/posts" className="btn btn-light">
                  <i className="fas fa-rss me-2"></i>
                  Follow Updates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;