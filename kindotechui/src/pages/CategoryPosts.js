/**
 * Category posts page - shows posts for a given category slug
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import PostList from '../components/posts/PostList';

const CategoryPosts = () => {
  const { slug } = useParams();

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="display-6 fw-bold mb-2">{slug ? slug.replace(/-/g, ' ') : 'Category'}</h1>
        <p className="lead text-muted">Showing posts in the "{slug}" category</p>
      </div>

      {/* Reuse PostList which supports filtering by categorySlug */}
      <PostList categorySlug={slug} />
    </div>
  );
};

export default CategoryPosts;
