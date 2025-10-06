/**
 * Admin comment moderation and management
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CommentManager = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadComments();
  }, [activeTab]);

  const loadComments = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'pending') {
        response = await apiService.getCommentsModeration();
      } else {
        // For approved comments, we'd need to add this to the API
        const allComments = await apiService.getRecentActivity();
        response = { 
          success: true, 
          data: allComments.data?.recent_comments || [] 
        };
      }

      if (response.success) {
        setComments(response.data);
      }
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId) => {
    try {
      setModerating(true);
      const response = await apiService.approveComment(commentId);
      
      if (response.success) {
        setSuccess('Comment approved successfully!');
        loadComments();
      }
    } catch (err) {
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
      const response = await apiService.deleteComment(commentId);
      if (response.success) {
        setSuccess('Comment deleted successfully!');
        loadComments();
      }
    } catch (err) {
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

  const pendingComments = comments.filter(c => !c.is_approved);
  const approvedComments = comments.filter(c => c.is_approved);

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