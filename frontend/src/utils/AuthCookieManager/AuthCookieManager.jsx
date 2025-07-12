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
    console.log('🔑 setAuthToken called with token:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });
    
    try {
      console.log('🍪 Setting cookie with key:', AUTH_TOKEN_KEY);
      Cookies.set(AUTH_TOKEN_KEY, token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      console.log('👤 Setting user type to superAdmin');
      this.setUserType('superAdmin');
      
      // Verify the cookie was set
      const savedToken = Cookies.get(AUTH_TOKEN_KEY);
      console.log('✅ Auth token set successfully. Verification:', {
        cookieExists: !!savedToken,
        tokenMatches: savedToken === token
      });
    } catch (error) {
      console.error('❌ Error setting auth token:', error);
    }
  }

  // Set impersonation token (effective user)
  static setImpersonationToken(token, userData = null) {
    console.log('👤 setImpersonationToken called with:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      hasUserData: !!userData,
      userData: userData
    });
    
    try {
      console.log('🍪 Setting impersonation cookie with key:', IMPERSONATION_TOKEN_KEY);
      Cookies.set(IMPERSONATION_TOKEN_KEY, token, {
        expires: 1, // 1 day for impersonation
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      if (userData) {
        console.log('💾 Storing user data in localStorage');
        localStorage.setItem(IMPERSONATED_USER_KEY, JSON.stringify(userData));
      }
      
      console.log('👤 Setting user type to effectiveUser');
      AuthCookieManager.setUserType('effectiveUser');
      
      // Verify the cookie was set
      const savedToken = Cookies.get(IMPERSONATION_TOKEN_KEY);
      console.log('✅ Impersonation token set successfully. Verification:', {
        cookieExists: !!savedToken,
        tokenMatches: savedToken === token
      });
    } catch (error) {
      console.error('❌ Error setting impersonation token:', error);
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
      AuthCookieManager.setUserType('superAdmin');
      
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

  // Login as user (super admin switching to user account)
  static loginAsUser(authToken, userData) {
    try {
      console.log('🔄 Login as user - keeping super admin session and adding user impersonation');
      
      // Keep super admin auth token, set user token as impersonation token
      console.log('👤 Setting user token as impersonation token');
      AuthCookieManager.setImpersonationToken(authToken, userData);
      
      console.log('✅ Login as user completed successfully - super admin session preserved');
    } catch (error) {
      console.error('❌ Error during login as user:', error);
    }
  }

  // Return to super admin (clear impersonation, keep super admin session)


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
    console.log('🍪 setAuthCookies called with data:', {
      hasAuthToken: !!data.authToken,
      hasImpersonationToken: !!data.impersonationToken,
      userId: data.userId,
      tenantId: data.tenantId,
      organization: data.organization
    });
    
    try {
      // Check current state
      const currentAuthToken = AuthCookieManager.getAuthToken();
      const currentImpersonationToken = AuthCookieManager.getImpersonationToken();
      console.log('🔍 Current state before setting cookies:', {
        hasAuthToken: !!currentAuthToken,
        hasImpersonationToken: !!currentImpersonationToken
      });
      
      if (data.authToken) {
        console.log('🔑 Setting auth token...');
        AuthCookieManager.setAuthToken(data.authToken);
        console.log('✅ Auth token set successfully');
      } else {
        console.log('⚠️ No auth token provided in data');
      }
      
      if (data.impersonationToken) {
        console.log('👤 Setting impersonation token...');
        AuthCookieManager.setImpersonationToken(data.impersonationToken, data.impersonatedUserId);
        console.log('✅ Impersonation token set successfully');
      } else {
        console.log('⚠️ No impersonation token provided in data');
      }
      
      // Check final state
      const finalAuthToken = AuthCookieManager.getAuthToken();
      const finalImpersonationToken = AuthCookieManager.getImpersonationToken();
      console.log('🔍 Final state after setting cookies:', {
        hasAuthToken: !!finalAuthToken,
        hasImpersonationToken: !!finalImpersonationToken
      });
      
      console.log('✅ Auth cookies set successfully');
    } catch (error) {
      console.error('❌ Error setting auth cookies:', error);
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
      const authToken = AuthCookieManager.getAuthToken();
      const impersonationToken = AuthCookieManager.getImpersonationToken();
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
export const loginAsUser = AuthCookieManager.loginAsUser;

export default AuthCookieManager;