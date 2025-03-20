import React from 'react';
import { useNavigate } from 'react-router-dom';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-gray-800">Welcome!</h1>
        <p className="text-gray-600 text-lg mb-6">Join us today and explore amazing features</p>
        <button
          onClick={() => navigate('/signup')}
          className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;