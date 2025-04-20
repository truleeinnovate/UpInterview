import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Slideshow from './Slideshow';

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

    // Validate inputs on submit (including empty fields)
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/Organization/Login`,
        {
          email: email.trim().toLowerCase(),
          password
        }
      );

      if (response.data.success) {
        const { userId, organizationId, token, isProfileCompleted, roleName, contactDataFromOrg } = response.data;

        if (userId) Cookies.set('userId', userId, { expires: 7 });
        if (organizationId) Cookies.set('organizationId', organizationId, { expires: 7 });
        if (token) Cookies.set('token', token, { expires: 7 });

        // Check profile status
        if (typeof isProfileCompleted === 'undefined') {
          navigate('/home');
        } else if (isProfileCompleted === true) {
          navigate('/home');
        } else if (isProfileCompleted === false && roleName) {
          navigate('/profile4', { state: { isProfileComplete: true, roleName, contactDataFromOrg } });
        } else {
          navigate('/home');
        }
      } else {
        setErrors((prev) => ({ ...prev, email: response.data.message || 'Login failed' }));
      }
    } catch (error) {
      if (error.response) {
        setErrors((prev) => ({
          ...prev,
          email: error.response.data.message || 'Login failed. Please try again.'
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email: 'An error occurred. Please check your connection.'
        }));
      }
    }
  };

  return (
    <>
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-1">
          {/* Left Column - Slideshow */}
          <div>
            <Slideshow />
          </div>
          {/* Right Column - Login Form */}
          <div className="flex text-sm flex-col sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]">
            <div className="mb-8 mt-5 flex justify-center">
              <button className="border border-gray-400 font-medium rounded-md px-10 py-2">
                User
              </button>
            </div>
            <div>
              <p className="text-2xl font-semibold mb-7 text-center">Welcome Back</p>
              <form onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="relative mb-4">
                  <input
                    type="email"
                    id="email"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
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
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
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
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
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
                <div className="flex flex-col items-center">
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
                </div>

                {/* Signup Link */}
                <div className="flex justify-center mt-4">
                  <p
                    className="text-sm text-custom-blue cursor-pointer"
                    onClick={() => navigate('/organization')}
                  >
                    If not registered | Sign Up
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