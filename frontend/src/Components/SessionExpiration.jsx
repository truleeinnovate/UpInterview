// components/SessionExpiration.jsx
import React, { useState, useEffect } from 'react';
import { getActivityEmitter } from '../utils/activityTracker';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

const SessionExpiration = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [showExpiration, setShowExpiration] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        const emitter = getActivityEmitter();

        const handleWarning = ({ remainingTime }) => {
            setRemainingTime(remainingTime);
            // If expiration is already visible, do not override it with warning UI
            setShowWarning((prev) => (showExpiration ? false : true));
            if (!showExpiration) setShowExpiration(false);
        };

        const handleActivity = () => {
            // Ignore activity while expiration modal is shown
            if (showExpiration) return;
            setShowWarning(false);
            setShowExpiration(false);
        };

        const handleLogout = () => {
            setShowWarning(false);
            setShowExpiration(true);
            try {
                // Persist a flag and metadata so a browser refresh can redirect to the right login
                const authToken = AuthCookieManager.getAuthToken();
                const impersonationToken = AuthCookieManager.getImpersonationToken();
                let loginType = 'individual';
                if (authToken) {
                    const payload = decodeJwt(authToken);
                    loginType = payload?.organization === true ? 'organization' : 'individual';
                } else if (impersonationToken) {
                    loginType = 'organization';
                }
                const currentUrl = window.location.pathname + window.location.search + window.location.hash;
                sessionStorage.setItem('sessionExpired', 'true');
                sessionStorage.setItem('sessionExpiredLoginType', loginType);
                sessionStorage.setItem('sessionExpiredReturnUrl', currentUrl);
            } catch (e) {
                // ignore
            }
        };

        const handleShowExpiration = () => {
            setShowExpiration(true);
        };

        emitter.on('warning', handleWarning);
        emitter.on('activity', handleActivity);
        emitter.on('logout', handleLogout);
        emitter.on('showExpiration', handleShowExpiration);

        return () => {
            emitter.off('warning', handleWarning);
            emitter.off('activity', handleActivity);
            emitter.off('logout', handleLogout);
            emitter.off('showExpiration', handleShowExpiration);
        };
    }, [showExpiration]);

    // Manage global flag to prevent ProtectedRoute from redirecting while modal is visible
    // useEffect(() => {
    //     if (showExpiration) {
    //         window.sessionExpirationVisible = true;
    //         // Optional: prevent background scroll
    //         const originalOverflow = document.body.style.overflow;
    //         document.body.style.overflow = 'hidden';
    //         return () => {
    //             document.body.style.overflow = originalOverflow;
    //             window.sessionExpirationVisible = false;
    //         };
    //     } else {
    //         window.sessionExpirationVisible = false;
    //     }
    // }, [showExpiration]);

    const handleLogoutNow = async () => {
        // Determine prior login type before clearing auth
        const authToken = AuthCookieManager.getAuthToken();
        const impersonationToken = AuthCookieManager.getImpersonationToken();

        let wasOrganizationUser = false; // default to individual=false
        try {
            if (authToken) {
                const payload = decodeJwt(authToken);
                // ProtectedRoute relies on payload.organization === true for org users
                wasOrganizationUser = payload?.organization === true;
            } else if (impersonationToken) {
                // If only impersonation token exists, treat as admin/org context
                wasOrganizationUser = true;
            }
        } catch (e) {
            // if decoding fails, fallback handled below
        }

        // Capture current location for returnUrl (only for organization flow)
        const currentUrl = window.location.pathname + window.location.search + window.location.hash;

        try {
            await AuthCookieManager.clearAllAuth();
        } catch (e) {
            // ignore
        }

        // Clear flag before leaving page
        window.sessionExpirationVisible = false;
        // Also clear persistent flags to avoid stale state
        try {
            sessionStorage.removeItem('sessionExpired');
            sessionStorage.removeItem('sessionExpiredLoginType');
            sessionStorage.removeItem('sessionExpiredReturnUrl');
        } catch (e) { }

        if (wasOrganizationUser) {
            // Org users: return back to the same place after login
            window.location.href = `/organization-login?returnUrl=${encodeURIComponent(currentUrl)}`;
        } else {
            // Individual users: carry returnUrl to individual login so it can be preserved through OAuth
            window.location.href = `/individual-login?returnUrl=${encodeURIComponent(currentUrl)}`;
        }
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
                    onClick={(e) => {
                        // Prevent any click from dismissing the modal or reaching the app beneath
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>

                    {/* Dialog */}
                    <div
                        className="relative w-[90%] max-w-md rounded-lg bg-white p-6 shadow-xl"
                        onClick={(e) => {
                            // Also stop clicks inside the dialog from bubbling to parent overlay
                            e.stopPropagation();
                        }}
                    >
                        <h2 id="session-expired-title" className="text-lg font-semibold text-gray-900">
                            Session Expired
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your login session has expired. Please login again.
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleLogoutNow}
                                className="inline-flex items-center rounded-md bg-custom-blue px-4 py-2 text-sm font-medium text-white hover:bg-custom-blue/90 focus:outline-none"
                            >
                                Log in
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
