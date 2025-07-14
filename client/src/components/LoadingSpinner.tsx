import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;