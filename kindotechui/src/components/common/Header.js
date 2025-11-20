/**
 * Main navigation header for KeyBlog
 * Responsive navbar with authentication-aware links and dynamic categories
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import Logo from './Logo';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data.slice(0, 8)); // Show first 8 categories
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('news') || name.includes('politics')) return 'fas fa-newspaper';
    if (name.includes('business') || name.includes('economy')) return 'fas fa-chart-line';
    if (name.includes('technology') || name.includes('tech')) return 'fas fa-laptop-code';
    if (name.includes('culture') || name.includes('heritage')) return 'fas fa-landmark';
    if (name.includes('sports')) return 'fas fa-futbol';
    if (name.includes('travel') || name.includes('tourism')) return 'fas fa-plane';
    if (name.includes('health')) return 'fas fa-heartbeat';
    if (name.includes('education')) return 'fas fa-graduation-cap';
    if (name.includes('entertainment')) return 'fas fa-music';
    if (name.includes('food')) return 'fas fa-utensils';
    if (name.includes('lifestyle')) return 'fas fa-coffee';
    if (name.includes('environment')) return 'fas fa-leaf';
    
    return 'fas fa-folder';
  };

  return (
    <nav className="navbar-modern navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="brand-modern" to="/">
          <Logo 
            size="navbar" 
            className="navbar-logo"
          />
        </Link>

        <button 
          className="navbar-toggler-modern" 
          type="button" 
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <div className={`navbar-collapse-modern ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav-modern me-auto">
            <li className="nav-item-modern">
              <Link className="nav-link-modern" to="/" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-home nav-icon"></i>
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item-modern">
              <Link className="nav-link-modern" to="/posts" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-newspaper nav-icon"></i>
                <span>All Stories</span>
              </Link>
            </li>
            <li className="nav-item-modern dropdown">
              <button 
                className="nav-link-modern dropdown-toggle btn btn-link p-0" 
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                id="categoriesDropdownMenuButton"
              >
                <i className="fas fa-th-large nav-icon"></i>
                <span>Categories</span>
              </button>
              <ul className="dropdown-menu categories-dropdown" aria-labelledby="categoriesDropdownMenuButton">
                {categoriesLoading ? (
                  <li>
                    <span className="dropdown-item-text">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Loading categories...
                    </span>
                  </li>
                ) : (
                  <>
                    {/* Browse All Categories */}
                    <li className="dropdown-item-featured">
                      <Link 
                        className="dropdown-item dropdown-item-featured" 
                        to="/categories"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-th-large me-2"></i>
                        <div>
                          <strong>Browse All Categories</strong>
                          <small className="d-block text-muted">Explore all topics</small>
                        </div>
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    {/* Categories Grid Container */}
                    <div className="categories-grid">
                      {/* Dynamic Categories */}
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <li key={category.id}>
                            <Link 
                              className="dropdown-item category-dropdown-item" 
                              to={`/categories/${category.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <i className={`${getCategoryIcon(category.name)} me-2 category-icon`}></i>
                              <div className="category-info">
                                <span className="category-name">{category.name}</span>
                                {category.name_sw && (
                                  <small className="category-name-sw d-block">{category.name_sw}</small>
                                )}
                              </div>
                              {category.posts_count > 0 && (
                                <span className="badge bg-secondary ms-auto">{category.posts_count}</span>
                              )}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li>
                          <span className="dropdown-item-text text-muted">
                            <i className="fas fa-info-circle me-2"></i>
                            No categories available
                          </span>
                        </li>
                      )}
                    </div>

                    {/* View More Link */}
                    {categories.length >= 8 && (
                      <div className="view-more-section">
                        <hr className="dropdown-divider" />
                        <li>
                          <Link 
                            className="dropdown-item text-center" 
                            to="/categories"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <i className="fas fa-plus me-2"></i>
                            View More Categories
                          </Link>
                        </li>
                      </div>
                    )}
                  </>
                )}
              </ul>
            </li>
            <li className="nav-item-modern">
              <Link className="nav-link-modern" to="/about" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-info-circle nav-icon"></i>
                <span>About</span>
              </Link>
            </li>
          </ul>

          <div className="navbar-actions">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn theme-toggle-btn me-2"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {/* Modern Search Form */}
            <div className="search-container">
              <form className="search-form-modern" onSubmit={handleSearch}>
                <div className="search-input-group">
                  <i className="fas fa-search search-icon"></i>
                  <input 
                    className="search-input-modern" 
                    type="search" 
                    placeholder="Search technology stories..." 
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="search-btn-modern" type="submit">
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </form>
            </div>

            

            {/* Modern User Section */}
            <div className="user-section">
              {!isAuthenticated ? (
                <div className="auth-buttons">
                  <Link to="/login" className="btn auth-btn-outline">
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                  </Link>
                </div>
              ) : (
                <div className="dropdown user-dropdown-modern">
                  <button 
                    className="btn user-btn-modern dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    id="userDropdownMenuButton"
                  >
                    <div className="user-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <span className="user-name-simple">{user?.name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-modern dropdown-menu-end" aria-labelledby="userDropdownMenuButton">
                    <li>
                      <Link className="dropdown-item-simple" to={`/${user.role}/dashboard`}>
                        <i className="fas fa-tachometer-alt me-2"></i>
                        <span>{user?.role === 'admin' ? 'Dashboard' : 'Dashboard'}</span>
                      </Link>
                    </li>
                    {(user?.role === 'admin' || user?.role === 'author') && (
                      <li>
                        <Link className="dropdown-item-simple" to={`/${user.role}/posts`}>
                          <i className="fas fa-file-alt me-2"></i>
                          <span>{user?.role === 'admin' ? 'Manage Posts' : 'My Posts'}</span>
                        </Link>
                      </li>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <Link className="dropdown-item-simple admin-item" to="/admin/users">
                            <i className="fas fa-users me-2"></i>
                            <span>Users</span>
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item-simple admin-item" to="/admin/categories">
                            <i className="fas fa-tags me-2"></i>
                            <span>Categories</span>
                          </Link>
                        </li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item-simple logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;