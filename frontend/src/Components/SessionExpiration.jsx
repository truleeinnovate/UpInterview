// components/SessionExpiration.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityEmitter } from '../utils/activityTracker';

const SessionExpiration = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [showExpiration, setShowExpiration] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const emitter = getActivityEmitter();

        const handleWarning = ({ remainingTime }) => {
            setRemainingTime(remainingTime);
            setShowWarning(true);
            setShowExpiration(false);
        };

        const handleActivity = () => {
            setShowWarning(false);
            setShowExpiration(false);
        };

        const handleLogout = () => {
            setShowWarning(false);
            setShowExpiration(true);
        };

        emitter.on('warning', handleWarning);
        emitter.on('activity', handleActivity);
        emitter.on('logout', handleLogout);
        emitter.on('showExpiration', () => setShowExpiration(true));

        return () => {
            emitter.off('warning', handleWarning);
            emitter.off('activity', handleActivity);
            emitter.off('logout', handleLogout);
            emitter.off('showExpiration', () => setShowExpiration(true));
        };
    }, []);

    const handleLogoutNow = () => {
        // Remove all activity listeners before navigating
        window.onmousedown = null;
        window.onmousemove = null;
        window.onkeydown = null;
        window.onscroll = null;
        navigate('/organization-login');
        window.location.reload();
    };

    if (showExpiration) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4 sm:p-6">
                <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Header with icon */}
                    <div className="bg-red-50 p-6 flex flex-col items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Session Expired</h1>
                        <p className="text-sm sm:text-base text-gray-600 text-center">Your secure session has ended due to inactivity</p>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                            <h3 className="font-medium text-custom-blue mb-1 sm:mb-2 flex items-center text-sm sm:text-base">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What happened?
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                For your security, we automatically log you out after 2 hours of inactivity. This helps protect your account from unauthorized access.
                            </p>
                        </div>

                        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
                            <h3 className="font-medium text-yellow-800 mb-1 sm:mb-2 flex items-center text-sm sm:text-base">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What to do next?
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Click the button below to return to the login page. You'll need to sign in again to continue where you left off.
                            </p>
                        </div>
                    </div>

                    {/* Responsive Actions */}
                    <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row-reverse justify-between gap-2 sm:gap-0">
                        <button
                            onClick={handleLogoutNow}
                            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-custom-blue to-custom-blue text-white font-medium rounded-lg shadow-md hover:from-custom-blue/80 hover:to-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Return to Login
                        </button>
                        <button
                            // onClick={handleContactSupport}
                            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>

                {/* Footer note - responsive text size */}
                <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 text-center max-w-md px-4">
                    Need help? Email us at <a href="mailto:support@yourcompany.com" className="text-custom-blue hover:underline">support@yourcompany.com</a> or call +1 (800) 123-4567
                </p>
            </div>
        );
    }

    return null;
};

export default SessionExpiration;