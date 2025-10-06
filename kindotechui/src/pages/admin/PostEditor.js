/**
 * Post editor component for creating and editing blog posts
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';
import { useAuth } from '../../context/AuthContext';

const PostEditor = () => {
  const [post, setPost] = useState({
    title: '',
    title_sw: '',
    content: '',
    content_sw: '',
    excerpt: '',
    category_id: '',
    tags: [],
    is_published: false,
    is_featured: false,
    featured_image: null,
    meta_title: '',
    meta_description: ''
  });
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [swahiliWordCount, setSwahiliWordCount] = useState(0);
  const [swahiliReadingTime, setSwahiliReadingTime] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(postId);

  useEffect(() => {
    loadInitialData();
  }, [postId]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = post.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
    
    const swahiliWords = post.content_sw.trim().split(/\s+/).filter(word => word.length > 0).length;
    setSwahiliWordCount(swahiliWords);
    setSwahiliReadingTime(Math.ceil(swahiliWords / 200));
  }, [post.content, post.content_sw]);

  // Auto-save functionality
  useEffect(() => {
    if (!isEditing && isDirty && post.title && post.content && post.title.length > 3) {
      const autoSaveTimer = setTimeout(() => {
        autoSaveDraft();
      }, 30000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [post.title, post.content, isDirty, isEditing]);

  const autoSaveDraft = async () => {
    if (!post.title || post.title.length < 3) return;
    
    setAutoSaving(true);
    try {
      const draftData = {
        title: post.title.trim(),
        content: post.content.trim(),
        is_published: false
      };
      
      if (post.excerpt) draftData.excerpt = post.excerpt.trim();
      if (post.category_id) draftData.category_id = parseInt(post.category_id);
      
      const response = await apiService.createPost(draftData);
      if (response?.success) {
        setLastSaved(new Date());
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load categories and tags
      const [categoriesResponse, tagsResponse] = await Promise.all([
        apiService.getCategories(),
        // apiService.getTags() // Uncomment when tags endpoint is ready
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // If editing, load the post
      if (isEditing) {
        const postResponse = await apiService.getPostForEdit(postId);
        if (postResponse.success) {
          const postData = postResponse.data;
          setPost({
            title: postData.title || '',
            title_sw: postData.title_sw || '',
            content: postData.content || '',
            content_sw: postData.content_sw || '',
            excerpt: postData.excerpt || '',
            category_id: postData.category_id || '',
            tags: postData.tags?.map(tag => tag.id) || [],
            is_published: postData.is_published || false,
            is_featured: postData.is_featured || false,
            featured_image: null, // File object, not URL
            meta_title: postData.meta_title || '',
            meta_description: postData.meta_description || ''
          });
          
          if (postData.featured_image) {
            setImagePreview(`http://localhost:8000/storage/${postData.featured_image}`);
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      notify.error('Failed to load page data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPost(prev => ({ ...prev, featured_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTagChange = (tagId) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  // Text formatting helpers
  const insertText = (textarea, textToInsert) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + textToInsert + after;
    
    const fieldName = textarea.name;
    setPost(prev => ({ ...prev, [fieldName]: newText }));
    setIsDirty(true);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      textarea.focus();
    }, 0);
  };

  const formatText = (format, isSwahili = false) => {
    const textareaId = isSwahili ? 'content_sw' : 'content';
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || (isSwahili ? 'maandishi makubwa' : 'bold text')}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || (isSwahili ? 'maandishi ya italiki' : 'italic text')}*`;
        break;
      case 'heading':
        formattedText = `\n## ${selectedText || (isSwahili ? 'Kichwa cha Habari' : 'Heading')}\n`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || (isSwahili ? 'Kipengee cha orodha' : 'List item')}\n`;
        break;
      case 'link':
        formattedText = `[${selectedText || (isSwahili ? 'Maandishi ya kiungo' : 'Link text')}](https://example.com)`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText || (isSwahili ? 'Maandishi ya nukuu' : 'Quote text')}\n`;
        break;
      default:
        return;
    }
    
    insertText(textarea, formattedText);
  };

  const insertSwahiliSample = () => {
    const textarea = document.getElementById('content_sw');
    if (textarea) {
      const sampleText = 'Habari za Tanzania ni muhimu sana katika kuboresha uelewa wa mambo ya kijamii na kisiasa. Tunapaswa kuwa na makala zenye ubora na zenye taarifa sahihi ili kuwasaidia wasomaji kupata maarifa bora.';
      insertText(textarea, sampleText);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!post.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!post.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!post.category_id) {
      newErrors.category_id = 'Please select a category';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSaving(true);
    setErrors({});

    try {
      // Handle image upload first if there's a new image file
      let featuredImagePath = typeof post.featured_image === 'string' ? post.featured_image : null;
      
      if (post.featured_image && typeof post.featured_image !== 'string') {
        // Upload the image file
        try {
          const imageResponse = await apiService.uploadImage(post.featured_image);
          if (imageResponse.success) {
            featuredImagePath = imageResponse.data.path; // Use the path, not the full URL
          } else {
            notify.error('Failed to upload image');
            setSaving(false);
            return;
          }
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          notify.error('Failed to upload image');
          setSaving(false);
          return;
        }
      }

      // Prepare data with proper types
      const postData = {
        title: post.title.trim(),
        title_sw: post.title_sw?.trim() || null,
        content: post.content.trim(),
        content_sw: post.content_sw?.trim() || null,
        excerpt: post.excerpt?.trim() || null,
        category_id: post.category_id ? parseInt(post.category_id) : null,
        featured_image: featuredImagePath,
        tags: Array.isArray(post.tags) ? post.tags.map(id => parseInt(id)) : [],
        is_published: Boolean(post.is_published),
        is_featured: Boolean(post.is_featured),
        meta_title: post.meta_title?.trim() || null,
        meta_description: post.meta_description?.trim() || null
      };

      console.log('Sending post data:', postData);

      let response;
      
      if (isEditing) {
        response = await apiService.updatePost(postId, postData);
      } else {
        response = await apiService.createPost(postData);
      }
      
      if (response.success) {
        notify.success(`Post ${isEditing ? 'updated' : 'created'} successfully!`);
        setIsDirty(false);
        navigate('/admin/posts');
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          notify.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} post`);
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      
      // Handle 422 validation errors
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
        notify.error('Please check the form for validation errors');
      } else {
        notify.error(`Failed to ${isEditing ? 'update' : 'create'} post: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const draftPost = { ...post, is_published: false };
    setPost(draftPost);
    
    // Trigger form submission with draft status
    setTimeout(() => {
      document.getElementById('post-form').requestSubmit();
    }, 100);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">
                {isEditing ? 'Edit Post' : 'Create New Post'}
              </h1>
              <p className="text-muted mb-0">
                {isEditing ? 'Update your blog post' : 'Create a new blog post for kindoTech'}
              </p>
              {autoSaving && (
                <span className="badge bg-info d-flex align-items-center mt-2">
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Auto-saving...
                </span>
              )}
              {lastSaved && !autoSaving && (
                <span className="badge bg-success mt-2">
                  <i className="fas fa-check me-1"></i>
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {isDirty && !autoSaving && (
                <span className="badge bg-warning text-dark mt-2">
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  Unsaved changes
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/posts')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Posts
            </button>
          </div>

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="alert alert-danger alert-dismissible fade show mb-4">
              <h6 className="alert-heading">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Please fix the following errors:
              </h6>
              <ul className="mb-0">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>
                    <strong>{field.replace('_', ' ')}:</strong> {Array.isArray(message) ? message[0] : message}
                  </li>
                ))}
              </ul>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setErrors({})}
              ></button>
            </div>
          )}

          <form id="post-form" onSubmit={handleSubmit}>
            <div className="row">
              {/* Main Content */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="card-title mb-0">
                      <i className="fas fa-edit me-2"></i>
                      Post Content
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Title */}
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label fw-semibold">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        value={post.title}
                        onChange={handleInputChange}
                        placeholder="Enter post title"
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                    </div>

                    {/* Title Swahili */}
                    <div className="mb-3">
                      <label htmlFor="title_sw" className="form-label">
                        Title (Swahili)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title_sw"
                        name="title_sw"
                        value={post.title_sw}
                        onChange={handleInputChange}
                        placeholder="Enter Swahili title"
                      />
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">
                        Content <span className="text-danger">*</span>
                        <span className="badge bg-light text-dark ms-2">
                          {wordCount} words • {readingTime} min read
                        </span>
                      </label>
                      
                      {/* Editor Toolbar */}
                      <div className="card mb-2">
                        <div className="card-body py-2">
                          <div className="btn-toolbar" role="toolbar">
                            <div className="btn-group me-2" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => formatText('bold')}
                                title="Bold"
                              >
                                <i className="fas fa-bold"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => formatText('italic')}
                                title="Italic"
                              >
                                <i className="fas fa-italic"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => formatText('heading')}
                                title="Heading"
                              >
                                <i className="fas fa-heading"></i>
                              </button>
                            </div>
                            <div className="btn-group me-2" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => formatText('list')}
                                title="List"
                              >
                                <i className="fas fa-list-ul"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => formatText('quote')}
                                title="Quote"
                              >
                                <i className="fas fa-quote-left"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => formatText('link')}
                                title="Link"
                              >
                                <i className="fas fa-link"></i>
                              </button>
                            </div>
                            <div className="btn-group" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => {
                                  const textarea = document.getElementById('content');
                                  const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
                                  insertText(textarea, text);
                                }}
                                title="Insert Sample Text"
                              >
                                <i className="fas fa-magic"></i> Sample
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <textarea
                        className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                        id="content"
                        name="content"
                        value={post.content}
                        onChange={handleInputChange}
                        rows="20"
                        placeholder="Write your post content here...

