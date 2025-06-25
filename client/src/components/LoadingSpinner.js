import React from 'react';
import '../styles/LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', text = 'Carregando DesenvolveAí...' }) {
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default LoadingSpinner; 