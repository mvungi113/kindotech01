/**
 * Displays list of comments for a post with nested replies
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import CommentItem from './CommentItem';
import LoadingSpinner from '../common/LoadingSpinner';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPostComments(postId);
      
      if (response.success) {
        setComments(response.data);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      setError('Error loading comments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh comments after new comment is added (used by CommentItem via prop)

  const handleLike = async (commentId) => {
    try {
      await apiService.likeComment(commentId);
      loadComments(); // Refresh to show updated like count
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="small" text="Loading comments..." />;
  }

  if (error) {
    return (
      <div className="alert alert-warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="comments-list mb-4">
      {comments.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-comments fa-2x mb-3"></i>
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        comments.map(comment => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onLike={handleLike}
            onReplyAdded={loadComments}
          />
        ))
      )}
    </div>
  );
};

export default CommentList;