import React from 'react';
import { useNavigate } from 'react-router-dom';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome!</h1>
        <p className="text-gray-600 mb-6">Join us today and explore amazing features</p>
        <button
          onClick={() => navigate('/signup')}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;