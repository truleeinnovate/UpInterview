// middleware/authContext.js
/**
 * ==============================================================
 *  AUTH CONTEXT MIDDLEWARE (Node / Express)
 * ==============================================================
 *
 * What it does (exactly the same as src/utils/authHelpers.js):
 *   1. Reads `authToken` and `impersonationToken` from cookies
 *   2. Falls back to Authorization: Bearer <token>
 *   3. Safely decodes both JWTs (jwt.decode – no verification)
 *   4. Exposes a **single, predictable object** on `res.locals.auth`
 *
 * Exported values (available in every downstream route / middleware):
 *   • actingAsUserId      – user whose data we are reading/editing
 *   • actingAsTenantId    – tenant scope (only from authToken)
 *   • onBehalfOfUserId    – **real** super-admin id (audit)
 *   • isImpersonating     – true when BOTH tokens exist
 *   • isSuperAdminOnly    – true when only impersonationToken
 *   • isEffectiveOnly     – true when only authToken
 *   • authToken / impersonationToken (raw strings)
 *
 * USE:
 *   app.use(authContextMiddleware);
 *   // then any route / middleware can read:  const { actingAsUserId, ... } = res.locals.auth;
 *
 * ==============================================================
 */

const jwt = require('jsonwebtoken');

const authContextMiddleware = (req, res, next) => {
  try {
    // -----------------------------------------------------------------
    // 1. READ COOKIES
    // -----------------------------------------------------------------
    let authToken = req.cookies.authToken || '';
    let impersonationToken = req.cookies.impersonationToken || '';

    console.log("authToken", authToken);
    console.log("impersonationToken", impersonationToken);

    // -----------------------------------------------------------------
    // 2. FALLBACK: Authorization header (Bearer token)
    // -----------------------------------------------------------------
    if (!authToken && !impersonationToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        try {
          const decoded = jwt.decode(token) || {};
          if (decoded.impersonatedUserId) {
            impersonationToken = token;
          } else if (decoded.userId && decoded.tenantId) {
            authToken = token;
          }
          // if we can't decide – just leave both empty
        } catch (e) {
          console.warn('[authContext] Invalid JWT in Authorization header', e.message);
        }
      }
    }

    // -----------------------------------------------------------------
    // 3. SAFELY DECODE PAYLOADS
    // -----------------------------------------------------------------
    const authPayload = authToken ? jwt.decode(authToken) || {} : {};
    const impPayload = impersonationToken ? jwt.decode(impersonationToken) || {} : {};

    // -----------------------------------------------------------------
    // 4. FLAGS
    // -----------------------------------------------------------------
    const isImpersonating = !!authToken && !!impersonationToken;
    const isSuperAdminOnly = !authToken && !!impersonationToken;
    const isEffectiveOnly = !!authToken && !impersonationToken;

    // -----------------------------------------------------------------
    // 5. ACTING-AS CONTEXT (for reads / filters)
    // -----------------------------------------------------------------
    let actingAsUserId = null;
    if (authToken) {
      actingAsUserId = authPayload.userId || authPayload.id || null;
    } else if (impersonationToken) {
      actingAsUserId = impPayload.impersonatedUserId || impPayload.userId || null;
    }

    const actingAsTenantId = authPayload.tenantId || null;

    // -----------------------------------------------------------------
    // 6. REAL SUPER-ADMIN ID (for audit)
    // -----------------------------------------------------------------
    const onBehalfOfUserId = isImpersonating ? (impPayload.userId || null) : null;

    // -----------------------------------------------------------------
    // 7. ATTACH TO res.locals
    // -----------------------------------------------------------------
    res.locals.auth = {
      actingAsUserId,
      actingAsTenantId,
      onBehalfOfUserId,
      isImpersonating,
      isSuperAdminOnly,
      isEffectiveOnly,
      authToken,
      impersonationToken,
    };

    console.log("res.locals.auth", res.locals.auth);

    // -----------------------------------------------------------------
    // 8. CONTINUE
    // -----------------------------------------------------------------
    next();
  } catch (err) {
    console.error('[authContext] Unexpected error:', err);
    // Even on error we provide a safe empty object – never crash the request
    res.locals.auth = {
      actingAsUserId: null,
      actingAsTenantId: null,
      onBehalfOfUserId: null,
      isImpersonating: false,
      isSuperAdminOnly: false,
      isEffectiveOnly: false,
      authToken: '',
      impersonationToken: '',
    };
    next();
  }
};

module.exports = { authContextMiddleware };