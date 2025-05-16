import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { useCustomContext } from '../Context/Contextfetch';

const ProtectedRoute = ({ children }) => {
  const { usersData } = useCustomContext();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const authToken = Cookies.get("authToken");
        
        if (!authToken) {
          navigate('/');
          return;
        }

        const tokenPayload = decodeJwt(authToken);
        if (!tokenPayload) {
          navigate('/');
          return;
        }

        const userId = tokenPayload?.userId;
        const currentUserData = usersData?.find(user => user._id === userId);
        const organization = currentUserData?.tenantId;

        const currentDomain = window.location.hostname;
        let targetDomain;

        if (tokenPayload.organization === true && organization?.subdomain) {
          targetDomain = `${organization.subdomain}.app.upinterview.io`;
        } else {
          targetDomain = 'app.upinterview.io';
        }

        if (!currentDomain.includes(targetDomain)) {
          window.location.href = `https://${targetDomain}${location.pathname}`;
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      }
    };

    checkAuthAndRedirect();
  }, [usersData, navigate, location.pathname]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return children;
};

export default ProtectedRoute;