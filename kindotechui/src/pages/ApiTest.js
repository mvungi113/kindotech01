/**
 * Simple API test page to debug authentication and API calls
 */
import React, { useState } from 'react';
import { apiService } from '../services/api';

const ApiTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      data: success ? data : null,
      error: error?.message || error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testLogin = async () => {
    try {
      setLoading(true);
      const result = await apiService.login({
        email: 'admin@example.com',
        password: 'password'
      });
      addResult('Login Test', true, result);
      console.log('Login result:', result);
    } catch (error) {
      addResult('Login Test', false, null, error);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDashboardStats = async () => {
    try {
      setLoading(true);
      const result = await apiService.getDashboardStats();
      addResult('Dashboard Stats', true, result);
      console.log('Dashboard stats:', result);
    } catch (error) {
      addResult('Dashboard Stats', false, null, error);
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testTokenInfo = () => {
    const token = localStorage.getItem('auth_token');
    addResult('Token Check', !!token, { 
      hasToken: !!token, 
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 20) + '...' || 'No token'
    });
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1>API Testing Panel</h1>
          <p className="text-muted">Test API endpoints and authentication</p>

          <div className="mb-4">
            <button 
              className="btn btn-primary me-2" 
              onClick={testLogin}
              disabled={loading}
            >
              Test Login
            </button>
            <button 
              className="btn btn-secondary me-2" 
              onClick={testTokenInfo}
            >
              Check Token
            </button>
            <button 
              className="btn btn-info me-2" 
              onClick={testDashboardStats}
              disabled={loading}
            >
              Test Dashboard Stats
            </button>
            <button 
              className="btn btn-warning" 
              onClick={clearResults}
            >
              Clear Results
            </button>
          </div>

          {results.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5>Test Results</h5>
              </div>
              <div className="card-body">
                {results.map((result, index) => (
                  <div key={index} className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                    <div className="d-flex justify-content-between">
                      <strong>{result.test}</strong>
                      <small>{result.timestamp}</small>
                    </div>
                    {result.success ? (
                      <pre className="mt-2 mb-0">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-danger mt-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTest;