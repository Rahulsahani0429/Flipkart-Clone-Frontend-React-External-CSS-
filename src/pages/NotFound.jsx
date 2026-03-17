import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '70vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '6rem', margin: 0, color: 'var(--primary)' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{ 
        padding: '0.8rem 2rem', 
        backgroundColor: 'var(--primary)', 
        color: 'white', 
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: '600'
      }}>
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
