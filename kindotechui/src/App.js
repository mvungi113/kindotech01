/**
 * Main KeyBlog React application with complete routing
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public Pages
import Home from './pages/Home';
import AllPosts from './pages/AllPosts';
import PostDetail from './pages/PostDetail';
import Categories from './pages/Categories';
import CategoryPosts from './pages/CategoryPosts';
import SearchResults from './pages/SearchResults';

// Auth Pages
import Login from './pages/auth/Login';
import ApiTest from './pages/ApiTest';
import NewsletterTest from './pages/NewsletterTest';

// Dashboard Router
import DashboardRouter from './pages/DashboardRouter';

// Admin Pages  
import PostManager from './pages/admin/PostManager';
import PostEditor from './pages/admin/PostEditor';
import CategoryManager from './pages/admin/CategoryManager';
import CommentManager from './pages/admin/CommentManager';
import UserManager from './pages/admin/UserManager';
import NewsletterManager from './pages/admin/NewsletterManager';

// Author Pages
import AuthorPostManager from './pages/author/PostManager';
import AuthorPostEditor from './pages/author/PostEditor';
import AuthorProfile from './pages/author/AuthorProfile';

// Auth Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false, requireAuthor = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  if (requireAuthor && !['admin', 'author'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div className="alert alert-danger">
            <h4>Something went wrong</h4>
            <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
            <button 
              className="btn btn-tanzania"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Header />
            
            <main className="flex-grow-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/posts" element={<AllPosts />} />
                <Route path="/posts/:slug" element={<PostDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:slug" element={<CategoryPosts />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/about" element={
                  <div className="container py-5">
                    <h1>About kindoTech</h1>
                    <p>Your gateway to cutting-edge technology insights and innovation.</p>
                  </div>
                } />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/api-test" element={<ApiTest />} />
                <Route path="/newsletter-test" element={<NewsletterTest />} />
                
                {/* Dashboard Routes - Unified routing */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requireAdmin={true}>
                    <DashboardRouter />
                  </ProtectedRoute>
                } />
                
                <Route path="/author/dashboard" element={
                  <ProtectedRoute requireAuthor={true}>
                    <DashboardRouter />
                  </ProtectedRoute>
                } />
                
                {/* Author-specific routes */}
                <Route path="/author/posts" element={
                  <ProtectedRoute requireAuthor={true}>
                    <AuthorPostManager />
                  </ProtectedRoute>
                } />
                
                <Route path="/author/posts/new" element={
                  <ProtectedRoute requireAuthor={true}>
                    <AuthorPostEditor />
                  </ProtectedRoute>
                } />
                
                <Route path="/author/posts/:postId/edit" element={
                  <ProtectedRoute requireAuthor={true}>
                    <AuthorPostEditor />
                  </ProtectedRoute>
                } />
                
                <Route path="/author/profile" element={
                  <ProtectedRoute requireAuthor={true}>
                    <AuthorProfile />
                  </ProtectedRoute>
                } />
                
                {/* Admin-specific routes */}
                <Route path="/admin/posts" element={
                  <ProtectedRoute requireAdmin={true}>
                    <PostManager />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/posts/new" element={
                  <ProtectedRoute requireAdmin={true}>
                    <PostEditor />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/posts/:postId/edit" element={
                  <ProtectedRoute requireAdmin={true}>
                    <PostEditor />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/posts/edit/:postId" element={
                  <ProtectedRoute requireAdmin={true}>
                    <PostEditor />
                  </ProtectedRoute>
                } />
                
                {/* Admin-only Routes */}
                <Route path="/admin/categories" element={
                  <ProtectedRoute requireAdmin={true}>
                    <CategoryManager />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/comments" element={
                  <ProtectedRoute requireAdmin={true}>
                    <CommentManager />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <ProtectedRoute requireAdmin={true}>
                    <UserManager />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/newsletter" element={
                  <ProtectedRoute requireAdmin={true}>
                    <NewsletterManager />
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={
                  <div className="container py-5 text-center">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/'}
                    >
                      Back to Home
                    </button>
                  </div>
                } />
              </Routes>
            </main>

            <Footer />
          </div>
          
          {/* Toast notifications */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;