Tips:
• Use **bold** for emphasis
• Use *italic* for subtle emphasis
• Use ## for headings
• Use - for bullet points
• Use > for quotes"
                        style={{ 
                          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}
                      />
                      {errors.content && (
                        <div className="invalid-feedback">{errors.content}</div>
                      )}
                    </div>

                    {/* Content Swahili */}
                    <div className="mb-3">
                      <label htmlFor="content_sw" className="form-label">
                        <i className="fas fa-globe me-2"></i>
                        Content (Swahili)
                        <span className="badge bg-light text-dark ms-2">
                          {swahiliWordCount} words • {swahiliReadingTime} min read
                        </span>
                        <span className="badge bg-info text-white ms-2">
                          <i className="fas fa-language me-1"></i>KiSwahili
                        </span>
                      </label>
                      
                      {/* Swahili Editor Toolbar */}
                      <div className="card mb-2 border-info">
                        <div className="card-body py-2">
                          <div className="btn-toolbar" role="toolbar">
                            <div className="btn-group me-2" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => formatText('bold', true)}
                                title="Makubwa (Bold)"
                              >
                                <i className="fas fa-bold"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => formatText('italic', true)}
                                title="Italiki (Italic)"
                              >
                                <i className="fas fa-italic"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => formatText('heading', true)}
                                title="Kichwa cha Habari (Heading)"
                              >
                                <i className="fas fa-heading"></i>
                              </button>
                            </div>
                            <div className="btn-group me-2" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => formatText('list', true)}
                                title="Orodha (List)"
                              >
                                <i className="fas fa-list-ul"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => formatText('quote', true)}
                                title="Nukuu (Quote)"
                              >
                                <i className="fas fa-quote-left"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => formatText('link', true)}
                                title="Kiungo (Link)"
                              >
                                <i className="fas fa-link"></i>
                              </button>
                            </div>
                            <div className="btn-group" role="group">
                              <button
                                type="button"
                                className="btn btn-sm btn-info"
                                onClick={insertSwahiliSample}
                                title="Weka Mfano wa Maandishi"
                              >
                                <i className="fas fa-language me-1"></i> Mfano
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <textarea
                        className="form-control"
                        id="content_sw"
                        name="content_sw"
                        value={post.content_sw}
                        onChange={handleInputChange}
                        rows="15"
                        placeholder="Andika maudhui yako ya Kiswahili hapa...

