

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { config } from '../config';

export const useRolesQuery = (type) => {
  return useQuery({
    queryKey: ['roles', type],
    queryFn: async () => {
      console.log(`Fetching roles for type=${type}`);
      const response = await axios.get(`${config.REACT_APP_API_URL}/getAllRoles`);
      const allRoles = response.data;
      console.log('All roles fetched:', allRoles);

      if (type === 'superAdmin') {
        const filteredRoles = allRoles.filter(role => role.roleType === 'internal');
        console.log(`Filtered roles for superAdmin:`, filteredRoles);
        return filteredRoles;
      } else {
        const filteredRoles = allRoles.filter(role => role.roleType === 'organization');
        console.log(`Filtered roles for ${type}:`, filteredRoles);
        return filteredRoles;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry twice before failing
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