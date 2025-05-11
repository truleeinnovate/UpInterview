// src/middleware/domainMiddleware.js
import axios from 'axios';
// import { config } from '../config.js';

const checkDomainAccess = async () => {
    const hostname = window.location.hostname;
    console.log('hostname :-', hostname);
    const subdomain = hostname.split('.')[0];
    console.log('Checking domain access for:', subdomain);

    try {
        // const res = await axios.get(
        //   `${config.REACT_APP_API_URL}/api/validate-domain`,
        //   { withCredentials: true }
        // );

        const res = await axios.get(
            `https://backend-001.azurewebsites.net/api/validate-domain`,
            { withCredentials: true }
        );

        console.log('Domain validated:', res.data);
        return res.data.isValid; // backend should respond { isValid: true }
    } catch (err) {
        console.error('Domain access error:', err.message);
        return false;
    }
};

export default checkDomainAccess;
