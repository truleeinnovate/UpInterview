import React from 'react';

const PermissionLoadingState = ({ message = "Loading permissions..." }) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default PermissionLoadingState; 