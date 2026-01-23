/**
 * Modern Post card component with full clickability and animations
 * Features hover effects, responsive design, and enhanced visual hierarchy
 */
import React from 'react';
import { Link } from 'react-router-dom';

// Get base URL for images (remove /api/v1 from API URL)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://keysblog-464d939b8203.herokuapp.com/api/v1';
const IMAGE_BASE_URL = API_BASE_URL.replace('/api/v1', '');

const PostCard = ({ post, featured = false, animationDelay = 0 }) => {
  const [imageError, setImageError] = React.useState(false);
  
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

  // Enhanced excerpt generation
  const getPostExcerpt = (post) => {
    // Check if excerpt exists and is meaningful (not just random text)
    if (post.excerpt && post.excerpt.length > 10 && !post.excerpt.match(/^[a-z]*$/i)) {
      return post.excerpt;
    }
    
    if (post.content) {
      // Remove HTML tags and clean up content
      let cleanContent = post.content
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
        .trim();
      
      // Skip Lorem ipsum text and random content
      if (cleanContent.toLowerCase().includes('lorem ipsum') || cleanContent.match(/^[a-z]*$/i)) {
        // Try Swahili content if English is Lorem ipsum
        if (post.content_sw) {
          cleanContent = post.content_sw
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanContent.length > 150) {
            return cleanContent.substring(0, 150).trim() + '...';
          }
          return cleanContent;
        }
      }
      
      if (cleanContent.length > 150) {
        return cleanContent.substring(0, 150).trim() + '...';
      }
      return cleanContent;
    }
    
    // Use Swahili content as fallback if available
    if (post.content_sw) {
      const cleanSwahili = post.content_sw
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanSwahili.length > 150) {
        return cleanSwahili.substring(0, 150).trim() + '...';
      }
      return cleanSwahili;
    }
    
    // Default fallback description based on category
    const categoryName = post.category?.name || post.category?.display_name || 'General';
    return `Explore the latest insights and updates in ${categoryName}. Discover comprehensive coverage and expert analysis.`;
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
          {post.featured_image && !imageError ? (
            <img 
              src={`${IMAGE_BASE_URL}/${post.featured_image}`}
              className="post-image"
              alt={post.title}
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', `${IMAGE_BASE_URL}/${post.featured_image}`);
                setImageError(true);
              }}
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
            {post.title && post.title.length > 3 && !post.title.match(/^[a-z]*$/i) ? 
              post.title : 
              (post.title_sw || `${post.category?.display_name || 'General'} Article`)
            }
          </h3>

          <p className="post-excerpt">
            {getPostExcerpt(post)}
          </p>

          <div className="post-stats">
            <div className="stat-item">
              <i className="fas fa-clock text-tanzania-blue"></i>
              <span>{post.reading_time || 5} min read</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-eye text-muted"></i>
              <span>{formatViews(post.views)} views</span>
            </div>
            {post.comments_count > 0 && (
              <div className="stat-item">
                <i className="fas fa-comments text-muted"></i>
                <span>{post.comments_count}</span>
              </div>
            )}
            {post.content_sw && (
              <div className="stat-item">
                <i className="fas fa-language text-success"></i>
                <span className="small">Bilingual</span>
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