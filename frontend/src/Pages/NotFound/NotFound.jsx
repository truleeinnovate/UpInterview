import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
      <h1 className="text-9xl font-bold text-custom-blue">404</h1>
      <h2 className="text-3xl font-semibold mt-4 text-gray-800">
        Page Not Found
      </h2>
      <p className="text-gray-600 mt-2 max-w-md">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={handleBackHome}
        className="mt-6 px-6 py-3 bg-custom-blue text-white rounded-md hover:opacity-90 transition-all shadow-lg font-medium"
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
