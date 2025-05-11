export const handleDomainRedirection = (organization, contactDataFromOrg, navigate, token) => {
  console.log('Redirecting with:', { organization, contactDataFromOrg, token });

  if (organization?.subdomain) {
    const sub = organization.subdomain;
    const contactData = encodeURIComponent(JSON.stringify(contactDataFromOrg || {}));
    window.location.href = `https://${sub}.app.upinterview.io/home?token=${token}&contactData=${contactData}`;
  } else if (organization?.fullDomain) {
    const full = organization.fullDomain;
    const contactData = encodeURIComponent(JSON.stringify(contactDataFromOrg || {}));
    window.location.href = `https://${full}/home?token=${token}&contactData=${contactData}`;
  } else {
    console.warn("⚠️ No subdomain or fullDomain found in org data.");
    navigate('/home');
  }
};