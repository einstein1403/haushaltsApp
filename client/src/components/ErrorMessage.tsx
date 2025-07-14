import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  retryText = 'Try Again'
}) => {
  return (
    <div className="error-container">
      <div className="error-message">
        <div className="error-icon">⚠️</div>
        <h3>{title}</h3>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;