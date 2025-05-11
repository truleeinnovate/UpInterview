// src/routes/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import checkDomainAccess from '../middleware/domainMiddleware';

const ProtectedRoute = ({ children }) => {
    const [allowed, setAllowed] = useState(null);

    useEffect(() => {
        console.log('useEffect triggered');
        const verify = async () => {
            console.log('Verifying domain access...');
            const isValid = await checkDomainAccess();
            console.log('Domain access verification result:', isValid);
            setAllowed(isValid);
        };
        verify();
    }, []);

    console.log('Current allowed state:', allowed);

    if (allowed === null) {
        console.log('Allowed is null, showing loading...');
        return <p>Loading...</p>;
    }
    if (!allowed) {
        console.log('Access not allowed, navigating to /404');
        return <Navigate to="/404" />;
    }
    console.log('Access allowed, rendering children');
    return children;
};

export default ProtectedRoute;



// src/routes/ProtectedRoute.js
// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import checkDomainAccess from '../middleware/domainMiddleware';

// const ProtectedRoute = ({ children }) => {
//   const [allowed, setAllowed] = useState(null);

//   useEffect(() => {
//     const verify = async () => {
//       const isValid = await checkDomainAccess();
//       setAllowed(isValid);
//     };
//     verify();
//   }, []);

//   if (allowed === null) return <p>Loading...</p>;
//   if (!allowed) return <Navigate to="/404" />;
//   return children;
// };

// export default ProtectedRoute;

