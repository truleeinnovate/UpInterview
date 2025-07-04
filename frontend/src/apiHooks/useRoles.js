

import axios from 'axios';
import { config } from '../config';

export const getOrganizationRoles = async (type) => {
  try {
    const response = await axios.get(`${config.REACT_APP_API_URL}/getAllRoles`);
    const allRoles = response.data;

    console.log("allRoles", allRoles);

    // Return all roles for super admins, filter for organization roles for effective users
    if (type === 'superAdmin') {
      return allRoles;
    }
    const filteredRoles = allRoles.filter(role => role.roleType === 'organization');
    return filteredRoles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
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