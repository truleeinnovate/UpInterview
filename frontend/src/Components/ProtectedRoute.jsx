import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { CustomProvider, useCustomContext } from '../Context/Contextfetch';
import { PermissionsProvider, usePermissions } from '../Context/PermissionsContext';
import { startActivityTracking } from '../utils/activityTracker';
import { getActivityEmitter } from '../utils/activityTracker';
import { debugTokenSources, getAuthToken, getImpersonationToken } from '../utils/AuthCookieManager/AuthCookieManager';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = getAuthToken();
  const impersonationToken = getImpersonationToken();
  const tokenPayload = authToken ? decodeJwt(authToken) : null;
  const impersonationPayload = impersonationToken ? decodeJwt(impersonationToken) : null;
  const { usersData } = useCustomContext() || {};
  const { isInitialized } = usePermissions() || { isInitialized: false };

  console.log('[ProtectedRoute] Component render - tokens from getAuthToken/getImpersonationToken:', {
    authToken: authToken ? 'EXISTS' : 'MISSING',
    impersonationToken: impersonationToken ? 'EXISTS' : 'MISSING',
    pathname: location.pathname
  });

  useEffect(() => {
    console.log('ProtectedRoute: starting activity tracking');
    // Start activity tracking
    const cleanupActivityTracker = startActivityTracking();

    // Listen for logout events
    const emitter = getActivityEmitter();
    const handleLogout = () => {
      // Clear auth token
      Cookies.remove('authToken', { path: '/' });
    };
    emitter.on('logout', handleLogout);
    return () => {
      cleanupActivityTracker();
      emitter.off('logout', handleLogout);
    };
  }, [navigate, location.pathname]);

  // Handle user inactivity
  const handleUserInactive = useCallback(() => {
    // Clear the auth token
    Cookies.remove('authToken', { path: '/' });
  }, [navigate, location.pathname]);

  // Set up activity tracking and event listeners
  useEffect(() => {
    // Only set up activity tracking if user is authenticated
    if (authToken || impersonationToken) {
      // Start activity tracking
      const cleanupActivityTracker = startActivityTracking();

      // Add event listener for user inactivity
      window.addEventListener('userInactive', handleUserInactive);

      // Cleanup function
      return () => {
        cleanupActivityTracker();
        window.removeEventListener('userInactive', handleUserInactive);
      };
    }
  }, [authToken, impersonationToken, handleUserInactive]);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('[ProtectedRoute] Checking authentication...');
        console.log('[ProtectedRoute] Current pathname:', location.pathname);
        console.log('[ProtectedRoute] Auth token exists:', authToken, !!authToken);
        console.log('[ProtectedRoute] Impersonation token exists:', !!impersonationToken);
        console.log('[ProtectedRoute] All cookies:', document.cookie);

        // Debug all token sources
        try {
          const debugResult = debugTokenSources();
          console.log('[ProtectedRoute] Token debug result:', debugResult);
        } catch (error) {
          console.error('[ProtectedRoute] Error in debugTokenSources:', error);
        }

        // SIMPLE CHECK: If we have any token at all, allow access
        const hasAnyToken = authToken || impersonationToken;

        if (hasAnyToken) {
          console.log('[ProtectedRoute] Token found, allowing access');
          setIsChecking(false);
          return;
        }

        // If no tokens at all, redirect to login
        console.log('[ProtectedRoute] No tokens found, redirecting to login');
        console.error('[ProtectedRoute] No tokens found, redirecting to login');
        navigate('/organization-login');
      } catch (error) {
        console.error('[ProtectedRoute] Auth check failed:', error);
        navigate('/organization-login');
      }
    };

    checkAuthAndRedirect();
  }, [authToken, impersonationToken, navigate, location.pathname]);

  // Show loading while checking
  if (isChecking) {
    return (
      <Loading message="Loading..." />
    );
  }

  const ProtectedContent = ({ children }) => {
    const { usersData } = useCustomContext() || {};

    const authToken = getAuthToken();
    const impersonationToken = getImpersonationToken();
    const tokenPayload = authToken ? decodeJwt(authToken) : null;
    const impersonationPayload = impersonationToken ? decodeJwt(impersonationToken) : null;

    // Determine which token to use for user data
    const effectiveTokenPayload = impersonationPayload?.impersonatedUserId ? impersonationPayload : tokenPayload;
    const userId = effectiveTokenPayload?.userId || effectiveTokenPayload?.impersonatedUserId;
    const currentUserData = usersData?.find(user => user._id === userId);

    const organization = currentUserData?.tenantId;

    const currentDomain = window.location.hostname;
    let targetDomain;

    console.log('[ProtectedContent] Checking subdomain redirect...');
    console.log('[ProtectedContent] Current domain:', currentDomain);
    console.log('[ProtectedContent] Auth token exists:', !!authToken);
    console.log('[ProtectedContent] Impersonation token exists:', !!impersonationToken);
    console.log('[ProtectedContent] Effective token payload:', effectiveTokenPayload);
    console.log('[ProtectedContent] User ID:', userId);
    console.log('[ProtectedContent] Organization:', organization);

    // Only check for subdomain redirect if we have organization data and it's a regular user (not super admin)
    if (authToken && tokenPayload?.organization === true && organization?.subdomain) {
      targetDomain = `${organization.subdomain}.app.upinterview.io`;
    } else {
      targetDomain = 'app.upinterview.io';
    }

    console.log('[ProtectedContent] Target domain:', targetDomain);

    // Only redirect for subdomain if NOT localhost
    const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
    console.log('[ProtectedContent] Is localhost:', isLocalhost);

    // Skip subdomain redirect if we're already on a subdomain and the organization data might not be loaded yet
    const isOnSubdomain = currentDomain.includes('.app.upinterview.io') && currentDomain !== 'app.upinterview.io';
    const shouldSkipRedirect = isOnSubdomain && !organization?.subdomain;

    if (!isLocalhost && !currentDomain.includes(targetDomain) && !shouldSkipRedirect) {
      console.log('[ProtectedContent] Redirecting to subdomain:', targetDomain);
      const protocol = window.location.protocol;
      window.location.href = `${protocol}//${targetDomain}${location.pathname}`;
      return null;
    }

    console.log('[ProtectedContent] No redirect needed, rendering children');
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