// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
// import { config } from '../config';
// const PermissionsContext = createContext();

// export const PermissionsProvider = ({ children }) => {
//   const [organization, setOrganization] = useState(false);
//   // const [freelancer, setFreelancer] = useState(false);
//   const [objectPermissionscontext, setObjectPermissions] = useState({});
//   const [tabPermissions, setTabPermissions] = useState({});
//   const [sharingPermissionscontext, setSharingPermissions] = useState({});

//   useEffect(() => {
//     const initialize = async () => {

//       const authToken = Cookies.get("authToken");
//       const tokenPayload = decodeJwt(authToken);

//       const ownerId = tokenPayload?.userId;
//       const tenantId = tokenPayload?.tenantId;

//       let profileResponse, sharesetting;
//       try {
//         const matchedUser = await axios.get(`${config.REACT_APP_API_URL}/auth/users/${ownerId}`);
//         // if (matchedUser.data && matchedUser.data.Name) {
//         //   Cookies.set("userName", matchedUser.data.Name);
//         // }
//         // if (matchedUser.data && matchedUser.data.tenantId) {
//         //   setOrganization(true);
//         //   Cookies.set("organization", "true");
//         // } else {
//         //   setOrganization(false);
//         //   Cookies.set("organization", "false");
//         // }
//         // if (matchedUser.data && matchedUser.data.isFreelancer === 'yes') {
//         //   setFreelancer(true);
//         // } else {
//         //   setFreelancer(false);
//         // }
//         if (matchedUser.data) {
//           if (!organization) {
//             profileResponse = await axios.get(`${config.REACT_APP_API_URL}/profiles/individualProfile`);


//             const sharingResponse = await axios.get(`${config.REACT_APP_API_URL}/sharingSettings/individual`);
//             sharesetting = sharingResponse.data;
//           } else {
//             profileResponse = await axios.get(`${config.REACT_APP_API_URL}/api/profiles/${matchedUser.data.ProfileId}`);
//             const sharingResponse = await axios.get(`${config.REACT_APP_API_URL}/api/sharing-settings`);
//             sharesetting = sharingResponse.data.filter(profile => profile.organizationId === tenantId);
//           }

//           const newObjectPermissions = {
//             candidate: getObjectPermissions(profileResponse.data[0], 'Candidates'),
//             position: getObjectPermissions(profileResponse.data[0], 'Positions'),
//             team: getObjectPermissions(profileResponse.data[0], 'Teams'),
//             assessment: getObjectPermissions(profileResponse.data[0], 'Assessments'),
//             analytics: getObjectPermissions(profileResponse.data[0], 'Analytics'),
//             billing: getObjectPermissions(profileResponse.data[0], 'Billing'),
//             questionBank: getObjectPermissions(profileResponse.data[0], 'QuestionBank'),
//             interviews: getObjectPermissions(profileResponse.data[0], 'Interviews'),
//             mockInterviews: getObjectPermissions(profileResponse.data[0], 'MockInterviews'),
//             roles: getObjectPermissions(profileResponse.data[0], 'Roles'),
//             skills: getObjectPermissions(profileResponse.data[0], 'Skills'),
//             technologyMaster: getObjectPermissions(profileResponse.data[0], 'TechnologyMaster'),
//             roleMAster: getObjectPermissions(profileResponse.data[0], 'RoleMAster'),
//             industries: getObjectPermissions(profileResponse.data[0], 'Industries'),
//             interviewGroup: getObjectPermissions(profileResponse.data[0], 'InterviewGroups'),
//             pushNotification: getObjectPermissions(profileResponse.data[0], 'PushNotification'),
//           };
//           setObjectPermissions(newObjectPermissions);

//           const newTabPermissions = {
//             candidate: getTabPermissions(profileResponse.data[0], 'Candidates'),
//             position: getTabPermissions(profileResponse.data[0], 'Positions'),
//             team: getTabPermissions(profileResponse.data[0], 'Teams'),
//             assessment: getTabPermissions(profileResponse.data[0], 'Assessments'),
//             billing: getTabPermissions(profileResponse.data[0], 'Billing'),
//             questionBank: getTabPermissions(profileResponse.data[0], 'QuestionBank'),
//             mockInterviews: getTabPermissions(profileResponse.data[0], 'MockInterviews'),
//             interviews: getTabPermissions(profileResponse.data[0], 'Interviews'),
//             analytics: getTabPermissions(profileResponse.data[0], 'Analytics'),
//             interviewGroup: getTabPermissions(profileResponse.data[0], 'InterviewGroups'),
//             pushNotification: getTabPermissions(profileResponse.data[0], 'PushNotification'),
//           };
//           setTabPermissions(newTabPermissions);

