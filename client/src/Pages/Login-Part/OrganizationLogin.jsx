import React, { useState } from "react";
import { config } from '../../config.js';
import { useNavigate } from 'react-router-dom';
import { usePermify } from '@permify/react-role';
import axios from 'axios';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.png";
import Slideshow from './Slideshow';

const Admin = () => {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { can } = usePermify();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Validate inputs
      if (!Email || !password) {
        setErrorMessage('Email and password are required');
        return;
      }
  
      console.log('Attempting login with:', { Email, password });
  
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/Organization/login`,
        { 
          email: Email.trim(), // Send lowercase email
          password: password 
        }
      );
  
      console.log('Response:', response.data);
  
      if (response.data.success) {
        // // Store tokens/user data if needed
        // if (response.data.userId) {
        //   Cookies.set('userId', response.data.userId, { expires: 7 });
        // }
        // if (response.data.organizationId) {
        //   Cookies.set('organizationId', response.data.organizationId, { expires: 7 });
        // }
        
        console.log('Login successful. Navigating to home...');
        navigate('/home');
      } else {
        setErrorMessage(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <>
      <div>
        <div className="border-b p-4">
          <img src={logo} alt="Logo" className="w-20" />
        </div>
        <div className="grid grid-cols-2">
          {/* col 1 */}
          <div>
            <Slideshow />
          </div>
          {/* col 2 */}
          <div className="mt-5">
            <div className="flex justify-center gap-52 mb-8">
              <button className="border-2 border-gray-400 font-medium rounded-md px-10 py-2">User</button>
              {can && can('view') && (
                <button className="border-2 border-gray-400 font-medium rounded-md px-10 py-2">Admin</button>
              )}
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-2xl font-semibold mb-7 text-center">Welcome Back</p>
              {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
              <form onSubmit={handleLogin}>
                <div className="border border-gray-300 rounded-md mb-4">
                  <label className="block text-gray-600 ml-2">Email or Phone</label>
                  <input
                    type="text"
                    name="contact"
                    placeholder=""
                    className="w-full focus:outline-none rounded-md border-gray-300 px-2"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="border border-gray-300 rounded-md mb-4 relative">
                  <label className="block text-gray-600 ml-2">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    className="w-full focus:outline-none rounded-md border-gray-300 px-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={togglePasswordVisibility}
                    className="text-blue-500 absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="mb-5">
                  <p className="text-blue-500">Forgot Password ?</p>
                </div>
                <div className="flex flex-col items-center">
                  <button type="submit" className="bg-blue-500 text-white rounded-full px-16 py-2 mb-2">Login</button>
                  <button type="button" className="bg-gray-500 text-white rounded-full px-16 py-2" onClick={() => navigate('/organization')}>Cancel</button>
                </div>
                <div className="flex justify-center mt-4">
                  <div
                    className="text-sm text-blue-500 cursor-pointer"
                    onClick={() => navigate('/organization')}
                  >
                    If not registered | Sign Up
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;