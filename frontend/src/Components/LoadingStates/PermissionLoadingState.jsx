import React from 'react';
import Loading from '../Loading';

const PermissionLoadingState = ({ message = "Loading permissions...", showSpinner = true }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
      {showSpinner && (
        <div className="mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
        </div>
      )}
      <div className="text-center">
        <p className="text-gray-600 text-sm font-medium">{message}</p>
        <p className="text-gray-400 text-xs mt-1">This may take a few seconds...</p>
      </div>
    </div>
  );
};

export default PermissionLoadingState; 