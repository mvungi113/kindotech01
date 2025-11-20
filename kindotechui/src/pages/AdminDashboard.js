/**
 * Admin dashboard with role-based routing
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardRouter from './DashboardRouter';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="admin-layout">
      {/* Modern Admin Header */}
      <div className="admin-header bg-gradient-primary text-white py-4 shadow-sm">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div className="admin-header-icon me-3">
                  <i className="fas fa-cog fa-2x"></i>
                </div>
                <div>
                  <h1 className="h3 mb-1 fw-bold">
                    {user?.role === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}
                  </h1>
                  <p className="mb-0 opacity-75">KeyBlog Management System</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <div className="d-flex justify-content-md-end align-items-center gap-2">
                <span className="badge bg-white bg-opacity-20 text-white px-3 py-2">
                  <i className={`fas fa-${user?.role === 'admin' ? 'shield-alt' : 'user-edit'} me-1`}></i>
                  {user?.role === 'admin' ? 'Administrator' : 'Author'}
                </span>
                <small className="text-white-50 ms-2">
                  Welcome back, {user?.name}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <DashboardRouter />
    </div>
  );
};

export default AdminDashboard;