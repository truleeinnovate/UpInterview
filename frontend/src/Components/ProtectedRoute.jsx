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

    const tokenPayload = decodeJwt(authToken);
    console.log('tokenPayload:', tokenPayload);

    const userId = tokenPayload?.userId;
    console.log('userId:', userId);

    console.log('usersData:', usersData);
    const currentUserData = usersData?.find(user => user._id === userId);
    console.log('currentUserData:', currentUserData);

    const organization = currentUserData?.tenantId;
    console.log('Matched user data :', organization);

    handleDomainRedirection(organization, navigate, authToken, location.pathname);

  }, [usersData, navigate, location.pathname]);

  return null;
};

export default ProtectedRoute;
