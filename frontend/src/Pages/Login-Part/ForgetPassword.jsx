import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { config } from '../../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    try {
      const response = await fetch(`${config.REACT_APP_API_URL}/emails/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setMessage("Check your email to reset your password.");
      } else {
        setError(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };
  
  
  return (
    <div className="flex items-center justify-center mt-10">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-teal-100">
            <Lock className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your email to reset the password
          </p>
          <p className="text-red-600 text-center font-medium mt-2">{error}</p>
        </div>

        {message ? (
          <div className="text-green-600 text-center font-medium">
            {message}
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Your Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
              >
                Reset Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
