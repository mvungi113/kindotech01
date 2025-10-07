/**
 * Login Component - Unified login with role-based redirection
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../utils/notifications';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default based on role
  const from = location.state?.from?.pathname;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      notify.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Pass credentials as object to match AuthContext login function
      const credentials = {
        email: formData.email,
        password: formData.password
      };
      
      const response = await login(credentials);
      
      if (response.success && response.user) {
        notify.success(`Welcome back, ${response.user.name}!`);
        
        // Role-based redirection
        let redirectPath = '/';
        
        if (from) {
          // If there was an intended destination, go there
          redirectPath = from;
        } else {
          // Default redirection based on role
          switch (response.user.role) {
            case 'admin':
              redirectPath = '/admin/dashboard';
              break;
            case 'author':
              redirectPath = '/author/dashboard';
              break;
            default:
              redirectPath = '/';
              break;
          }
        }
        
        navigate(redirectPath, { replace: true });
      } else {
        notify.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      notify.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="bg-light py-5" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="fas fa-user-circle fa-3x text-primary"></i>
                  </div>
                  <h2 className="h4 mb-1">Welcome Back</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock me-2"></i>Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Remember me
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Links */}
                <div className="text-center mt-4">
                  <div className="small">
                    <Link to="/forgot-password" className="text-decoration-none">
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="small mt-2">
                    <Link to="/" className="text-decoration-none">
                      <i className="fas fa-arrow-left me-1"></i>
                      Back to Blog
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;