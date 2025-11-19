/**
 * Category posts page - shows posts for a given category slug
 * Now with Load More functionality for better user experience
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import PostList from '../components/posts/PostList';

const CategoryPosts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCategoryDetails();
  }, [slug]);

  const loadCategoryDetails = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        const foundCategory = response.data.find(cat => cat.slug === slug);
        setCategory(foundCategory);
      }
    } catch (error) {
      console.error('Error loading category details:', error);
    }
  };

  const formatCategoryName = (slug) => {
    return slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category';
  };

  return (
    <div className="category-posts-page">
      {/* Category Header */}
      <section className="category-hero py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/" className="text-decoration-none">Home</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/categories" className="text-decoration-none">Categories</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {formatCategoryName(slug)}
                  </li>
                </ol>
              </nav>
              
              <div className="d-flex align-items-center mb-3">
                {category?.icon && (
                  <div className="category-icon-large me-3">
                    <i className={`${category.icon} fa-3x`} style={{ color: category.color || '#007bff' }}></i>
                  </div>
                )}
                <div>
                  <h1 className="display-5 fw-bold mb-2">
                    {category?.display_name || category?.name || formatCategoryName(slug)}
                  </h1>
                  <p className="lead text-muted mb-0">
                    {category?.description || `Explore all posts in the ${formatCategoryName(slug)} category`}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/categories" className="btn btn-outline-tanzania">
                <i className="fas fa-th-large me-2"></i>
                Browse All Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="category-posts-section py-5">
        <div className="container">
          {/* Use PostList with Load More style enabled */}
          <PostList categorySlug={slug} loadMoreStyle={true} />
        </div>
      </section>
    </div>
  );
};

export default CategoryPosts;
