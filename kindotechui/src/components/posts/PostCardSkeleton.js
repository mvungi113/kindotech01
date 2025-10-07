/**
 * Loading skeleton component for PostCard
 */
import React from 'react';

const PostCardSkeleton = () => (
  <div className="col-lg-4 col-md-6">
    <div className="modern-post-card h-100">
      <div className="post-image-container">
        <div className="post-image-placeholder bg-light">
          <div className="skeleton skeleton-image"></div>
        </div>
      </div>
      <div className="post-content">
        <div className="post-meta mb-2">
          <div className="skeleton skeleton-text skeleton-sm mb-1"></div>
        </div>
        <div className="skeleton skeleton-text skeleton-title mb-2"></div>
        <div className="skeleton skeleton-text skeleton-paragraph mb-2"></div>
        <div className="skeleton skeleton-text skeleton-paragraph-short mb-3"></div>
        <div className="post-stats">
          <div className="skeleton skeleton-text skeleton-xs"></div>
        </div>
      </div>
    </div>
  </div>
);

export default PostCardSkeleton;