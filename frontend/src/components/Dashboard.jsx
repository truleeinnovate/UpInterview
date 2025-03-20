import React from 'react';
import { useLocation } from 'react-router-dom';

function Dashboard() {
  const location = useLocation();
  const name = location.state?.name || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center transform hover:scale-105 transition duration-300">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Welcome, {name}!</h1>
        <p className="text-gray-600 text-lg">Enjoy your personalized dashboard</p>
      </div>
    </div>
  );
}

export default Dashboard;