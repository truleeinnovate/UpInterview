import React from 'react';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-blue"></div>
        <p className="text-center text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
