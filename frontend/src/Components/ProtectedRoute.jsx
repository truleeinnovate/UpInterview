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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const authToken = Cookies.get('authToken');

        if (!authToken) {
          navigate('/');
          return;
        }

        const tokenPayload = decodeJwt(authToken);
        if (!tokenPayload) {
          navigate('/');
          return;
        }

        // Defer usersData usage to after CustomProvider
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      }
    };

    checkAuthAndRedirect();
  }, [navigate, location.pathname]);

  if (isChecking) {
    return <div><Loading /></div>;
  }

  // Component to handle context-dependent logic
  const ProtectedContent = ({ children }) => {
    const { usersData } = useCustomContext() || {};
    // console.log('userData in protected route', usersData);

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