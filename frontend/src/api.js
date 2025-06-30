// frontend/src/api.js
// import axios from 'axios';

// export const fetchFilterData = async (endpoint, organizationId, userId, roleLevel) => {
//   try {
//     if (!userId) return [];
//     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/${endpoint}`, {
//       params: { tenantId: organizationId, ownerId: userId },
//       headers: { 'X-Role-Level': roleLevel || null } // Pass roleLevel for frontend filtering
//     });
//     return response.data; // Contains { data, permissions, roleLevel }
//   } catch (error) {
//     console.error(`Error fetching ${endpoint}:`, error);
//     return [];
//   }
// };

// Example React Component
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { fetchFilterData } from './api';

// const PermissionContext = createContext();

// export const PermissionProvider = ({ children }) => {
//   const [permissions, setPermissions] = useState({});
//   const [roleLevel, setRoleLevel] = useState(null);

//   useEffect(() => {
//     const organizationId = 'org123'; // Replace with actual tenantId
//     const userId = 'user123'; // Replace with actual userId
//     axios.get('/api/users/permissions').then(response => {
//       setPermissions(response.data.permissions);
//       setRoleLevel(response.data.roleLevel);
//     });
//   }, []);

//   return (
//     <PermissionContext.Provider value={{ permissions, roleLevel }}>
//       {children}
//     </PermissionContext.Provider>
//   );
// };

// export const usePermissions = () => useContext(PermissionContext);

// // Candidate Component
// const CandidatePage = () => {
//   const { permissions, roleLevel } = usePermissions();
//   const [candidates, setCandidates] = useState([]);

//   useEffect(() => {
//     const organizationId = 'org123'; // Replace with actual
//     const userId = 'user123'; // Replace with actual
//     fetchFilterData('candidate', organizationId, userId, roleLevel).then(data => {
//       setCandidates(data.data);
//     });
//   }, [roleLevel]);

//   return (
//     <div>
//       {permissions.Candidate?.View && (
//         <div>
//           <h2>Candidates</h2>
//           {permissions.Candidate?.Create && <button>Add Candidate</button>}
//           <ul>
//             {candidates.map(candidate => (
//               <li key={candidate._id}>
//                 {candidate.firstName} {candidate.lastName}
//                 {permissions.Candidate?.Edit && <button>Edit</button>}
//                 {permissions.Candidate?.Delete && <button>Delete</button>}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };


// new

// frontend/src/api.js
import Cookies from 'js-cookie';
import axios from 'axios';
import { decodeJwt } from './utils/AuthCookieManager/jwtDecode';
import { config } from './config';

export const fetchFilterData = async (endpoint) => {
  try {
let tokenPayload = {};
    const authToken = Cookies.get('authToken') ?? '';
        if(authToken){
    tokenPayload = authToken ? decodeJwt(authToken) : {};
  }

    const userId = tokenPayload?.userId;
    const tenantId = tokenPayload?.tenantId;

    if (!userId || !tenantId) {
      throw new Error('Missing userId or tenantId');
    }

    const response = await axios.get(`${config.REACT_APP_API_URL}/api/${endpoint}`, {
      params: { tenantId, ownerId: userId },
      headers: {
        Authorization: `Bearer ${authToken}`, // Ensure auth token is sent
      },
      withCredentials: true,
    });


    console.log('Response for', endpoint, ':', response.data);

    return response.data.data || []; // Backend returns data in response.data.data
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};
