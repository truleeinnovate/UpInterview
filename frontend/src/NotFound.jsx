import React from 'react';

function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mt-4">Subdomain not found</p>
        <p className="text-gray-500 mt-2">
          The subdomain you are trying to access does not exist.
        </p>
        <a
          href="https://app.upinterview.io"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}

export default NotFound;