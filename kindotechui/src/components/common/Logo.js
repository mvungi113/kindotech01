/**
 * KindoTech Logo component
 * Uses the actual KindoTech logo image
 */
import React, { useState } from 'react';

const Logo = ({ 
  size = 'medium', 
  className = '',
  onClick = null,
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);

  // Logo size configurations
  const sizes = {
    small: { height: '40px', width: 'auto' },
    medium: { height: '50px', width: 'auto' },
    large: { height: '80px', width: 'auto' },
    xlarge: { height: '120px', width: 'auto' },
    navbar: { height: '45px', width: 'auto' },
    custom: style
  };

  const logoStyle = size === 'custom' ? style : sizes[size];

  // Simple text fallback if image fails
  if (imageError) {
    return (
      <div 
        className={`logo-fallback ${className}`}
        style={{
          ...logoStyle,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          fontSize: '20px',
          color: '#E53E3E',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          ...style
        }}
        onClick={onClick}
      >
        <span style={{ color: '#E53E3E' }}>Kindo</span>
        <span style={{ color: '#3182CE' }}>Tech</span>
      </div>
    );
  }

  return (
    <img
      src="/images/kindotech.png"
      alt="KindoTech Logo"
      className={`logo-image ${className}`}
      style={{
        ...logoStyle,
        cursor: onClick ? 'pointer' : 'default',
        objectFit: 'contain',
        ...style
      }}
      onClick={onClick}
      onError={(e) => {
        console.log('Logo failed to load from:', e.target.src);
        setImageError(true);
      }}
    />
  );
};

export default Logo;