/**
 * All Posts page - Public view of all published blog posts
 * Features search, filtering, load more functionality, and modern card-based layout
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import PostCard from '../components/posts/PostCard';
import PostCardSkeleton from '../components/posts/PostCardSkeleton';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial values from URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const featured = searchParams.get('featured') === 'true';
    
    setSearchTerm(search);
    setSelectedCategory(category);
    setShowFeaturedOnly(featured);
    
    // Reset posts and page when filters change
    setPosts([]);
    setCurrentPage(1);
    setHasMorePosts(true);
  }, [searchParams]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Reset and load posts when filters change
    setPosts([]);
    setCurrentPage(1);
    setHasMorePosts(true);
    loadPosts(true); // true = reset posts
  }, [selectedCategory, searchTerm, showFeaturedOnly]);

  useEffect(() => {
    loadCategories();
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
  }, [loadingMore, hasMorePosts, currentPage]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPosts = async (resetPosts = false) => {
    try {
      if (resetPosts) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const params = {
        page: resetPosts ? 1 : currentPage,
        per_page: 12, // Show 12 posts per page
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (showFeaturedOnly) params.featured = true;

      const response = await apiService.getPosts(params);
      
      if (response.success) {
        // Handle Laravel pagination structure
        let postsData, totalPagesCount, totalPostsCount;
        
        if (response.data && typeof response.data === 'object' && response.data.data) {
          // Paginated response from Laravel
          postsData = response.data.data;
          totalPagesCount = response.data.last_page || 1;
          totalPostsCount = response.data.total || postsData.length;
        } else if (response.data && Array.isArray(response.data)) {
          // Direct array response
          postsData = response.data;
          totalPagesCount = 1;
          totalPostsCount = postsData.length;
        } else {
          // Fallback
          postsData = [];
          totalPagesCount = 1;
          totalPostsCount = 0;
        }
        
        if (resetPosts) {
          setPosts(postsData);
          setCurrentPage(1);
        } else {
          setPosts(prevPosts => [...prevPosts, ...postsData]);
        }
        
        setHasMorePosts((resetPosts ? 1 : currentPage) < totalPagesCount);
        setTotalPosts(totalPostsCount);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMorePosts) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    // Load posts for the next page
    setTimeout(() => {
      loadPosts(false);
    }, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURL();
    loadPosts();
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (showFeaturedOnly) params.set('featured', 'true');
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowFeaturedOnly(false);
    setSearchParams({});
  };

  if (loading && posts.length === 0) {
    return <LoadingSpinner text="Loading stories..." />;
  }

  return (
    <div className="all-posts-page">
      {/* Filters Section */}
      <section className="filters-section py-4 border-bottom" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="search-form">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-tanzania" type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="col-lg-6">
              {/* Category Filter */}
              <div className="d-flex align-items-center justify-content-lg-end mt-3 mt-lg-0">
                <label className="me-2 fw-semibold">Category:</label>
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.display_name || category.name}
                    </option>
                  ))}
                </select>
                {(searchTerm || selectedCategory || showFeaturedOnly) && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline-secondary ms-2"
                    title="Clear filters"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="posts-grid py-5">
        <div className="container">
          {/* Active Filters Display */}
          {(searchTerm || selectedCategory || showFeaturedOnly) && (
            <div className="active-filters mb-4">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="text-muted">Filtered by:</span>
                {searchTerm && (
                  <span className="badge bg-tanzania-green">
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="badge bg-tanzania-blue">
                    Category: {categories.find(c => c.slug === selectedCategory)?.display_name || selectedCategory}
                  </span>
                )}
                {showFeaturedOnly && (
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-star me-1"></i>
                    Featured Only
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="results-info mb-4">
            <p className="text-muted mb-0">
              {posts.length > 0 ? (
                <>Showing {posts.length} of {totalPosts} stories</>
              ) : (
                'Loading stories...'
              )}
            </p>
          </div>

          {/* Posts Grid */}
          <div className="row g-4">
            {loading && posts.length === 0 ? (
              // Initial loading skeletons
              Array.from({ length: 12 }, (_, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <PostCardSkeleton />
                </div>
              ))
            ) : posts.length > 0 ? (
              // Display posts
              posts.map((post, index) => (
                <div key={post.id} className="col-lg-4 col-md-6">
                  <PostCard post={post} animationDelay={index * 50} />
                </div>
              ))
            ) : (
              // Empty state
              <div className="col-12">
                <div className="empty-state text-center py-5">
                  <i className={`fas ${showFeaturedOnly ? 'fa-star' : 'fa-search'} fa-3x text-muted mb-3`}></i>
                  <h4 className="text-muted">
                    {showFeaturedOnly ? 'No featured posts found' : 'No posts found'}
                  </h4>
                  <p className="text-muted">
                    {showFeaturedOnly 
                      ? 'Check back soon for featured content!' 
                      : searchTerm || selectedCategory 
                        ? 'Try adjusting your search criteria or browse all posts'
                        : 'Be the first to share your story!'
                    }
                  </p>
                  {(searchTerm || selectedCategory || showFeaturedOnly) && (
                    <button
                      onClick={clearFilters}
                      className="btn btn-outline-tanzania mt-3"
                    >
                      <i className="fas fa-refresh me-2"></i>
                      {showFeaturedOnly ? 'View All Posts' : 'Clear Filters'}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Loading more skeletons */}
            {loadingMore && (
              Array.from({ length: 6 }, (_, index) => (
                <div key={`loading-${index}`} className="col-lg-4 col-md-6">
                  <PostCardSkeleton />
                </div>
              ))
            )}
          </div>

          {/* Infinite scroll loading indicator */}
          {loadingMore && hasMorePosts && (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading more...</span>
              </div>
              <p className="text-muted mt-2">Loading more stories...</p>
            </div>
          )}

          {/* End of results message */}
          {!hasMorePosts && posts.length > 0 && (
            <div className="text-center mt-5">
              <p className="text-muted">
                <i className="fas fa-check-circle me-2 text-success"></i>
                You've seen all {totalPosts} {showFeaturedOnly ? 'featured ' : ''}stories!
              </p>
              {showFeaturedOnly && (
                <Link to="/posts" className="btn btn-outline-primary mt-2">
                  <i className="fas fa-th-large me-2"></i>
                  View All Posts
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllPosts;