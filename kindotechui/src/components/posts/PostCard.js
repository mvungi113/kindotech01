/**
 * Modern Post card component with full clickability and animations
 * Features hover effects, responsive design, and enhanced visual hierarchy
 */
import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post, featured = false, animationDelay = 0 }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatViews = (views) => {
    if (views > 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views || 0;
  };

  return (
    <Link 
      to={`/posts/${post.slug}`} 
      className="text-decoration-none"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <article className={`modern-post-card h-100 animate-fade-in-up ${featured ? 'featured-post' : ''}`}>
        {/* Image Container */}
        <div className="post-image-container">
          {post.featured_image ? (
            <img 
              src={`http://localhost:8000/storage/${post.featured_image}`}
              className="post-image"
              alt={post.title}
              loading="lazy"
            />
          ) : (
            <div className="post-image-placeholder">
              <i className="fas fa-image fa-3x text-muted"></i>
            </div>
          )}
          
          {/* Category Badge */}
          {post.category && (
            <div className="category-badge-overlay">
              <span className="category-badge-modern">
                {post.category?.display_name || post.category?.name}
              </span>
            </div>
          )}
          
          {/* Featured Badge */}
          {featured && (
            <div className="featured-badge">
              <i className="fas fa-star"></i>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="post-content">
          <div className="post-meta">
            <div className="author-info">
              <div className="author-avatar">
                <i className="fas fa-user-circle fa-lg text-tanzania"></i>
              </div>
              <span className="author-name">{post.user?.name}</span>
            </div>
            <span className="post-date">{formatDate(post.published_at || post.created_at)}</span>
          </div>

          <h3 className={`post-title ${featured ? 'featured-title' : ''}`}>
            {post.title}
          </h3>

          <p className="post-excerpt">
            {post.excerpt || (post.content ? `${post.content.substring(0, 120)}...` : 'No preview available.')}\n          </p>

          <div className="post-stats">
            <div className="stat-item">
              <i className="fas fa-clock text-tanzania-blue"></i>\n              <span>{post.reading_time || 5} min read</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-eye text-muted"></i>\n              <span>{formatViews(post.views)} views</span>
            </div>
            {post.comments_count > 0 && (
              <div className="stat-item">
                <i className="fas fa-comments text-muted"></i>\n                <span>{post.comments_count}</span>
              </div>
            )}
          </div>

          {/* Read More Arrow */}
          <div className="read-more-arrow">
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PostCard;