/**
 * Author Post Manager - Author-specific post management
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const AuthorPostManager = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState({
    total_posts: 0,
    published_posts: 0,
    draft_posts: 0
  });

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    loadPosts(1); // Load first page when filter changes
    loadStatistics(); // Load statistics when component mounts or filter changes
  }, [filter]);

  const loadStatistics = async () => {
    try {
      // Load all posts to get accurate counts
      const allPostsResponse = await apiService.getPosts({ 
        user_id: user.id,
        per_page: 1000 // Get a large number to ensure we get all posts
      });
      
      if (allPostsResponse?.success) {
        const allPosts = allPostsResponse.data.data || [];
        const publishedCount = allPosts.filter(post => post.is_published).length;
        const draftCount = allPosts.filter(post => !post.is_published).length;
        
        setStatistics({
          total_posts: allPosts.length,
          published_posts: publishedCount,
          draft_posts: draftCount
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadPosts = async (page = 1) => {
    try {
      setLoading(true);
      const params = { 
        user_id: user.id,
        page: page,
        per_page: 10
      };
      
      if (filter === 'published') {
        params.status = 'published';
      } else if (filter === 'draft') {
        params.status = 'draft';
      }

      const response = await apiService.getPosts(params);
      if (response?.success) {
        setPosts(response.data.data || []);
        setPagination({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || 10,
          total: response.data.total || 0,
          from: response.data.from || 0,
          to: response.data.to || 0
        });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      notify.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await apiService.deletePost(postId);
      if (response?.success) {
        notify.success('Post deleted successfully');
        loadPosts(pagination.current_page);
        loadStatistics(); // Refresh statistics after deletion
      } else {
        notify.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      notify.error('Failed to delete post');
    }
  };

  const togglePublish = async (post) => {
    try {
      const response = await apiService.updatePost(post.id, {
        ...post,
        is_published: !post.is_published
      });
      
      if (response?.success) {
        notify.success(post.is_published ? 'Post unpublished' : 'Post published');
        loadPosts(pagination.current_page);
        loadStatistics(); // Refresh statistics after status change
      } else {
        notify.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      notify.error('Failed to update post');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      loadPosts(page);
    }
  };

  const renderPagination = () => {
    if (pagination.last_page <= 1) {
      return null;
    }

    const pages = [];
    const currentPage = pagination.current_page;
    const totalPages = pagination.last_page;
    
    // Calculate visible page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Adjust range if near beginning or end
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPage > totalPages - 3) {
      startPage = Math.max(1, totalPages - 4);
    }

    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      </li>
    );

    // First page if not in visible range
    if (startPage > 1) {
      pages.push(
        <li key={1} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        pages.push(
          <li key="ellipsis1" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Last page if not in visible range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <li key="ellipsis2" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      pages.push(
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </button>
        </li>
      );
    }

    // Next button
    pages.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </li>
    );

    return (
      <nav aria-label="Posts pagination" className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted">
            Showing {pagination.from} to {pagination.to} of {pagination.total} posts
          </div>
          <ul className="pagination mb-0">
            {pages}
          </ul>
        </div>
      </nav>
    );
  };

  // Filter posts based on search term (client-side filtering for current page)
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-1">
            <i className="fas fa-file-alt me-2"></i>My Posts
          </h1>
          <p className="text-muted">Manage your blog posts</p>
        </div>
        <div className="col-auto">
          <Link to="/author/posts/new" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Write New Post
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="fas fa-file-alt fa-lg text-primary"></i>
                </div>
                <div>
                  <h3 className="mb-0 text-primary">{statistics.total_posts}</h3>
                  <p className="text-muted mb-0 small">Total Posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="fas fa-globe fa-lg text-success"></i>
                </div>
                <div>
                  <h3 className="mb-0 text-success">{statistics.published_posts}</h3>
                  <p className="text-muted mb-0 small">Published</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="fas fa-pencil-alt fa-lg text-warning"></i>
                </div>
                <div>
                  <h3 className="mb-0 text-warning">{statistics.draft_posts}</h3>
                  <p className="text-muted mb-0 small">Drafts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              <i className="fas fa-list me-1"></i>
              All Posts
              <span className="badge bg-light text-dark ms-2">{statistics.total_posts}</span>
            </button>
            <button
              type="button"
              className={`btn ${filter === 'published' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('published')}
            >
              <i className="fas fa-globe me-1"></i>
              Published
              <span className="badge bg-light text-dark ms-2">
                {statistics.published_posts}
              </span>
            </button>
            <button
              type="button"
              className={`btn ${filter === 'draft' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilter('draft')}
            >
              <i className="fas fa-pencil-alt me-1"></i>
              Drafts
              <span className="badge bg-light text-dark ms-2">
                {statistics.draft_posts}
              </span>
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading posts...</span>
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-5">
          <i className={`fas ${
            filter === 'published' ? 'fa-globe' : 
            filter === 'draft' ? 'fa-pencil-alt' : 
            'fa-file-alt'
          } fa-3x text-muted mb-3`}></i>
          <h5>
            {searchTerm ? 'No posts match your search' : 
             filter === 'published' ? 'No published posts yet' :
             filter === 'draft' ? 'No drafts found' :
             'No posts found'}
          </h5>
          <p className="text-muted mb-3">
            {searchTerm ? `No posts match "${searchTerm}". Try a different search term.` :
             filter === 'published' ? 'Once you publish your drafts, they\'ll appear here for the world to see.' :
             filter === 'draft' ? 'All your work-in-progress posts will be saved here.' :
             'You haven\'t written any posts yet. Start sharing your stories!'}
          </p>
          {!searchTerm && filter !== 'published' && (
            <Link to="/author/posts/new" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              {filter === 'draft' ? 'Start Writing' : 'Write Your First Post'}
            </Link>
          )}
          {!searchTerm && filter === 'published' && posts.filter(p => !p.is_published).length > 0 && (
            <button 
              className="btn btn-success" 
              onClick={() => setFilter('draft')}
            >
              <i className="fas fa-eye me-2"></i>
              Publish Your Drafts
            </button>
          )}
        </div>
      ) : (
        <div className="row">
          {filteredPosts.map(post => (
            <div key={post.id} className="col-lg-6 mb-4">
              <div className={`card border-0 shadow-sm h-100 ${!post.is_published ? 'border-warning' : ''}`}>
                {/* Status indicator bar */}
                <div className={`card-header bg-${post.is_published ? 'success' : 'warning'} py-1`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className={`text-${post.is_published ? 'white' : 'dark'} fw-bold`}>
                      <i className={`fas ${post.is_published ? 'fa-globe' : 'fa-pencil-alt'} me-1`}></i>
                      {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                    </small>
                    {!post.is_published && (
                      <small className="text-dark">
                        <i className="fas fa-clock me-1"></i>
                        Not visible to public
                      </small>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-1">{post.title}</h5>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <Link
                            to={`/author/posts/${post.id}/edit`}
                            className="dropdown-item"
                          >
                            <i className="fas fa-edit me-2"></i>Edit
                          </Link>
                        </li>
                        <li>
                          <button
                            className={`dropdown-item ${post.is_published ? 'text-warning' : 'text-success'}`}
                            onClick={() => togglePublish(post)}
                          >
                            <i className={`fas ${post.is_published ? 'fa-eye-slash' : 'fa-globe'} me-2`}></i>
                            {post.is_published ? 'Unpublish (Make Draft)' : 'Publish Now'}
                          </button>
                        </li>
                        {post.is_published && (
                          <li>
                            <Link
                              to={`/posts/${post.slug}`}
                              className="dropdown-item"
                              target="_blank"
                            >
                              <i className="fas fa-external-link-alt me-2"></i>View
                            </Link>
                          </li>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleDelete(post.id)}
                          >
                            <i className="fas fa-trash me-2"></i>Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="card-text text-muted small mb-2">
                    {post.excerpt || 'No excerpt available'}
                  </p>

                  <div className="d-flex align-items-center gap-2 mb-2">
                    {post.is_published ? (
                      <span className="badge bg-success d-flex align-items-center">
                        <i className="fas fa-globe me-1"></i>
                        Published
                      </span>
                    ) : (
                      <span className="badge bg-warning text-dark d-flex align-items-center">
                        <i className="fas fa-pencil-alt me-1"></i>
                        Draft
                      </span>
                    )}
                    {post.category && (
                      <span className="badge bg-info d-flex align-items-center">
                        <i className="fas fa-tag me-1"></i>
                        {post.category.name}
                      </span>
                    )}
                    {post.featured_image && (
                      <span className="badge bg-secondary d-flex align-items-center">
                        <i className="fas fa-image me-1"></i>
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center text-muted small">
                    <div>
                      <i className="fas fa-eye me-1"></i>
                      {post.views || 0} views
                    </div>
                    <div>
                      <i className="fas fa-comments me-1"></i>
                      {post.comments_count || 0} comments
                    </div>
                    <div>
                      <i className="fas fa-calendar me-1"></i>
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default AuthorPostManager;