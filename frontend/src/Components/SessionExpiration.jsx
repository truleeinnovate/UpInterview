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
            // <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 p-2 sm:p-4">
            //     <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border border-gray-200">
            //         {/* Header */}
            //         <div className="bg-custom-blue text-white p-4 text-center">
            //             <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
            //                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            //                 </svg>
            //             </div>
            //             <h1 className="text-lg font-semibold">Session Expired</h1>
            //         </div>

            //         {/* Content */}
            //         <div className="p-4 space-y-3">
            //             <p className="text-sm text-gray-600 text-center">
            //                 Your session has ended due to inactivity for your security.
            //             </p>
            //             <div className="text-sm text-gray-600">
            //                 <p className="mb-1">What happened?</p>
            //                 <p className="text-xs">You were logged out after 2 hours of inactivity to protect your account.</p>
            //             </div>
            //             <div className="text-sm text-gray-600">
            //                 <p className="mb-1">What to do next?</p>
            //                 <p className="text-xs">Please log in again to continue.</p>
            //             </div>
            //         </div>

            //         {/* Actions */}
            //         <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
            //             <button
            //                 onClick={handleLogoutNow}
            //                 className="w-full sm:w-auto px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2 transition-all duration-200 text-sm"
            //             >
            //                 Return to Login
            //             </button>
            //             <button
            //                 // onClick={handleContactSupport}
            //                 className="w-full sm:w-auto px-4 py-2 text-custom-blue border border-custom-blue rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2 transition-all duration-200 text-sm"
            //             >
            //                 Contact Support
            //             </button>
            //         </div>

            //         {/* Footer */}
            //         <p className="text-xs text-gray-500 text-center p-2">
            //             Need help? Email us at <a href="mailto:support@yourcompany.com" className="text-custom-blue hover:underline">support@yourcompany.com</a> or call +1 (800) 123-4567
            //         </p>
            //     </div>
            // </div>



            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-custom-blue to-gray-100 p-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Session Expired</h1>
                    <p className="text-sm sm:text-base text-white/80 mb-6">
                        Your session has ended due to inactivity. Please refresh the page to log in again.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-white text-custom-blue font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all duration-200 text-sm"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>






            // <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-beige-100 p-4">
            //     <div className="text-center">
            //         <div className="w-16 h-16 mx-auto mb-6 bg-custom-blue/10 rounded-full flex items-center justify-center">
            //             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-custom-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            //             </svg>
            //         </div>
            //         <h1 className="text-3xl font-serif text-gray-800 mb-4">Session Expired</h1>
            //         <p className="text-lg text-gray-600 mb-8 max-w-md">
            //             Your session has timed out due to inactivity. Please refresh to log in again.
            //         </p>
            //         <button
            //             onClick={() => window.location.reload()}
            //             className="px-6 py-3 bg-custom-blue text-white font-medium rounded hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2 transition-all duration-200 text-base"
            //         >
            //             Refresh Now
            //         </button>
            //     </div>
            // </div>





            // <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-beige-100 p-4 sm:p-6">
            //     <div className="text-center">
            //         <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 bg-custom-blue/10 rounded-full flex items-center justify-center">
            //             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-custom-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            //             </svg>
            //         </div>
            //         <h1 className="text-3xl sm:text-4xl font-serif text-gray-800 mb-4 sm:mb-6">Session Expired</h1>
            //         <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-md mx-auto">
            //             Your session has timed out due to inactivity. Please refresh to log in again or contact support for assistance.
            //         </p>
            //         <div className="flex flex-col sm:flex-row justify-center gap-4">
            //             <button
            //                 onClick={() => window.location.reload()}
            //                 className="px-6 py-3 sm:px-8 sm:py-4 bg-custom-blue text-white font-medium rounded-lg hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2 transition-all duration-200 text-base sm:text-lg"
            //             >
            //                 Refresh Now
            //             </button>
            //             <button
            //                 // onClick={handleContactSupport}
            //                 className="px-6 py-3 sm:px-8 sm:py-4 text-custom-blue border border-custom-blue font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:ring-offset-2 transition-all duration-200 text-base sm:text-lg"
            //             >
            //                 Contact Support
            //             </button>
            //         </div>
            //     </div>
            // </div>



        );
    }

    return null;
};

export default SessionExpiration;