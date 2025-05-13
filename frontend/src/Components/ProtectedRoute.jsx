import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import { handleDomainRedirection } from '../middleware/domainRedirect';
import { useCustomContext } from '../Context/Contextfetch';

const ProtectedRoute = ({ children }) => {
  const { usersData } = useCustomContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authToken = Cookies.get("authToken");
    console.log('authToken:', authToken);

    if (!authToken) {
      console.log('No auth token found, redirecting...');
      navigate('/');
      return;
    }

    const tokenPayload = decodeJwt(authToken);
    console.log('tokenPayload:', tokenPayload);

    const userId = tokenPayload?.userId;
    console.log('userId:', userId);

    const currentUserData = usersData.find(user => user._id === userId);

    if (!currentUserData || !currentUserData.tenantId) {
      console.log('No matching user or tenantId not found, redirecting...');
      navigate('/');
      return;
    }

    const organization = currentUserData.tenantId;
    console.log('Matched user data :', organization);

    // 🔁 Call domain redirection middleware
    handleDomainRedirection(organization, navigate, authToken, location.pathname);

    // ⛔ Don't render children - we're redirecting
  }, [usersData, navigate, location.pathname]);

  // ⛔ Don't render children while validation is happening
  return null;
};

export default ProtectedRoute;
