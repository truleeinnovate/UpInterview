import React from "react";
const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="absolute inset-0 top-0 left-0 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-blue"></div>
        <p className="text-center text-gray-600 text-sm font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loader;
