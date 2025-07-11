import Cookies from 'js-cookie';
import { decodeJwt } from './jwtDecode';

// Token keys
const AUTH_TOKEN_KEY = 'authToken';
const IMPERSONATION_TOKEN_KEY = 'impersonationToken';
const USER_TYPE_KEY = 'userType'; // 'superAdmin' or 'effectiveUser'
const IMPERSONATED_USER_KEY = 'impersonatedUser';

// Permission cache keys
const PERMISSIONS_CACHE_KEY = 'app_permissions_cache';
const PERMISSIONS_CACHE_TIMESTAMP = 'app_permissions_timestamp';

class AuthCookieManager {
  // Get auth token (super admin token)
  static getAuthToken() {
    try {
      return Cookies.get(AUTH_TOKEN_KEY);
    } catch (error) {
      console.warn('Error getting auth token:', error);
      return null;
    }
  }

  // Get impersonation token (effective user token)
  static getImpersonationToken() {
    try {
      return Cookies.get(IMPERSONATION_TOKEN_KEY);
    } catch (error) {
      console.warn('Error getting impersonation token:', error);
      return null;
    }
  }

  // Set auth token (super admin)
  static setAuthToken(token) {
    try {
      Cookies.set(AUTH_TOKEN_KEY, token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      this.setUserType('superAdmin');
      console.log('✅ Auth token set successfully');
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Set impersonation token (effective user)
  static setImpersonationToken(token, userData = null) {
    try {
      Cookies.set(IMPERSONATION_TOKEN_KEY, token, {
        expires: 1, // 1 day for impersonation
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      if (userData) {
        localStorage.setItem(IMPERSONATED_USER_KEY, JSON.stringify(userData));
      }
      
      this.setUserType('effectiveUser');
      console.log('✅ Impersonation token set successfully');
    } catch (error) {
      console.error('Error setting impersonation token:', error);
    }
  }

  // Get current user type
  static getUserType() {
    try {
      return localStorage.getItem(USER_TYPE_KEY);
    } catch (error) {
      console.warn('Error getting user type:', error);
      return null;
    }
  }

  // Set user type
  static setUserType(type) {
    try {
      localStorage.setItem(USER_TYPE_KEY, type);
      console.log('✅ User type set to:', type);
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  }

  // Get impersonated user data
  static getImpersonatedUser() {
    try {
      const userData = localStorage.getItem(IMPERSONATED_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Error getting impersonated user:', error);
      return null;
    }
  }

  // Check if user is super admin only
  static isSuperAdminOnly() {
    return !!(this.getAuthToken() && !this.getImpersonationToken());
  }

  // Check if user is effective user only
  static isEffectiveUserOnly() {
    return !!(this.getImpersonationToken() && !this.getAuthToken());
  }

  // Check if user has any valid authentication
  static isAuthenticated() {
    return !!(this.getAuthToken() || this.getImpersonationToken());
  }

  // Get the active token (impersonation token takes precedence)
  static getActiveToken() {
    return this.getImpersonationToken() || this.getAuthToken();
  }

  // Get active user data
  static getActiveUserData() {
    const token = this.getActiveToken();
    if (!token) return null;

    try {
      const decoded = decodeJwt(token);
      return decoded;
    } catch (error) {
      console.warn('Error decoding active token:', error);
      return null;
    }
  }

  // Clear only effective user data (return to super admin)
  static clearEffectiveUser() {
    try {
      // Clear impersonation token and related data
      Cookies.remove(IMPERSONATION_TOKEN_KEY);
      localStorage.removeItem(IMPERSONATED_USER_KEY);
      localStorage.removeItem(PERMISSIONS_CACHE_KEY);
      localStorage.removeItem(PERMISSIONS_CACHE_TIMESTAMP);
      
      // Reset user type to super admin
      this.setUserType('superAdmin');
      
      console.log('✅ Effective user data cleared, returning to super admin');
    } catch (error) {
      console.error('Error clearing effective user data:', error);
    }
  }

  // Login as super admin
  static loginAsSuperAdmin(token) {
    try {
      this.clearAllAuth(); // Clear any existing data
      this.setAuthToken(token);
      console.log('✅ Logged in as super admin');
    } catch (error) {
      console.error('Error logging in as super admin:', error);
    }
  }

  // Login as effective user (direct login)
  static loginAsEffectiveUser(token) {
    try {
      this.clearAllAuth(); // Clear any existing data
      this.setImpersonationToken(token);
      console.log('✅ Logged in as effective user');
    } catch (error) {
      console.error('Error logging in as effective user:', error);
    }
  }

  // Impersonate user (super admin impersonating effective user)
  static impersonateUser(token, userData) {
    try {
      // Keep super admin token, add impersonation token
      this.setImpersonationToken(token, userData);
      console.log('✅ Impersonating user:', userData);
    } catch (error) {
      console.error('Error impersonating user:', error);
    }
  }

  // Complete logout (clear everything)
  static logout(isImpersonating, navigate) {
    try {
      if (isImpersonating) {
        this.clearEffectiveUser();
        navigate("/admin-dashboard");
      } else {
        this.clearAllAuth();
        navigate("/organization-login");
      }
      console.log('✅ Complete logout performed');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Get authentication status summary
  static getAuthStatus() {
    const authToken = this.getAuthToken();
    const impersonationToken = this.getImpersonationToken();
    const userType = this.getUserType();
    const impersonatedUser = this.getImpersonatedUser();

    return {
      hasAuthToken: !!authToken,
      hasImpersonationToken: !!impersonationToken,
      isImpersonating: !!impersonationToken,
      isSuperAdminOnly: this.isSuperAdminOnly(),
      isEffectiveUserOnly: this.isEffectiveUserOnly(),
      isAuthenticated: this.isAuthenticated(),
      userType,
      impersonatedUser,
      activeToken: this.getActiveToken() ? 'present' : 'none'
    };
  }

  // Clear all authentication data
  static clearAllAuth() {
    try {
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
      console.log('✅ All auth data cleared');
    } catch (error) {
      console.error('Error clearing all auth data:', error);
    }
  }

  // Set auth cookies (legacy function)
  static setAuthCookies(data) {
    try {
      if (data.authToken) {
        this.setAuthToken(data.authToken);
      }
      if (data.impersonationToken) {
        this.setImpersonationToken(data.impersonationToken, data.impersonatedUserId);
      }
      console.log('✅ Auth cookies set');
    } catch (error) {
      console.error('Error setting auth cookies:', error);
    }
  }

  // Test cookie functionality (legacy function)
  static testCookieFunctionality() {
    try {
      const authToken = this.getAuthToken();
      const impersonationToken = this.getImpersonationToken();
      return {
        authToken: !!authToken,
        impersonationToken: !!impersonationToken,
        success: true
      };
    } catch (error) {
      console.error('Error testing cookie functionality:', error);
      return { success: false, error: error.message };
    }
  }

  // Debug token sources (legacy function)
  static debugTokenSources() {
    try {
      const authToken = this.getAuthToken();
      const impersonationToken = this.getImpersonationToken();
      const authTokenFromDocument = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='));
      const impersonationTokenFromDocument = document.cookie.split(';').find(cookie => cookie.trim().startsWith('impersonationToken='));
      
      return {
        authToken: !!authToken,
        impersonationToken: !!impersonationToken,
        authTokenFromDocument: !!authTokenFromDocument,
        impersonationTokenFromDocument: !!impersonationTokenFromDocument,
        success: true
      };
    } catch (error) {
      console.error('Error debugging token sources:', error);
      return { success: false, error: error.message };
    }
  }
}

// Named exports for backward compatibility
export const clearAllAuth = AuthCookieManager.clearAllAuth;
export const logout = AuthCookieManager.logout;
export const setAuthCookies = AuthCookieManager.setAuthCookies;
export const testCookieFunctionality = AuthCookieManager.testCookieFunctionality;
export const debugTokenSources = AuthCookieManager.debugTokenSources;
export const getAuthToken = AuthCookieManager.getAuthToken;
export const getImpersonationToken = AuthCookieManager.getImpersonationToken;

export default AuthCookieManager;