import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  console.log('process.env.REACT_APP_API_URL frontend api link:', process.env.REACT_APP_API_URL)

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data being sent:', formData);
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, formData);
      if (response.data.success) {
        navigate('/dashboard', { state: { name: formData.name } });
      }
    } catch (error) {
      if (error.response) {
        console.error('Signup error:', error.response.data.message);
        alert(error.response.data.message);
      } else {
        console.error('Signup error:', error);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-96">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;