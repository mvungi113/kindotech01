/**
 * Main entry point with Bootstrap JavaScript initialization
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Bootstrap JavaScript
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Global CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/TanzaniaTheme.css';

// Initialize Bootstrap components
const initializeBootstrap = () => {
  // Tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Popovers
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  );
  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize Bootstrap after render
setTimeout(initializeBootstrap, 100);