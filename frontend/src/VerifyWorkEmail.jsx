import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from './config';
import toast from 'react-hot-toast';
import { notify } from './services/toastService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus('invalid');
        toast.error('Verification token is missing.');
        return;
      }

      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/Organization/verify-email?token=${token}`
        );

        if (response.data.success) {
          setVerificationStatus('success');
          notify.success('Email verified successfully!');
          // Redirect after 3 seconds
          setTimeout(() => {
            navigate('/organization-login');
          }, 3000);
        } else {
          setVerificationStatus('failed');
          notify.error(response.data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('failed');
        notify.error(error.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        {verificationStatus === 'verifying' && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-800">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-green-100 rounded-full">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Verified Successfully!</h2>
            <p className="text-gray-600">Your account is now active.</p>
            <div className="pt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full animate-progress"
                  style={{ animationDuration: '3s' }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login page...</p>
            </div>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-red-100 rounded-full">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
            <p className="text-gray-600">The verification link is invalid or has expired.</p>
            <button
              onClick={() => navigate('/organization-login')}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Login Page
            </button>
          </div>
        )}

        {verificationStatus === 'invalid' && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-red-100 rounded-full">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Invalid Verification Link</h2>
            <p className="text-gray-600">The verification link is missing the required token.</p>
            <button
              onClick={() => navigate('/organization-login')}
              className="w-full mt-6 px-6 py-3 bg-custom-blue text-white font-medium rounded-lg hover:bg-custom-blue/90 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Login Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;