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
  const { user } = useAuth();
  
  const [mode, setMode] = useState('list');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter and pagination state
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="mb-0">Posts Management</h5>
                <small className="text-muted">
                  Showing {posts.length} of {totalPosts} posts
                </small>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="card-header bg-light border-top">
            <ul className="nav nav-tabs card-header-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                  type="button"
                >
                  <i className="fas fa-list me-2"></i>
                  All Posts
                  <span className="badge bg-secondary ms-2">{totalPosts}</span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${filter === 'published' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('published')}
                  type="button"
                >
                  <i className="fas fa-eye me-2"></i>
                  Published
                  <span className="badge bg-success ms-2">
                    {posts.filter(p => p.is_published).length}
                  </span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${filter === 'draft' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('draft')}
                  type="button"
                >
                  <i className="fas fa-edit me-2"></i>
                  Drafts
                  <span className="badge bg-warning ms-2">
                    {posts.filter(p => !p.is_published).length}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-5 text-muted">
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
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Author</th>
                      <th>Date</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id}>
                        <td>
                          <strong>{post.title}</strong>
                          {post.is_featured && (
                            <span className="badge bg-warning ms-2">Featured</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {post.category?.name}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${post.is_published ? 'bg-success' : 'bg-warning'}`}>
                            {post.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>{post.user?.name}</td>
                        <td>
                          {new Date(post.published_at).toLocaleDateString()}
                        </td>
                        <td>{post.views}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link 
                              to={`/posts/${post.slug}`}
                              className="btn btn-outline-primary"
                              target="_blank"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link 
                              to={`/admin/posts/edit/${post.id}`}
                              className="btn btn-outline-secondary"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button 
                              className="btn btn-outline-warning"
                              onClick={() => togglePublish(post)}
                            >
                              <i className={`fas fa-${post.is_published ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(post.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <small className="text-muted">
                    Page {currentPage} of {totalPages} ({totalPosts} total posts)
                  </small>
                </div>
                <nav aria-label="Posts pagination">
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      } else if (
                        page === currentPage - 3 || 
                        page === currentPage + 3
                      ) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    })}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Form View */}
      {(mode === 'create' || mode === 'edit') && (
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  {mode === 'create' ? 'Create New Post' : 'Edit Post'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Post Title *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Swahili Title */}
                  <div className="mb-3">
                    <label htmlFor="title_sw" className="form-label">
                      Swahili Title (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title_sw"
                      name="title_sw"
                      value={formData.title_sw}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      Content *
                    </label>
                    <textarea
                      className="form-control"
                      id="content"
                      name="content"
                      rows="12"
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>

                  {/* Swahili Content */}
                  <div className="mb-3">
                    <label htmlFor="content_sw" className="form-label">
                      Swahili Content (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="content_sw"
                      name="content_sw"
                      rows="6"
                      value={formData.content_sw}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      {/* Category */}
                      <div className="mb-3">
                        <label htmlFor="category_id" className="form-label">
                          Category *
                        </label>
                        <select
                          className="form-select"
                          id="category_id"
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      {/* Tags */}
                      <div className="mb-3">
                        <label htmlFor="tags" className="form-label">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="tags"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          placeholder="technology, news, tanzania"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="mb-3">
                    <label htmlFor="excerpt" className="form-label">
                      Excerpt
                    </label>
                    <textarea
                      className="form-control"
                      id="excerpt"
                      name="excerpt"
                      rows="3"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Brief description of the post"
                    ></textarea>
                  </div>

                  {/* Meta Fields */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="meta_title" className="form-label">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="meta_title"
                          name="meta_title"
                          value={formData.meta_title}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="meta_description" className="form-label">
                          Meta Description
                        </label>
                        <textarea
                          className="form-control"
                          id="meta_description"
                          name="meta_description"
                          rows="2"
                          value={formData.meta_description}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_published"
                          name="is_published"
                          checked={formData.is_published}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="is_published">
                          Publish immediately
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_featured"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="is_featured">
                          Feature this post
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-tanzania"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          {mode === 'create' ? 'Create Post' : 'Update Post'}
                        </>
                      )}
                    </button>
                    
                    <Link
                      to="/admin/posts"
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h6 className="mb-0">Publishing</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <div>
                    <span className={`badge ${formData.is_published ? 'bg-success' : 'bg-warning'}`}>
                      {formData.is_published ? 'Will publish' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Author</label>
                  <p className="mb-0">{user?.name}</p>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h6 className="mb-0">Tips</h6>
              </div>
              <div className="card-body">
                <ul className="small text-muted mb-0">
                  <li>Use clear, descriptive titles</li>
                  <li>Add relevant tags for better discovery</li>
                  <li>Include a compelling excerpt</li>
                  <li>Add Swahili content for wider reach</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManager;