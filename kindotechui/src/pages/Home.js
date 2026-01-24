import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [postsByCategory, setPostsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomepageData();
  }, []);

  const loadHomepageData = async () => {
    try {
      setLoading(true);
      
      const [categoriesResponse, postsResponse] = await Promise.all([
        apiService.getCategories(),
        apiService.getPosts({ page: 1, per_page: 100 })
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      if (postsResponse.success) {
        const postsData = postsResponse.data.data || postsResponse.data;
        setRecentPosts(postsData);
        
        const grouped = {};
        if (categoriesResponse.success) {
          categoriesResponse.data.forEach(category => {
            grouped[category.id] = postsData.filter(post => 
              post.category_id === category.id
            ).slice(0, 6);
          });
        }
        setPostsByCategory(grouped);
      }

    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render different layouts for variety
  const renderCategoryLayout = (category, categoryPosts, index) => {
    const layoutType = index % 3; // Cycle through 3 different layouts

    // Layout 1: Grid Layout (3 columns)
    if (layoutType === 0) {
      return (
        <div className="row g-3">
          {categoryPosts.map((post) => (
            <div key={post.id} className="col-lg-4 col-md-6">
              <Link to={`/posts/${post.slug}`} className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 overflow-hidden">
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    {post.featured_image ? (
                      <img 
                        src={`https://keysblog-464d939b8203.herokuapp.com/${post.featured_image}`}
                        className="w-100 h-100"
                        alt={post.title}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                        <i className="fas fa-image fa-2x text-muted"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-body p-3">
                    <h6 className="mb-2" style={{ 
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.title}
                    </h6>
                    <div className="d-flex align-items-center gap-2 small text-muted">
                      <span><i className="fas fa-clock me-1"></i>{post.reading_time || 5} min</span>
                      <span><i className="fas fa-eye me-1"></i>{post.views || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      );
    }

    // Layout 2: Featured + Grid (1 large, rest smaller)
    if (layoutType === 1) {
      return (
        <div className="row g-3">
          {categoryPosts[0] && (
            <div className="col-lg-6">
              <Link to={`/posts/${categoryPosts[0].slug}`} className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 overflow-hidden">
                  <div style={{ height: '280px', overflow: 'hidden' }}>
                    {categoryPosts[0].featured_image ? (
                      <img 
                        src={`https://keysblog-464d939b8203.herokuapp.com/${categoryPosts[0].featured_image}`}
                        className="w-100 h-100"
                        alt={categoryPosts[0].title}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                        <i className="fas fa-image fa-3x text-muted"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-body p-3">
                    <h5 className="mb-2" style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.4' }}>
                      {categoryPosts[0].title}
                    </h5>
                    <p className="text-muted small mb-2" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {categoryPosts[0].excerpt}
                    </p>
                    <div className="d-flex align-items-center gap-2 small text-muted">
                      <span><i className="fas fa-user me-1"></i>{categoryPosts[0].user?.name}</span>
                      <span><i className="fas fa-eye me-1"></i>{categoryPosts[0].views || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
          <div className="col-lg-6">
            <div className="row g-3">
              {categoryPosts.slice(1).map((post) => (
                <div key={post.id} className="col-12">
                  <Link to={`/posts/${post.slug}`} className="text-decoration-none">
                    <div className="card border-0 shadow-sm overflow-hidden">
                      <div className="row g-0">
                        <div className="col-4">
                          <div style={{ height: '100px', overflow: 'hidden' }}>
                            {post.featured_image ? (
                              <img 
                                src={`https://keysblog-464d939b8203.herokuapp.com/${post.featured_image}`}
                                className="w-100 h-100"
                                alt={post.title}
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                                <i className="fas fa-image text-muted"></i>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-8">
                          <div className="card-body p-2">
                            <h6 className="mb-1" style={{ 
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              lineHeight: '1.3',
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {post.title}
                            </h6>
                            <div className="d-flex gap-2 small text-muted">
                              <span><i className="fas fa-clock me-1"></i>{post.reading_time || 5}m</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Layout 3: Horizontal List
    return (
      <div className="row g-3">
        {categoryPosts.map((post) => (
          <div key={post.id} className="col-lg-6">
            <Link to={`/posts/${post.slug}`} className="text-decoration-none">
              <div className="card border-0 shadow-sm overflow-hidden">
                <div className="row g-0">
                  <div className="col-5">
                    <div style={{ height: '140px', overflow: 'hidden' }}>
                      {post.featured_image ? (
                        <img 
                          src={`https://keysblog-464d939b8203.herokuapp.com/${post.featured_image}`}
                          className="w-100 h-100"
                          alt={post.title}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                          <i className="fas fa-image fa-2x text-muted"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-7">
                    <div className="card-body p-3">
                      <h6 className="mb-2" style={{ 
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: '3',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.title}
                      </h6>
                      <div className="d-flex align-items-center gap-2 small text-muted">
                        <span><i className="fas fa-clock me-1"></i>{post.reading_time || 5} min</span>
                        <span><i className="fas fa-eye me-1"></i>{post.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading KeyBlog..." />;
  }

  return (
    <div className="modern-homepage">
      {/* Hero - Latest Posts */}
      <section className="py-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          {recentPosts.length > 0 && (
            <div className="row g-2">
              <div className="col-lg-8">
                <Link to={`/posts/${recentPosts[0].slug}`} className="text-decoration-none">
                  <div className="card border-0 shadow-sm overflow-hidden h-100">
                    <div style={{ height: '350px', overflow: 'hidden' }}>
                      {recentPosts[0].featured_image ? (
                        <img 
                          src={`https://keysblog-464d939b8203.herokuapp.com/${recentPosts[0].featured_image}`}
                          className="w-100 h-100"
                          alt={recentPosts[0].title}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                          <i className="fas fa-image fa-4x text-muted"></i>
                        </div>
                      )}
                    </div>
                    <div className="card-body p-3">
                      <span className="badge bg-primary mb-2" style={{ fontSize: '0.75rem' }}>
                        {recentPosts[0].category?.display_name || recentPosts[0].category?.name}
                      </span>
                      <h4 className="mb-2" style={{ fontSize: '1.3rem', fontWeight: '600', lineHeight: '1.3' }}>
                        {recentPosts[0].title}
                      </h4>
                      <div className="d-flex align-items-center gap-3 small text-muted">
                        <span><i className="fas fa-user me-1"></i>{recentPosts[0].user?.name}</span>
                        <span><i className="fas fa-clock me-1"></i>{recentPosts[0].reading_time || 5} min</span>
                        <span><i className="fas fa-eye me-1"></i>{recentPosts[0].views || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-lg-4">
                <div className="row g-2 h-100">
                  {recentPosts.slice(1, 3).map((post, idx) => (
                    <div key={post.id} className="col-12" style={{ height: 'calc(50% - 0.25rem)' }}>
                      <Link to={`/posts/${post.slug}`} className="text-decoration-none h-100 d-block">
                        <div className="card border-0 shadow-sm overflow-hidden h-100">
                          <div style={{ height: '55%', overflow: 'hidden' }}>
                            {post.featured_image ? (
                              <img 
                                src={`https://keysblog-464d939b8203.herokuapp.com/${post.featured_image}`}
                                className="w-100 h-100"
                                alt={post.title}
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                                <i className="fas fa-image fa-2x text-muted"></i>
                              </div>
                            )}
                          </div>
                          <div className="card-body p-3" style={{ height: '45%' }}>
                            <span className="badge bg-primary mb-2" style={{ fontSize: '0.7rem' }}>
                              {post.category?.display_name || post.category?.name}
                            </span>
                            <h6 className="mb-2" style={{ 
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              lineHeight: '1.4',
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {post.title}
                            </h6>
                            <div className="d-flex align-items-center gap-2 small text-muted">
                              <span><i className="fas fa-clock me-1"></i>{post.reading_time || 5}m</span>
                              <span><i className="fas fa-eye me-1"></i>{post.views || 0}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Sections with Different Layouts */}
      {categories.map((category, index) => {
        const categoryPosts = postsByCategory[category.id] || [];
        
        if (categoryPosts.length === 0) return null;
        
        return (
          <section key={category.id} className="py-3" style={{ 
            backgroundColor: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)' 
          }}>
            <div className="container">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                  {category.display_name || category.name}
                </h5>
                <Link 
                  to={`/posts?category=${category.slug}`} 
                  className="btn btn-sm btn-outline-primary"
                  style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem' }}
                >
                  All <i className="fas fa-arrow-right ms-1"></i>
                </Link>
              </div>
              
              {renderCategoryLayout(category, categoryPosts, index)}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Home;