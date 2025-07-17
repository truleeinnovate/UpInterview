import React, { useEffect } from 'react';

const DomainRedirect = () => {
  useEffect(() => {
    // Check if we're on the main domain (not app subdomain)
    const currentHost = window.location.hostname;
    const isMainDomain = currentHost === 'upinterview.io' || currentHost === 'www.upinterview.io';
    
    if (isMainDomain) {
      // Redirect to app subdomain
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      const appUrl = `https://app.upinterview.io${currentPath}`;
      window.location.href = appUrl;
    }
  }, []);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to application...</p>
      </div>
    </div>
  );
};

export default DomainRedirect; 