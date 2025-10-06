/**
 * Author Profile - Profile management for blog authors
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const AuthorProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    website: '',
    social_links: {
      twitter: '',
      facebook: '',
      linkedin: '',
      instagram: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        social_links: {
          twitter: user.social_links?.twitter || '',
          facebook: user.social_links?.facebook || '',
          linkedin: user.social_links?.linkedin || '',
          instagram: user.social_links?.instagram || ''
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialField = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.updateProfile(formData);
      if (response.success) {
        updateUser(response.data);
        notify.success('Profile updated successfully!');
      } else {
        notify.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      notify.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      notify.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.changePassword(passwordData);
      if (response.success) {
        notify.success('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      } else {
        notify.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      notify.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="fas fa-user-circle me-2"></i>
          My Profile
        </h1>
      </div>

      <div className="row">
        <div className="col-md-3">
          {/* Profile Sidebar */}
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
              <h5>{user?.name}</h5>
              <p className="text-muted">{user?.email}</p>
              <span className="badge bg-info">{user?.role}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="card mt-3">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user me-2"></i>
                  Profile Information
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'social' ? 'active' : ''}`}
                  onClick={() => setActiveTab('social')}
                >
                  <i className="fas fa-share-alt me-2"></i>
                  Social Links
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Profile Information
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="website" className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="current_password" className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="current_password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="new_password" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="new_password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                    />
                    <div className="form-text">Password must be at least 8 characters long.</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="new_password_confirmation" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="new_password_confirmation"
                      name="new_password_confirmation"
                      value={passwordData.new_password_confirmation}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key me-2"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Social Links Tab */}
          {activeTab === 'social' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-share-alt me-2"></i>
                  Social Links
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="social_twitter" className="form-label">
                          <i className="fab fa-twitter me-2"></i>Twitter
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="social_twitter"
                          name="social_twitter"
                          value={formData.social_links.twitter}
                          onChange={handleInputChange}
                          placeholder="https://twitter.com/yourusername"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="social_facebook" className="form-label">
                          <i className="fab fa-facebook me-2"></i>Facebook
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="social_facebook"
                          name="social_facebook"
                          value={formData.social_links.facebook}
                          onChange={handleInputChange}
                          placeholder="https://facebook.com/yourusername"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="social_linkedin" className="form-label">
                          <i className="fab fa-linkedin me-2"></i>LinkedIn
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="social_linkedin"
                          name="social_linkedin"
                          value={formData.social_links.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/yourusername"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="social_instagram" className="form-label">
                          <i className="fab fa-instagram me-2"></i>Instagram
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="social_instagram"
                          name="social_instagram"
                          value={formData.social_links.instagram}
                          onChange={handleInputChange}
                          placeholder="https://instagram.com/yourusername"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Update Social Links
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;