Vidokezo:
• Tumia **makubwa** kwa msisitizo
• Tumia *italiki* kwa msisitizo wa hali ya chini
• Tumia ## kwa vichwa vya habari
• Tumia - kwa alama za nukta
• Tumia > kwa nukuu"
                        style={{ 
                          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          direction: 'ltr'
                        }}
                      />
                      <div className="form-text">
                        <i className="fas fa-info-circle me-1"></i>
                        Inasaidia muundo wa Markdown. Tumia kifaa cha juu kwa kuunda haraka.
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="mb-3">
                      <label htmlFor="excerpt" className="form-label">
                        Excerpt
                      </label>
                      <textarea
                        className="form-control"
                        id="excerpt"
                        name="excerpt"
                        value={post.excerpt}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Brief description of the post"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="card mt-4">
                  <div className="card-header">
                    <h5 className="mb-0">SEO Settings</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor="meta_title" className="form-label">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="meta_title"
                        name="meta_title"
                        value={post.meta_title}
                        onChange={handleInputChange}
                        placeholder="SEO title"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="meta_description" className="form-label">
                        Meta Description
                      </label>
                      <textarea
                        className="form-control"
                        id="meta_description"
                        name="meta_description"
                        value={post.meta_description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="SEO description"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4">
                {/* Publish Settings */}
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Publish Settings</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_published"
                          name="is_published"
                          checked={post.is_published}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="is_published">
                          Publish immediately
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_featured"
                          name="is_featured"
                          checked={post.is_featured}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="is_featured">
                          Feature this post
                        </label>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            {isEditing ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            {isEditing ? 'Update Post' : 'Create Post'}
                          </>
                        )}
                      </button>

                      {!post.is_published && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleSaveDraft}
                          disabled={saving}
                        >
                          Save as Draft
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">Category</h5>
                  </div>
                  <div className="card-body">
                    <select
                      className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                      name="category_id"
                      value={post.category_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.display_name || category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <div className="invalid-feedback">{errors.category_id}</div>
                    )}
                  </div>
                </div>

                {/* Featured Image */}
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">Featured Image</h5>
                  </div>
                  <div className="card-body">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="img-fluid rounded"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Statistics */}
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-bar me-2"></i>Content Stats
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* English Stats */}
                    <div className="mb-3">
                      <h6 className="text-primary mb-2">
                        <i className="fas fa-flag-usa me-1"></i> English Content
                      </h6>
                      <div className="row text-center">
                        <div className="col-6">
                          <div className="border-end">
                            <h6 className="text-primary mb-0">{wordCount}</h6>
                            <small className="text-muted">Words</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <h6 className="text-success mb-0">{readingTime}</h6>
                          <small className="text-muted">Min Read</small>
                        </div>
                      </div>
                    </div>
                    
                    {/* Swahili Stats */}
                    <div className="mb-3">
                      <h6 className="text-info mb-2">
                        <i className="fas fa-globe me-1"></i> Kiswahili Content
                      </h6>
                      <div className="row text-center">
                        <div className="col-6">
                          <div className="border-end">
                            <h6 className="text-info mb-0">{swahiliWordCount}</h6>
                            <small className="text-muted">Maneno</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <h6 className="text-success mb-0">{swahiliReadingTime}</h6>
                          <small className="text-muted">Dakika</small>
                        </div>
                      </div>
                    </div>
                    
                    <hr className="my-2" />
                    <div className="small text-muted">
                      <div className="d-flex justify-content-between">
                        <span>English Title:</span>
                        <span className={post.title.length > 10 ? 'text-success' : 'text-warning'}>
                          {post.title.length}/200
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Swahili Title:</span>
                        <span className={post.title_sw.length > 0 ? 'text-success' : 'text-muted'}>
                          {post.title_sw.length > 0 ? `${post.title_sw.length} chars` : 'Not added'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>English Content:</span>
                        <span className={wordCount > 100 ? 'text-success' : wordCount > 50 ? 'text-warning' : 'text-danger'}>
                          {wordCount} words
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Swahili Content:</span>
                        <span className={swahiliWordCount > 50 ? 'text-success' : swahiliWordCount > 20 ? 'text-warning' : 'text-muted'}>
                          {swahiliWordCount > 0 ? `${swahiliWordCount} maneno` : 'Haijawekwa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Writing Tips */}
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-lightbulb me-2"></i>Writing Tips / Vidokezo
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="small">
                      <div className="mb-2">
                        <i className={`fas fa-${post.title.length > 10 ? 'check text-success' : 'times text-danger'} me-2`}></i>
                        Write a compelling English title (10+ chars)
                      </div>
                      <div className="mb-2">
                        <i className={`fas fa-${post.title_sw.length > 5 ? 'check text-success' : 'times text-warning'} me-2`}></i>
                        Andika kichwa cha habari cha Kiswahili (5+ chars)
                      </div>
                      <div className="mb-2">
                        <i className={`fas fa-${wordCount > 100 ? 'check text-success' : 'times text-danger'} me-2`}></i>
                        Write substantial English content (100+ words)
                      </div>
                      <div className="mb-2">
                        <i className={`fas fa-${swahiliWordCount > 50 ? 'check text-success' : 'times text-warning'} me-2`}></i>
                        Andika maudhui ya kutosha ya Kiswahili (50+ maneno)
                      </div>
                      <div className="mb-2">
                        <i className={`fas fa-${post.excerpt ? 'check text-success' : 'times text-warning'} me-2`}></i>
                        Add an excerpt for better SEO
                      </div>
                      <div className="mb-2">
                        <i className={`fas fa-${post.category_id ? 'check text-success' : 'times text-warning'} me-2`}></i>
                        Select a relevant category / Chagua jamii husika
                      </div>
                      <div className="mb-2">
                        <i className={`fas fa-${imagePreview ? 'check text-success' : 'times text-warning'} me-2`}></i>
                        Add a featured image / Weka picha kuu
                      </div>
                      <div className="mb-0">
                        <i className={`fas fa-${post.is_featured ? 'check text-success' : 'times text-muted'} me-2`}></i>
                        Feature this post for homepage visibility
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;