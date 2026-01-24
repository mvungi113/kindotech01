/**
 * Admin post management - Create, edit, and manage blog posts
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PostManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  
  const [mode, setMode] = useState('list');
  const [posts, setPosts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter and pagination state
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerPage] = useState(10);
  
  // Statistics state
  const [stats, setStats] = useState({
    total_posts: 0,
    published_posts: 0,
    draft_posts: 0,
    total_comments: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    title_sw: '',
    content: '',
    content_sw: '',
    excerpt: '',
    category_id: '',
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    tags: ''
  });

  // Determine mode based on URL
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/create') || path.includes('/new')) {
      setMode('create');
    } else if (path.includes('/edit/') || id) {
      setMode('edit');
    } else {
      setMode('list');
    }
  }, [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (mode === 'list' || mode === 'create') {
      loadPosts();
      loadCategories();
    } else if (mode === 'edit' && id) {
      loadPostForEdit();
      loadCategories();
    }
  }, [mode, id, filter, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: currentPage,
        per_page: postsPerPage,
        admin: true // Request admin data including statistics
      };
      
      // Add status filter
      if (filter === 'published') {
        params.status = 'published';
      } else if (filter === 'draft') {
        params.status = 'draft';
      }
      
      console.log('=== LOADING POSTS ===');
      console.log('Filter:', filter);
      console.log('Params being sent:', params);
      
      const response = await apiService.getPosts(params);
      if (response.success) {
        setPosts(response.data.data || []);
        // Handle pagination info
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotalPosts(response.data.total || 0);
        
        // Update statistics from backend
        if (response.stats) {
          setStats(response.stats);
        }
        
        // Debug logging
        console.log('=== POSTS LOADED ===');
        console.log('Filter:', filter);
        console.log('Total posts received:', response.data.data?.length || 0);
        console.log('Published posts:', response.data.data?.filter(p => p.is_published).length || 0);
        console.log('Draft posts:', response.data.data?.filter(p => !p.is_published).length || 0);
        console.log('Sample posts:', response.data.data?.slice(0, 3).map(p => ({
          id: p.id, 
          title: p.title, 
          is_published: p.is_published
        })) || []);
      }
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadPostForEdit = async () => {
    try {
      setLoading(true);
      // We need to get the post by ID - for now using slug, but you'd need to add this to API
      const response = await apiService.getPost(id);
      if (response.success) {
        const post = response.data;
        setFormData({
          title: post.title,
          title_sw: post.title_sw || '',
          content: post.content,
          content_sw: post.content_sw || '',
          excerpt: post.excerpt || '',
          category_id: post.category_id,
          is_published: post.is_published,
          is_featured: post.is_featured,
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
          tags: post.tags?.map(t => t.name).join(', ') || ''
        });
      }
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      let response;
      if (mode === 'create') {
        response = await apiService.createPost(postData);
      } else {
        response = await apiService.updatePost(id, postData);
      }

      if (response.success) {
        setSuccess(mode === 'create' ? 'Post created successfully!' : 'Post updated successfully!');
        setTimeout(() => {
          navigate('/admin/posts');
        }, 2000);
      } else {
        setError(response.message || 'Failed to save post');
      }
    } catch (err) {
      setError('Error saving post: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await apiService.deletePost(postId);
      if (response.success) {
        setSuccess('Post deleted successfully!');
        loadPosts(); // Refresh the list
      } else {
        setError('Failed to delete post');
      }
    } catch (err) {
      setError('Error deleting post: ' + err.message);
    }
  };

  const togglePublish = async (post) => {
    try {
      const response = await apiService.updatePost(post.id, {
        is_published: !post.is_published
      });
      
      if (response.success) {
        setSuccess(`Post ${post.is_published ? 'unpublished' : 'published'}!`);
        loadPosts();
      }
    } catch (err) {
      setError('Error updating post status');
    }
  };

  // Filter and pagination handlers
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // eslint-disable-next-line no-unused-vars
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filtered posts count helper (unused in UI) — keep for future use

  if (loading && mode !== 'create') {
    return <LoadingSpinner text="Loading posts..." />;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">
            {mode === 'list' && 'Manage Posts'}
            {mode === 'create' && 'Create New Post'}
            {mode === 'edit' && 'Edit Post'}
          </h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/admin/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/admin/posts">Posts</Link>
              </li>
              {mode !== 'list' && (
                <li className="breadcrumb-item active">
                  {mode === 'create' ? 'Create' : 'Edit'}
                </li>
              )}
            </ol>
          </nav>
        </div>
        
        {mode === 'list' && (
          <Link to="/admin/posts/new" className="btn btn-tanzania">
            <i className="fas fa-plus me-2"></i>
            New Post
          </Link>
        )}
      </div>

      {/* Statistics Cards - Only show in list mode */}
      {mode === 'list' && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="h4 text-primary">{stats.total_posts}</div>
                <div className="text-muted">Total Posts</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="h4 text-success">{stats.published_posts}</div>
                <div className="text-muted">Published</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="h4 text-warning">{stats.draft_posts}</div>
                <div className="text-muted">Drafts</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="h4 text-info">{stats.total_comments}</div>
                <div className="text-muted">Comments</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="fas fa-check me-2"></i>
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      {/* Post List View */}
      {mode === 'list' && (
        <>
          {/* Filter Tabs */}
          <div className="mb-4">
            <div className="btn-group" role="group">
              <button
                className={`btn ${filter === 'all' ? 'btn-tanzania' : 'btn-outline-secondary'}`}
                onClick={() => handleFilterChange('all')}
                type="button"
              >
                <i className="fas fa-list me-2"></i>
                All Posts
                <span className="badge bg-light text-dark ms-2">{stats.total_posts}</span>
              </button>
              <button
                className={`btn ${filter === 'published' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => handleFilterChange('published')}
                type="button"
              >
                <i className="fas fa-eye me-2"></i>
                Published
                <span className="badge bg-light text-dark ms-2">{stats.published_posts}</span>
              </button>
              <button
                className={`btn ${filter === 'draft' ? 'btn-warning' : 'btn-outline-secondary'}`}
                onClick={() => handleFilterChange('draft')}
                type="button"
              >
                <i className="fas fa-edit me-2"></i>
                Drafts
                <span className="badge bg-light text-dark ms-2">{stats.draft_posts}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5 text-muted">
                <i className="fas fa-file-alt fa-3x mb-3"></i>
                <h5>No posts found</h5>
                <p>
                  {filter === 'published' 
                    ? 'No published posts yet'
                    : filter === 'draft'
                    ? 'No draft posts'
                    : 'No posts created yet'
                  }
                </p>
                <Link to="/admin/posts/new" className="btn btn-tanzania mt-3">
                  <i className="fas fa-plus me-2"></i>
                  Create Your First Post
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Card Grid Layout - Similar to Homepage */}
              <div className="row g-4">
                {posts.map((post) => (
                  <div key={post.id} className="col-lg-4 col-md-6">
                    <article className="card border-0 shadow-sm h-100 modern-post-card">
                      {/* Post Image */}
                      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                        {post.featured_image ? (
                          <img 
                            src={`https://keysblog-464d939b8203.herokuapp.com/${post.featured_image}`}
                            className="card-img-top"
                            alt={post.title}
                            style={{ height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-secondary d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
                            <i className="fas fa-image fa-3x text-muted"></i>
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="position-absolute top-0 end-0 p-2">
                          <span className={`badge ${post.is_published ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {post.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        {/* Featured Badge */}
                        {post.is_featured && (
                          <div className="position-absolute top-0 start-0 p-2">
                            <span className="badge bg-warning text-dark">
                              <i className="fas fa-star me-1"></i>
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="card-body d-flex flex-column">
                        {/* Category */}
                        <div className="mb-2">
                          <span className="badge bg-primary">
                            {post.category?.display_name || post.category?.name || 'Uncategorized'}
                          </span>
                        </div>

                        {/* Title */}
                        <h5 className="card-title">
                          <Link to={`/admin/posts/edit/${post.id}`} className="text-decoration-none">
                            {post.title}
                          </Link>
                        </h5>

                        {/* Excerpt */}
                        <p className="card-text text-muted small flex-grow-1">
                          {post.excerpt ? 
                            (post.excerpt.length > 100 ? post.excerpt.substring(0, 100) + '...' : post.excerpt)
                            : 'No excerpt available'
                          }
                        </p>

                        {/* Meta Info */}
                        <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                          <div>
                            <i className="fas fa-user me-1"></i>
                            {post.user?.name || 'Unknown'}
                          </div>
                          <div>
                            <i className="fas fa-calendar me-1"></i>
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                          <div>
                            <i className="fas fa-eye me-1"></i>
                            {post.views || 0} views
                          </div>
                          <div>
                            <i className="fas fa-clock me-1"></i>
                            {post.reading_time || 5} min read
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="btn-group w-100" role="group">
                          <Link 
                            to={`/admin/posts/edit/${post.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </Link>
                          <Link 
                            to={`/posts/${post.slug}`}
                            className="btn btn-sm btn-outline-info"
                            target="_blank"
                          >
                            <i className="fas fa-eye me-1"></i>
                            View
                          </Link>
                          <button
                            onClick={() => togglePublish(post)}
                            className={`btn btn-sm ${post.is_published ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          >
                            <i className={`fas fa-${post.is_published ? 'eye-slash' : 'check'} me-1`}></i>
                            {post.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-5">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PostManager;