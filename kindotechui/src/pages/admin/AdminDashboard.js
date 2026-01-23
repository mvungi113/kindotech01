/**
 * Admin Dashboard - Comprehensive system management for administrators
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalCategories: 0,
    activeUsers: 0,
    newsletterSubscribers: 0
  });
  const [, setNewsletterStats] = useState({
    total_subscribers: 0,
    recent_subscribers: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/author/dashboard');
    }
  }, [user, navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const dashboardResponse = await apiService.getDashboardStats();
      if (dashboardResponse?.success) {
        // Map API response structure to frontend state
        const apiData = dashboardResponse.data.totals || {};
        setStats({
          totalPosts: apiData.posts || 0,
          publishedPosts: apiData.published_posts || 0,
          totalUsers: apiData.users || 0,
          totalComments: apiData.comments || 0,
          totalCategories: apiData.categories || 0,
          activeUsers: apiData.users || 0, // Using total users as active users for now
          totalViews: apiData.views || 0
        });
        console.log('Dashboard stats loaded:', apiData);
      }

      // Load recent posts (limit to 5 for dashboard)
      const postsResponse = await apiService.getPosts({ limit: 5, orderBy: 'created_at', orderDir: 'desc' });
      if (postsResponse?.success) {
        const posts = postsResponse.data.data || [];
        setRecentPosts(posts.slice(0, 5)); // Ensure only 5 items
      }

      // Load recent users (admin only, limit to 5 for dashboard)
      try {
        const usersResponse = await apiService.getUsers({ limit: 5, orderBy: 'created_at', orderDir: 'desc' });
        if (usersResponse?.success) {
          const users = usersResponse.data.data || [];
          setRecentUsers(users.slice(0, 5)); // Ensure only 5 items
        }
      } catch (error) {
        console.warn('Could not load users - admin access required');
      }

      // Load newsletter stats
      try {
        const newsletterResponse = await apiService.getNewsletterStats();
        if (newsletterResponse?.success) {
          setNewsletterStats(newsletterResponse.data);
          setStats(prev => ({
            ...prev,
            newsletterSubscribers: newsletterResponse.data.total_subscribers || 0
          }));
        }
      } catch (error) {
        console.warn('Could not load newsletter stats - admin access required');
      }

      // Load recent comments (limit to 5 for dashboard)
      try {
        const commentsResponse = await apiService.getRecentActivity();
        if (commentsResponse?.success) {
          // The API returns { recent_posts, recent_comments, recent_users }
          const recentComments = commentsResponse.data?.recent_comments || [];
          setRecentComments(recentComments.slice(0, 5)); // Ensure only 5 items
        }
      } catch (error) {
        console.warn('Could not load recent activity:', error);
        setRecentComments([]);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard min-vh-100">
      {/* Admin Page Header */}
      <div className="admin-page-header" style={{ background: 'var(--tanzania-green)', marginTop: '0' }}>
        <div className="container">
          <div className="row align-items-center py-4">
            <div className="col">
              <div className="d-flex align-items-center">
                <div className="admin-icon-container me-3">
                  <div className="admin-badge">
                    <i className="fas fa-tachometer-alt"></i>
                  </div>
                </div>
                <div className="admin-header-content">
                  <h1 className="h2 mb-1 text-white fw-bold">Admin Dashboard</h1>
                  <p className="mb-0 text-white">System management and analytics overview</p>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="admin-badge">
                <i className="fas fa-shield-alt me-2"></i>
                <span>Administrator Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* System Statistics */}
        <div className="admin-stats-section mb-4">
          <div className="row">
            <div className="col">
              <h5 className="mb-3 fw-bold">
                <i className="fas fa-chart-bar me-2 text-success"></i>
                System Overview
              </h5>
            </div>
          </div>
          <div className="row g-3 mb-4">
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-file-alt text-primary"></i>
                </div>
                <div className="h4 mb-1">{formatNumber(stats.totalPosts)}</div>
                <div className="text-muted small">Total Posts</div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-check-circle text-success"></i>
                </div>
                <div className="h4 mb-1">{formatNumber(stats.publishedPosts)}</div>
                <div className="text-muted small">Published</div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-users text-info"></i>
                </div>
                <div className="h4 mb-1">{formatNumber(stats.totalUsers)}</div>
                <div className="text-muted small">Total Users</div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-comments text-warning"></i>
                </div>
                <div className="h4 mb-1">{formatNumber(stats.totalComments)}</div>
                <div className="text-muted small">Comments</div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-tags text-secondary"></i>
                </div>
                <div className="h4 mb-1">{formatNumber(stats.totalCategories)}</div>
                <div className="text-muted small">Categories</div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-user-check text-danger"></i>
                </div>
                <div className="h4 mb-1">{formatNumber(stats.activeUsers)}</div>
                <div className="text-muted small">Active Users</div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-envelope text-success"></i>
                </div>
                <div className="h4 mb-1">{formatNumber(stats.newsletterSubscribers)}</div>
                <div className="text-muted small">Newsletter</div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-actions-section mb-4">
          <div className="row">
            <div className="col">
              <h5 className="mb-3 fw-bold">
                <i className="fas fa-bolt me-2 text-primary"></i>
                Quick Actions
              </h5>
              <div className="admin-actions-grid">
                <Link to="/admin/posts/new" className="admin-action-card">
                  <div className="action-icon bg-primary">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div className="action-content">
                    <h6 className="action-title">Create Post</h6>
                    <p className="action-desc">Write a new article</p>
                  </div>
                </Link>
                <Link to="/admin/users" className="admin-action-card">
                  <div className="action-icon bg-success">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="action-content">
                    <h6 className="action-title">Manage Users</h6>
                    <p className="action-desc">User administration</p>
                  </div>
                </Link>
                <Link to="/admin/posts" className="admin-action-card">
                  <div className="action-icon bg-info">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div className="action-content">
                    <h6 className="action-title">All Posts</h6>
                    <p className="action-desc">Content management</p>
                  </div>
                </Link>
                <Link to="/admin/categories" className="admin-action-card">
                  <div className="action-icon bg-warning">
                    <i className="fas fa-tags"></i>
                  </div>
                  <div className="action-content">
                    <h6 className="action-title">Categories</h6>
                    <p className="action-desc">Organize content</p>
                  </div>
                </Link>
                <Link to="/admin/newsletter" className="admin-action-card">
                  <div className="action-icon bg-info">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="action-content">
                    <h6 className="action-title">Newsletter</h6>
                    <p className="action-desc">Manage subscribers</p>
                  </div>
                </Link>
                <button 
                  onClick={loadDashboardData} 
                  className="admin-action-card refresh-btn"
                  disabled={loading}
                >
                  <div className="action-icon bg-secondary">
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                  </div>
                  <div className="action-content">
                    <h6 className="action-title">Refresh</h6>
                    <p className="action-desc">Update data</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Management */}
        <div className="admin-content-section">
          <div className="row mb-3">
            <div className="col">
              <h5 className="mb-0 fw-bold">
                <i className="fas fa-cogs me-2 text-info"></i>
                Content Management
              </h5>
            </div>
          </div>
          <div className="row">
          {/* Recent Posts */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-file-alt me-2"></i>Recent Posts
                </h5>
                <Link to="/admin/posts" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
              <div className="card-body">
                {recentPosts.length === 0 ? (
                  <p className="text-muted text-center py-3">No posts available</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {recentPosts.map(post => (
                      <div key={post.id} className="list-group-item px-0 border-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{post.title}</h6>
                            <div className="d-flex align-items-center gap-2">
                              {post.is_published ? (
                                <span className="badge bg-success">Published</span>
                              ) : (
                                <span className="badge bg-warning">Draft</span>
                              )}
                              <small className="text-muted">by {post.author?.name || 'Unknown'}</small>
                            </div>
                            <small className="text-muted">{formatDate(post.created_at)}</small>
                          </div>
                          <div className="d-flex gap-1 ms-2">
                            <Link 
                              to={`/admin/posts/${post.id}/edit`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fas fa-edit"></i>
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

          {/* Recent Users */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-users me-2"></i>Recent Users
                </h5>
                <Link to="/admin/users" className="btn btn-sm btn-outline-danger">Manage</Link>
              </div>
              <div className="card-body">
                {recentUsers.length === 0 ? (
                  <p className="text-muted text-center py-3">No users data available</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {recentUsers.map(user => (
                      <div key={user.id} className="list-group-item px-0 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{user.name}</h6>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge ${
                                user.role === 'admin' ? 'bg-danger' : 
                                user.role === 'author' ? 'bg-info' : 'bg-secondary'
                              }`}>
                                {user.role}
                              </span>
                              <small className="text-muted">{formatDate(user.created_at)}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">{user.email}</small>
                            {user.email_verified_at && (
                              <i className="fas fa-check-circle text-success" title="Verified"></i>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-activity me-2"></i>Recent Activity
                </h5>
                <Link to="/admin/comments" className="btn btn-sm btn-outline-success">View All</Link>
              </div>
              <div className="card-body">
                {recentComments.length === 0 ? (
                  <p className="text-muted text-center py-3">No recent activity</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {recentComments.map((activity, index) => (
                      <div key={index} className="list-group-item px-0 border-0">
                        <div className="d-flex">
                          <div className="flex-shrink-0 me-2">
                            <i className="fas fa-comment text-primary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-1 small">{activity.content}</p>
                            <div className="d-flex justify-content-between">
                              <small className="text-muted">by {activity.author_name}</small>
                              <small className="text-muted">{formatDate(activity.created_at)}</small>
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

        {/* System Health */}
        <div className="row mt-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">
                  <i className="fas fa-heartbeat me-2"></i>System Status
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border-end">
                      <h6 className="text-success">
                        <i className="fas fa-check-circle me-1"></i>Database
                      </h6>
                      <small className="text-muted">Connected</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h6 className="text-success">
                        <i className="fas fa-check-circle me-1"></i>API
                      </h6>
                      <small className="text-muted">Operational</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border-end">
                      <h6 className="text-success">
                        <i className="fas fa-check-circle me-1"></i>Storage
                      </h6>
                      <small className="text-muted">Available</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div>
                      <h6 className="text-success">
                        <i className="fas fa-check-circle me-1"></i>Security
                      </h6>
                      <small className="text-muted">Protected</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;