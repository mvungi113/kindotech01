/**
 * Single post detail page with full content, comments, and related posts
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommentList from '../components/comments/CommentList';
import CommentForm from '../components/comments/CommentForm';

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPost(slug);
      
      if (response.success) {
        setPost(response.data);
        loadRelatedPosts(response.data.category_id, response.data.id);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      setError('Error loading post: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPosts = async (categoryId, excludePostId) => {
    try {
      const response = await apiService.getPosts({
        category: categoryId,
        per_page: 3
      });
      
      if (response.success) {
        const filteredPosts = response.data.data.filter(p => p.id !== excludePostId);
        setRelatedPosts(filteredPosts.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading related posts:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading post..." />;
  }

  if (error || !post) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error || 'Post not found'}
        </div>
        <Link to="/" className="btn btn-tanzania">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link 
              to={`/categories/${post.category.slug}`} 
              className="text-decoration-none"
            >
              {post.category.display_name}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          <article>
            {/* Post Header */}
            <header className="mb-4">
              <span className="category-badge mb-3">
                {post.category.display_name}
              </span>
              
              <h1 className="display-5 fw-bold mb-3">{post.title}</h1>
              
              {post.title_sw && (
                <h2 className="h4 text-muted mb-4 swahili-text">
                  {post.title_sw}
                </h2>
              )}

              {/* Author and Meta Info */}
              <div className="d-flex align-items-center mb-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=1EB53A&color=fff`}
                  alt={post.user.name}
                  className="rounded-circle me-3"
                  style={{ width: '50px', height: '50px' }}
                />
                <div>
                  <strong className="d-block">{post.user.name}</strong>
                  <div className="text-muted small">
                    <span>{formatDate(post.published_at)}</span> • 
                    <span className="ms-2">
                      <i className="fas fa-clock me-1"></i>
                      {post.reading_time} min read
                    </span> • 
                    <span className="ms-2">
                      <i className="fas fa-eye me-1"></i>
                      {post.views} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {post.featured_image && (
                <div className="text-center mb-4">
                  <img 
                    src={`http://localhost:8000/storage/${post.featured_image}`}
                    alt={post.title}
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                  {post.image_caption && (
                    <p className="text-muted mt-2 small">{post.image_caption}</p>
                  )}
                </div>
              )}
            </header>

            {/* Post Content */}
            <div className="post-content mb-5">
              <div 
                className="content-text"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{ 
                  fontSize: '1.1rem', 
                  lineHeight: '1.8',
                  fontFamily: 'Georgia, serif'
                }}
              />
              
              {/* Swahili Content (if available) */}
              {post.content_sw && (
                <div className="mt-5 pt-4 border-top">
                  <h4 className="mb-3 text-tanzania">
                    <i className="fas fa-language me-2"></i>
                    Kwa Kiswahili
                  </h4>
                  <div 
                    className="content-text swahili-text"
                    dangerouslySetInnerHTML={{ __html: post.content_sw }}
                    style={{ 
                      fontSize: '1.1rem', 
                      lineHeight: '1.8',
                      fontFamily: 'Georgia, serif'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-5">
                <strong className="me-2">Tags:</strong>
                {post.tags.map(tag => (
                  <Link 
                    key={tag.id}
                    to={`/tags/${tag.slug}`}
                    className="badge bg-secondary text-decoration-none me-1"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Sharing */}
            <div className="card mb-5">
              <div className="card-body text-center">
                <h6 className="card-title mb-3">Share this post</h6>
                <div className="social-share">
                  <button className="btn btn-outline-primary me-2">
                    <i className="fab fa-facebook me-1"></i> Facebook
                  </button>
                  <button className="btn btn-outline-info me-2">
                    <i className="fab fa-twitter me-1"></i> Twitter
                  </button>
                  <button className="btn btn-outline-success">
                    <i className="fab fa-whatsapp me-1"></i> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <section className="comments-section">
            <h3 className="mb-4">
              <i className="fas fa-comments me-2 text-tanzania"></i>
              Comments
            </h3>
            
            <CommentList postId={post.id} />
            <CommentForm postId={post.id} onCommentAdded={loadPost} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Related Posts */}
          <div className="card mb-4">
            <div className="card-header bg-tanzania text-white">
              <h5 className="mb-0">
                <i className="fas fa-newspaper me-2"></i>
                Related Posts
              </h5>
            </div>
            <div className="card-body">
              {relatedPosts.length > 0 ? (
                relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className="mb-3 pb-3 border-bottom">
                    <h6 className="mb-1">
                      <Link 
                        to={`/posts/${relatedPost.slug}`}
                        className="text-decoration-none"
                      >
                        {relatedPost.title}
                      </Link>
                    </h6>
                    <small className="text-muted">
                      {formatDate(relatedPost.published_at)}
                    </small>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">No related posts found.</p>
              )}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Stay Updated</h5>
              <p className="card-text">
                Get the latest posts from Tanzania Blog delivered to your inbox.
              </p>
              <form className="newsletter-form">
                <div className="mb-3">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your email address" 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-tanzania w-100">
                  Subscribe to Newsletter
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;