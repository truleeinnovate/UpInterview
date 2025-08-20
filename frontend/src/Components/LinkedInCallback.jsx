import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config.js';
import { setAuthCookies, clearAllAuth, getAuthToken, 
  // debugCookieState
 } from '../utils/AuthCookieManager/AuthCookieManager.jsx';
import Loading from '../Components/Loading.js';
import { useIndividualLogin } from '../apiHooks/useIndividualLogin';

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredContact, setFilteredContact] = useState(null);

  const fetchAndFilterContacts = async (linkedInEmail) => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/contacts`);
      const allContacts = response.data;
      const filteredContacts = allContacts.filter(contact => contact.email === linkedInEmail);
      
      if (filteredContacts.length > 0) {
        setFilteredContact(filteredContacts[0]);
        return filteredContacts[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return null;
    }
  };

  const fetchTenantByEmail = async (email) => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/tenants/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }
  };

  const determineNavigation = async (contact, token, email) => {
    if (!contact) {
      // No contact found - new user
      return navigate('/select-profession', {
        state: { token, linkedIn_email: email }
      });
    }

    const { completionStatus } = contact;
    
    if (!completionStatus) {
      // No completion status - treat as new user
      return navigate('/select-profession', {
        state: { token, linkedIn_email: email }
      });
    }

    // Check which steps are completed
    const {
      basicDetails,
      additionalDetails,
      interviewDetails,
      availabilityDetails
    } = completionStatus;

    if (!basicDetails) {
      // Basic details not completed - go to select profession
      return navigate('/select-profession', {
        state: { token, linkedIn_email: email }
      });
    }

    if (basicDetails && !additionalDetails) {
      // Only basic details completed - go to complete-profile step 1
      return navigate('/create-profile', {
        state: {
          token,
          linkedIn_email: email,
          currentStep: 1,
          matchedContact: contact,
          Freelancer: true // or determine this from contact data
        }
      });
    }

    if (basicDetails && additionalDetails && !interviewDetails) {
      // Basic and additional completed - go to complete-profile step 2
      return navigate('/create-profile', {
        state: {
          token,
          linkedIn_email: email,
          currentStep: 2,
          matchedContact: contact,
          Freelancer: true
        }
      });
    }

    if (basicDetails && additionalDetails && interviewDetails && !availabilityDetails) {
      // Basic, additional, interview completed - go to complete-profile step 3
      return navigate('/create-profile', {
        state: {
          token,
          linkedIn_email: email,
          currentStep: 3,
          matchedContact: contact,
          Freelancer: true
        }
      });
    }

    if (basicDetails && additionalDetails && interviewDetails && availabilityDetails) {
      // All steps completed - check tenant status
      const tenantResponse = await fetchTenantByEmail(email);
      if (!tenantResponse || !tenantResponse.success) {
        console.error('Failed to fetch tenant data');
        return navigate('/select-profession', {
          state: { token, linkedIn_email: email }
        });
      }
      
      const tenant = tenantResponse.data;
      
      // If tenant status is 'submitted' or 'payment_pending', go to subscription plans
      if (tenant.status === 'submitted' || tenant.status === 'payment_pending') {
        return navigate('/subscription-plans', {
          state: { token, linkedIn_email: email },
          replace: true,
        });
      }
      
      // For any status, default to home
      return navigate('/home', {
        replace: true,
        state: { token, linkedIn_email: email }
      });
    }

    // Default fallback
    return navigate('/select-profession', {
      state: { token, linkedIn_email: email }
    });
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // console.log('🔍 Initial cookie state:', debugCookieState());
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const returnUrl = urlParams.get('returnUrl'); // Extract returnUrl
    
        if (!code) {
          throw new Error('No authorization code received from LinkedIn');
        }
    
        const response = await axios.post(
          `${config.REACT_APP_API_URL}/linkedin/check-user`,
          { code, redirectUri: window.location.origin + '/callback' },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );
    
        const { existingUser, token, email } = response.data;
    
        // Clear all cookies and localStorage before setting new ones
        console.log('🧹 Clearing all auth data');
        await clearAllAuth();
        // console.log('✅ Cleared all cookies and localStorage, post-clear state:', debugCookieState());
    
        // Set the authToken with retries
        if (token) {
          const maxRetries = 3;
          let retries = 0;
          let verified = false;
    
          while (!verified && retries < maxRetries) {
            setAuthCookies({ authToken: token });
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    
            const authToken = getAuthToken();
            // console.log(`🔍 Verification attempt ${retries + 1}, cookie state:`, debugCookieState());
    
            verified = !!authToken;
            if (!verified) {
              console.warn(`Retry ${retries + 1}: authToken not set, re-clearing and re-setting`);
              await clearAllAuth();
            }
            retries++;
          }
    
          if (!verified) {
            throw new Error('Failed to set authToken after retries');
          }
        } else {
          throw new Error('No token received from LinkedIn');
        }
    
        // Handle returnUrl if present
        if (returnUrl) {
          // Basic validation to ensure returnUrl is for the correct domain
          const currentDomain = window.location.hostname;
          const validDomains = [
            currentDomain,
            '.app.upinterview.io',
            ...(process.env.NODE_ENV === 'development' ? ['localhost'] : [])
          ];
          
          // Check if returnUrl starts with a valid protocol and domain
          if (
            returnUrl.startsWith('http://') || 
            returnUrl.startsWith('https://')
          ) {
            const hostname = returnUrl.split('/')[2]; // Extract hostname from URL
            const isValidDomain = validDomains.some(domain => 
              hostname === domain || hostname.endsWith(domain)
            );
            
            if (isValidDomain) {
              console.log('Redirecting to returnUrl:', returnUrl);
              await new Promise(resolve => setTimeout(resolve, 2000));
              window.location.href = returnUrl; // Use returnUrl as-is
              return;
            } else {
              console.warn('Invalid returnUrl domain, proceeding with default navigation');
            }
          } else {
            console.warn('Invalid returnUrl format, proceeding with default navigation');
          }
        }
    
        // Existing navigation logic
        if (existingUser) {
          const contact = await fetchAndFilterContacts(email);
          await determineNavigation(contact, token, email);
        } else {
          navigate('/select-profession', {
            state: {
              linkedIn_email: email,
              token: token
            },
          });
        }
      } catch (error) {
        console.error('Error in LinkedIn callback:', error);
        setError(error.message || 'Failed to process LinkedIn login');
        setTimeout(() => {
          navigate('/login', {
            state: { error: 'LinkedIn login failed. Please try again.' },
          });
        }, 5000);
      } finally {
        setLoading(false);
      }
    };
  
    handleCallback();
  }, [navigate]);

  return (
    <div className="linkedin-callback">
      {loading ? (
        <Loading message="Processing LinkedIn login..." />
      ) : error ? (
        <Loading message={`Error: ${error}. Redirecting to login page...`} />
      ) : null}
    </div>
  );
};

export default LinkedInCallback;