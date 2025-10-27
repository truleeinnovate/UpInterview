// v1.0.0  -  mansoor  -  removed total comments from this file
// v1.0.1  -  Ashraf  -  using authcookie manager to get current tokein
// v1.0.2  -  Ashraf  -  in local cookies expiring issue colved
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { CustomProvider, useCustomContext } from '../Context/Contextfetch';
import { PermissionsProvider, usePermissions } from '../Context/PermissionsContext';
import { startActivityTracking } from '../utils/activityTracker';
import { getActivityEmitter } from '../utils/activityTracker';
// <---------------------- v1.0.1
// import {
//   debugTokenSources,
//   // debugCookieState,
//   handleTokenExpiration
// } from '../utils/AuthCookieManager/AuthCookieManager';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

// ---------------------- v1.0.1 >
import Loading from './Loading';
import { config } from '../config';

const ProtectedRoute = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    // <---------------------- v1.0.1

    // Use the same token validation logic as AuthCookieManager
    const authToken = AuthCookieManager.getAuthToken(); // Simple getter
    const impersonationToken = AuthCookieManager.getImpersonationToken(); // Simple getter
    // ---------------------- v1.0.1 >
    const tokenPayload = authToken ? decodeJwt(authToken) : null;
    const impersonationPayload = impersonationToken ? decodeJwt(impersonationToken) : null;
    const { usersData } = useCustomContext() || {};
    const { isInitialized } = usePermissions() || { isInitialized: false };
    // <---------------------------- v1.0.0

    const loginType = sessionStorage.getItem('sessionExpiredLoginType');
    useEffect(() => {
        // If the session expiration modal was active and the user refreshed,
        // redirect them to the appropriate login page with returnUrl
        try {
            const expiredFlag = sessionStorage.getItem('sessionExpired');
            if (expiredFlag === 'true') {
                const returnUrl = sessionStorage.getItem('sessionExpiredReturnUrl') || (window.location.pathname + window.location.search + window.location.hash);
                // Clear flags to avoid loops
                sessionStorage.removeItem('sessionExpired');
                sessionStorage.removeItem('sessionExpiredLoginType');
                sessionStorage.removeItem('sessionExpiredReturnUrl');

                if (loginType === 'individual') {
                    navigate(`/individual-login?returnUrl=${encodeURIComponent(returnUrl)}`);
                } else {
                    navigate(`/organization-login?returnUrl=${encodeURIComponent(returnUrl)}`);
                }
                return; // prevent further checks in this effect run
            }
        } catch (e) {
            // ignore
        }

        // Start activity tracking
        const cleanupActivityTracker = startActivityTracking();

        // Listen for logout events
        const emitter = getActivityEmitter();
        const handleLogout = () => {
            // Do NOT clear cookies here; let the session expiration modal control logout.
            // This preserves navbar/data visibility under the overlay.
        };
        emitter.on('logout', handleLogout);
        // <---------------------- v1.0.1

        // Listen for token expiration events
        const handleTokenExpired = () => {
            console.log('Token expired in ProtectedRoute, redirecting to login');
            if (window.sessionExpirationVisible) {
                // Modal overlay is handling UX; do not navigate away
                return;
            }
            const currentUrl = window.location.pathname + window.location.search + window.location.hash;
            if (loginType === 'individual') {
                navigate(`/individual-login?returnUrl=${encodeURIComponent(currentUrl)}`);
            } else {
                navigate(`/organization-login?returnUrl=${encodeURIComponent(currentUrl)}`);
            }
        };

        // Listen for token refresh failure events from axios interceptor
        const handleTokenRefreshFailed = () => {
            console.log('Token refresh failed, redirecting to login');
            if (window.sessionExpirationVisible) {
                return;
            }
            const currentUrl = window.location.pathname + window.location.search + window.location.hash;
            if (loginType === 'individual') {
                navigate(`/individual-login?returnUrl=${encodeURIComponent(currentUrl)}`);
            } else {
                navigate(`/organization-login?returnUrl=${encodeURIComponent(currentUrl)}`);
            }
        };
        window.addEventListener('tokenExpired', handleTokenExpired);
        window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed);

        return () => {
            cleanupActivityTracker();
            emitter.off('logout', handleLogout);
            window.removeEventListener('tokenExpired', handleTokenExpired);
            window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
        };
    }, [navigate, location.pathname]);
    // ---------------------- v1.0.1 >

    // Handle user inactivity
    const handleUserInactive = useCallback(() => {
        // Clear the auth token
        Cookies.remove('authToken', { path: '/' });
    }, [navigate, location.pathname]);
    // <---------------------- v1.0.2

    // Set up activity tracking and event listeners
    // useEffect(() => {
    //   // Only set up activity tracking if user is authenticated
    //   if (authToken || impersonationToken) {
    //     // Start activity tracking
    //     const cleanupActivityTracker = startActivityTracking();

    //     // Add event listener for user inactivity
    //     window.addEventListener('userInactive', handleUserInactive);

    //     // Cleanup function
    //     return () => {
    //       cleanupActivityTracker();
    //       window.removeEventListener('userInactive', handleUserInactive);
    //     };
    //   }
    // }, [authToken, impersonationToken, handleUserInactive]);


    // Update the activity tracker setup
    useEffect(() => {
        // Only set up activity tracking if user is authenticated
        if (authToken || impersonationToken) {
            // Start activity tracking with proper configuration
            const cleanupActivityTracker = startActivityTracking({
                inactivityTimeout: 120 * 60 * 1000, // 2 hours in milliseconds
                warningTimeout: 115 * 60 * 1000, // Show warning 5 minutes before
            });

            // Add event listener for user inactivity
            const handleUserInactive = () => {
                console.log('User inactive, showing modal without clearing tokens');
                // Do NOT clear tokens or navigate; allow the modal to appear and keep UI visible.
            };

            window.addEventListener('userInactive', handleUserInactive);

            // Cleanup function
            return () => {
                cleanupActivityTracker();
                window.removeEventListener('userInactive', handleUserInactive);
            };
        }
    }, [authToken, impersonationToken, navigate]);

    // In ProtectedRoute.js, simplify the auth check
    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            try {
                // SIMPLE CHECK: Just check if tokens exist in cookies
                const hasAuthToken = !!AuthCookieManager.getAuthToken();
                const hasImpersonationToken = !!AuthCookieManager.getImpersonationToken();
                const hasAnyValidToken = hasAuthToken || hasImpersonationToken;

                if (hasAnyValidToken) {
                    setIsChecking(false);
                    return;
                }
                console.log('loginType', loginType);
                // If no tokens at all, redirect to login unless the session expiration modal is visible
                console.log('No tokens found, assessing redirect to login');
                if (window.sessionExpirationVisible) {
                    // Keep user on current page under modal overlay
                    setIsChecking(false);
                    return;
                }
                const currentUrl = window.location.pathname + window.location.search + window.location.hash;

                if (loginType === 'individual') {
                    navigate(`/individual-login?returnUrl=${encodeURIComponent(currentUrl)}`);
                } else {
                    navigate(`/organization-login?returnUrl=${encodeURIComponent(currentUrl)}`);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                if (window.sessionExpirationVisible) {
                    setIsChecking(false);
                    return;
                }
                const currentUrl = window.location.pathname + window.location.search + window.location.hash;
                if (loginType === 'individual') {
                    navigate(`/individual-login?returnUrl=${encodeURIComponent(currentUrl)}`);
                } else {
                    navigate(`/organization-login?returnUrl=${encodeURIComponent(currentUrl)}`);
                }
            }
        };

        checkAuthAndRedirect();
    }, [navigate, location.pathname]);
    // ---------------------- v1.0.2 >


    // Show loading while checking
    if (isChecking) {
        return (
            <Loading message="Loading..." />
        );
    }

    const ProtectedContent = ({ children }) => {
        const { usersData } = useCustomContext() || {};
        // <---------------------- v1.0.1
        // Use the same token validation logic
        const currentAuthToken = AuthCookieManager.getAuthToken();
        const currentImpersonationToken = AuthCookieManager.getImpersonationToken();
        const currentTokenPayload = currentAuthToken ? decodeJwt(currentAuthToken) : null;
        const currentImpersonationPayload = currentImpersonationToken ? decodeJwt(currentImpersonationToken) : null;

        // Determine which token to use for user data
        const effectiveTokenPayload = currentImpersonationPayload?.impersonatedUserId ? currentImpersonationPayload : currentTokenPayload;
        // ---------------------- v1.0.1 >
        const userId = effectiveTokenPayload?.userId || effectiveTokenPayload?.impersonatedUserId;
        const currentUserData = usersData?.find(user => user._id === userId);

        const organization = currentUserData?.tenantId;

        const currentDomain = window.location.hostname;
        let targetDomain;

        // Only check for subdomain redirect if we have organization data and it's a regular user (not super admin)
        // <---------------------- v1.0.1
        if (currentAuthToken && currentTokenPayload?.organization === true && organization?.subdomain) {
            targetDomain = `${organization.subdomain}.${config.REACT_APP_API_URL_FRONTEND}`;
        } else {
            targetDomain = `${config.REACT_APP_API_URL_FRONTEND}`;
        }
        // ---------------------- v1.0.1 >

        // Only redirect for subdomain if NOT localhost
        const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';

        // Skip subdomain redirect if we're already on a subdomain and the organization data might not be loaded yet
        const isOnSubdomain = currentDomain.includes(`${config.REACT_APP_API_URL_FRONTEND}`) && currentDomain !== `${config.REACT_APP_API_URL_FRONTEND}`;
        const shouldSkipRedirect = isOnSubdomain && !organization?.subdomain;

        if (!isLocalhost && !currentDomain.includes(targetDomain) && !shouldSkipRedirect) {
            const protocol = window.location.protocol;
            window.location.href = `${protocol}//${targetDomain}${location.pathname}`;
            return null;
        }


        // v1.0.0 ---------------------->
        return children;
    };

    return (
        <PermissionsProvider>
            <CustomProvider>
                <ProtectedContent>{children}</ProtectedContent>
            </CustomProvider>
        </PermissionsProvider>
    );
};

export default ProtectedRoute;
