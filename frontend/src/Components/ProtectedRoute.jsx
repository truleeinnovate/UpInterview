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
import {
  debugTokenSources,
  // debugCookieState,
  handleTokenExpiration
} from '../utils/AuthCookieManager/AuthCookieManager';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

// ---------------------- v1.0.1 >
import Loading from './Loading';

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


  useEffect(() => {
    // Start activity tracking
    const cleanupActivityTracker = startActivityTracking();

    // Listen for logout events
    const emitter = getActivityEmitter();
    const handleLogout = () => {
      // Clear auth token
      Cookies.remove('authToken', { path: '/' });
    };
    emitter.on('logout', handleLogout);
    // <---------------------- v1.0.1

    // Listen for token expiration events
    const handleTokenExpired = () => {
      console.log('Token expired in ProtectedRoute, redirecting to login');
      navigate('/organization-login');
    };
    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      cleanupActivityTracker();
      emitter.off('logout', handleLogout);
      window.removeEventListener('tokenExpired', handleTokenExpired);
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
        console.log('User inactive, clearing auth tokens');
        // Clear the auth tokens properly
        Cookies.remove('authToken', {
          path: '/',
          domain: window.location.hostname.includes('upinterview.io') ? '.upinterview.io' : undefined
        });
        Cookies.remove('impersonationToken', {
          path: '/',
          domain: window.location.hostname.includes('upinterview.io') ? '.upinterview.io' : undefined
        });

        // Navigate to login
        navigate('/organization-login');
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

        // If no tokens at all, redirect to login
        console.log('No tokens found, redirecting to login');
        navigate('/organization-login');
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/organization-login');
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
      targetDomain = `${organization.subdomain}.app.upinterview.io`;
    } else {
      targetDomain = 'app.upinterview.io';
    }
    // ---------------------- v1.0.1 >

    // Only redirect for subdomain if NOT localhost
    const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';

    // Skip subdomain redirect if we're already on a subdomain and the organization data might not be loaded yet
    const isOnSubdomain = currentDomain.includes('.app.upinterview.io') && currentDomain !== 'app.upinterview.io';
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