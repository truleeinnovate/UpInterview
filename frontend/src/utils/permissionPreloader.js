// // v1.0.0  -  Ashraf  -  increased catch loading time
// import axios from 'axios';
// import { config } from '../config';
// import AuthCookieManager from './AuthCookieManager/AuthCookieManager';

// // Track if permissions have been preloaded to prevent multiple loads
// let permissionsPreloaded = false;

// // Preload permissions to improve performance
// export const preloadPermissions = async () => {
//   try {
//     // Prevent multiple preloads
//     if (permissionsPreloaded) {
//       return null;
//     }

//     const activeToken = AuthCookieManager.getActiveToken();
//     if (!activeToken) {
//       return null;
//     }

//     const userType = AuthCookieManager.getUserType();
//     const permissionsUrl = `${config.REACT_APP_API_URL}/users/permissions`;

//     // console.log('🔄 Preloading permissions for user type:', userType);

//     const response = await axios.get(permissionsUrl, {
//       withCredentials: true,
//       headers: {
//         'Authorization': `Bearer ${activeToken}`
//       }
//     });

//     const permissionData = response.data;
    
//     // Cache the permissions immediately
//     const cacheKey = `permissions_${userType}`;
//     const cacheData = {
//       permissions: permissionData,
//       timestamp: Date.now()
//     };

//     localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
//     // Mark as preloaded
//     permissionsPreloaded = true;
    
//     // console.log('✅ Permissions preloaded and cached successfully');
    
//     return permissionData;
//   } catch (error) {
//     console.warn('Failed to preload permissions:', error);
//     return null;
//   }
// };

// // Check if permissions are cached and valid
// export const hasValidCachedPermissions = () => {
//   try {
//     const userType = AuthCookieManager.getUserType();
//     if (!userType) {
//       return false;
//     }

//     const cacheKey = `permissions_${userType}`;
//     const cached = localStorage.getItem(cacheKey);
    
//     if (!cached) {
//       return false;
//     }

//     const { timestamp } = JSON.parse(cached);
//     const age = Date.now() - timestamp;
//     // <-------------------------------v1.0.0
//     const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
//     // ------------------------------v1.0.0 >
//     const isValid = age < CACHE_DURATION;
    
//     if (isValid) {
//       // console.log('✅ Valid cached permissions found');
//     } else {
//       console.log('❌ Cached permissions expired');
//     }
    
//     return isValid;
//   } catch (error) {
//     console.warn('Error checking cached permissions:', error);
//     return false;
//   }
// };

// // Reset preload flag (useful for testing or logout)
// export const resetPermissionPreload = () => {
//   permissionsPreloaded = false;
// }; 