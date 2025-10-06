/**
 * Admin category management - Create, edit, and organize categories
 */
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    name_sw: '',
    description: '',
    color: '#3B82F6',
    icon: 'fas fa-folder',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let response;
      if (editingCategory) {
        response = await apiService.updateCategory(editingCategory.id, formData);
      } else {
        response = await apiService.createCategory(formData);
      }

      if (response.success) {
        setSuccess(
          editingCategory ? 'Category updated successfully!' : 'Category created successfully!'
        );
        resetForm();
        loadCategories();
      } else {
        setError(response.message || 'Failed to save category');
      }
    } catch (err) {
      setError('Error saving category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_sw: '',
      description: '',
      color: '#3B82F6',
      icon: 'fas fa-folder',
      is_active: true,
      order: 0
    });
    setEditingCategory(null);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_sw: category.name_sw || '',
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || 'fas fa-folder',
      is_active: category.is_active,
      order: category.order || 0
    });
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await apiService.deleteCategory(categoryId);
      if (response.success) {
        setSuccess('Category deleted successfully!');
        loadCategories();
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category: ' + err.message);
    }
  };

  const iconOptions = [
    'fas fa-newspaper',
    'fas fa-chart-line',
    'fas fa-laptop-code',
    'fas fa-music',
    'fas fa-plane',
    'fas fa-heartbeat',
    'fas fa-futbol',
    'fas fa-graduation-cap',
    'fas fa-film',
    'fas fa-utensils',
    'fas fa-leaf',
    'fas fa-building',
    'fas fa-car',
    'fas fa-shopping-cart',
    'fas fa-university'
  ];

  if (loading) {
    return <LoadingSpinner text="Loading categories..." />;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Categories</h5>
              <span className="badge bg-primary">{categories.length} categories</span>
            </div>
            <div className="card-body">
              {categories.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-folder-open fa-3x mb-3"></i>
                  <p>No categories yet. Create your first category!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Swahili Name</th>
                        <th>Posts</th>
                        <th>Status</th>
                        <th>Order</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(category => (
                        <tr key={category.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i 
                                className={`${category.icon} me-2`} 
                                style={{ color: category.color, width: '20px' }}
                              ></i>
                              <strong>{category.name}</strong>
                            </div>
                          </td>
                          <td>{category.name_sw || '-'}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {category.posts_count || 0}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${category.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {category.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{category.order}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(category)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(category.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Category Name *
                  </label>
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

                <div className="mb-3">
                  <label htmlFor="name_sw" className="form-label">
                    Swahili Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name_sw"
                    name="name_sw"
                    value={formData.name_sw}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="color" className="form-label">
                        Color
                      </label>
                      <input
                        type="color"
                        className="form-control form-control-color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="icon" className="form-label">
                        Icon
                      </label>
                      <select
                        className="form-select"
                        id="icon"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="order" className="form-label">
                        Order
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mb-3 mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_active">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-tanzania"
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
                        {editingCategory ? 'Update' : 'Create'} Category
                      </>
                    )}
                  </button>
                  
                  {editingCategory && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Preview */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-white">
              <h6 className="mb-0">Preview</h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i 
                  className={`${formData.icon} me-2`} 
                  style={{ color: formData.color }}
                ></i>
                <div>
                  <strong>{formData.name || 'Category Name'}</strong>
                  {formData.name_sw && (
                    <div className="small text-muted">{formData.name_sw}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;