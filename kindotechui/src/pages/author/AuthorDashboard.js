/**
 * Author Dashboard - Dedicated dashboard for blog authors
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

// Add custom styles
const dashboardStyles = `
  .hover-shadow {
    transition: box-shadow 0.3s ease;
  }
  .hover-shadow:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
  .author-dashboard {
    animation: fadeIn 0.5s ease-in;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = dashboardStyles;
  document.head.appendChild(styleElement);
}

const AuthorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    posts: 0,
    published: 0,
    drafts: 0,
    views: 0,
    comments: 0
  });
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not author
  useEffect(() => {
    if (user && user.role !== 'author') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'author') {
      loadAuthorData();
    }
  }, [user]);

  const loadAuthorData = async () => {
    try {
      setLoading(true);
      
      // Load author's posts (all posts for dashboard stats)
      const postsResponse = await apiService.getPosts({ user_id: user.id, dashboard: true });
      if (postsResponse?.success) {
        const posts = postsResponse.data.data || [];
        setMyPosts(posts);
        
        // Debug logging
        console.log('=== AUTHOR DASHBOARD DEBUG ===');
        console.log('Total posts received:', posts.length);
        console.log('Sample post structure:', posts[0]);
        console.log('Published posts raw:', posts.filter(p => p.is_published));
        console.log('Draft posts raw:', posts.filter(p => !p.is_published));
        
        // Calculate stats with proper type checking
        const published = posts.filter(p => p.is_published === true || p.is_published === 1 || p.is_published === "1").length;
        const drafts = posts.filter(p => p.is_published === false || p.is_published === 0 || p.is_published === "0").length;
        const totalViews = posts.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);
        const totalComments = posts.reduce((sum, p) => sum + (parseInt(p.comments_count) || 0), 0);
        
        console.log('Calculated published:', published);
        console.log('Calculated drafts:', drafts);
        console.log('Total should be:', posts.length);
        
        setStats({
          posts: posts.length,
          published,
          drafts,
          views: totalViews,
          comments: totalComments
        });
      }
    } catch (error) {
      console.error('Error loading author data:', error);
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
          <span className="visually-hidden">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="author-dashboard bg-light min-vh-100">
      {/* Author Header */}
      <div className="bg-primary text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h3 mb-1">
                <i className="fas fa-user-edit me-2"></i>
                Author Dashboard
              </h1>
              <p className="mb-0 opacity-75">Welcome back, {user?.name}! Manage your content and track your success.</p>
            </div>
            <div className="col-auto">
              <span className="badge bg-light text-primary fs-6">
                <i className="fas fa-pen-fancy me-1"></i>
                Content Creator
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex gap-2 flex-wrap justify-content-between align-items-center">
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/author/posts/new" className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>Write New Post
                </Link>
                <Link to="/author/posts" className="btn btn-outline-primary">
                  <i className="fas fa-file-alt me-2"></i>Manage Posts ({stats.posts})
                </Link>
                <Link to="/author/profile" className="btn btn-outline-secondary">
                  <i className="fas fa-user me-2"></i>My Profile
                </Link>
              </div>
              <div className="d-flex gap-2">
                <button 
                  onClick={loadAuthorData} 
                  className="btn btn-outline-info"
                  disabled={loading}
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                {stats.drafts > 0 && (
                  <Link to="/author/posts?filter=draft" className="btn btn-outline-warning">
                    <i className="fas fa-edit me-2"></i>
                    Continue Drafts ({stats.drafts})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100 hover-shadow">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                      <i className="fas fa-file-alt text-primary fa-lg"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="text-muted small">Total Posts</div>
                    <div className="h4 mb-0">{formatNumber(stats.posts)}</div>
                    <div className="small text-success">
                      {stats.posts === 0 ? 'Ready to start writing?' : 'Content created'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100 hover-shadow">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-success bg-opacity-10 rounded-3 p-3">
                      <i className="fas fa-check-circle text-success fa-lg"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="text-muted small">Published</div>
                    <div className="h4 mb-0">{formatNumber(stats.published)}</div>
                    <div className="small text-muted">
                      {stats.published === 0 ? 'No published posts yet' : 'Live content'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100 hover-shadow">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                      <i className="fas fa-edit text-warning fa-lg"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="text-muted small">Drafts</div>
                    <div className="h4 mb-0">{formatNumber(stats.drafts)}</div>
                    <div className="small text-muted">
                      {stats.drafts === 0 ? 'All posts published!' : 'In progress'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100 hover-shadow">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-info bg-opacity-10 rounded-3 p-3">
                      <i className="fas fa-eye text-info fa-lg"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="text-muted small">Total Views</div>
                    <div className="h4 mb-0">{formatNumber(stats.views)}</div>
                    <div className="small text-muted">
                      {stats.views === 0 ? 'Start getting readers!' : 'Reader reach'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="row">
          {/* My Posts */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-file-alt me-2"></i>My Recent Posts
                </h5>
                <Link to="/author/posts" className="btn btn-sm btn-outline-primary">
                  View All Posts
                </Link>
              </div>
              <div className="card-body">
                {myPosts.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <h5>No posts yet</h5>
                    <p className="text-muted mb-3">Start writing your first post to share your stories with the world!</p>
                    <Link to="/author/posts/new" className="btn btn-primary">
                      <i className="fas fa-plus me-2"></i>Write Your First Post
                    </Link>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {myPosts.slice(0, 5).map(post => (
                      <div key={post.id} className="list-group-item px-0 border-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{post.title}</h6>
                            <p className="mb-1 text-muted small">{post.excerpt}</p>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              {post.is_published ? (
                                <span className="badge bg-success d-flex align-items-center">
                                  <i className="fas fa-eye me-1"></i>
                                  Published
                                </span>
                              ) : (
                                <span className="badge bg-warning text-dark d-flex align-items-center">
                                  <i className="fas fa-edit me-1"></i>
                                  Draft
                                </span>
                              )}
                              {post.category && (
                                <span className="badge bg-info">{post.category.name}</span>
                              )}
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <small className="text-muted">
                                <i className="fas fa-eye me-1"></i>
                                {formatNumber(post.views || 0)} views
                              </small>
                              <small className="text-muted">
                                <i className="fas fa-comments me-1"></i>
                                {formatNumber(post.comments_count || 0)} comments
                              </small>
                              <small className="text-muted">
                                <i className="fas fa-calendar me-1"></i>
                                {formatDate(post.created_at)}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex gap-1 ms-2">
                            <Link 
                              to={`/author/posts/${post.id}/edit`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            {post.is_published && (
                              <Link 
                                to={`/posts/${post.slug}`} 
                                className="btn btn-sm btn-outline-success"
                                target="_blank"
                              >
                                <i className="fas fa-eye"></i>
                              </Link>
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

        {/* Performance Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-pie me-2"></i>Content Overview
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center mb-3">
                <div className="col-6">
                  <div className="border-end">
                    <div className="h4 text-success mb-1">{stats.published}</div>
                    <small className="text-muted">Published</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="h4 text-warning mb-1">{stats.drafts}</div>
                  <small className="text-muted">Drafts</small>
                </div>
              </div>
              
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ 
                    width: stats.posts > 0 ? `${(stats.published / stats.posts) * 100}%` : '0%' 
                  }}
                  title={`${stats.published} Published`}
                ></div>
                <div 
                  className="progress-bar bg-warning" 
                  role="progressbar" 
                  style={{ 
                    width: stats.posts > 0 ? `${(stats.drafts / stats.posts) * 100}%` : '0%' 
                  }}
                  title={`${stats.drafts} Drafts`}
                ></div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small">Total Views</span>
                <span className="badge bg-info">{formatNumber(stats.views)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small">Reader Comments</span>
                <span className="badge bg-secondary">{formatNumber(stats.comments)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small">Avg. Views/Post</span>
                <span className="badge bg-primary">
                  {stats.posts > 0 ? Math.round(stats.views / stats.posts) : 0}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small">Publication Rate</span>
                <span className="badge bg-success">
                  {stats.posts > 0 ? Math.round((stats.published / stats.posts) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>            {/* Writing Tips & Goals */}
            <div className="card border-0 shadow-sm mt-3">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">
                  <i className="fas fa-target me-2"></i>Writing Goals
                </h5>
              </div>
              <div className="card-body">
                {stats.posts === 0 ? (
                  <div className="text-center py-3">
                    <i className="fas fa-rocket text-primary fa-2x mb-2"></i>
                    <h6>Ready to Start?</h6>
                    <p className="small text-muted mb-3">Begin your writing journey today!</p>
                    <Link to="/author/posts/new" className="btn btn-sm btn-primary">
                      Write First Post
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small>Publication Progress</small>
                        <small>{Math.round((stats.published / Math.max(stats.posts, 1)) * 100)}%</small>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${(stats.published / Math.max(stats.posts, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <ul className="list-unstyled mb-0">
                      {stats.drafts > 0 && (
                        <li className="mb-2">
                          <i className="fas fa-edit text-warning me-2"></i>
                          <small>Complete {stats.drafts} draft{stats.drafts > 1 ? 's' : ''}</small>
                        </li>
                      )}
                      {stats.published < 5 && (
                        <li className="mb-2">
                          <i className="fas fa-bullseye text-primary me-2"></i>
                          <small>Goal: Publish {5 - stats.published} more post{5 - stats.published > 1 ? 's' : ''}</small>
                        </li>
                      )}
                      {stats.views < 100 && stats.published > 0 && (
                        <li className="mb-2">
                          <i className="fas fa-eye text-info me-2"></i>
                          <small>Target: Reach 100 total views</small>
                        </li>
                      )}
                      <li className="mb-0">
                        <i className="fas fa-heart text-danger me-2"></i>
                        <small>Engage with your readers</small>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDashboard;