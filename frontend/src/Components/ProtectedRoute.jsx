import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { CustomProvider, useCustomContext } from '../Context/Contextfetch';
import { PermissionsProvider } from '../Context/PermissionsContext';
import { startActivityTracking } from '../utils/activityTracker';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = Cookies.get('authToken');
  const impersonationToken = Cookies.get('impersonationToken');
  const tokenPayload = authToken ? decodeJwt(authToken) : null;
  const impersonationPayload = impersonationToken ? decodeJwt(impersonationToken) : null;
  const { usersData } = useCustomContext() || {};

  // Handle user inactivity
  const handleUserInactive = useCallback(() => {
    // Clear the auth token
    Cookies.remove('authToken', { path: '/' });
    // Only redirect if not already on login page
    if (!location.pathname.includes('organization-login')) {
      navigate('/organization-login', { replace: true });
    }
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
        // Check for either authToken or impersonationToken
        if (!authToken && !impersonationToken) {
          navigate('/organization-login');
          return;
        }

        // Validate tokens
        const currentTime = Date.now() / 1000;
        if (authToken && tokenPayload?.exp && tokenPayload.exp < currentTime) {
          navigate('/organization-login');
          return;
        }
        if (impersonationToken && impersonationPayload?.exp && impersonationPayload.exp < currentTime) {
          navigate('/organization-login');
          return;
        }

        // Super admin check
        if (impersonationToken && impersonationPayload?.impersonatedUserId) {
          // Allow super admins to proceed (e.g., to /admin-dashboard)
          setIsChecking(false);
          return;
        }

        // Normal user check
        if (!tokenPayload) {
          navigate('/organization-login');
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/organization-login');
      }
    };

    checkAuthAndRedirect();
  }, [authToken, impersonationToken, tokenPayload, impersonationPayload, usersData, navigate, location.pathname]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const ProtectedContent = ({ children }) => {
    const { usersData } = useCustomContext() || {};

    const authToken = Cookies.get('authToken');
    const tokenPayload = authToken ? decodeJwt(authToken) : null;
    const userId = tokenPayload?.userId;
    const currentUserData = usersData?.find(user => user._id === userId);
    const organization = currentUserData?.tenantId;

    const currentDomain = window.location.hostname;
    const isLocalhost = currentDomain === 'localhost';
    let targetDomain;

    // Only apply domain redirect for normal users (with authToken and organization)
    if (authToken && tokenPayload?.organization === true && organization?.subdomain) {
      targetDomain = `${organization.subdomain}.app.upinterview.io`;
    } else {
      targetDomain = 'app.upinterview.io';
    }

    if (!isLocalhost && !currentDomain.includes(targetDomain)) {
      window.location.href = `https://${targetDomain}${location.pathname}`;
      return null;
    }

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