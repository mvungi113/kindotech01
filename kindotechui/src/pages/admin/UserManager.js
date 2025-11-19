/**
 * User Manager - Admin interface for managing users
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  
  // Total statistics (all users, not just current page)
  const [totalStats, setTotalStats] = useState({
    total_users: 0,
    total_admins: 0,
    total_authors: 0,
    total_verified: 0
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers({
        page: currentPage,
        per_page: usersPerPage
      });
      if (response?.success) {
        setUsers(response.data.data || []);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
        setTotalUsers(response.data.total || 0);
        
        // Update total statistics from backend
        if (response.stats) {
          setTotalStats(response.stats);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      notify.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiService.updateUser(userId, { role: newRole });
      notify.success('User role updated successfully');
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error updating user role:', error);
      notify.error('Failed to update user role');
    }
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  };

  const handleViewUser = async (user) => {
    try {
      const response = await apiService.getUser(user.id);
      if (response.success) {
        setSelectedUser(response.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      notify.error('Failed to load user details');
    }
  };

  const handleEditUser = async (user) => {
    try {
      const response = await apiService.getUser(user.id);
      if (response.success) {
        setSelectedUser(response.data);
        setEditForm({
          name: response.data.name || '',
          email: response.data.email || '',
          role: response.data.role || '',
          bio: response.data.bio || ''
        });
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      notify.error('Failed to load user details');
    }
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);
      const response = await apiService.updateUser(selectedUser.id, editForm);
      if (response.success) {
        notify.success('User updated successfully');
        setShowEditModal(false);
        loadUsers(); // Reload users list
      }
    } catch (error) {
      console.error('Error updating user:', error);
      notify.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // loadUsers will be called automatically by useEffect when currentPage changes
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>
          
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}

          {pages.map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">User Management</h1>
          <p className="text-muted mb-0">Manage blog authors and administrators</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            onClick={loadUsers} 
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* User Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="h4 text-primary">{totalStats.total_users}</div>
              <div className="text-muted">Total Users</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="h4 text-danger">
                {totalStats.total_admins}
              </div>
              <div className="text-muted">Administrators</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="h4 text-info">
                {totalStats.total_authors}
              </div>
              <div className="text-muted">Authors</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="h4 text-success">
                {totalStats.total_verified}
              </div>
              <div className="text-muted">Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              All Users ({totalUsers})
              {totalPages > 1 && (
                <small className="text-muted ms-2">
                  Page {currentPage} of {totalPages}
                </small>
              )}
            </h5>
            {selectedUsers.size > 0 && (
              <div className="text-muted">
                {selectedUsers.size} selected
              </div>
            )}
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={selectAllUsers}
                      />
                    </div>
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Posts</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <i className="fas fa-users fa-2x mb-2"></i>
                      <div>No users found</div>
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px' }}
                              />
                            ) : (
                              <div 
                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="fw-bold">{user.name}</div>
                            <div className="text-muted small">{user.email}</div>
                            {user.bio && (
                              <div className="text-muted small">{user.bio}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm ${
                            user.role === 'admin' ? 'text-danger' : 'text-primary'
                          }`}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          style={{ width: '120px' }}
                        >
                          <option value="author">Author</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {user.posts_count || 0} posts
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(user.created_at)}
                        </small>
                      </td>
                      <td>
                        {user.email_verified_at ? (
                          <span className="badge bg-success">Verified</span>
                        ) : (
                          <span className="badge bg-warning">Unverified</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="View Profile"
                            onClick={() => handleViewUser(user)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            title="Edit User"
                            onClick={() => handleEditUser(user)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user me-2"></i>
                  User Profile
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="rounded-circle mb-3"
                        style={{ width: '120px', height: '120px' }}
                      />
                    ) : (
                      <div 
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                      >
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h5>{selectedUser.name}</h5>
                    <span className={`badge ${selectedUser.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-bold">Email</label>
                        <p className="form-control-plaintext">{selectedUser.email}</p>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold">Posts Count</label>
                        <p className="form-control-plaintext">{selectedUser.posts_count || 0} posts</p>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold">Joined</label>
                        <p className="form-control-plaintext">{formatDate(selectedUser.created_at)}</p>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Bio</label>
                        <p className="form-control-plaintext">
                          {selectedUser.bio ? selectedUser.bio : (
                            <em className="text-muted">No bio available</em>
                          )}
                        </p>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold">Status</label>
                        <p className="form-control-plaintext">
                          {selectedUser.email_verified_at ? (
                            <span className="badge bg-success">Verified</span>
                          ) : (
                            <span className="badge bg-warning">Unverified</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditUser(selectedUser);
                  }}
                >
                  <i className="fas fa-edit me-2"></i>
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>
                  Edit User
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="User bio..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveUser}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;