const jwt = require('jsonwebtoken');
const { Organization } = require('../models/Organization');

const subdomainRedirectMiddleware = async (req, res, next) => {
    try {
        // console.log('[Middleware] Checking for authToken in cookies');

        // 1. Get the auth token from cookies
        const authToken = req.cookies.authToken;

        if (!authToken) {
            // console.log('[Middleware] No authToken found. Skipping redirect.');
            return next(); // Continue if no auth token
        }

        // 2. Decode and verify the JWT
        // console.log('[Middleware] Verifying JWT');
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        // console.log('[Middleware] JWT decoded:', decoded);

        // 3. Check if the token belongs to an organization user
        if (decoded.organization) {
            // console.log('[Middleware] User is an organization user');

            // 4. Get the organization's subdomain and full domain
            const organization = await Organization.findOne({
                tenantId: decoded.tenantId
            }).select('subdomain fullDomain');

            if (organization && organization.subdomain) {
                // console.log('[Middleware] Organization found:', organization);

                // 5. Get the current domain and construct organization subdomain
                const currentDomain = req.headers.host;
                const organizationDomain = `${organization.subdomain}.app.upinterview.io`;

                // console.log('[Middleware] Current domain:', currentDomain);
                // console.log('[Middleware] Expected subdomain:', organizationDomain);

                // 6. If user is on main domain, redirect to subdomain
                if (currentDomain === 'app.upinterview.io') {
                    const redirectUrl = req.originalUrl;
                    const fullUrl = `https://${organizationDomain}${redirectUrl}`;
                    // console.log('[Middleware] Redirecting to subdomain:', fullUrl);

                    // Prevent redirect loop
                    res.cookie('redirected', 'true', { maxAge: 1000 });

                    return res.redirect(302, fullUrl);
                }

                // 7. If already on the subdomain, let the request pass
                else if (currentDomain === organizationDomain) {
                    // console.log('[Middleware] Already on correct subdomain. Proceeding.');
                    return next();
                }

                // 8. If on wrong subdomain
                else {
                    // console.log('[Middleware] On a different domain. No redirection enforced.');
                }
            } else {
                // console.log('[Middleware] No organization found or no subdomain configured');
            }
        } else {
            // console.log('[Middleware] User is not an organization user');
        }

        // 9. If no redirect conditions met, continue normally
        return next();
    } catch (error) {
        // console.error('[Middleware] Error in subdomainRedirectMiddleware:', error);
        return next(); // Continue even if there's an error
    }
};

module.exports = subdomainRedirectMiddleware;