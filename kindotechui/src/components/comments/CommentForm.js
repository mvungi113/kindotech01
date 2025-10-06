/**
 * Form for submitting new comments on blog posts
 */
import React, { useState } from 'react';
import { apiService } from '../../services/api';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData(event.target);
    
    const commentData = {
      content: formData.get('content'),
      author_name: formData.get('author_name'),
      author_email: formData.get('author_email'),
      author_website: formData.get('author_website')
    };

    try {
      const response = await apiService.createComment(postId, commentData);
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Comment submitted successfully! It will appear after approval.'
        });
        event.target.reset();
        onCommentAdded(); // Notify parent to refresh comments
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to submit comment'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error submitting comment'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Leave a Comment</h5>
      </div>
      <div className="card-body">
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="commentContent" className="form-label">
              Comment *
            </label>
            <textarea 
              className="form-control" 
              id="commentContent"
              name="content"
              rows="4" 
              placeholder="Share your thoughts..."
              required
            ></textarea>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="authorName" className="form-label">
                Name *
              </label>
              <input 
                type="text" 
                className="form-control" 
                id="authorName"
                name="author_name"
                placeholder="Your name" 
                required
              />
            </div>
            
            <div className="col-md-4">
              <label htmlFor="authorEmail" className="form-label">
                Email *
              </label>
              <input 
                type="email" 
                className="form-control" 
                id="authorEmail"
                name="author_email"
                placeholder="Your email" 
                required
              />
            </div>
            
            <div className="col-md-4">
              <label htmlFor="authorWebsite" className="form-label">
                Website
              </label>
              <input 
                type="url" 
                className="form-control" 
                id="authorWebsite"
                name="author_website"
                placeholder="Your website (optional)" 
              />
            </div>
          </div>

          <div className="mt-4">
            <button 
              type="submit" 
              className="btn btn-tanzania"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Submit Comment
                </>
              )}
            </button>
          </div>

          <div className="mt-2">
            <small className="text-muted">
              * Required fields. Your email will not be published.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentForm;