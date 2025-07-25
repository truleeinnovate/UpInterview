// v1.0.0 - mansoor - removed unnecessary comments
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Slideshow from './Slideshow';
// <------------------- v1.0.0
import { setAuthCookies, clearAllAuth } from '../../utils/AuthCookieManager/AuthCookieManager';
// v1.0.0 ---------------------->
import { config } from "../../config";
import { validateWorkEmail } from '../../utils/workEmailValidation.js';
import toast from "react-hot-toast";
import { usePermissions } from '../../Context/PermissionsContext';

const OrganizationLogin = () => {
  const { refreshPermissions } = usePermissions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle verification success
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const verified = query.get('verified');
    if (verified === 'true') {
      toast.success('Email verified successfully!');
      navigate('/organization-login');
      window.location.reload();
    }
  }, [location, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return '';
  };

  const validateLogin = () => {
    const emailError = validateWorkEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    return !emailError && !passwordError;
  };

  const handleBlur = (field, value) => {
    if (field === 'email' && value) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'password' && value) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };


  const handleResendVerification = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/emails/resend-verification`, { email });
      if (response.data.success) {
        toast.success('Verification email resent!');
        setCountdown(60);
      } else {
        toast.error(response.data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const [countdown, setCountdown] = useState(0);

  // Countdown timer logic
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   if (!validateLogin()) return;

  //   setIsLoading(true);

  //   try {
  //     const response = await axios.post(`${config.REACT_APP_API_URL}/Organization/Login`, {
  //       email: email.trim().toLowerCase(),
  //       password,
  //     });

  //     const {
  //       token,
  //       isEmailVerified,
  //       status,
  //       isProfileCompleted,
  //       roleName,
  //       contactEmailFromOrg,
  //       roleType,//only check for super admin comes here
  //     } = response.data;

  //     setAuthCookies(token);

  //     if (!isEmailVerified) {
  //       setIsEmailVerified(false);
  //       await handleResendVerification();
  //       setCountdown(60);
  //       return;
  //     }

  //     // Check if user is internal based on roleType
  //     if (roleType === 'internal') {
  //       navigate('/admin-dashboard');
  //       return;
  //     }

  //     // Handle successful login cases
  //     switch (status) {
  //       case 'submitted':
  //       case 'payment_pending':
  //         navigate('/subscription-plans');
  //         break;
  //       case 'active':
  //         if (isProfileCompleted === false && roleName) {
  //           navigate('/complete-profile', {
  //             state: { isProfileCompleteStateOrg: true, roleName, contactEmailFromOrg }
  //           });
  //         } else {
  //           navigate('/home');
  //         }
  //         break;
  //       default:
  //         navigate('/');
  //     }

  //   } catch (error) {
  //     setIsLoading(false);

  //     // Clear previous errors
  //     setErrors({ email: '', password: '' });

  //     if (error.response) {
  //       const { status, data } = error.response;

  //       if (status === 400) {
  //         // Use backend-provided field errors if available
  //         if (data.fields) {
  //           setErrors(data.fields);
  //         }
  //         // Fallback for generic invalid credentials message
  //         else if (data.message === 'Invalid email or password') {
  //           setErrors({
  //             email: 'Invalid credentials',
  //             password: 'Invalid credentials'
  //           });
  //         }
  //       }
  //       else if (status === 403) {
  //         if (data.isEmailVerified === false) {
  //           setIsEmailVerified(false);
  //           await handleResendVerification();
  //           setCountdown(60);
  //         } else {
  //           toast.error(data.message || 'Access denied');
  //         }
  //       }
  //       else if (status >= 500) {
  //         toast.error('Login failed. Please try again later.');
  //       }
  //     } else {
  //       toast.error('Network error. Please check your connection.');
  //     }
  //   }
  // };



  // <------------------- v1.0.0 - removed consoles in this total function
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    const loginStartTime = new Date().toISOString();

    try {
      // Step 1: Clear all existing cookies
      await clearAllAuth();

      // Step 2: Authenticate user with email and password
      const loginURL = `${config.REACT_APP_API_URL}/Organization/Login`;
      const response = await axios.post(
        loginURL,
        {
          email: email.trim().toLowerCase(),
          password,
        },
        { withCredentials: true }
      );

      const {
        authToken,
        impersonationToken,
        impersonatedUserId,
        ownerId,
        tenantId,
        isEmailVerified,
        status,
        isProfileCompleted,
        roleName,
        contactEmailFromOrg,
        roleType,
        subdomain,
        fullDomain,
        subdomainStatus,
      } = response.data;

      // Step 3: Handle internal users (admin dashboard)
      if (roleType === 'internal') {
        setAuthCookies({ impersonationToken, impersonatedUserId });
        await refreshPermissions();
        navigate('/admin-dashboard');
        return;
      }

      // Step 4: Set authentication cookies for regular users
      const setCookiesResult = await setAuthCookies({ 
        authToken, 
        userId: ownerId, 
        tenantId, 
        organization: true 
      });

      // Step 5: Handle email verification
      if (!isEmailVerified) {
        setIsEmailVerified(false);
        await handleResendVerification();
        setCountdown(60);
        return;
      }

      // Step 6: Check subdomain and handle subdomain routing
      if (subdomain && subdomainStatus === 'active') {
        const currentDomain = window.location.hostname;
        const targetDomain = `${subdomain}.app.upinterview.io`;

        // Check if we need to redirect to subdomain
        if (!currentDomain.includes(subdomain)) {
          const protocol = window.location.protocol;

          // Determine the target path based on user status
          let targetPath = '/';
          if (status === 'active' && isProfileCompleted !== false) {
            targetPath = '/home';
          } else if (status === 'submitted' || status === 'payment_pending') {
            targetPath = '/subscription-plans';
          } else if (isProfileCompleted === false && roleName) {
            targetPath = '/complete-profile';
          }

          const targetUrl = `${protocol}//${targetDomain}${targetPath}`;

          // Wait for data to be loaded in the home page
          await new Promise(resolve => setTimeout(resolve, 4000));
          window.location.href = targetUrl;
          return;
        }
      }

      // Step 7: Refresh permissions for non-subdomain cases
      await refreshPermissions();

      // Step 8: Handle navigation based on user status (immediate navigation)
      switch (status) {
        case 'submitted':
        case 'payment_pending':
          navigate('/subscription-plans');
          break;

        case 'active':
          if (isProfileCompleted === false && roleName) {
            navigate('/complete-profile', {
              state: { isProfileCompleteStateOrg: true, roleName, contactEmailFromOrg },
            });
          } else {
            // Wait for data to be ready before navigating to home
            await new Promise(resolve => setTimeout(resolve, 4000));
            navigate('/home');
          }
          break;

        default:
          navigate('/');
      }

    } catch (error) {
      setIsLoading(false);
      setErrors({ email: '', password: '' });

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          if (data.fields) {
            setErrors(data.fields);
          } else if (data.message === 'Invalid email or password') {
            setErrors({
              email: 'Invalid credentials',
              password: 'Invalid credentials',
            });
          }
        } else if (status === 403) {
          if (data.isEmailVerified === false) {
            setIsEmailVerified(false);
            await handleResendVerification();
            setCountdown(60);
          } else {
            toast.error(data.message || 'Access denied');
          }
        } else if (status >= 500) {
          toast.error('Login failed. Please try again later.');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // v1.0.0 ----------------------->

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-1 items-center">
        <div>
          <Slideshow />
        </div>
        <div className="flex text-sm flex-col sm:mt-5 sm:mb-5 sm:px-[7%] px-[20%] md:px-[10%]">
          <div>
            <p className="text-2xl font-semibold mb-7 text-center">Welcome Back</p>
            {isEmailVerified ? (
              <form onSubmit={handleLogin}>
                <div className="relative mb-4">
                  <input
                    type="email"
                    id="email"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    autoComplete="email"
                  />
                  <label htmlFor="email" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
                    Work Email
                  </label>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`block rounded px-3 pb-1.5 pt-4 w-full text-sm text-gray-900 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'} appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 peer`}
                    placeholder=" "
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    autoComplete="current-password"
                  />
                  <label htmlFor="password" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-3 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">
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
                <div className="mb-5">
                  <p
                    className="text-custom-blue cursor-pointer text-xs hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/forgetPassword');
                    }}
                    style={{ display: 'inline-block' }} // Ensures only the text area is clickable
                  >
                    Forgot Password?
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-sm bg-custom-blue text-white rounded px-3 py-[10px] transition-colors duration-300 flex items-center justify-center ${isLoading ? 'opacity-80' : 'hover:bg-custom-blue hover:bg-opacity-50'}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </>
                    ) : 'Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/select-user-type')}
                    disabled={isLoading}
                    className={`w-full text-sm bg-white text-custom-blue border border-gray-400 rounded px-3 py-[10px] transition-colors duration-300 ${isLoading ? 'opacity-50' : 'hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex justify-center mt-4">
                  <p className="text-sm mb-4">
                    If not registered | <span className="cursor-pointer text-custom-blue hover:underline" onClick={() => navigate('/organization-signup')}>Sign Up</span>
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-lg mb-2">
                  We've already sent a verification email to <span className="font-semibold">{email}</span>.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  If you didn’t receive it, you can resend the email below.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || countdown > 0}
                    className={`px-4 py-2 rounded-md transition-colors ${isResending || countdown > 0
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    {isResending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
                  >
                    Back to Login
                  </button>
                </div>
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationLogin;