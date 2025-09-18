// components/SessionExpiration.jsx
import React, { useState, useEffect } from 'react';
import { getActivityEmitter } from '../utils/activityTracker';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

const SessionExpiration = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [showExpiration, setShowExpiration] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

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

    const handleLogoutNow = async () => {
        try {
            await AuthCookieManager.clearAllAuth();
        } catch (e) {
            // ignore
        }
        // Hard redirect to ensure a fully clean state
        window.location.href = '/organization-login';
    };

    if (showExpiration) {
        return (
            <>
                {/* Session Expired Modal */}
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="session-expired-title"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>

                    {/* Dialog */}
                    <div className="relative w-[90%] max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 id="session-expired-title" className="text-lg font-semibold text-gray-900">
                            Session Expired (401)
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Required to provide Auth information
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleLogoutNow}
                                className="inline-flex items-center rounded-md bg-custom-blue px-4 py-2 text-sm font-medium text-white hover:bg-custom-blue/90 focus:outline-none"
                            >
                                Log In
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return null;
};

export default SessionExpiration;
