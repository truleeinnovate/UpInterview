import React from 'react';

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading your data.", 
  onRetry, 
  retryText = "Try Again",
  icon = "⚠️",
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState; 