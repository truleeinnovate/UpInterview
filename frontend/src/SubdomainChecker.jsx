import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SubdomainChecker() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubdomain = async () => {
      try {
        // Get the current host (e.g., xyz.app.upinterview.io)
        const host = window.location.host;
        const baseDomain = 'app.upinterview.io';
        const subdomain = host.split(`.${baseDomain}`)[0];

        // Skip check for base domain
        if (!subdomain || subdomain === baseDomain || host === baseDomain) {
          setLoading(false);
          return;
        }

        // Call backend to verify subdomain
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/organization/verify-subdomain/${subdomain}`);

        if (!response.data.success) {
          throw new Error(response.data.message);
        }

        setLoading(false);
      } catch (err) {
        console.error('Subdomain check failed:', err);
        setError(err.message || 'Invalid subdomain');
        navigate('/404'); // Redirect to 404 page
      }
    };

    checkSubdomain();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return null; // The navigate will handle redirection
  }

  return null; // Render nothing, let child components render
}

export default SubdomainChecker;