import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

export const handleDomainRedirection = (organization, navigate, token, path = '') => {
  console.log('Redirecting with:', { organization, token, path });

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  if (tokenPayload.organization === true) {
    console.log('organization?.subdomain', organization?.subdomain);
    if (organization?.subdomain) {
      console.log('1');
      const sub = organization.subdomain;
      // window.location.href = `https://${sub}.app.upinterview.io${path}`;
    } else {
      console.log('2');
      // window.location.href = `https://app.upinterview.io${path}`;
    }
  } else {
    console.log('3');
    // window.location.href = `https://app.upinterview.io${path}`;
  }
};