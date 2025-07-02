import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
import Cookies from 'js-cookie';
import { decodeJwt } from '../utils/AuthCookieManager/jwtDecode';
const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {

  const [effectivePermissions, setEffectivePermissions] = useState({});
  const [superAdminPermissions, setSuperAdminPermissions] = useState(null);
  const [effectivePermissions_RoleType, setEffectivePermissions_RoleType] = useState(null);
  const [effectivePermissions_RoleLevel, setEffectivePermissions_RoleLevel] = useState(null);
  const [effectivePermissions_RoleName, setEffectivePermissions_RoleName] = useState(null);
  const [impersonatedUser_roleType, setImpersonatedUser_roleType] = useState(null);
  const [impersonatedUser_roleName, setImpersonatedUser_roleName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  console.log('effectivePermissions', effectivePermissions);
  console.log('superAdminPermissions', superAdminPermissions);
  console.log('effectivePermissions_RoleType', effectivePermissions_RoleType);
  console.log('effectivePermissions_RoleLevel', effectivePermissions_RoleLevel);
  console.log('effectivePermissions_RoleName', effectivePermissions_RoleName);
  console.log('impersonatedUser_roleType', impersonatedUser_roleType);
  console.log('impersonatedUser_roleName', impersonatedUser_roleName);

  const refreshPermissions = async () => {
    try {
      const tokenPayload = decodeJwt(Cookies.get("authToken"));
      const userId = tokenPayload?.userId;
      const orgId = tokenPayload?.tenantId;
      const impersonationToken = decodeJwt(Cookies.get("impersonationToken"));
  
      const headers = {
        'x-user-id': userId,
        'x-tenant-id': orgId,
        'x-impersonation-token': impersonationToken?.impersonatedUserId || ''
      };
  
      const response = await axios.get(`${config.REACT_APP_API_URL}/users/permissions`, { 
        headers,
        withCredentials: true 
      });
      console.log('response frontend', response.data);
      
      setEffectivePermissions(response.data.effectivePermissions || {});
      setSuperAdminPermissions(response.data.superAdminPermissions || null);
      setEffectivePermissions_RoleType(response.data.effectivePermissions_RoleType || null);
      setEffectivePermissions_RoleLevel(response.data.effectivePermissions_RoleLevel || null);
      setEffectivePermissions_RoleName(response.data.effectivePermissions_RoleName || null);
      setImpersonatedUser_roleType(response.data.impersonatedUser_roleType || null);
      setImpersonatedUser_roleName(response.data.impersonatedUser_roleName || null);
      setAuthError(null);
    } catch (error) {
      console.error('Error refreshing permissions:', error);
      setEffectivePermissions({});
      setSuperAdminPermissions(null);
      setEffectivePermissions_RoleType(null);
      setEffectivePermissions_RoleLevel(null);
      setEffectivePermissions_RoleName(null);
      setImpersonatedUser_roleType(null);
      setImpersonatedUser_roleName(null);
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
      effectivePermissions_RoleType,
      effectivePermissions_RoleLevel,
      effectivePermissions_RoleName,
      impersonatedUser_roleType,
      impersonatedUser_roleName,
      loading,
      authError,
      refreshPermissions
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);