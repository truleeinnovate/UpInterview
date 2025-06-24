// import { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Cookies from "js-cookie";
// import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
// import { useCustomContext } from '../Context/Contextfetch';
// import Loading from './Loading';

// const ProtectedRoute = ({ children }) => {
//   const { usersData } = useCustomContext() || {};
//   console.log('userData in protected route', usersData);
//   const [isChecking, setIsChecking] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const checkAuthAndRedirect = async () => {
//       try {
//         const authToken = Cookies.get("authToken");
        
//         if (!authToken) {
//           navigate('/');
//           return;
//         }

//         const tokenPayload = decodeJwt(authToken);
//         if (!tokenPayload) {
//           navigate('/');
//           return;
//         }

//         const userId = tokenPayload?.userId;
//         const currentUserData = usersData?.find(user => user._id === userId);
//         const organization = currentUserData?.tenantId;

//         const currentDomain = window.location.hostname;
//         let targetDomain;

//         if (tokenPayload.organization === true && organization?.subdomain) {
//           targetDomain = `${organization.subdomain}.app.upinterview.io`;
//         } else {
//           targetDomain = 'app.upinterview.io';
//         }

//         if (!currentDomain.includes(targetDomain)) {
//           window.location.href = `https://${targetDomain}${location.pathname}`;
//         } else {
//           setIsChecking(false);
//         }
//       } catch (error) {
//         console.error('Auth check failed:', error);
//         navigate('/');
//       }
//     };

//     checkAuthAndRedirect();
//   }, [usersData, navigate, location.pathname]);

//   if (isChecking) {
//     return <div><Loading /></div>;
//   }

//   return children;
// };

// export default ProtectedRoute;




// import { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Cookies from "js-cookie";
// import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
// import { useCustomContext } from '../Context/Contextfetch';
// import Loading from './Loading';

// const ProtectedRoute = ({ children }) => {
//   const { usersData } = useCustomContext() || {};
//   console.log('userData in protected route', usersData);
//   const [isChecking, setIsChecking] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const checkAuthAndRedirect = async () => {
//       try {
//         const authToken = Cookies.get("authToken");

//         if (!authToken) {
//           navigate('/');
//           return;
//         }

//         const tokenPayload = decodeJwt(authToken);
//         if (!tokenPayload) {
//           navigate('/');
//           return;
//         }

//         const userId = tokenPayload?.userId;
//         const currentUserData = usersData?.find(user => user._id === userId);
//         const organization = currentUserData?.tenantId;

//         const currentDomain = window.location.hostname;
//         let targetDomain;

//         // If in development (localhost), skip redirection logic
//         const isLocalhost = currentDomain === 'localhost';

//         if (tokenPayload.organization === true && organization?.subdomain) {
//           targetDomain = `${organization.subdomain}.app.upinterview.io`;
//         } else {
//           targetDomain = 'app.upinterview.io';
//         }

//         if (!isLocalhost) {
//           // Production domain redirection
//           if (!currentDomain.includes(targetDomain)) {
//             window.location.href = `https://${targetDomain}${location.pathname}`;
//             return;
//           }
//         }

//         setIsChecking(false);
//       } catch (error) {
//         console.error('Auth check failed:', error);
//         navigate('/');
//       }
//     };

//     checkAuthAndRedirect();
//   }, [usersData, navigate, location.pathname]);

//   if (isChecking) {
//     return <div><Loading /></div>;
//   }

//   return children;
// };

// export default ProtectedRoute;




import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import Loading from './Loading';
import { CustomProvider, useCustomContext } from '../Context/Contextfetch';
import { PermissionsProvider } from '../Context/PermissionsContext';

// Placeholder PermissionsProvider (implement as needed)
// const PermissionsProvider = ({ children }) => children;

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = Cookies.get('authToken');
  const tokenPayload = authToken ? decodeJwt(authToken) : null;
  const { usersData } = useCustomContext() || {};
  const [finalDomain, setFinalDomain] = useState(null);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        if (!authToken || !tokenPayload) {
          navigate('/');
          return;
        }

        // If we have usersData, we can determine the target domain
        if (usersData) {
          const userId = tokenPayload.userId;
          const currentUserData = usersData.find(user => user._id === userId);
          const organization = currentUserData?.tenantId;
          const currentDomain = window.location.hostname;
          const isLocalhost = currentDomain === 'localhost';
          
          let targetDomain = 'app.upinterview.io';
          if (tokenPayload.organization === true && organization?.subdomain) {
            targetDomain = `${organization.subdomain}.app.upinterview.io`;
          }

          setFinalDomain(targetDomain);

          // If we're not on localhost and not on the correct domain, redirect
          if (!isLocalhost && !currentDomain.includes(targetDomain)) {
            setIsRedirecting(true);
            window.location.href = `https://${targetDomain}${location.pathname}`;
            return;
          }
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      }
    };

    checkAuthAndRedirect();
  }, [authToken, tokenPayload, usersData, navigate, location.pathname]);

  // Show loading while checking or redirecting
  if (isChecking || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Component to handle context-dependent logic
  const ProtectedContent = ({ children }) => {
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