//           const newSharingPermissions = {
//             candidate: getSharingPermissions(sharesetting, 'Candidates'),
//             position: getSharingPermissions(sharesetting, 'Positions'),
//             team: getSharingPermissions(sharesetting, 'Teams'),
//             assessment: getSharingPermissions(sharesetting, 'Assessments'),
//             billing: getSharingPermissions(sharesetting, 'Billing'),
//             questionBank: getSharingPermissions(sharesetting, 'QuestionBank'),
//             interviews: getSharingPermissions(sharesetting, 'Interviews'),
//             mockInterviews: getSharingPermissions(sharesetting, 'MockInterviews'),
//             roles: getSharingPermissions(sharesetting, 'Roles'),
//             skills: getSharingPermissions(sharesetting, 'Skills'),
//             technologyMaster: getSharingPermissions(sharesetting, 'TechnologyMaster'),
//             roleMAster: getSharingPermissions(sharesetting, 'RoleMAster'),
//             industries: getSharingPermissions(sharesetting, 'Industries'),
//             interviewGroup: getSharingPermissions(sharesetting, 'InterviewGroups'),
//             pushNotification: getSharingPermissions(sharesetting, 'PushNotification'),
//           };
//           setSharingPermissions(newSharingPermissions);
//         }

//       } catch (error) {
//         // console.error('Error fetching authorization details:', error);
//       }
//     };

//     initialize();
//   }, [organization]);

//   return (
//     <PermissionsContext.Provider value={{
//       // userProfile,
//       // setUserProfile,
//       // userRole,
//       // setUserRole,
//       // sharingSettings,
//       // setSharingSettings,
//       organization,
//       setOrganization,
//       // freelancer,
//       // setFreelancer,
//       objectPermissionscontext,
//       // setObjectPermissions,
//       tabPermissions,
//       // setTabPermissions,
//       sharingPermissionscontext,
//       // setSharingPermissions
//     }}>
//       {children}
//     </PermissionsContext.Provider>
//   );
// };

// export const usePermissions = () => useContext(PermissionsContext);

// const getObjectPermissions = (userProfile, objName) => {
//   if (!userProfile || !userProfile.Objects) {
//     return null;
//   }
//   const object = userProfile.Objects.find(obj => obj.name === objName);
//   return object ? object.permissions : null;
// };

// const getTabPermissions = (userProfile, tabName) => {
//   if (!userProfile) {
//     return null;
//   }
//   const Tabs = userProfile.Tabs;
//   if (!Tabs) {
//     return null;
//   }
//   const tab = Tabs.find(tab => tab.name === tabName);
//   return tab;
// };

// const getSharingPermissions = (sharesetting, tabName) => {
//   if (!sharesetting) {
//     return null;
//   }
//   const accessBody = sharesetting[0]?.accessBody;
//   if (!accessBody) {
//     return null;
//   }
//   const tab = accessBody.find(setting => setting.ObjName === tabName);
//   return tab;
// };




