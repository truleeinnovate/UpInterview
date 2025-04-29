const Organization = require('../models/Organization');

module.exports = async function (req, res, next) {
  const host = req.headers.host; // e.g., sgsdfgsd.app.upinterview.io:PORT
  const mainDomain = 'app.upinterview.io';

  // Remove port if present
  const hostWithoutPort = host.split(':')[0];

  // Only check if it's a subdomain (not main domain)
  if (hostWithoutPort.endsWith(mainDomain) && hostWithoutPort !== mainDomain) {
    const subdomain = hostWithoutPort.replace(`.${mainDomain}`, '');
    try {
      const org = await Organization.findOne({
        subdomain: subdomain,
        subdomainStatus: 'active'
      });
      if (!org) {
        return res.status(404).send('Not found');
      }
    } catch (err) {
      return res.status(500).send('Server error');
    }
  }
  next();
};
