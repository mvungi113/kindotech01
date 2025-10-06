/**
 * Search results page with filtering and pagination
 */
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getPosts({
        search: query,
        per_page: 20
      });

      if (response.success) {
        setResults(response.data.data);
      } else {
        setError('Search failed');
      }
    } catch (err) {
      setError('Error performing search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  return (
    <div className="container py-5">
      {/* Search Header */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-8">
          <div className="text-center mb-4">
            <h1 className="display-6 fw-bold mb-3">Search Results</h1>
            <p className="lead text-muted">
              {initialQuery ? `Searching for: "${initialQuery}"` : 'Enter your search terms'}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group input-group-lg">
              <input
                type="text"
                className="form-control"
                placeholder="Search posts, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-tanzania" type="submit">
                <i className="fas fa-search me-2"></i>
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text="Searching posts..." />}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div>
          {/* Results Count */}
          <div className="row mb-4">
            <div className="col-12">
              <p className="text-muted">
                Found {results.length} result{results.length !== 1 ? 's' : ''} 
                {initialQuery && ` for "${initialQuery}"`}
              </p>
            </div>
          </div>

          {/* No Results */}
          {results.length === 0 && initialQuery && (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">No results found</h4>
              <p className="text-muted">
                Try different keywords or browse our categories
              </p>
              <Link to="/" className="btn btn-tanzania">
                Browse All Posts
              </Link>
            </div>
          )}

          {/* Results Grid */}
          {results.length > 0 && (
            <div className="row">
              {results.map(post => (
                <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State - No Search Yet */}
          {!initialQuery && (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">Start Searching</h4>
              <p className="text-muted">
                Enter keywords to find posts about Tanzania news, culture, technology, and more.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;