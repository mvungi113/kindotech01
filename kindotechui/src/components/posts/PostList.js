/**
 * Component for displaying a list of posts with pagination
 * Supports filtering and search functionality
 */
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';

const PostList = ({ categorySlug = null, searchQuery = '', loadMoreStyle = false }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    // Reset to page 1 when category or search changes
    if (currentPage === 1) {
      loadPosts();
    } else {
      setCurrentPage(1);
    }
  }, [categorySlug, searchQuery]);

  useEffect(() => {
    // Load posts when page changes (but not for load more style)
    if (currentPage === 1 || !loadMoreStyle) {
      loadPosts();
    }
  }, [currentPage]);

  const loadPosts = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: currentPage,
        per_page: 9
      };

      if (categorySlug) {
        params.category = categorySlug;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiService.getPosts(params);
      
      if (response.success) {
        const newPosts = response.data.data;
        
        if (loadMoreStyle && isLoadMore) {
          // Append to existing posts for load more style
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        } else {
          // Replace posts for pagination style
          setPosts(newPosts);
        }
        
        setTotalPages(response.data.last_page);
        setHasMorePosts(currentPage < response.data.last_page);
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('Error loading posts: ' + err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (!loadMoreStyle) {
      window.scrollTo(0, 0);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMorePosts) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    
    // For load more style, we need to manually trigger the load
    setTimeout(() => {
      loadPosts(true);
    }, 0);
  };

  if (loading) {
    return <LoadingSpinner text="Loading posts..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
        <h4 className="text-muted">No posts found</h4>
        <p className="text-muted">
          {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new posts'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Posts Grid */}
      <div className="row">
        {posts.map((post) => (
          <div key={post.id} className="col-lg-4 col-md-6 mb-4">
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Show additional loading skeletons when loading more */}
      {loadingMore && (
        <div className="row">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`loading-${index}`} className="col-lg-4 col-md-6 mb-4">
              <div className="card">
                <div className="skeleton-loader" style={{ height: '200px' }}></div>
                <div className="card-body">
                  <div className="skeleton-text mb-2"></div>
                  <div className="skeleton-text mb-2"></div>
                  <div className="skeleton-text" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button or Pagination */}
      {totalPages > 1 && (
        loadMoreStyle ? (
          // Load More Style
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
                    Load More Posts
                  </>
                )}
              </button>
            )}
            
            <div className="mt-3 text-muted small">
              <span>Showing {posts.length} posts</span>
            </div>
          </div>
        ) : (
          // Traditional Pagination
          <nav aria-label="Posts pagination" className="mt-5">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages)].map((_, index) => (
                <li 
                  key={index + 1} 
                  className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  <button 
                    className="page-link"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )
      )}
    </div>
  );
};

export default PostList;