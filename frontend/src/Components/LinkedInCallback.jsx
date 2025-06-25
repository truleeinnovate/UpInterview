import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config.js';
import { setAuthCookies } from '../utils/AuthCookieManager/AuthCookieManager.jsx';
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
      return navigate('/complete-profile', {
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
      return navigate('/complete-profile', {
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
      return navigate('/complete-profile', {
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
      
      // // For active users, go to home
      // if (tenant.status === 'active') {
      //   console.log('Tenant is active, navigating to home');
      //   return navigate('/home', { replace: true });
      // }
      
      // For any other status, default to home
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
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

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

        // Set the authToken cookie
        if (token) {
          Cookies.set('authToken', token, { expires: 7, secure: true, sameSite: 'strict' });
        }

        if (existingUser) {
          // Check if we have a contact for this user
          const contact = await fetchAndFilterContacts(email);
          await determineNavigation(contact, token, email);
        } else {
          // New user - go to select profession
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
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  // useEffect(() => {
  //   let timer;
  //   if (error) {
  //     timer = setTimeout(() => {
  //       navigate('/login', {
  //         state: { error: 'LinkedIn login failed. Please try again.' },
  //       });
  //     }, 5000);
  //   }
  //   return () => clearTimeout(timer);
  // }, [error, navigate]);

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
