/**
 * Dashboard Router - Role-based dashboard routing with separate components
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import AuthorDashboard from './author/AuthorDashboard';

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on user role with separate dashboard components
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'author':
      return <AuthorDashboard />;
    default:
      // Regular users don't have dashboards, redirect to home
      return <Navigate to="/" replace />;
  }
};

export default DashboardRouter;