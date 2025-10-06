/**
 * Enhanced Author Dashboard - Complete content management system for authors
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const AuthorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authorStats, setAuthorStats] = useState({
    posts: 0,
    published: 0,
    drafts: 0,
    views: 0,
    comments: 0
  });
  const [myPosts, setMyPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAuthorData();
  }, []);

  const loadAuthorData = async () => {
    try {
      setLoading(true);
      
      // Load author's posts with user filter
      const postsResponse = await apiService.getPosts({ user_id: user.id });
      if (postsResponse?.success) {
        const posts = postsResponse.data.data || [];
        setMyPosts(posts);
        
        // Calculate author stats
        const published = posts.filter(p => p.is_published).length;
        const drafts = posts.filter(p => !p.is_published).length;
        const totalViews = posts.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);
        
        // Count comments on author's posts
        const totalComments = posts.reduce((sum, p) => sum + (parseInt(p.comments_count) || 0), 0);
        
        setAuthorStats({
          posts: posts.length,
          published,
          drafts,
          views: totalViews,
          comments: totalComments
        });
      }

      // Load categories for post creation
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse?.success) {
        setCategories(categoriesResponse.data.data || []);
      }

      // Load recent comments on author's posts (if available)
      try {
        const commentsResponse = await apiService.getComments({ author_posts: user.id });
        if (commentsResponse?.success) {
          setRecentComments(commentsResponse.data.data?.slice(0, 5) || []);
        }
      } catch (error) {
        // Comments endpoint might not support this filter yet
        console.log('Comments loading skipped:', error.message);
      }
      
    } catch (error) {
      console.error('Error loading author data:', error);
      notify.error('Failed to load author dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await apiService.deletePost(postId);
      notify.success('Post deleted successfully');
      loadAuthorData(); // Refresh data
    } catch (error) {
      console.error('Error deleting post:', error);
      notify.error('Failed to delete post');
    }
  };

  const handleTogglePublish = async (postId, currentStatus) => {
    try {
      if (currentStatus) {
        // Unpublish
        await apiService.updatePost(postId, { is_published: false });
        notify.success('Post unpublished');
      } else {
        // Publish
        await apiService.updatePost(postId, { is_published: true });
        notify.success('Post published');
      }
      loadAuthorData(); // Refresh data
    } catch (error) {
      console.error('Error toggling post status:', error);
      notify.error('Failed to update post status');
    }
  };

  const formatNumber = (num) => {
    if (typeof num === 'string') num = parseInt(num) || 0;
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPostsByStatus = (status) => {
    if (status === 'published') return myPosts.filter(p => p.is_published);
    if (status === 'drafts') return myPosts.filter(p => !p.is_published);
    return myPosts;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="author-dashboard">
      {/* Author Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Welcome back, {user?.name}!</h1>
              <p className="text-muted mb-0">Manage your content and engage with your readers</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/author/posts/new" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>Write New Post
              </Link>
              <button 
                onClick={loadAuthorData} 
                className="btn btn-outline-secondary"
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Author Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-file-alt text-primary fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">My Posts</div>
                  <div className="h4 mb-0">{formatNumber(authorStats.posts)}</div>
                  <div className="small text-success">
                    Total created
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-check-circle text-success fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Published</div>
                  <div className="h4 mb-0">{formatNumber(authorStats.published)}</div>
                  <div className="small text-muted">
                    Live content
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-edit text-warning fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Drafts</div>
                  <div className="h4 mb-0">{formatNumber(authorStats.drafts)}</div>
                  <div className="small text-muted">
                    Work in progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-3 p-3">
                    <i className="fas fa-eye text-info fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total Views</div>
                  <div className="h4 mb-0">{formatNumber(authorStats.views)}</div>
                  <div className="small text-muted">
                    Reader reach
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row">
        <div className="col-12">
          <ul className="nav nav-tabs nav-fill mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-home me-2"></i>Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'all-posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('all-posts')}
              >
                <i className="fas fa-file-alt me-2"></i>All Posts ({authorStats.posts})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'published' ? 'active' : ''}`}
                onClick={() => setActiveTab('published')}
              >
                <i className="fas fa-check-circle me-2"></i>Published ({authorStats.published})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'drafts' ? 'active' : ''}`}
                onClick={() => setActiveTab('drafts')}
              >
                <i className="fas fa-edit me-2"></i>Drafts ({authorStats.drafts})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row g-3">
          {/* Quick Actions */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-6">
                    <Link to="/author/posts/new" className="btn btn-primary w-100">
                      <i className="fas fa-plus me-2"></i>
                      New Post
                    </Link>
                  </div>
                  <div className="col-6">
                    <button 
                      onClick={() => setActiveTab('drafts')} 
                      className="btn btn-outline-warning w-100"
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Drafts
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      onClick={() => setActiveTab('published')} 
                      className="btn btn-outline-success w-100"
                    >
                      <i className="fas fa-eye me-2"></i>
                      View Published
                    </button>
                  </div>
                  <div className="col-6">
                    <Link to="/author/profile" className="btn btn-outline-info w-100">
                      <i className="fas fa-user me-2"></i>
                      My Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">Your Performance</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Content Status</span>
                  <span className="text-muted">Posts</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Published</span>
                  <span className="badge bg-success">{authorStats.published}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>In Progress</span>
                  <span className="badge bg-warning">{authorStats.drafts}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Total Views</span>
                  <span className="badge bg-info">{formatNumber(authorStats.views)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Avg. Views per Post</span>
                  <span className="badge bg-primary">
                    {authorStats.posts > 0 ? Math.round(authorStats.views / authorStats.posts) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Posts Preview */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Recent Posts</h5>
                <button 
                  onClick={() => setActiveTab('all-posts')} 
                  className="btn btn-sm btn-outline-primary"
                >
                  View All
                </button>
              </div>
              <div className="card-body">
                {myPosts.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-file-alt fa-3x mb-3"></i>
                    <h5>No posts yet</h5>
                    <p className="mb-3">Start writing your first post to share your stories!</p>
                    <Link to="/author/posts/new" className="btn btn-primary">
                      <i className="fas fa-plus me-2"></i>Write Your First Post
                    </Link>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {myPosts.slice(0, 3).map(post => (
                      <div key={post.id} className="list-group-item px-0 border-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{post.title}</h6>
                            <p className="mb-1 text-muted small">{post.excerpt}</p>
                            <div className="d-flex align-items-center gap-2">
                              {post.is_published ? (
                                <span className="badge bg-success">Published</span>
                              ) : (
                                <span className="badge bg-warning">Draft</span>
                              )}
                              <small className="text-muted">
                                {formatNumber(post.views)} views • {formatDate(post.created_at)}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex gap-1 ms-2">
                            <Link 
                              to={`/author/posts/${post.id}/edit`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Management Tabs */}
      {(activeTab === 'all-posts' || activeTab === 'published' || activeTab === 'drafts') && (
        <PostsManagement 
          posts={getPostsByStatus(activeTab === 'all-posts' ? 'all' : activeTab === 'published' ? 'published' : 'drafts')}
          onDelete={handleDeletePost}
          onTogglePublish={handleTogglePublish}
          formatDate={formatDate}
          formatNumber={formatNumber}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};

// Posts Management Component
const PostsManagement = ({ posts, onDelete, onTogglePublish, formatDate, formatNumber, activeTab }) => {
  if (posts.length === 0) {
    const messages = {
      'all-posts': 'No posts created yet',
      'published': 'No published posts yet', 
      'drafts': 'No drafts saved yet'
    };
    
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
          <h5>{messages[activeTab]}</h5>
          <p className="text-muted mb-3">Start creating content to see it here</p>
          <Link to="/author/posts/new" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Create Your First Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Views</th>
                <th>Comments</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <div>
                      <h6 className="mb-1">{post.title}</h6>
                      <small className="text-muted">{post.excerpt}</small>
                    </div>
                  </td>
                  <td>
                    {post.is_published ? (
                      <span className="badge bg-success">Published</span>
                    ) : (
                      <span className="badge bg-warning">Draft</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {formatNumber(post.views)}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {post.comments_count || 0}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">
                      {formatDate(post.created_at)}
                    </small>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link 
                        to={`/author/posts/${post.id}/edit`} 
                        className="btn btn-sm btn-outline-primary"
                        title="Edit Post"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      {post.is_published && (
                        <Link 
                          to={`/posts/${post.slug}`} 
                          className="btn btn-sm btn-outline-success"
                          target="_blank"
                          title="View Post"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                      )}
                      <button
                        onClick={() => onTogglePublish(post.id, post.is_published)}
                        className={`btn btn-sm ${post.is_published ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        title={post.is_published ? 'Unpublish' : 'Publish'}
                      >
                        <i className={`fas ${post.is_published ? 'fa-eye-slash' : 'fa-check'}`}></i>
                      </button>
                      <button
                        onClick={() => onDelete(post.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete Post"
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
      </div>
    </div>
  );
};

export default AuthorDashboard;