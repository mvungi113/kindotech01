/**
 * API service for Tanzania Blog - Handles all HTTP requests to Laravel backend
 * Uses Axios for HTTP requests with interceptors for authentication
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.client.post('/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  }

  async testAuth() {
    const response = await this.client.get('/auth-test');
    return response.data;
  }

  async register(userData) {
    // Registration disabled - handled by administrators only
    return { 
      success: false, 
      message: 'User registration is disabled. Please contact an administrator for account access.' 
    };
  }

  async logout() {
    const response = await this.client.post('/logout');
    localStorage.removeItem('auth_token');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/user');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await this.client.put('/user/profile', profileData);
    return response.data;
  }

  async forgotPassword(email) {
    const response = await this.client.post('/forgot-password', { email });
    return response.data;
  }

  async resetPassword(data) {
    const response = await this.client.post('/reset-password', data);
    return response.data;
  }

  async changePassword(data) {
    const response = await this.client.post('/user/change-password', data);
    return response.data;
  }

  // Post endpoints
  async getPosts(params = {}) {
    // Add admin parameter if user is authenticated and is admin
    const token = localStorage.getItem('auth_token');
    if (token && !params.user_id) {
      // For admin post management, add admin flag
      if (window.location.pathname.includes('/admin/posts')) {
        params.admin = true;
      }
    }
    
    const response = await this.client.get('/posts', { params });
    return response.data;
  }

  async getPost(slug) {
    const response = await this.client.get(`/posts/${slug}`);
    return response.data;
  }

  async getPostForEdit(postId) {
    const response = await this.client.get(`/posts/${postId}/edit`);
    return response.data;
  }

  async getFeaturedPosts() {
    const response = await this.client.get('/posts/featured');
    return response.data;
  }

  async getRecentPosts() {
    const response = await this.client.get('/posts/recent');
    return response.data;
  }

  async searchPosts(query) {
    const response = await this.client.get('/posts/search', { params: { q: query } });
    return response.data;
  }

  async uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await this.client.post('/posts/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async createPost(postData) {
    const response = await this.client.post('/posts', postData);
    return response.data;
  }

  async updatePost(postId, postData) {
    const response = await this.client.put(`/posts/${postId}`, postData);
    return response.data;
  }

  async publishPost(postId) {
    const response = await this.client.post(`/posts/${postId}/publish`);
    return response.data;
  }

  async unpublishPost(postId) {
    const response = await this.client.post(`/posts/${postId}/unpublish`);
    return response.data;
  }

  async deletePost(postId) {
    const response = await this.client.delete(`/posts/${postId}`);
    return response.data;
  }

  // Category endpoints
  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async getCategory(id) {
    const response = await this.client.get(`/categories/${id}`);
    return response.data;
  }

  async createCategory(categoryData) {
    const response = await this.client.post('/categories', categoryData);
    return response.data;
  }

  async updateCategory(id, categoryData) {
    const response = await this.client.put(`/categories/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id) {
    const response = await this.client.delete(`/categories/${id}`);
    return response.data;
  }

  async getCategoryPosts(slug) {
    const response = await this.client.get(`/categories/${slug}/posts`);
    return response.data;
  }

  // Comment endpoints
  async getPostComments(postId) {
    const response = await this.client.get(`/posts/${postId}/comments`);
    return response.data;
  }

  async createComment(postId, commentData) {
    const response = await this.client.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  }

  async likeComment(commentId) {
    const response = await this.client.post(`/comments/${commentId}/like`);
    return response.data;
  }

  // Admin endpoints
  async getDashboardStats() {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivity() {
    const response = await this.client.get('/dashboard/recent-activity');
    return response.data;
  }

  async getMonthlyStats() {
    const response = await this.client.get('/dashboard/monthly-stats');
    return response.data;
  }

  async approveComment(commentId) {
    const response = await this.client.post(`/comments/${commentId}/approve`);
    return response.data;
  }

  async deleteComment(commentId) {
    const response = await this.client.delete(`/comments/${commentId}`);
    return response.data;
  }

  // User management endpoints (Admin only)
  async getUsers(params = {}) {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await this.client.put(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId) {
    const response = await this.client.delete(`/users/${userId}`);
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get('/users/stats');
    return response.data;
  }

  // Comment management endpoints
  async getComments(params = {}) {
    const response = await this.client.get('/comments/moderation', { params });
    return response.data;
  }

  // Newsletter endpoints
  async subscribeToNewsletter(email, source = 'website') {
    const response = await this.client.post('/newsletter/subscribe', { email, source });
    return response.data;
  }

  async unsubscribeFromNewsletter(email) {
    const response = await this.client.post('/newsletter/unsubscribe', { email });
    return response.data;
  }

  // Newsletter management endpoints (Admin only)
  async getNewsletterSubscribers(params = {}) {
    const response = await this.client.get('/newsletter/subscribers', { params });
    return response.data;
  }

  async getNewsletterStats() {
    const response = await this.client.get('/newsletter/stats');
    return response.data;
  }
}

export const apiService = new ApiService();