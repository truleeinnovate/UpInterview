import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

export const handleDomainRedirection = (organization, navigate, token, path = '') => {
  console.log('Redirecting with:', { organization, token, path });

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  if (tokenPayload.organization === true) {
    console.log('organization?.subdomain', organization?.subdomain)
    if (organization?.subdomain) {
      const sub = organization.subdomain;
      window.location.href = `https://${sub}.app.upinterview.io/${path}?token=${token}`;
    } else {
      console.log('subdomain not found...')
      navigate(`/${path}`);
    }
  } else {
    console.log('Organization from the cookies is false');
    navigate(`/${path}`);
  }
};