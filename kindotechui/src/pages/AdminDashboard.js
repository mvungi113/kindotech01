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
      {/* Dashboard Header */}
      <div className="bg-primary text-white py-3">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h4 mb-0">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}
              </h1>
              <small className="opacity-75">KeyBlog Management</small>
            </div>
            <div className="col-auto">
              <span className="badge bg-light text-primary">
                {user?.role === 'admin' ? 'Administrator' : 'Author'}
              </span>
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