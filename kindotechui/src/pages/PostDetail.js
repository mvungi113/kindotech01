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
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [showSwahili, setShowSwahili] = useState(false);

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
        // Load related posts after we have the post data
        setTimeout(() => {
          loadRelatedPosts(response.data.category_id, response.data.id);
        }, 100);
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
      setLoadingRelated(true);
      console.log('Loading related posts for category:', categoryId, 'excluding post:', excludePostId);
      let relatedPostsData = [];
      
      // First, try to get posts from the same category using category slug
      if (post?.category?.slug) {
        try {
          console.log('Trying to load posts from category:', post.category.slug);
          const categoryResponse = await apiService.getPosts({
            category: post.category.slug,
            per_page: 6
          });
          
          console.log('Category posts response:', categoryResponse);
          
          if (categoryResponse.success && categoryResponse.data?.data) {
            const categoryPosts = categoryResponse.data.data.filter(p => p.id !== excludePostId);
            relatedPostsData = categoryPosts.slice(0, 3);
            console.log('Found category posts:', relatedPostsData.length);
          }
        } catch (err) {
          console.warn('Could not load category posts:', err);
        }
      }
      
      // If we don't have enough related posts, get recent posts
      if (relatedPostsData.length < 3) {
        try {
          console.log('Loading recent posts to fill related posts...');
          const recentResponse = await apiService.getPosts({
            per_page: 8,
            orderBy: 'published_at',
            orderDir: 'desc'
          });
          
          console.log('Recent posts response:', recentResponse);
          
          if (recentResponse.success && recentResponse.data?.data) {
            const recentPosts = recentResponse.data.data.filter(p => 
              p.id !== excludePostId && 
              !relatedPostsData.some(existing => existing.id === p.id)
            );
            relatedPostsData = [...relatedPostsData, ...recentPosts].slice(0, 3);
            console.log('Total related posts after adding recent:', relatedPostsData.length);
          }
        } catch (err) {
          console.warn('Could not load recent posts:', err);
        }
      }
      
      console.log('Final related posts:', relatedPostsData);
      setRelatedPosts(relatedPostsData);
    } catch (error) {
      console.error('Error loading related posts:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscribeMessage('Please enter a valid email address.');
      return;
    }
    
    try {
      setSubscribing(true);
      setSubscribeMessage('');
      
      // For now, simulate subscription (you can add actual API call later)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscribeMessage('Thank you for subscribing! You will receive updates from Tanzania Blog.');
      setEmail('');
      
      // Optional: Add actual API call here
      // const response = await apiService.subscribeToNewsletter({ email });
      
    } catch (error) {
      setSubscribeMessage('Sorry, there was an error subscribing. Please try again.');
    } finally {
      setSubscribing(false);
    }
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
              
              <h1 className="display-5 fw-bold mb-3">
                {!showSwahili ? post.title : (post.title_sw || post.title)}
              </h1>
              
              {post.title_sw && !showSwahili && (
                <div className="d-flex align-items-center mb-3">
                  <small className="text-muted me-2">Also available in Swahili:</small>
                  <span className="text-muted small fst-italic">"{post.title_sw}"</span>
                </div>
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

            {/* Language Toggle (if Swahili version available) */}
            {post.content_sw && post.content_sw.trim().length > 0 && (
              <div className="language-toggle mb-4">
                <div className="d-flex align-items-center">
                  <span className="me-3 text-muted">Available in:</span>
                  <div className="btn-group" role="group" aria-label="Language selection">
                    <button
                      type="button"
                      className={`btn ${!showSwahili ? 'btn-tanzania' : 'btn-outline-tanzania'}`}
                      onClick={() => setShowSwahili(false)}
                    >
                      <i className="fas fa-globe me-1"></i>
                      English
                    </button>
                    <button
                      type="button"
                      className={`btn ${showSwahili ? 'btn-tanzania' : 'btn-outline-tanzania'}`}
                      onClick={() => setShowSwahili(true)}
                    >
                      <i className="fas fa-language me-1"></i>
                      Kiswahili
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="post-content mb-5">
              {!showSwahili ? (
                <div 
                  className="content-text"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                  style={{ 
                    fontSize: '1.1rem', 
                    lineHeight: '1.8',
                    fontFamily: 'Georgia, serif'
                  }}
                />
              ) : (
                <div>
                  {post.content_sw && post.content_sw.trim().length > 0 ? (
                    <div 
                      className="content-text swahili-text"
                      dangerouslySetInnerHTML={{ __html: post.content_sw }}
                      style={{ 
                        fontSize: '1.1rem', 
                        lineHeight: '1.8',
                        fontFamily: 'Georgia, serif',
                        color: '#212529'
                      }}
                    />
                  ) : (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Swahili version is not available for this post.
                      <button 
                        className="btn btn-outline-primary btn-sm ms-3"
                        onClick={() => setShowSwahili(false)}
                      >
                        View English
                      </button>
                    </div>
                  )}
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
              {loadingRelated ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-tanzania me-2" role="status"></div>
                  <span className="text-muted">Loading related posts...</span>
                </div>
              ) : relatedPosts.length > 0 ? (
                relatedPosts.map((relatedPost, index) => (
                  <div key={relatedPost.id} className={`mb-3 ${index < relatedPosts.length - 1 ? 'pb-3 border-bottom' : ''}`}>
                    <div className="d-flex">
                      {relatedPost.featured_image && (
                        <div className="me-3 flex-shrink-0">
                          <img 
                            src={`http://localhost:8000/storage/${relatedPost.featured_image}`}
                            alt={relatedPost.title}
                            className="rounded"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <h6 className="mb-1">
                          <Link 
                            to={`/posts/${relatedPost.slug}`}
                            className="text-decoration-none text-dark"
                            onClick={() => window.scrollTo(0, 0)}
                          >
                            {relatedPost.title}
                          </Link>
                        </h6>
                        <div className="text-muted small d-flex align-items-center">
                          <span className="me-3">
                            <i className="fas fa-calendar me-1"></i>
                            {formatDate(relatedPost.published_at)}
                          </span>
                          {relatedPost.category && (
                            <span className="me-3">
                              <i className="fas fa-tag me-1"></i>
                              {relatedPost.category.name}
                            </span>
                          )}
                          <span>
                            <i className="fas fa-eye me-1"></i>
                            {relatedPost.views || 0} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-newspaper fa-2x text-muted mb-2"></i>
                  <p className="text-muted mb-2">No related posts found.</p>
                  <Link to="/posts" className="btn btn-outline-tanzania btn-sm">
                    <i className="fas fa-arrow-left me-1"></i>
                    Browse All Posts
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-envelope me-2 text-tanzania"></i>
                Stay Updated
              </h5>
              <p className="card-text">
                Get the latest posts from Tanzania Blog delivered to your inbox.
              </p>
              
              {subscribeMessage && (
                <div className={`alert ${subscribeMessage.includes('Thank you') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                  <small>{subscribeMessage}</small>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setSubscribeMessage('')}
                  ></button>
                </div>
              )}
              
              <form className="newsletter-form" onSubmit={handleNewsletterSubscribe}>
                <div className="mb-3">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    disabled={subscribing}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-tanzania w-100"
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Subscribe to Newsletter
                    </>
                  )}
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