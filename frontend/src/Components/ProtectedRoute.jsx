import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import Loading from './Loading';
import { CustomProvider, useCustomContext } from '../Context/Contextfetch';
import { PermissionsProvider } from '../Context/PermissionsContext';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const authToken = Cookies.get('authToken');

        if (!authToken) {
          navigate('/organization-login'); // Changed from '/' to '/organization-log'
          return;
        }

        const tokenPayload = decodeJwt(authToken);
        if (!tokenPayload) {
          navigate('/organization-login'); // Changed from '/' to '/organization-log'
          return;
        }

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          navigate('/organization-login'); // Added token expiration check
          return;
        }

        // Defer usersData usage to after CustomProvider
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/organization-login'); // Changed from '/' to '/organization-log'
      }
    };

    checkAuthAndRedirect();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return <div><Loading /></div>;
  }

  const ProtectedContent = ({ children }) => {
    const { usersData } = useCustomContext() || {};

    const tokenPayload = decodeJwt(Cookies.get('authToken'));
    const userId = tokenPayload?.userId;
    const currentUserData = usersData?.find(user => user._id === userId);
    const organization = currentUserData?.tenantId;

    const currentDomain = window.location.hostname;
    const isLocalhost = currentDomain === 'localhost';
    let targetDomain;

    if (tokenPayload.organization === true && organization?.subdomain) {
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