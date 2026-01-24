/**
 * Modern Homepage component for KeyBlog
 * Features hero section, category navigation, featured posts, and recent posts
 * Fully responsive with modern card-based design
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import PostCardSkeleton from '../components/posts/PostCardSkeleton';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0, totalCategories: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    loadHomepageData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled near the bottom (within 300px)
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition >= pageHeight - 300 && !loadingMore && hasMorePosts) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMorePosts, currentPage]); // Re-attach listener when these change

  const loadHomepageData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [featuredResponse, recentResponse, categoriesResponse] = await Promise.all([
        apiService.getFeaturedPosts(),
        apiService.getPosts({ page: 1, per_page: 50 }), // Load 50 posts initially
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
        // Use stats from API response (retrieved from database)
        if (recentResponse.stats) {
          setStats({
            totalPosts: recentResponse.stats.total_posts || 0,
            totalViews: recentResponse.stats.total_views || 0,
            totalCategories: recentResponse.stats.total_categories || 0
          });
        } else {
          // Fallback to calculating from response data if stats not available
          const totalPosts = recentResponse.data.total || postsData.length;
          const totalViews = postsData.reduce((sum, post) => sum + (post.views || 0), 0);
          setStats({ totalPosts, totalViews, totalCategories: categories.length });
        }
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
        per_page: 50 
      });
      
      if (response.success) {
        const newPosts = response.data.data || response.data;
        setRecentPosts(prev => [...prev, ...newPosts]);
        setCurrentPage(nextPage);
        
        // Check if there are more posts
        if (response.data.last_page) {
          setHasMorePosts(nextPage < response.data.last_page);
        } else {
          setHasMorePosts(newPosts.length === 50); // If we got less than requested, no more posts
        }
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading KeyBlog..." />;
  }

  return (
    <div className="modern-homepage">
      {/* Hero Section with Latest Posts */}
      <section className="hero-posts-section py-5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          {/* Hero Posts Grid - MSN Style */}
          {recentPosts.length > 0 && (
            <div className="row g-3">
              {/* Large Featured Post */}
              <div className="col-lg-6">
                <Link to={`/posts/${recentPosts[0].slug}`} className="text-decoration-none">
                  <div className="card border-0 shadow-sm h-100 overflow-hidden hero-card-large">
                    <div className="position-relative" style={{ height: '400px' }}>
                      {recentPosts[0].featured_image ? (
                        <img 
                          src={`https://keysblog-464d939b8203.herokuapp.com/${recentPosts[0].featured_image}`}
                          className="w-100 h-100"
                          alt={recentPosts[0].title}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                          <i className="fas fa-image fa-4x text-muted"></i>
                        </div>
                      )}
                      <div className="position-absolute bottom-0 start-0 end-0 p-4" 
                           style={{ 
                             background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                             color: 'white'
                           }}>
                        <span className="badge bg-primary mb-2">
                          {recentPosts[0].category?.display_name || recentPosts[0].category?.name}
                        </span>
                        <h2 className="h3 fw-bold mb-2 text-white">{recentPosts[0].title}</h2>
                        <div className="d-flex align-items-center gap-3 small">
                          <span>
                            <i className="fas fa-user me-1"></i>
                            {recentPosts[0].user?.name}
                          </span>
                          <span>
                            <i className="fas fa-clock me-1"></i>
                            {recentPosts[0].reading_time || 5} min read
                          </span>
                          <span>
                            <i className="fas fa-eye me-1"></i>
                            {recentPosts[0].views || 0} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Right Column - Two Smaller Posts */}
              <div className="col-lg-6">
                <div className="row g-3 h-100">
                  {recentPosts.slice(1, 3).map((post, index) => (
                    <div key={post.id} className="col-12">
                      <Link to={`/posts/${post.slug}`} className="text-decoration-none">
                        <div className="card border-0 shadow-sm overflow-hidden hero-card-small">
                          <div className="row g-0">
                            <div className="col-5">
                              <div className="position-relative" style={{ height: '190px' }}>
                                {post.featured_image ? (
                                  <img 
                                    src={`https://keysblog-464d939b8203.herokuapp.com/${post.featured_image}`}
                                    className="w-100 h-100"
                                    alt={post.title}
                                    style={{ objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                                    <i className="fas fa-image fa-2x text-muted"></i>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-7">
                              <div className="card-body h-100 d-flex flex-column">
                                <span className="badge bg-primary mb-2 align-self-start">
                                  {post.category?.display_name || post.category?.name}
                                </span>
                                <h5 className="card-title mb-2 flex-grow-1" style={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: '3',
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {post.title}
                                </h5>
                                <div className="d-flex align-items-center gap-3 small text-muted">
                                  <span>
                                    <i className="fas fa-user me-1"></i>
                                    {post.user?.name}
                                  </span>
                                  <span>
                                    <i className="fas fa-eye me-1"></i>
                                    {post.views || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row - All Remaining Posts */}
              {recentPosts.length > 3 && (
                <>
                  {recentPosts.slice(3).map((post) => (
                    <div key={post.id} className="col-lg-4 col-md-6">
                      <Link to={`/posts/${post.slug}`} className="text-decoration-none">
                        <div className="card border-0 shadow-sm h-100 overflow-hidden hero-card-medium">
                          <div className="position-relative" style={{ height: '180px' }}>
                            {post.featured_image ? (
                              <img 
                                src={`https://keysblog-464d939b8203.herokuapp.com/${post.featured_image}`}
                                className="w-100 h-100"
                                alt={post.title}
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                                <i className="fas fa-image fa-3x text-muted"></i>
                              </div>
                            )}
                          </div>
                          <div className="card-body">
                            <span className="badge bg-primary mb-2">
                              {post.category?.display_name || post.category?.name}
                            </span>
                            <h6 className="card-title mb-2" style={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {post.title}
                            </h6>
                            <div className="d-flex align-items-center gap-3 small text-muted">
                              <span>
                                <i className="fas fa-clock me-1"></i>
                                {post.reading_time || 5} min
                              </span>
                              <span>
                                <i className="fas fa-eye me-1"></i>
                                {post.views || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </>
              )}

              {/* Loading Indicator */}
              {loadingMore && (
                <>
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={`loading-${index}`} className="col-lg-4 col-md-6">
                      <PostCardSkeleton />
                    </div>
                  ))}
                </>
              )}

              {/* End Message */}
              {!hasMorePosts && recentPosts.length > 6 && (
                <div className="col-12">
                  <div className="text-center mt-4 pt-4 border-top">
                    <p className="text-muted mb-3">
                      <i className="fas fa-check-circle me-2"></i>
                      You've reached the end. Showing all {recentPosts.length} posts.
                    </p>
                    <Link to="/posts" className="btn btn-outline-tanzania">
                      <i className="fas fa-th-large me-2"></i>
                      Browse All Posts
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;