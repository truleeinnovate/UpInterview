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

    return () => {
      cleanupActivityTracker();
    };
  }, [navigate, location.pathname]);

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
      <Loading message="Loading your workspace..." />
    );
  }

  return (
    <PermissionsProvider>
      <CustomProvider>
        {children}
      </CustomProvider>
    </PermissionsProvider>
  );
};

export default ProtectedRoute;