

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';
import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

export const useRolesQuery = (filters = {}) => {
  const userType = AuthCookieManager.getUserType();
  
  return useQuery({
    queryKey: ['roles', userType, filters],
    queryFn: async () => {
      // console.log(`Fetching roles for userType=${userType}`);
      const response = await axios.get(`${config.REACT_APP_API_URL}/getAllRoles`);
      const allRoles = response.data;
      // console.log('All roles fetched:', allRoles);

      if (userType === 'superAdmin') {
        const filteredRoles = allRoles.filter(role => role.roleType === 'internal');
        // console.log(`Filtered roles for superAdmin:`, filteredRoles);
        return filteredRoles;
      } else {
        const filteredRoles = allRoles.filter(role => role.roleType === 'organization');
        // console.log(`Filtered roles for ${userType}:`, filteredRoles);
        return filteredRoles;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2, // Retry twice before failing
    enabled: !!userType, // Only run query if userType is available
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};


// const [currentRole, setCurrentRole] = useState([]);
    // useEffect(() => {
    //   const fetchRoles = async () => {
    //     try {
    //       const response = await axios.get(
    //         `${config.REACT_APP_API_URL}/getAllRoles`
    //       );
    //       const roles_res = response.data
    //         //  console.log("response before filter",roles_res);
         
    //       const filteredRoles = roles_res.filter((role) => {
    //         if (role.roleType === "organization"){
    //           return role
  
    //         }
    //       })
    //       // console.log("response",filteredRoles);
          
          
    //       setCurrentRole(filteredRoles);
    //     } catch (error) {
    //       console.error("Error fetching roles:", error);
    //     }
    //   };
  
    //   if (tenantId) {
    //     fetchRoles();
    //   }
    // }, [tenantId]);