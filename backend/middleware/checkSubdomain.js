const Organization = require('../models/Organization');

module.exports = async function (req, res, next) {
  console.log('--- [checkSubdomain] Middleware Invoked ---');
  const host = req.headers.host; // e.g., sgsdfgsd.app.upinterview.io:PORT
  const mainDomain = 'app.upinterview.io';
  console.log('[checkSubdomain] host:', host);

  // Remove port if present
  const hostWithoutPort = host.split(':')[0];
  console.log('[checkSubdomain] hostWithoutPort:', hostWithoutPort);

  // Only check if it's a subdomain (not main domain)
  if (hostWithoutPort.endsWith(mainDomain) && hostWithoutPort !== mainDomain) {
    const subdomain = hostWithoutPort.replace(`.${mainDomain}`, '');
    console.log('[checkSubdomain] Extracted subdomain:', subdomain);
    try {
      const org = await Organization.findOne({
        subdomain: subdomain,
        subdomainStatus: 'active'
      });
      console.log('[checkSubdomain] DB lookup result:', org);
      if (!org) {
        console.log('[checkSubdomain] Subdomain not found or inactive. Returning 404.');
        return res.status(404).end();
      }
      console.log('[checkSubdomain] Subdomain is valid and active. Proceeding.');
    } catch (err) {
      console.error('[checkSubdomain] Error during DB lookup:', err);
      return res.status(500).send('Server error');
    }
  } else {
    console.log('[checkSubdomain] Main domain or unrelated domain. Skipping subdomain check.');
  }
  next();
};
