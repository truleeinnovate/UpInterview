import React from 'react';

const EmptyState = ({ 
  title = "No data found", 
  message = "There's nothing to display at the moment.", 
  actionText,
  onAction,
  icon = "📋",
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="text-center">
        <div className="text-gray-400 text-6xl mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState; 