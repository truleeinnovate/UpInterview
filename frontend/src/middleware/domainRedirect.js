import Cookies from "js-cookie";
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';

// export const handleDomainRedirection = (organization, navigate, token, path = '') => {
//   console.log('Redirecting with:', { organization, token, path });

//   const authToken = Cookies.get("authToken");
//   const tokenPayload = decodeJwt(authToken);

//   if (tokenPayload.organization === true) {
//     console.log('organization?.subdomain', organization?.subdomain);
//     if (organization?.subdomain) {
//       console.log('1');
//       const sub = organization.subdomain;
//       window.location.href = `https://${sub}.app.upinterview.io${path}`;
//     } else {
//       console.log('2');
//       window.location.href = `https://app.upinterview.io${path}`;
//     }
//   } else {
//     console.log('3');
//     window.location.href = `https://app.upinterview.io${path}`;
//   }
// };


export const handleDomainRedirection = (organization, navigate, token, path = '') => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  
  const currentDomain = window.location.hostname;
  let targetDomain;

  if (tokenPayload.organization === true && organization?.subdomain) {
    targetDomain = `${organization.subdomain}.app.upinterview.io`;
  } else {
    targetDomain = 'app.upinterview.io';
  }

  // Only redirect if we're not already on the correct domain
  if (!currentDomain.includes(targetDomain)) {
    window.location.href = `https://${targetDomain}${path}`;
  }
};