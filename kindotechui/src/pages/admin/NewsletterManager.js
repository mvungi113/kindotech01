/**
 * Newsletter Management Component for Admin Dashboard
 * Allows admins to view subscribers, statistics, and manage newsletter list
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({
    total_subscribers: 0,
    total_unsubscribed: 0,
    recent_subscribers: 0,
    sources: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadNewsletterData();
    loadNewsletterStats();
  }, [currentPage, filterStatus, filterSource, searchTerm]);

  const loadNewsletterData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 20,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        source: filterSource !== 'all' ? filterSource : undefined,
        search: searchTerm || undefined
      };

      const response = await apiService.getNewsletterSubscribers(params);
      
      if (response.success) {
        setSubscribers(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      console.error('Error loading newsletter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNewsletterStats = async () => {
    try {
      const response = await apiService.getNewsletterStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading newsletter stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadNewsletterData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceBadgeClass = (source) => {
    const classes = {
      website: 'bg-primary',
      post_detail: 'bg-success',
      footer: 'bg-info',
      admin: 'bg-warning'
    };
    return classes[source] || 'bg-secondary';
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-tanzania" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading newsletter data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Newsletter Management</h1>
              <p className="text-muted">Manage your newsletter subscribers and view statistics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Total Subscribers</h6>
                  <h2 className="mb-0">{stats.total_subscribers}</h2>
                </div>
                <i className="fas fa-users fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Recent (30 days)</h6>
                  <h2 className="mb-0">{stats.recent_subscribers}</h2>
                </div>
                <i className="fas fa-user-plus fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Unsubscribed</h6>
                  <h2 className="mb-0">{stats.total_unsubscribed}</h2>
                </div>
                <i className="fas fa-user-minus fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Sources</h6>
                  <h2 className="mb-0">{Object.keys(stats.sources).length}</h2>
                </div>
                <i className="fas fa-chart-pie fa-2x opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Search by Email</label>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Unsubscribed</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Source</label>
                <select
                  className="form-select"
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="website">Website</option>
                  <option value="post_detail">Post Detail</option>
                  <option value="footer">Footer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="col-md-2">
                <label className="form-label">&nbsp;</label>
                <button type="submit" className="btn btn-tanzania w-100">
                  <i className="fas fa-search me-1"></i>
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-list me-2"></i>
            Newsletter Subscribers
          </h5>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-tanzania" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No subscribers found</h5>
              <p className="text-muted">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Subscribed</th>
                    <th>Unsubscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td>
                        <div className="fw-medium">{subscriber.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${subscriber.is_active ? 'bg-success' : 'bg-secondary'}`}>
                          {subscriber.is_active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getSourceBadgeClass(subscriber.subscription_source)}`}>
                          {subscriber.subscription_source}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(subscriber.subscribed_at)}
                        </small>
                      </td>
                      <td>
                        {subscriber.unsubscribed_at ? (
                          <small className="text-muted">
                            {formatDate(subscriber.unsubscribed_at)}
                          </small>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer">
            <nav aria-label="Newsletter pagination">
              <ul className="pagination pagination-sm justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNum = Math.max(1, Math.min(currentPage - 2 + index, totalPages - 4 + index));
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManager;