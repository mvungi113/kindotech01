/**
 * Admin Dashboard Stats component
 * Displays key metrics and charts for the blog
 */
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totals: {
      posts: 0,
      published_posts: 0,
      draft_posts: 0,
      users: 0,
      comments: 0,
      categories: 0,
      views: 0
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
      
      // Test each endpoint separately to see which one fails
      console.log('Loading dashboard stats...');
      const statsResponse = await apiService.getDashboardStats();
      console.log('Stats response:', statsResponse);
      
      console.log('Loading recent activity...');
      const activityResponse = await apiService.getRecentActivity();
      console.log('Activity response:', activityResponse);

      if (statsResponse && statsResponse.success) {
        setStats(statsResponse.data);
      } else {
        console.error('Stats request failed:', statsResponse);
      }

      if (activityResponse && activityResponse.success) {
        setRecentActivity(activityResponse.data);
      } else {
        console.error('Activity request failed:', activityResponse);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      notify.error('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
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
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Posts
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totals.posts}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-file-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Published Posts
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totals.published_posts}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Total Views
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totals.views.toLocaleString()}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-eye fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Total Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {stats.totals.users}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        {/* Recent Posts */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Posts</h6>
            </div>
            <div className="card-body">
              {recentActivity.recent_posts.length === 0 ? (
                <p className="text-muted">No recent posts</p>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.recent_posts.slice(0, 5).map(post => (
                    <div key={post.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{post.title}</h6>
                          <small className="text-muted">
                            {post.is_published ? (
                              <span className="badge bg-success">Published</span>
                            ) : (
                              <span className="badge bg-warning">Draft</span>
                            )}
                            {' '}{formatDate(post.created_at)}
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

        {/* Popular Posts */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Popular Posts</h6>
            </div>
            <div className="card-body">
              {stats.popular_posts.length === 0 ? (
                <p className="text-muted">No popular posts yet</p>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.popular_posts.map(post => (
                    <div key={post.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{post.title}</h6>
                          <small className="text-muted">
                            {post.views} views • {formatDate(post.published_at)}
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
      </div>

      {/* Recent Comments */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Recent Comments</h6>
            </div>
            <div className="card-body">
              {recentActivity.recent_comments.length === 0 ? (
                <p className="text-muted">No recent comments</p>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.recent_comments.slice(0, 5).map(comment => (
                    <div key={comment.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            {comment.author_name || 'Anonymous'} on "{comment.post?.title}"
                          </h6>
                          <p className="mb-1">{comment.content?.substring(0, 100)}...</p>
                          <small className="text-muted">
                            {comment.is_approved ? (
                              <span className="badge bg-success">Approved</span>
                            ) : (
                              <span className="badge bg-warning">Pending</span>
                            )}
                            {' '}{formatDate(comment.created_at)}
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
      </div>
    </>
  );
};

export default DashboardStats;