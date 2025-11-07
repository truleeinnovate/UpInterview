// src/utils/authHelpers.js
/**
 * ===================================================================
 *  AUTH HELPERS – SINGLE SOURCE OF TRUTH (Pure JS)
 * ===================================================================
 *
 * PURPOSE:
 *   - Provide consistent access to user context across the entire app
 *   - Eliminate repeated JWT decoding and cookie reading
 *   - Support 3 auth states:
 *        1. Normal organization user
 *        2. Super admin (direct login)
 *        3. Super admin IMPERSONATING a user
 *
 * WHY THIS FILE?
 *   - You were decoding tokens in every page → error-prone
 *   - Need both tokens when impersonating → old code cleared one
 *   - Need `updatedBy` = super admin ID during impersonation
 *
 * USAGE:
 *   import { getAuthIds } from '@/utils/authHelpers';
 *   const { actingAsUserId, onBehalfOfUserId } = getAuthIds();
 *
 * WORKS IN:
 *   - React components (with useEffect, etc.)
 *   - API services
 *   - Utility functions
 *   - Background scripts
 *
 * ===================================================================
 */

import Cookies from 'js-cookie';
import { decodeJwt } from './AuthCookieManager/jwtDecode';


/**
 * -------------------------------------------------------------------
 *  MAIN FUNCTION: getAuthIds()
 * -------------------------------------------------------------------
 * Returns an object with every ID and flag needed for API/UI logic.
 * This is the ONLY function you should import and use.
 */
const getAuthIds = () => {
  // -----------------------------------------------------------------
  // 1. READ RAW TOKENS FROM COOKIES
  // -----------------------------------------------------------------
  // `authToken` → effective user (organization user)
  // `impersonationToken` → super admin
  const authToken = Cookies.get('authToken') || '';
  const impersonationToken = Cookies.get('impersonationToken') || '';

  // -----------------------------------------------------------------
  // 2. SAFELY DECODE BOTH TOKENS
  // -----------------------------------------------------------------
  // decodeJwt returns {} if token is invalid/missing → safe
  const authPayload = authToken ? decodeJwt(authToken) : {};
  const impPayload = impersonationToken ? decodeJwt(impersonationToken) : {};

  // -----------------------------------------------------------------
  // 3. DETERMINE IF WE ARE IMPERSONATING
  // -----------------------------------------------------------------
  // Only true when BOTH tokens exist
  const isImpersonating = !!authToken && !!impersonationToken;

  // -----------------------------------------------------------------
  // 4. ACTING-AS CONTEXT (for reads, filters, UI)
  // -----------------------------------------------------------------
  // This is the user whose data we are viewing/editing
  let actingAsUserId = null;
  if (authToken) {
    // Priority 1: authToken = effective user (normal or impersonated)
    actingAsUserId = authPayload.userId || authPayload.id || null;
  } else if (impersonationToken) {
    // Priority 2: super admin direct login
    // Use impersonatedUserId if present, otherwise their own ID
    actingAsUserId = impPayload.impersonatedUserId || impPayload.userId || null;
  }

  // Tenant ID is always from the effective user's token
  const actingAsTenantId = authPayload.tenantId || null;

  // -----------------------------------------------------------------
  // 5. REAL SUPER ADMIN ID (for audit logs)
  // -----------------------------------------------------------------
  // Only available during impersonation
  // This is the ID you send as `updatedBy` when super admin edits user data
  const onBehalfOfUserId = isImpersonating
    ? (impPayload.userId || null) // Real admin ID is in `userId`
    : null;

  // -----------------------------------------------------------------
  // 6. CONVENIENCE FLAGS
  // -----------------------------------------------------------------
  const isSuperAdminOnly = !authToken && !!impersonationToken;
  const isEffectiveOnly = !!authToken && !impersonationToken;

  // -----------------------------------------------------------------
  // 7. RETURN FINAL OBJECT
  // -----------------------------------------------------------------
  return {
    // === CORE IDs ===
    actingAsUserId,        // → Use for: API filters, UI display, data ownership
    actingAsTenantId,      // → Use for: tenant-scoped queries
    onBehalfOfUserId,      // → Use for: audit logs, `updatedBy`
    isImpersonating,       // → Use for: UI warnings, conditional logic

    // === CONVENIENCE FLAGS ===
    isSuperAdminOnly,      // → True: super admin logged in directly
    isEffectiveOnly,       // → True: normal user logged in

    // === DEBUG / ADVANCED ===
    authToken,             // Raw token strings (for headers, debugging)
    impersonationToken,
  };
};

/**
 * ===================================================================
 *  EXPORT
 * ===================================================================
 */
export { getAuthIds };

/**
 * ===================================================================
 *  HOW TO USE IN PRACTICE
 * ===================================================================
 *
 * 1. In any file:
 *    import { getAuthIds } from '@/utils/authHelpers';
 *    const { actingAsUserId, onBehalfOfUserId, isImpersonating } = getAuthIds();
 *
 * 2. FETCH data (reads):
 *    api.get('/profiles', {
 *      params: { userId: actingAsUserId, tenantId: actingAsTenantId }
 *    })
 *
 * 3. UPDATE data (writes):
 *    api.put('/profiles', {
 *      name: 'John',
 *      updatedBy: onBehalfOfUserId ?? actingAsUserId,
 *      updatedByType: isImpersonating ? 'superAdmin' : 'user'
 *    })
 *
 * 4. UI indicator (in React):
 *    {isImpersonating && (
 *      <div style={{background: '#fff3cd', padding: 8}}>
 *        Acting as user <strong>{actingAsUserId}</strong>
 *        (Real admin: {onBehalfOfUserId})
 *      </div>
 *    )}
 *
 * ===================================================================
 *  BACKEND EXPECTATIONS
 * ===================================================================
 *
 * Your backend should accept and store:
 *   - actingAsUserId → for data filtering
 *   - actingAsTenantId → for tenant isolation
 *   - updatedBy → the REAL person who made the change
 *   - updatedByType → 'user' or 'superAdmin'
 *
 * Example DB columns:
 *   updated_by       VARCHAR(50)
 *   updated_by_type  ENUM('user', 'superAdmin')
 *
 * ===================================================================
 */


// const { actingAsUserId, actingAsTenantId, onBehalfOfUserId, isImpersonating } = getAuthIds();
// updatedBy: isImpersonating ? onBehalfOfUserId : actingAsUserId,