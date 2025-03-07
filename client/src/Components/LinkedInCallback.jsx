import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const LinkedInCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Exchange code for user data
                const response = await axios.post(
                    `${config.REACT_APP_API_URL}/api/linkedin/token`,
                    { code }
                );

                if (response.data.existingUser) {
                    // Show alert and redirect to login
                    alert('You are already registered. Please login.');
                    navigate('/profile1');
                } else {
                    // New user - redirect to profile completion
                    navigate('/profile3', {
                        state: {
                            userData: response.data.userInfo
                        }
                    });
                }
            } catch (error) {
                console.error('LinkedIn callback error:', error);
                setError('Authentication failed. Please try again.');
                setTimeout(() => navigate('/profile1'), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {error ? (
                <div className="text-red-500 text-center p-4 rounded-lg bg-red-50">
                    <p>{error}</p>
                    <p className="text-sm mt-2">Redirecting to login page...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Processing your login...</p>
                </div>
            )}
        </div>
    );
};

export default LinkedInCallback;