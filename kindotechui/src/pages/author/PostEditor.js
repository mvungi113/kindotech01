/**
 * Author Post Editor - Author-specific post creation and editing
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { notify } from '../../utils/notifications';

const AuthorPostEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEditing = !!postId;

  const [formData, setFormData] = useState({
    title: '',
    title_sw: '',
    content: '',
    content_sw: '',
    excerpt: '',
    category_id: '',
    is_published: false,
    is_featured: false,
    featured_image: null,
    meta_title: '',
    meta_description: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditing);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [swahiliWordCount, setSwahiliWordCount] = useState(0);
  const [swahiliReadingTime, setSwahiliReadingTime] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadPost();
    }
  }, [isEditing, postId]);

  // Auto-save draft every 30 seconds if content exists
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isEditing && isDirty && formData.title && formData.content && formData.title.length > 3) {
      const autoSaveTimer = setTimeout(() => {
        autoSaveDraft();
      }, 30000);
      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData.title, formData.content, isDirty, isEditing]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 words per minute
    
    const swahiliWords = formData.content_sw.trim().split(/\s+/).filter(word => word.length > 0).length;
    setSwahiliWordCount(swahiliWords);
    setSwahiliReadingTime(Math.ceil(swahiliWords / 200));
  }, [formData.content, formData.content_sw]);

  const autoSaveDraft = async () => {
    if (!formData.title || formData.title.length < 3) return;
    
    setAutoSaving(true);
    try {
      const draftData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_published: false
      };
      
      if (formData.excerpt) draftData.excerpt = formData.excerpt.trim();
      if (formData.category_id) draftData.category_id = parseInt(formData.category_id);
      
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

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      notify.error('Failed to load categories');
    }
  };

  const loadPost = async () => {
    try {
      setLoadingPost(true);
      const response = await apiService.getPostForEdit(postId);
      if (response?.success) {
        const post = response.data;
        
        // Check if user owns this post
        if (post.user_id !== user.id && user.role !== 'admin') {
          notify.error('You can only edit your own posts');
          navigate('/author/posts');
          return;
        }

        setFormData({
          title: post.title || '',
          title_sw: post.title_sw || '',
          content: post.content || '',
          content_sw: post.content_sw || '',
          excerpt: post.excerpt || '',
          category_id: post.category_id || '',
          is_published: post.is_published || false,
          is_featured: post.is_featured || false,
          featured_image: null,
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || ''
        });
        
        if (post.featured_image) {
          const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://keysblog-464d939b8203.herokuapp.com/api/v1';
          const imageBaseUrl = apiBaseUrl.replace('/api/v1', '');
          setImagePreview(`${imageBaseUrl}/${post.featured_image}`);
        }
      } else {
        notify.error('Post not found');
        navigate('/author/posts');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      notify.error('Failed to load post');
      navigate('/author/posts');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsDirty(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featured_image: file }));
      setIsDirty(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
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
    setFormData(prev => ({ ...prev, [fieldName]: newText }));
    setIsDirty(true);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      textarea.focus();
    }, 0);
  };

  const formatText = (format, isSwahili = false) => {
    const textareaId = isSwahili ? 'content_sw' : 'content';
    const textarea = document.getElementById(textareaId);
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
    const sampleText = 'Habari za Tanzania ni muhimu sana katika kuboresha uelewa wa mambo ya kijamii na kisiasa. Tunapaswa kuwa na makala zenye ubora na zenye taarifa sahihi ili kuwasaidia wasomaji kupata maarifa bora.';
    insertText(textarea, sampleText);
  };

  // generateSlug helper removed (unused)

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title || formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    if (formData.title && formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }
    if (!formData.content || formData.content.length < 10) {
      errors.content = 'Content must be at least 10 characters long';
    }
    if (formData.excerpt && formData.excerpt.length > 300) {
      errors.excerpt = 'Excerpt must be less than 300 characters';
    }
    if (formData.meta_title && formData.meta_title.length > 60) {
      errors.meta_title = 'Meta title should be less than 60 characters for SEO';
    }
    if (formData.meta_description && formData.meta_description.length > 160) {
      errors.meta_description = 'Meta description should be less than 160 characters for SEO';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // isValidUrl helper removed (unused)

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      // Handle image upload first if there's a new image file
      let featuredImagePath = typeof formData.featured_image === 'string' ? formData.featured_image : null;
      
      if (formData.featured_image && typeof formData.featured_image === 'object') {
        // Upload the image file
        try {
          const imageResponse = await apiService.uploadImage(formData.featured_image);
          if (imageResponse.success) {
            featuredImagePath = imageResponse.data.path; // Use the path, not the full URL
          } else {
            notify.error('Failed to upload image');
            setLoading(false);
            return;
          }
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          notify.error('Failed to upload image');
          setLoading(false);
          return;
        }
      }

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_published: formData.is_published || false,
        is_featured: formData.is_featured || false,
        featured_image: featuredImagePath
      };

      // Add optional fields only if they have values
      if (formData.title_sw && formData.title_sw.trim()) {
        postData.title_sw = formData.title_sw.trim();
      }
      
      if (formData.content_sw && formData.content_sw.trim()) {
        postData.content_sw = formData.content_sw.trim();
      }
      
      if (formData.excerpt && formData.excerpt.trim()) {
        postData.excerpt = formData.excerpt.trim();
      }
      
      if (formData.category_id) {
        postData.category_id = parseInt(formData.category_id);
      }
      
      if (formData.meta_title && formData.meta_title.trim()) {
        postData.meta_title = formData.meta_title.trim();
      }
      
      if (formData.meta_description && formData.meta_description.trim()) {
        postData.meta_description = formData.meta_description.trim();
      }

      console.log('Sending post data:', postData);

      let response;
      if (isEditing) {
        response = await apiService.updatePost(postId, postData);
      } else {
        response = await apiService.createPost(postData);
      }

      console.log('API Response received:', response);
      console.log('Response success flag:', response?.success);
      console.log('Response data:', response?.data);

      if (response?.success) {
        console.log('Success! Navigating to /author/posts');
        notify.success(`Post ${isEditing ? 'updated' : 'created'} successfully`);
        navigate('/author/posts');
      } else {
        console.log('Failed! Response:', response);
        notify.error(response?.message || `Failed to ${isEditing ? 'update' : 'create'} post`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {};
        const errorMessages = [];
        
        Object.keys(backendErrors).forEach(field => {
          if (Array.isArray(backendErrors[field])) {
            errorMessages.push(`${field}: ${backendErrors[field].join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${backendErrors[field]}`);
          }
        });
        
        setValidationErrors(backendErrors);
        notify.error('Validation errors: ' + errorMessages.join('; '));
        console.log('Backend validation errors:', backendErrors);
      } else if (error.response?.status === 500) {
        notify.error('Server error. Please try again later.');
        console.log('Server error details:', error.response.data);
      } else {
        notify.error(`Failed to ${isEditing ? 'update' : 'create'} post`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading post...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-1">
            <i className="fas fa-edit me-2"></i>
            {isEditing ? 'Edit Post' : 'Write New Post'}
          </h1>
          <div className="d-flex align-items-center gap-3">
            <p className="text-muted mb-0">
              {isEditing ? 'Update your existing post' : 'Share your story with the world'}
            </p>
            {autoSaving && (
              <span className="badge bg-info d-flex align-items-center">
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Auto-saving...
              </span>
            )}
            {lastSaved && !autoSaving && (
              <span className="badge bg-success">
                <i className="fas fa-check me-1"></i>
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {isDirty && !autoSaving && (
              <span className="badge bg-warning text-dark">
                <i className="fas fa-exclamation-triangle me-1"></i>
                Unsaved changes
              </span>
            )}
          </div>
        </div>
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/author/posts')}
          >
            <i className="fas fa-arrow-left me-2"></i>Back to Posts
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                    <span className="badge bg-light text-dark ms-2">
                      {formData.title.length}/200
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter post title"
                    maxLength="200"
                  />
                  {validationErrors.title && (
                    <div className="invalid-feedback">{validationErrors.title}</div>
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
                    value={formData.title_sw}
                    onChange={handleChange}
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
                    className={`form-control ${validationErrors.content ? 'is-invalid' : ''}`}
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="20"
                    placeholder="Write your post content here...\n\nTips:\n• Use **bold** for emphasis\n• Use *italic* for subtle emphasis\n• Use ## for headings\n• Use - for bullet points\n• Use > for quotes"
                    style={{ 
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '14px',
                      lineHeight: '1.6'
                    }}
                  />
                  {validationErrors.content && (
                    <div className="invalid-feedback">{validationErrors.content}</div>
                  )}
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    Supports Markdown formatting. Use the toolbar above for quick formatting.
                  </div>
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
                    value={formData.content_sw}
                    onChange={handleChange}
                    rows="15"
                    placeholder="Andika maudhui yako ya Kiswahili hapa...\n\nVidokezo:\n• Tumia **makubwa** kwa msisitizo\n• Tumia *italiki* kwa msisitizo wa hali ya chini\n• Tumia ## kwa vichwa vya habari\n• Tumia - kwa alama za nukta\n• Tumia > kwa nukuu"
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
                    <span className="badge bg-light text-dark ms-2">
                      {formData.excerpt.length}/300
                    </span>
                  </label>
                  <textarea
                    className={`form-control ${validationErrors.excerpt ? 'is-invalid' : ''}`}
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brief description of the post"
                    maxLength="300"
                  />
                  {validationErrors.excerpt && (
                    <div className="invalid-feedback">{validationErrors.excerpt}</div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-search me-2"></i>SEO Settings
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="meta_title" className="form-label">
                    Meta Title
                    <span className="badge bg-light text-dark ms-2">
                      {formData.meta_title.length}/60
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.meta_title ? 'is-invalid' : ''}`}
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    placeholder="SEO title"
                    maxLength="60"
                  />
                  {validationErrors.meta_title && (
                    <div className="invalid-feedback">{validationErrors.meta_title}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="meta_description" className="form-label">
                    Meta Description
                    <span className="badge bg-light text-dark ms-2">
                      {formData.meta_description.length}/160
                    </span>
                  </label>
                  <textarea
                    className={`form-control ${validationErrors.meta_description ? 'is-invalid' : ''}`}
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="SEO description"
                    maxLength="160"
                  />
                  {validationErrors.meta_description && (
                    <div className="invalid-feedback">{validationErrors.meta_description}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Publish Settings */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-cog me-2"></i>Publish Settings
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_published"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleChange}
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
                      checked={formData.is_featured}
                      onChange={handleChange}
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {isEditing ? 'Update Post' : 'Create Post'}
                      </>
                    )}
                  </button>

                  {!formData.is_published && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      <i className="fas fa-file-alt me-2"></i>
                      Save as Draft
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-tag me-2"></i>Category
                </h5>
              </div>
              <div className="card-body">
                <select
                  className="form-select"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.display_name || category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Featured Image */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-image me-2"></i>Featured Image
                </h5>
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
                    <span className={formData.title.length > 10 ? 'text-success' : 'text-warning'}>
                      {formData.title.length}/200
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Swahili Title:</span>
                    <span className={formData.title_sw.length > 0 ? 'text-success' : 'text-muted'}>
                      {formData.title_sw.length > 0 ? `${formData.title_sw.length} chars` : 'Not added'}
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
                    <i className={`fas fa-${formData.title.length > 10 ? 'check text-success' : 'times text-danger'} me-2`}></i>
                    Write a compelling English title (10+ chars)
                  </div>
                  <div className="mb-2">
                    <i className={`fas fa-${formData.title_sw.length > 5 ? 'check text-success' : 'times text-warning'} me-2`}></i>
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
                    <i className={`fas fa-${formData.excerpt ? 'check text-success' : 'times text-warning'} me-2`}></i>
                    Add an excerpt for better SEO
                  </div>
                  <div className="mb-2">
                    <i className={`fas fa-${formData.category_id ? 'check text-success' : 'times text-warning'} me-2`}></i>
                    Select a relevant category / Chagua jamii husika
                  </div>
                  <div className="mb-0">
                    <i className={`fas fa-${imagePreview ? 'check text-success' : 'times text-warning'} me-2`}></i>
                    Add a featured image / Weka picha kuu
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AuthorPostEditor;