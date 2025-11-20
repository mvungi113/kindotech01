/**
 * Enhanced Admin Dashboard - Clean, organized interface for administrators
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const EnhancedDashboard = () => {
  const [stats, setStats] = useState({
    totals: {
      posts: 0,
      published_posts: 0,
      draft_posts: 0,
      users: 0,
      comments: 0,
      categories: 0,
      views: '0'
    },
    recent: {
      posts: 0,
      users: 0,
      comments: 0
    },
    popular_posts: []
  });
  const [recentActivity, setRecentActivity] = useState({
    recent_posts: [],
    recent_comments: [],
    recent_users: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, activityResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentActivity()
      ]);

      if (statsResponse?.success) {
        setStats(statsResponse.data);
      }

      if (activityResponse?.success) {
        setRecentActivity(activityResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (typeof num === 'string') num = parseInt(num) || 0;
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Admin Dashboard</h1>
          <p className="text-muted mb-0">Manage your KeyBlog</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/posts/new" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>New Post
          </Link>
          <button 
            onClick={loadDashboardData} 
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
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
                  <div className="text-muted small">Total Posts</div>
                  <div className="h4 mb-0">{formatNumber(stats.totals.posts)}</div>
                  <div className="small text-success">
                    {formatNumber(stats.totals.published_posts)} published
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
                    <i className="fas fa-eye text-success fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Total Views</div>
                  <div className="h4 mb-0">{formatNumber(stats.totals.views)}</div>
                  <div className="small text-muted">All time</div>
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
                    <i className="fas fa-comments text-info fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Comments</div>
                  <div className="h4 mb-0">{formatNumber(stats.totals.comments)}</div>
                  <div className="small text-muted">Total discussions</div>
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
                    <i className="fas fa-users text-warning fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Users</div>
                  <div className="h4 mb-0">{formatNumber(stats.totals.users)}</div>
                  <div className="small text-muted">Registered authors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <Link to="/admin/posts" className="btn btn-outline-primary w-100">
                    <i className="fas fa-file-alt me-2"></i>
                    Manage Posts
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/admin/comments" className="btn btn-outline-info w-100">
                    <i className="fas fa-comments me-2"></i>
                    Comments
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/admin/categories" className="btn btn-outline-success w-100">
                    <i className="fas fa-tags me-2"></i>
                    Categories
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/admin/users" className="btn btn-outline-warning w-100">
                    <i className="fas fa-users me-2"></i>
                    Users
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">System Status</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Published Posts</span>
                <span className="badge bg-success">{stats.totals.published_posts}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Draft Posts</span>
                <span className="badge bg-warning">{stats.totals.draft_posts}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Categories</span>
                <span className="badge bg-info">{stats.totals.categories}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Active Users</span>
                <span className="badge bg-primary">{stats.totals.users}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-3">
        {/* Recent Posts */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Recent Posts</h5>
              <Link to="/admin/posts" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {recentActivity.recent_posts.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-file-alt fa-2x mb-2"></i>
                  <p className="mb-0">No recent posts</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.recent_posts.slice(0, 5).map(post => (
                    <div key={post.id} className="list-group-item px-0 border-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-truncate">{post.title}</h6>
                          <div className="d-flex align-items-center gap-2">
                            {post.is_published ? (
                              <span className="badge bg-success">Published</span>
                            ) : (
                              <span className="badge bg-warning">Draft</span>
                            )}
                            <small className="text-muted">{formatDate(post.created_at)}</small>
                          </div>
                        </div>
                        <Link 
                          to={`/admin/posts/${post.id}/edit`} 
                          className="btn btn-sm btn-outline-primary ms-2"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Posts */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Popular Posts</h5>
            </div>
            <div className="card-body">
              {stats.popular_posts.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-chart-line fa-2x mb-2"></i>
                  <p className="mb-0">No popular posts yet</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.popular_posts.map((post, index) => (
                    <div key={post.id} className="list-group-item px-0 border-0">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-truncate">{post.title}</h6>
                          <small className="text-muted">
                            {formatNumber(post.views)} views • {formatDate(post.published_at)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Comments */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Recent Comments</h5>
              <Link to="/admin/comments" className="btn btn-sm btn-outline-primary">Manage Comments</Link>
            </div>
            <div className="card-body">
              {recentActivity.recent_comments.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-comments fa-2x mb-2"></i>
                  <p className="mb-0">No recent comments</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.recent_comments.slice(0, 5).map(comment => (
                    <div key={comment.id} className="list-group-item px-0 border-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <strong>{comment.author_name || 'Anonymous'}</strong>
                            <small className="text-muted">on</small>
                            <Link to={`/posts/${comment.post?.slug || comment.post?.id}`} className="text-decoration-none">
                              {comment.post?.title || 'Unknown Post'}
                            </Link>
                          </div>
                          <p className="mb-1 text-muted">{comment.content?.substring(0, 100)}...</p>
                          <div className="d-flex align-items-center gap-2">
                            {comment.is_approved ? (
                              <span className="badge bg-success">Approved</span>
                            ) : (
                              <span className="badge bg-warning">Pending</span>
                            )}
                            <small className="text-muted">{formatDate(comment.created_at)}</small>
                          </div>
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
    </div>
  );
};

export default EnhancedDashboard;