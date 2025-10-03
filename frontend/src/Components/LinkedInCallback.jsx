import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config.js';
import {
    setAuthCookies, clearAllAuth, getAuthToken,
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
                // Extract returnUrl either directly from query or from OAuth state payload
                let returnUrl = urlParams.get('returnUrl');
                const stateParam = urlParams.get('state');

                if (!returnUrl && stateParam) {
                    try {
                        // state was sent as encodeURIComponent(btoa(JSON.stringify(payload)))
                        const decoded = JSON.parse(atob(decodeURIComponent(stateParam)));
                        if (decoded && typeof decoded === 'object' && decoded.returnUrl) {
                            returnUrl = decoded.returnUrl;
                        }
                    } catch (e) {
                        // fallback attempt without decodeURIComponent if already decoded by browser
                        try {
                            const decoded = JSON.parse(atob(stateParam));
                            if (decoded && typeof decoded === 'object' && decoded.returnUrl) {
                                returnUrl = decoded.returnUrl;
                            }
                        } catch (err) {
                            // ignore malformed state
                            console.warn('Failed to parse state parameter:', err);
                        }
                    }
                }

                if (!code) {
                    throw new Error('No authorization code received from LinkedIn');
                }

                console.log('Initiating LinkedIn callback with URL:', window.location.origin + '/callback');

                // Add retry logic with exponential backoff
                const maxRetries = 3;
                let lastError;
                let response;

                for (let attempt = 0; attempt < maxRetries; attempt++) {
                    try {
                        console.log(`Attempt ${attempt + 1} to connect to LinkedIn API`);
                        response = await axios.post(
                            `${config.REACT_APP_API_URL}/linkedin/check-user`,
                            {
                                code,
                                redirectUri: `${window.location.origin}/callback`
                            },
                            {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                }
                            }
                        );
                        break; // Exit the retry loop on success
                    } catch (error) {
                        lastError = error;
                        console.warn(`Attempt ${attempt + 1} failed:`, error.message);

                        if (attempt === maxRetries - 1) {
                            throw error;
                        }

                        const delay = 1000 * Math.pow(2, attempt);
                        console.log(`Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }

                if (!response) {
                    throw new Error('Failed to get response from LinkedIn API after retries');
                }

                // Handle returnUrl if present
                if (returnUrl) {
                    // Basic validation to ensure returnUrl is for the correct domain
                    const currentDomain = window.location.hostname;
                    const validDomains = [
                        currentDomain,
                        `${config.REACT_APP_API_URL_FRONTEND}`,
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
                    } else if (returnUrl.startsWith('/')) {
                        // Support relative internal paths (e.g., /candidate/view-details/123)
                        const target = `${window.location.origin}${returnUrl}`;
                        console.log('Redirecting to relative returnUrl:', target);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        window.location.href = target;
                        return;
                    }
                }

                const { existingUser, token, email } = response.data;

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

                let errorMessage = 'Failed to process LinkedIn login';

                if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out. The server is taking longer than expected to respond.';
                } else if (error.response?.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (error.message) {
                    errorMessage = error.message;
                }

                setError(errorMessage);

                // Show error message for 5 seconds before redirecting
                setTimeout(() => {
                    navigate('/individual-login', {
                        state: {
                            error: errorMessage,
                            showRetry: true
                        },
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
