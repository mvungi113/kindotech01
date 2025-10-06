/**
 * Author Dashboard - Dashboard for blog authors to manage their content
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const AuthorDashboard = () => {
  const { user } = useAuth();
  const [authorStats, setAuthorStats] = useState({
    posts: 0,
    published: 0,
    drafts: 0,
    views: 0,
    comments: 0
  });
  const [myPosts, setMyPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthorData();
  }, []);

  const loadAuthorData = async () => {
    try {
      setLoading(true);
      
      // Load author's posts
      const postsResponse = await apiService.getPosts({ author: user.id });
      if (postsResponse?.success) {
        const posts = postsResponse.data.data || [];
        setMyPosts(posts);
        
        // Calculate author stats
        const published = posts.filter(p => p.is_published).length;
        const drafts = posts.filter(p => !p.is_published).length;
        const totalViews = posts.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);
        
        setAuthorStats({
          posts: posts.length,
          published,
          drafts,
          views: totalViews,
          comments: 0 // This would need a separate API call
        });
      }

      // Load recent comments on author's posts
      const commentsResponse = await apiService.getComments({ author: user.id });
      if (commentsResponse?.success) {
        setRecentComments(commentsResponse.data.data?.slice(0, 5) || []);
      }
      
    } catch (error) {
      console.error('Error loading author data:', error);
      notify.error('Failed to load author dashboard data');
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
          <span className="visually-hidden">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="author-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Welcome back, {user?.name}!</h1>
          <p className="text-muted mb-0">Manage your content and engage with your readers</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/posts/new" className="btn btn-primary">
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
                    {formatNumber(authorStats.published)} published
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
                  <div className="small text-muted">Work in progress</div>
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
                  <div className="h4 mb-0">{formatNumber(authorStats.views)}</div>
                  <div className="small text-muted">Your content reach</div>
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
                  <div className="h4 mb-0">{formatNumber(recentComments.length)}</div>
                  <div className="small text-muted">Reader engagement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-3 col-6">
                  <Link to="/admin/posts/new" className="btn btn-outline-primary w-100">
                    <i className="fas fa-plus me-2"></i>
                    New Post
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/admin/posts?status=draft" className="btn btn-outline-warning w-100">
                    <i className="fas fa-edit me-2"></i>
                    Edit Drafts
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/admin/posts" className="btn btn-outline-success w-100">
                    <i className="fas fa-file-alt me-2"></i>
                    My Posts
                  </Link>
                </div>
                <div className="col-md-3 col-6">
                  <Link to="/profile" className="btn btn-outline-info w-100">
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Your Performance</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Published</span>
                <span className="badge bg-success">{authorStats.published}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>In Progress</span>
                <span className="badge bg-warning">{authorStats.drafts}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Total Views</span>
                <span className="badge bg-info">{formatNumber(authorStats.views)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Avg. Views</span>
                <span className="badge bg-primary">
                  {authorStats.posts > 0 ? Math.round(authorStats.views / authorStats.posts) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="row g-3">
        {/* My Recent Posts */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">My Recent Posts</h5>
              <Link to="/admin/posts" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {myPosts.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-file-alt fa-3x mb-3"></i>
                  <h5>No posts yet</h5>
                  <p className="mb-3">Start writing your first post to share your stories with the world!</p>
                  <Link to="/admin/posts/new" className="btn btn-primary">
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
                            to={`/admin/posts/${post.id}/edit`} 
                            className="btn btn-sm btn-outline-primary"
                          >
                            Edit
                          </Link>
                          {post.is_published && (
                            <Link 
                              to={`/posts/${post.slug}`} 
                              className="btn btn-sm btn-outline-success"
                              target="_blank"
                            >
                              View
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

        {/* Recent Comments on My Posts */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Recent Comments</h5>
            </div>
            <div className="card-body">
              {recentComments.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-comments fa-2x mb-2"></i>
                  <p className="mb-0">No comments yet</p>
                  <small>Comments on your posts will appear here</small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentComments.map(comment => (
                    <div key={comment.id} className="list-group-item px-0 border-0">
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-2">
                          <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <i className="fas fa-user text-white"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <small className="fw-bold">{comment.author_name}</small>
                          <p className="mb-1 small">{comment.content?.substring(0, 60)}...</p>
                          <small className="text-muted">{formatDate(comment.created_at)}</small>
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

export default AuthorDashboard;