/**
 * Component for displaying a list of posts with pagination
 * Supports filtering and search functionality
 */
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import PostCard from './PostCard';
import LoadingSpinner from '../common/LoadingSpinner';

const PostList = ({ categorySlug = null, searchQuery = '' }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPosts();
  }, [categorySlug, searchQuery, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
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
        setPosts(response.data.data);
        setTotalPages(response.data.last_page);
      } else {
        setError('Failed to load posts');
      }
    } catch (err) {
      setError('Error loading posts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
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

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
};

export default PostList;