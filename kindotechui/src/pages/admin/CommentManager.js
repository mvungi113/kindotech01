/**
 * Admin comment moderation and management
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CommentManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/author/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadComments();
    }
  }, [user]); // Remove activeTab dependency to load once on mount

  useEffect(() => {
    // Reload comments when tab changes, but only if we already have user
    if (user?.role === 'admin' && comments.length > 0) {
      loadComments();
    }
  }, [activeTab]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading comments for tab:', activeTab);
      
      // Always load both pending and approved comments for statistics
      let allCommentsData = [];
      
      try {
        // Load pending comments
        console.log('Calling getComments API...');
        const pendingResponse = await apiService.getComments();
        console.log('Pending API response:', pendingResponse);
        
        if (pendingResponse && pendingResponse.success) {
          const pendingData = pendingResponse.data?.data || pendingResponse.data || [];
          allCommentsData = [...pendingData];
        }
      } catch (err) {
        console.warn('Could not load pending comments:', err);
      }
      
      try {
        // Load recent activity for approved comments
        console.log('Loading recent activity...');
        const activityResponse = await apiService.getRecentActivity();
        if (activityResponse && activityResponse.success) {
          const approvedData = activityResponse.data?.recent_comments || [];
          // Add approved comments to all comments, avoiding duplicates
          const approvedComments = approvedData.filter(comment => 
            !allCommentsData.some(existing => existing.id === comment.id)
          );
          allCommentsData = [...allCommentsData, ...approvedComments];
        }
      } catch (err) {
        console.warn('Could not load approved comments:', err);
      }

      console.log('All comments data:', allCommentsData);
      setComments(allCommentsData);
      
      if (allCommentsData.length === 0 && activeTab === 'pending') {
        // If no comments at all, show appropriate message
        console.log('No comments found');
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(`Failed to load comments: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId) => {
    try {
      setModerating(true);
      setError('');
      const response = await apiService.approveComment(commentId);
      
      if (response.success) {
        setSuccess('Comment approved successfully!');
        loadComments();
      } else {
        setError('Error approving comment');
      }
    } catch (err) {
      console.error('Error approving comment:', err);
      setError('Error approving comment');
    } finally {
      setModerating(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setError('');
      const response = await apiService.deleteComment(commentId);
      if (response.success) {
        setSuccess('Comment deleted successfully!');
        loadComments();
      } else {
        setError('Error deleting comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Error deleting comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics from all comments
  const pendingComments = comments.filter(c => c.is_approved === false || c.is_approved === 0);
  const approvedComments = comments.filter(c => c.is_approved === true || c.is_approved === 1);
  const totalComments = comments.length;
  const approvalRate = totalComments > 0 ? Math.round((approvedComments.length / totalComments) * 100) : 0;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-2">Comment Management</h1>
          <p className="text-muted">Moderate and manage post comments</p>
        </div>
      </div>

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

      {/* Comment Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-clock text-warning"></i>
              </div>
              <div className="h4 mb-1">{pendingComments.length}</div>
              <div className="text-muted small">Pending Approval</div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-check-circle text-success"></i>
              </div>
              <div className="h4 mb-1">{approvedComments.length}</div>
              <div className="text-muted small">Approved</div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-comments text-primary"></i>
              </div>
              <div className="h4 mb-1">{totalComments}</div>
              <div className="text-muted small">Total Comments</div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-percentage text-info"></i>
              </div>
              <div className="h4 mb-1">{approvalRate}%</div>
              <div className="text-muted small">Approval Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <i className="fas fa-clock me-2"></i>
                Pending Approval
                {pendingComments.length > 0 && (
                  <span className="badge bg-warning ms-2">
                    {pendingComments.length}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'approved' ? 'active' : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                <i className="fas fa-check me-2"></i>
                Approved Comments
                <span className="badge bg-success ms-2">
                  {approvedComments.length}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {loading ? (
            <LoadingSpinner text="Loading comments..." />
          ) : activeTab === 'pending' ? (
            <PendingComments
              comments={pendingComments}
              onApprove={handleApprove}
              onDelete={handleDelete}
              moderating={moderating}
              formatDate={formatDate}
            />
          ) : (
            <ApprovedComments
              comments={approvedComments}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Pending Comments Component
const PendingComments = ({ comments, onApprove, onDelete, moderating, formatDate }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fas fa-check-circle fa-3x mb-3"></i>
        <p>No comments pending approval. Great job!</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map(comment => (
        <div key={comment.id} className="card mb-3 border-warning">
          <div className="card-body">
            <div className="d-flex">
              <img 
                src={comment.gravatar_url} 
                alt={comment.author_name}
                className="rounded-circle me-3"
                style={{ width: '50px', height: '50px' }}
              />
              
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{comment.author_name}</strong>
                    {comment.author_website && (
                      <a 
                        href={comment.author_website} 
                        className="text-muted small ms-2 text-decoration-none"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {comment.author_website}
                      </a>
                    )}
                    <div className="small text-muted">
                      on <Link to={`/posts/${comment.post?.slug}`}>{comment.post?.title}</Link>
                    </div>
                  </div>
                  <small className="text-muted">
                    {formatDate(comment.created_at)}
                  </small>
                </div>

                <p className="mb-3">{comment.content}</p>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => onApprove(comment.id)}
                    disabled={moderating}
                  >
                    <i className="fas fa-check me-1"></i>
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(comment.id)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete
                  </button>
                  <a 
                    href={`mailto:${comment.author_email}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-envelope me-1"></i>
                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Approved Comments Component
const ApprovedComments = ({ comments, onDelete, formatDate }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fas fa-comments fa-3x mb-3"></i>
        <p>No approved comments yet.</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map(comment => (
        <div key={comment.id} className="card mb-3">
          <div className="card-body">
            <div className="d-flex">
              <img 
                src={comment.gravatar_url} 
                alt={comment.author_name}
                className="rounded-circle me-3"
                style={{ width: '50px', height: '50px' }}
              />
              
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{comment.author_name}</strong>
                    {comment.author_website && (
                      <a 
                        href={comment.author_website} 
                        className="text-muted small ms-2 text-decoration-none"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {comment.author_website}
                      </a>
                    )}
                    <div className="small text-muted">
                      on <Link to={`/posts/${comment.post?.slug}`}>{comment.post?.title}</Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-success me-2">
                      <i className="fas fa-thumbs-up me-1"></i>
                      {comment.likes}
                    </span>
                    <small className="text-muted">
                      {formatDate(comment.created_at)}
                    </small>
                  </div>
                </div>

                <p className="mb-3">{comment.content}</p>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(comment.id)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete
                  </button>
                  <a 
                    href={`mailto:${comment.author_email}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-envelope me-1"></i>
                    Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentManager;