import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
// import { getAuthToken } from './AuthCookieManager/AuthCookieManager';

const PROTECTED_ROUTES = ['/home', '/candidates', '/positions', '/interview', '/evaluation', '/settings', '/account-settings'];

const TokenExpirationHandler = () => {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Function to get remaining time in seconds
    const getRemainingTime = () => {
      const tokenExpiration = Cookies.get('tokenExpiration') || localStorage.getItem('tokenExpiration');
      if (!tokenExpiration) return 0;

      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = Math.floor(parseInt(tokenExpiration, 10) / 1000);
      return Math.max(0, expirationTime - currentTime);
    };

    // Check if current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
      window.location.pathname.startsWith(route)
    );

    const remainingTime = getRemainingTime();

    // Only set up the timeout if we have a valid remaining time
    if (remainingTime > 0 && isProtectedRoute && !hasNavigated.current) {
      const timeoutId = setTimeout(() => {
        hasNavigated.current = true;

        // Clear all auth data
        Cookies.remove('authToken');
        Cookies.remove('isAuthenticated');
        Cookies.remove('tokenExpiration');
        localStorage.removeItem('tokenExpiration');

        // Navigate to home page
        navigate('/');
      }, remainingTime * 1000);

      // Clean up timeout on unmount
      return () => clearTimeout(timeoutId);
    } else if (remainingTime <= 0 && isProtectedRoute && !hasNavigated.current) {
      // If token is already expired, navigate immediately
      hasNavigated.current = true;
      navigate('/');
    }

    // Cleanup function
    return () => {};
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default TokenExpirationHandler;
