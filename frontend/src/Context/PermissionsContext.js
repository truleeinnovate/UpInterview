// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { config } from '../config';
// import Cookies from 'js-cookie';
// import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
// const PermissionsContext = createContext();

// export const PermissionsProvider = ({ children }) => {

//   const [effectivePermissions, setEffectivePermissions] = useState({});
//   const [superAdminPermissions, setSuperAdminPermissions] = useState(null);
//   const [effectivePermissions_RoleType, setEffectivePermissions_RoleType] = useState(null);
//   const [effectivePermissions_RoleLevel, setEffectivePermissions_RoleLevel] = useState(null);
//   const [effectivePermissions_RoleName, setEffectivePermissions_RoleName] = useState(null);
//   const [impersonatedUser_roleType, setImpersonatedUser_roleType] = useState(null);
//   const [impersonatedUser_roleName, setImpersonatedUser_roleName] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [authError, setAuthError] = useState(null);

//   console.log('effectivePermissions', effectivePermissions);
//   console.log('superAdminPermissions', superAdminPermissions);
//   console.log('effectivePermissions_RoleType', effectivePermissions_RoleType);
//   console.log('effectivePermissions_RoleLevel', effectivePermissions_RoleLevel);
//   console.log('effectivePermissions_RoleName', effectivePermissions_RoleName);
//   console.log('impersonatedUser_roleType', impersonatedUser_roleType);
//   console.log('impersonatedUser_roleName', impersonatedUser_roleName);

//   const refreshPermissions = async () => {
//     try {
//       const tokenPayload = decodeJwt(Cookies.get("authToken"));
//       const userId = tokenPayload?.userId;
//       const orgId = tokenPayload?.tenantId;
//       const impersonationToken = decodeJwt(Cookies.get("impersonationToken"));

//       const headers = {
//         'x-user-id': userId,
//         'x-tenant-id': orgId,
//         'x-impersonation-userid': impersonationToken?.impersonatedUserId || ''
//       };

//       const response = await axios.get(`${config.REACT_APP_API_URL}/users/permissions`, { 
//         headers,
//         withCredentials: true 
//       });
//       console.log('response frontend', response.data);

//       setEffectivePermissions(response.data.effectivePermissions || {});
//       setSuperAdminPermissions(response.data.superAdminPermissions || null);
//       setEffectivePermissions_RoleType(response.data.effectivePermissions_RoleType || null);
//       setEffectivePermissions_RoleLevel(response.data.effectivePermissions_RoleLevel || null);
//       setEffectivePermissions_RoleName(response.data.effectivePermissions_RoleName || null);
//       setImpersonatedUser_roleType(response.data.impersonatedUser_roleType || null);
//       setImpersonatedUser_roleName(response.data.impersonatedUser_roleName || null);
//       setAuthError(null);
//     } catch (error) {
//       console.error('Error refreshing permissions:', error);
//       setEffectivePermissions({});
//       setSuperAdminPermissions(null);
//       setEffectivePermissions_RoleType(null);
//       setEffectivePermissions_RoleLevel(null);
//       setEffectivePermissions_RoleName(null);
//       setImpersonatedUser_roleType(null);
//       setImpersonatedUser_roleName(null);
//       setAuthError('Failed to load permissions');
//     }
//   };

//   useEffect(() => {
//     const initialize = async () => {
//       await refreshPermissions();
//       setLoading(false);
//     };
//     initialize();
//   }, []);

//   return (
//     <PermissionsContext.Provider value={{
//       effectivePermissions,
//       superAdminPermissions,
//       effectivePermissions_RoleType,
//       effectivePermissions_RoleLevel,
//       effectivePermissions_RoleName,
//       impersonatedUser_roleType,
//       impersonatedUser_roleName,
//       loading,
//       authError,
//       refreshPermissions
//     }}>
//       {children}
//     </PermissionsContext.Provider>
//   );
// };

// export const usePermissions = () => useContext(PermissionsContext);

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { config } from '../config';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
import Loading from '../Components/Loading.js';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissionState, setPermissionState] = useState({
    effectivePermissions: {},
    superAdminPermissions: null,
    effectivePermissions_RoleType: null,
    effectivePermissions_RoleLevel: null,
    effectivePermissions_RoleName: null,
    impersonatedUser_roleType: null,
    impersonatedUser_roleName: null,
    loading: true,
    authError: null,
  });

  const refreshPermissions = useCallback(async () => {
    try {
      setPermissionState((prev) => ({ ...prev, loading: true }));

      const authToken = Cookies.get('authToken');
      const impersonationToken = Cookies.get('impersonationToken');
      const tokenPayload = authToken ? decodeJwt(authToken) : null;

      console.log('tokenPayload, impersonationToken frontend :----', tokenPayload, impersonationToken);

      // Send request with cookies only (no headers)
      const response = await axios.get(`${config.REACT_APP_API_URL}/users/permissions`, {
        withCredentials: true, // Ensure cookies are sent with the request
      });

      const permissionData = response.data;

      setPermissionState({
        ...permissionData,
        loading: false,
        authError: null,
      });
    } catch (error) {
      console.error('Permission refresh error:', error);
      setPermissionState((prev) => ({
        ...prev,
        loading: false,
        authError: error.message || 'Failed to load permissions',
      }));
    }
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        if (response.headers['x-permissions-data']) {
          try {
            const permissionData = JSON.parse(response.headers['x-permissions-data']);
            setPermissionState((prev) => ({
              ...prev,
              ...permissionData,
              loading: false,
            }));
          } catch (error) {
            console.error('Error parsing permission headers:', error);
          }
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          setPermissionState((prev) => ({
            ...prev,
            authError: 'Session expired. Please log in again.',
          }));
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <PermissionsContext.Provider value={{ ...permissionState, refreshPermissions }}>
      {permissionState.loading ? <Loading message="Loading..." /> : children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);