import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Slideshow from './Slideshow';
import { setAuthCookies } from '../../utils/AuthCookieManager/AuthCookieManager.jsx';

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const handleBlur = (field, value) => {
    // Only validate if the field has a value
    if (field === 'email' && value) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'password' && value) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/Organization/Login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.success) {
        const { token, isProfileCompleted, roleName, contactDataFromOrg } = response.data;

        // Store JWT in cookies
        setAuthCookies(token);

        if (typeof isProfileCompleted === 'undefined') {
          navigate('/home');
        } else if (isProfileCompleted === true) {
          navigate('/home');
        } else if (isProfileCompleted === false && roleName) {
          navigate('/complete-profile', {
            state: { isProfileComplete: true, roleName, contactDataFromOrg },
          });
        } else {
          navigate('/home');
        }
      } else {
        setErrors((prev) => ({ ...prev, email: response.data.message || 'Login failed' }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.response?.data.message || 'Login failed. Please try again.',
      }));
    }
  };

  return (
    <>
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-1 items-center">
          {/* Left Column - Slideshow */}
          <div>
            <Slideshow />
          </div>
          {/* Right Column - Login Form */}
          <div className="flex text-sm flex-col sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]">
            {/* <div className="mb-8 flex justify-center">
              <button className="border border-gray-400 font-medium rounded-md px-10 py-2">
                User
              </button>
            </div> */}
            <div>
              <p className="text-2xl font-semibold mb-7 text-center">Welcome Back</p>
              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="relative mb-4">
                  <input
                    type="email"
                    id="email"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'
                      } appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    autoComplete="email"
                  />
                  <label
                    htmlFor="email"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                  >
                    Work Email
                  </label>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'
                      } appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    autoComplete="current-password"
                  />
                  <label
                    htmlFor="password"
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Forgot Password */}
                <div className="mb-5">
                  <p
                    className="text-custom-blue cursor-pointer text-xs"
                    onClick={() => navigate('/forgetPassword')}
                  >
                    Forgot Password?
                  </p>
                </div>

                {/* Login & Cancel Buttons */}
                {/* <div className="flex flex-col items-center">
                  <button
                    type="submit"
                    className="bg-custom-blue text-white rounded-full px-16 py-2 mb-2"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="bg-white text-custom-blue rounded-full px-16 py-2 border border-gray-400"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                </div> */}
                <div className="flex flex-col space-y-2">
                  <button
                    type="submit"
                    className="w-full text-sm bg-custom-blue text-white rounded px-3 py-[10px] transition-colors duration-300"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full text-sm bg-white text-custom-blue border border-gray-400 rounded px-3 py-[10px] transition-colors duration-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>


                {/* Signup Link */}
                <div className="flex justify-center mt-4">
                  <p className="text-sm mb-4">
                    If not registered | <span className="cursor-pointer text-custom-blue underline" onClick={() => navigate('/organization-signup')}>Sign Up</span>
                  </p>
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