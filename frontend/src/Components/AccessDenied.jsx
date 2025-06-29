// src/Components/AccessDenied.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigateTo = useNavigate();

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page.</p>
      <button onClick={() => navigateTo('/home')}>Go to Home</button>
    </div>
  );
};

export default AccessDenied;