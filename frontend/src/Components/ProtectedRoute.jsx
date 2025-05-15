import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { handleDomainRedirection } from '../middleware/domainRedirect';
import { useCustomContext } from '../Context/Contextfetch';

// const ProtectedRoute = ({ children }) => {
//   const { usersData } = useCustomContext();
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const authToken = Cookies.get("authToken");
//     console.log('authToken:', authToken);

//     const tokenPayload = decodeJwt(authToken);
//     console.log('tokenPayload:', tokenPayload);

//     const userId = tokenPayload?.userId;
//     console.log('userId:', userId);

//     console.log('usersData:', usersData);
//     const currentUserData = usersData?.find(user => user._id === userId);
//     console.log('currentUserData:', currentUserData);

//     const organization = currentUserData?.tenantId;
//     console.log('Matched user data :', organization);

//     handleDomainRedirection(organization, navigate, authToken, location.pathname);

//   }, [usersData, navigate, location.pathname]);

//   return null;
// };



// const ProtectedRoute = ({ children }) => {
//   const { usersData } = useCustomContext();
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const authToken = Cookies.get("authToken");
//     const tokenPayload = decodeJwt(authToken);
//     const userId = tokenPayload?.userId;
//     const currentUserData = usersData?.find(user => user._id === userId);
//     const organization = currentUserData?.tenantId;

//     // Only redirect if we're not already processing a redirect
//     if (!window.location.href.includes('redirect-processed')) {
//       handleDomainRedirection(organization, navigate, authToken, `${location.pathname}?redirect-processed=true`);
//     }
//   }, [usersData, navigate, location.pathname]);

//   return children;
// };

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
          navigate('/login');
          return;
        }

        const tokenPayload = decodeJwt(authToken);
        if (!tokenPayload) {
          navigate('/login');
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
        navigate('/login');
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