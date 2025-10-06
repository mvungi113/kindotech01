/**
 * Individual comment component with reply functionality
 */
import React, { useState } from 'react';
import { apiService } from '../../services/api';

const CommentItem = ({ comment, onLike, onReplyAdded }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replying, setReplying] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLike = () => {
    onLike(comment.id);
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const replyData = {
      content: formData.get('content'),
      author_name: formData.get('author_name'),
      author_email: formData.get('author_email'),
      parent_id: comment.id
    };

    try {
      setReplying(true);
      const response = await apiService.createComment(comment.post_id, replyData);
      
      if (response.success) {
        event.target.reset();
        setShowReplyForm(false);
        onReplyAdded();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className={`comment mb-4 ${comment.parent_id ? 'comment-reply ms-4' : ''}`}>
      <div className="d-flex">
        <img 
          src={comment.gravatar_url} 
          alt={comment.author_name}
          className="rounded-circle me-3"
          style={{ width: '45px', height: '45px' }}
        />
        
        <div className="flex-grow-1">
          {/* Comment Header */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <strong className="d-block">{comment.author_name}</strong>
              {comment.author_website && (
                <a 
                  href={comment.author_website} 
                  className="text-muted small text-decoration-none"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {comment.author_website}
                </a>
              )}
            </div>
            <small className="text-muted">
              {formatDate(comment.created_at)}
            </small>
          </div>

          {/* Comment Content */}
          <p className="mb-2">{comment.content}</p>

          {/* Comment Actions */}
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={handleLike}
            >
              <i className="fas fa-thumbs-up me-1"></i> 
              Like ({comment.likes})
            </button>
            
            {!comment.parent_id && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <i className="fas fa-reply me-1"></i> 
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 p-3 bg-light rounded">
              <form onSubmit={handleReplySubmit}>
                <div className="mb-3">
                  <textarea 
                    className="form-control" 
                    name="content"
                    rows="3" 
                    placeholder="Write your reply..." 
                    required
                  ></textarea>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <input 
                      type="text" 
                      className="form-control" 
                      name="author_name"
                      placeholder="Your name" 
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input 
                      type="email" 
                      className="form-control" 
                      name="author_email"
                      placeholder="Your email" 
                      required
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-tanzania btn-sm"
                    disabled={replying}
                  >
                    {replying ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="replies mt-3">
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  onLike={onLike}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;