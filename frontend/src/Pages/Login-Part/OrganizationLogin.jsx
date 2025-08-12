// v1.0.0 - mansoor - removed unnecessary comments
// v1.0.1 - mansoor - removed old ui and added new ui
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Slideshow from './Slideshow';
import logo from "../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
// <------------------- v1.0.0
import { setAuthCookies, clearAllAuth } from '../../utils/AuthCookieManager/AuthCookieManager';
// v1.0.0 ---------------------->
import { config } from "../../config";
import { validateWorkEmail } from '../../utils/workEmailValidation.js';
import toast from "react-hot-toast";
import { usePermissions } from '../../Context/PermissionsContext';


import { Link } from 'react-router-dom';
// import Layout from './Layout.jsx';

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

  // Handle verification success and returnUrl
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
  //           navigate('/create-profile', {
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

      // Step 6: Get returnUrl early
      const query = new URLSearchParams(location.search);
      const returnUrl = query.get('returnUrl');
      let finalRedirectUrl = null;

      if (returnUrl) {
        let decodedReturnUrl = decodeURIComponent(returnUrl);
        let returnUrlObj = new URL(decodedReturnUrl);

        // If subdomain redirect needed, reconstruct returnUrl on subdomain
        if (subdomain && subdomainStatus === 'active') {
          const currentDomain = window.location.hostname;
          if (!currentDomain.includes(subdomain)) {
            decodedReturnUrl = `${window.location.protocol}//${subdomain}.app.upinterview.io${returnUrlObj.pathname}${returnUrlObj.search}`;
            returnUrlObj = new URL(decodedReturnUrl); // Update obj
          }
        }

        // Validate the (possibly reconstructed) returnUrl
        if (returnUrlObj.hostname.endsWith('.app.upinterview.io')) { // Allow subdomains
          finalRedirectUrl = decodedReturnUrl;
        } else {
          console.warn('Invalid returnUrl domain, falling back to default navigation');
        }
      }

      // Step 7: Handle subdomain redirect (only if no returnUrl or invalid)
      if (!finalRedirectUrl && subdomain && subdomainStatus === 'active') {
        const currentDomain = window.location.hostname;
        if (!currentDomain.includes(subdomain)) {
          const protocol = window.location.protocol;

          // Determine the target path based on user status
          let targetPath = '/';
          if (status === 'active' && isProfileCompleted !== false) {
            targetPath = '/home';
          } else if (status === 'submitted' || status === 'payment_pending') {
            targetPath = '/subscription-plans';
          } else if (isProfileCompleted === false && roleName) {
            targetPath = '/create-profile';
          }

          finalRedirectUrl = `${protocol}//${subdomain}.app.upinterview.io${targetPath}`;
        }
      }

      // Step 8: Refresh permissions
      await refreshPermissions();

      // Step 9: Redirect to final URL (returnUrl or subdomain or default)
      if (finalRedirectUrl) {
        // Increased delay for cookie sync
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('Redirecting to:', finalRedirectUrl);
        window.location.href = finalRedirectUrl;
        return;
      }

      // Step 10: Handle default navigation based on user status (no returnUrl, no subdomain redirect)
      switch (status) {
        case 'submitted':
        case 'payment_pending':
          navigate('/subscription-plans');
          break;

        case 'active':
          if (isProfileCompleted === false && roleName) {
            navigate('/create-profile', {
              state: { isProfileCompleteStateOrg: true, roleName, contactEmailFromOrg },
            });
          } else {
            // Increased delay for data readiness
            await new Promise(resolve => setTimeout(resolve, 5000));
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
      {/* <----------------- v1.0.1 */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-1 items-center">
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
      </div> */}
      {/* <div showBackButton={true} backPath="/"> */}
      <div className="min-h-screen flex">
        {/* Left side - Hero Image and Content */}
        <div className="hidden lg:flex lg:w-1/2 xl:flex xl:w-1/2 2xl:flex 2xl:w-1/2 bg-gradient-to-br from-custom-blue/80 via-custom-blue/90 to-custom-blue relative overflow-hidden rounded-r-3xl">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Modern office meeting room"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-custom-blue/85 via-custom-blue/90 to-custom-blue/95"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-4 lg:px-8 py-8 lg:py-12 text-white animate-fade-in mt-1">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">200+ Companies Already Using</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Accelerate Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                  Hiring Process
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-2">
                Access 500+ expert interviewers instantly. Schedule technical interviews
                without waiting for your team's availability.
              </p>
              <div className="flex items-center text-white/70 text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Reduce time-to-hire by 60% on average
              </div>
            </div>

            {/* Key Benefits */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">⚡ Instant Interview Scheduling</h4>
                  <p className="text-white/80">No more waiting for your technical team's availability. Schedule interviews immediately with our expert network.</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">👥 Hybrid Team Management</h4>
                  <p className="text-white/80">Seamlessly manage both external expert interviewers and your internal team in one platform.</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">✅ Quality Assurance</h4>
                  <p className="text-white/80">All interviewers are vetted professionals from top tech companies with proven track records.</p>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">📝 Smart Assessments</h4>
                  <p className="text-white/80">Pre-built technical assessments and coding challenges tailored to specific roles and skill levels.</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">💬 Detailed Feedback</h4>
                  <p className="text-white/80">Comprehensive interview reports with scoring, strengths, weaknesses, and hiring recommendations.</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">🏦 Question Bank</h4>
                  <p className="text-white/80">Access to 1000+ curated interview questions across different technologies and difficulty levels.</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:bg-white/30 transition-all duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">📊 Analytics Dashboard</h4>
                  <p className="text-white/80">Track hiring metrics, interviewer performance, and candidate pipeline analytics in real-time.</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">60%</div>
                <div className="text-sm text-white/80">Faster Hiring</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-sm text-white/80">Expert Interviewers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">10k+</div>
                <div className="text-sm text-white/80">Interviews Done</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">200+</div>
                <div className="text-sm text-white/80">Companies</div>
              </div>
            </div>

            {/* Platform Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-lg mb-4 text-center">🚀 Complete Hiring Platform</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>Video Interviews</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>Code Collaboration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>AI-Powered Matching</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>Calendar Integration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>Custom Workflows</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>Team Collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2 flex items-start justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-lg w-full py-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                <img src={logo} alt="Upinterview Logo" className="w-32 object-contain mx-auto mb-3 hover:scale-110 transition-transform duration-300" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {(() => {
                    const query = new URLSearchParams(location.search);
                    const returnUrl = query.get('returnUrl');
                    if (returnUrl) {
                      try {
                        const decodedReturnUrl = decodeURIComponent(returnUrl);
                        const returnUrlObj = new URL(decodedReturnUrl);
                        if (returnUrlObj.pathname === '/join-meeting') {
                          return 'Join Your Meeting! 🎯';
                        }
                      } catch (error) {
                        console.error('Error processing returnUrl:', error);
                      }
                    }
                    return 'Welcome Back! 🏢';
                  })()}
                </h2>
                <p className="text-gray-600 mb-4">
                  {(() => {
                    const query = new URLSearchParams(location.search);
                    const returnUrl = query.get('returnUrl');
                    if (returnUrl) {
                      try {
                        const decodedReturnUrl = decodeURIComponent(returnUrl);
                        const returnUrlObj = new URL(decodedReturnUrl);
                        if (returnUrlObj.pathname === '/join-meeting') {
                          return 'Sign in to access your scheduled interview meeting';
                        }
                      } catch (error) {
                        console.error('Error processing returnUrl:', error);
                      }
                    }
                    return 'Sign in to your organization dashboard';
                  })()}
                </p>
                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  Dashboard ready
                </div>
                
                {/* Return URL indicator */}
                {(() => {
                  const query = new URLSearchParams(location.search);
                  const returnUrl = query.get('returnUrl');
                  if (returnUrl) {
                    try {
                      const decodedReturnUrl = decodeURIComponent(returnUrl);
                      const returnUrlObj = new URL(decodedReturnUrl);
                      if (returnUrlObj.pathname === '/join-meeting') {
                        return (
                          <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm mt-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            Redirecting back to meeting after login
                          </div>
                        );
                      }
                    } catch (error) {
                      console.error('Error processing returnUrl:', error);
                    }
                  }
                  return null;
                })()}
              </div>

              <div className="bg-gradient-to-r from-custom-blue/5 to-custom-blue/10 rounded-xl p-4 mb-6 border border-custom-blue/20">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-custom-blue mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  {(() => {
                    const query = new URLSearchParams(location.search);
                    const returnUrl = query.get('returnUrl');
                    if (returnUrl) {
                      try {
                        const decodedReturnUrl = decodeURIComponent(returnUrl);
                        const returnUrlObj = new URL(decodedReturnUrl);
                        if (returnUrlObj.pathname === '/join-meeting') {
                          return '🎯 Meeting Access:';
                        }
                      } catch (error) {
                        console.error('Error processing returnUrl:', error);
                      }
                    }
                    return '🚀 Dashboard Access:';
                  })()}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {(() => {
                    const query = new URLSearchParams(location.search);
                    const returnUrl = query.get('returnUrl');
                    if (returnUrl) {
                      try {
                        const decodedReturnUrl = decodeURIComponent(returnUrl);
                        const returnUrlObj = new URL(decodedReturnUrl);
                        if (returnUrlObj.pathname === '/join-meeting') {
                          return (
                            <>
                              <li className="flex items-center">
                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                Join your scheduled interview meeting
                              </li>
                              <li className="flex items-center">
                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                Access meeting details and candidate info
                              </li>
                              <li className="flex items-center">
                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                View interview feedback and assessments
                              </li>
                              <li className="flex items-center">
                                <div className="w-2 h-2 bg-custom-blue rounded-full mr-3 animate-pulse"></div>
                                Manage interview scheduling and availability
                              </li>
                            </>
                          );
                        }
                      } catch (error) {
                        console.error('Error processing returnUrl:', error);
                      }
                    }
                    return (
                      <>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                          Schedule interviews with expert interviewers
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                          Manage your internal team availability
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                          Track interview progress and feedback
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 animate-pulse"></div>
                          Access detailed candidate assessments
                        </li>
                      </>
                    );
                  })()}
                </ul>
              </div>

              {isEmailVerified ? (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Work Email Address 📧
                    </label>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="your@company.com"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password 🔐
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        onBlur={(e) => handleBlur('password', e.target.value)}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {/* <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Keep me signed in
                      </label> */}
                    </div>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-custom-blue hover:text-custom-blue/80 font-medium hover:underline transition-all duration-200"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-lg font-medium rounded-lg py-3 transition-all duration-300 flex items-center justify-center ${isLoading
                      ? 'bg-gray-400 cursor-not-allowed transform scale-95'
                      : 'bg-custom-blue hover:bg-custom-blue/90 text-white transform hover:scale-105 shadow-md'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </>
                    ) : (
                      (() => {
                        const query = new URLSearchParams(location.search);
                        const returnUrl = query.get('returnUrl');
                        if (returnUrl) {
                          try {
                            const decodedReturnUrl = decodeURIComponent(returnUrl);
                            const returnUrlObj = new URL(decodedReturnUrl);
                            if (returnUrlObj.pathname === '/join-meeting') {
                              return 'Sign In & Join Meeting ✨';
                            }
                          } catch (error) {
                            console.error('Error processing returnUrl:', error);
                          }
                        }
                        return 'Sign In to Dashboard ✨';
                      })()
                    )}
                  </button>
                </form>
              ) : (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-custom-blue/20">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Email Verification Required 📧
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We've sent a verification email to{' '}
                      <span className="font-semibold text-blue-600">{email}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Please check your inbox and click the verification link to continue.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={handleResendVerification}
                        disabled={isResending || countdown > 0}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isResending || countdown > 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-custom-blue hover:bg-custom-blue/90 text-white transform hover:scale-105 shadow-md'
                          }`}
                      >
                        {isResending ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Resending...
                          </span>
                        ) : countdown > 0 ? (
                          `Resend in ${countdown}s`
                        ) : (
                          'Resend Verification Email'
                        )}
                      </button>

                      <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Don't have an account?{' '}
                  <Link
                    to="/organization/signup"
                    className="text-primary-500 hover:text-primary-600 font-medium hover:underline transition-all duration-200"
                  >
                    Create your organization account
                  </Link>
                </p>
                {/* <p className="text-xs text-gray-500">
                  🎉 Join 200+ companies already using UpInterview
                </p> */}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">Trusted by leading companies:</p>
              <div className="flex justify-center space-x-3 mb-4">
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                  <span className="text-xs font-medium text-gray-700">Stripe</span>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                  <span className="text-xs font-medium text-gray-700">Airbnb</span>
                </div>
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                  <span className="text-xs font-medium text-gray-700">Uber</span>
                </div>
              </div>
              <div className="inline-flex items-center bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-600 font-medium">🛡️ Enterprise-grade security</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
      {/* v1.0.1 ----------------> */}
    </div>
  );
};

export default OrganizationLogin;