import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});

  // const [roleLevel, setRoleLevel] = useState(null);
  // const [isImpersonating, setIsImpersonating] = useState(false);
  // const [roleType, setRoleType] = useState(null);

  // console.log('permissions', permissions);
  // console.log('roleLevel', roleLevel);
  // console.log('isImpersonating', isImpersonating);
  // console.log('roleType', roleType);




  // const refreshPermissions = () => {
  //   axios.get(`${config.REACT_APP_API_URL}/users/permissions`).then(response => {
  //     setPermissions(response.data.permissions);
  //     setRoleLevel(response.data.roleLevel);
  //     setIsImpersonating(response.data.isImpersonating);
  //     setRoleType(response.data.roleType);
  //   });
  // };

  // useEffect(() => {
  //   refreshPermissions();
  // }, []);

  const [effectivePermissions, setEffectivePermissions] = useState({});
  const [superAdminPermissions, setSuperAdminPermissions] = useState(null);
  // const [inheritedRoleIds, setInheritedRoleIds] = useState([]);
  // const [isImpersonating, setIsImpersonating] = useState(false);
  // const [roleType, setRoleType] = useState(null);
  // const [roleLevel, setRoleLevel] = useState(null);
  // const [tenants, setTenants] = useState([]);
  // const [users, setUsers] = useState([]);
  // const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  console.log('effectivePermissions', effectivePermissions);
  console.log('superAdminPermissions', superAdminPermissions);
  // console.log('inheritedRoleIds', inheritedRoleIds);
  // console.log('isImpersonating', isImpersonating);
  // console.log('roleType', roleType);
  // console.log('roleLevel', roleLevel);


  const refreshPermissions = async () => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/users/permissions`, { withCredentials: true });
      setEffectivePermissions(response.data.effectivePermissions || {});
      setSuperAdminPermissions(response.data.superAdminPermissions || null);
      // setInheritedRoleIds(response.data.inheritedRoleIds || []);
      // setIsImpersonating(response.data.isImpersonating || false);
      // setRoleType(response.data.roleType || null);
      // setRoleLevel(response.data.roleLevel || null);
      setAuthError(null);
    } catch (error) {
      console.error('Error refreshing permissions:', error);
      setEffectivePermissions({});
      setSuperAdminPermissions(null);
      // setInheritedRoleIds([]);
      // setIsImpersonating(false);
      // setRoleType(null);
      // setRoleLevel(null);
      setAuthError('Failed to load permissions');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await refreshPermissions();
      setLoading(false);
    };
    initialize();
  }, []);

  return (
    <PermissionsContext.Provider value={{
      effectivePermissions,
      superAdminPermissions,
      // inheritedRoleIds,
      // isImpersonating,
      // roleType,
      // roleLevel,
      // tenants,
      // users,
      // selectedTenant,
      // setSelectedTenant,
      // fetchUsers,
      // startImpersonation,
      // endImpersonation,
      // login,
      // logout,
      loading,
      authError
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);


// example code to use


// const App = () => {
//   const { permissions, isImpersonating, roleType, refreshPermissions } = usePermissions();

//   const handleImpersonate = (userId) => {
//     refreshPermissions();
//   };

//   const handleLogout = async () => {
//     if (isImpersonating) {
//       await endImpersonation();
//       refreshPermissions();
//     } else {
//       // Regular logout
//       document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
//       document.cookie = 'tenantId=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
//     }
//   };

//   return (
//     <BrowserRouter>
//       <PermissionProvider>
//         <Switch>
//           <Route path="/super-admin">
//             {permissions.SuperAdmin?.ViewTenants ? (
//               <SuperAdminDashboard onImpersonate={handleImpersonate} />
//             ) : (
//               <Redirect to="/login" />
//             )}
//           </Route>
//           <Route path="/candidates">
//             {['organization', 'individual'].includes(roleType) ? (
//               <CandidatePage />
//             ) : (
//               <Redirect to="/login" />
//             )}
//           </Route>
//           <Route path="/login">
//             {/* Login component */}
//             <div>Login Page</div>
//           </Route>
//           <Route path="/">
//             <Redirect to={permissions.SuperAdmin?.ViewTenants ? '/super-admin' : '/candidates'} />
//           </Route>
//         </Switch>
//         {isImpersonating && (
//           <button onClick={handleLogout}>End Impersonation</button>
//         )}
//       </PermissionProvider>
//     </BrowserRouter>
//   );
// };

// // Sample CandidatePage
// const CandidatePage = () => {
//   const { permissions, roleLevel, roleType } = usePermissions();
//   const [candidates, setCandidates] = useState([]);

//   useEffect(() => {
//     const tenantId = 'tenant123'; // Replace with actual
//     const userId = 'user123'; // Replace with actual
//     fetchFilterData('candidate', tenantId, userId, roleLevel).then(data => {
//       setCandidates(data.data);
//     });
//   }, [roleLevel, roleType]);

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

// export default App;

// const getObjectPermissions = (userProfile, objName) => {
//   if (!userProfile || !userProfile.Objects) {
//     return null;
//   }
//   const object = userProfile.Objects.find(obj => obj.name === objName);
//   return object ? object.permissions : null;
// };

// const getTabPermissions = (userProfile, tabName) => {
//   if (!userProfile) {
//     return null;
//   }
//   const Tabs = userProfile.Tabs;
//   if (!Tabs) {
//     return null;
//   }
//   const tab = Tabs.find(tab => tab.name === tabName);
//   return tab;
// };

// const getSharingPermissions = (sharesetting, tabName) => {
//   if (!sharesetting) {
//     return null;
//   }
//   const accessBody = sharesetting[0]?.accessBody;
//   if (!accessBody) {
//     return null;
//   }
//   const tab = accessBody.find(setting => setting.ObjName === tabName);
//   return tab;
// };
