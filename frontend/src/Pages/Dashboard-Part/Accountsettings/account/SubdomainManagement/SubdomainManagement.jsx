import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, PencilIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import Cookies from 'js-cookie'
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { config } from '../../../../../config';
import { usePermissions } from '../../../../../Context/PermissionsContext';
import { usePermissionCheck } from '../../../../../utils/permissionUtils';
import toast from 'react-hot-toast';

const DomainManagement = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const { effectivePermissions } = usePermissions();
  const [subdomain, setSubdomain] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState(null)
  const baseDomain = 'app.upinterview.io'
  const [activeDomain, setActiveDomain] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newSubdomain, setNewSubdomain] = useState('')
  const [newAvailability, setNewAvailability] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Organization ID from state
  //const organizationId = '66fbb040eebb7de70b317ca1'

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const organizationId = tokenPayload.tenantId;
  console.log("organizationId in subdomainmanagement", organizationId);
  const validateSubdomain = (subdomain) => {
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/
    return subdomainRegex.test(subdomain)
  }

  // Fetch organization subdomain on component mount
  useEffect(() => {
    const fetchSubdomain = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${config.REACT_APP_API_URL}/organization/subdomain/${organizationId}`)

        if (response.data.success && response.data.organization.subdomain) {
          setActiveDomain({
            //id: response.data.organization.id,
            subdomain: response.data.organization.subdomain,
            fullDomain: response.data.organization.fullDomain,
            subdomainStatus: response.data.organization.subdomainStatus,
            subdomainAddedDate: response.data.organization.subdomainAddedDate,
            subdomainLastVerified: response.data.organization.subdomainStatus === 'active' ? new Date().toISOString() : null
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching subdomain:', error)
        setError('Failed to fetch subdomain information')
        setLoading(false)
      }
    }

    fetchSubdomain()
  }, [organizationId])

  const checkSubdomainAvailability = async (value, setAvail) => {
    if (!value) return

    if (!validateSubdomain(value)) {
      setAvail({
        available: false,
        message: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens. Must start and end with alphanumeric characters.'
      })
      return
    }

    setIsChecking(true)
    try {
      const response = await axios.post(`${config.REACT_APP_API_URL}/organization/check-subdomain`, { subdomain: value })
      setAvail({
        available: response.data.available,
        message: response.data.message.includes('available')
          ? `${value}.${baseDomain} is available`
          : `${value}.${baseDomain} is already taken`
      })
    } catch (error) {
      console.error('Error checking subdomain availability:', error)
      setAvail({
        available: false,
        message: 'Error checking availability. Please try again.'
      })
    } finally {
      setIsChecking(false)
    }
  }

  const activateSubdomain = async () => {
    if (!subdomain || !availability?.available) return

    try {
      setLoading(true)
      const subdomainAddedDate = new Date().toISOString();
      const response = await axios.post(`${config.REACT_APP_API_URL}/organization/update-subdomain`, {
        organizationId,
        subdomain: subdomain.toLowerCase(),
        baseDomain,
        subdomainStatus: 'active', // Set to active immediately
        subdomainAddedDate,
        subdomainLastVerified: new Date().toISOString()
      })

      if (response.data.success) {
        const newDomain = {
          subdomain: response.data.organization.subdomain,
          fullDomain: response.data.organization.fullDomain,
          subdomainStatus: response.data.organization.subdomainStatus,
          subdomainAddedDate: response.data.organization.subdomainAddedDate,
          subdomainLastVerified: response.data.organization.subdomainLastVerified
        }

        setActiveDomain(newDomain)
        setSubdomain('')
        setAvailability(null)
        setError(null)

        // Show success message
        toast.success(`Subdomain activated successfully! Redirecting to ${newDomain.fullDomain}...`);

        // Wait for 2 seconds to ensure database is updated
        console.log('Subdomain activated successfully, waiting 2 seconds before redirect...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Redirect to the subdomain URL with the same path
        const protocol = window.location.protocol;
        const currentPath = window.location.pathname;
        const targetUrl = `${protocol}//${newDomain.fullDomain}${currentPath}`;

        console.log('Redirecting to subdomain with current path:', targetUrl);

        // Force redirect to subdomain with current path
        window.location.replace(targetUrl);

      } else {
        setError(response.data.message || 'Failed to activate subdomain')
      }
    } catch (error) {
      console.error('Error activating subdomain:', error)
      setError('Failed to activate subdomain. Please try again.')
    } finally {
      setLoading(false)
    }
  }



  const deactivateSubdomain = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to deactivate this subdomain? This action cannot be undone.')) {
      try {
        setLoading(true)
        const response = await axios.post(`${config.REACT_APP_API_URL}/organization/deactivate-subdomain`, {
          organizationId
        })

        if (response.data.success) {
          setActiveDomain(null)
          setIsEditing(false)
          setError(null)
        } else {
          setError(response.data.message || 'Failed to deactivate subdomain')
        }
      } catch (error) {
        console.error('Error deactivating subdomain:', error)
        setError('Failed to deactivate subdomain. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const startEditing = () => {
    setNewSubdomain(activeDomain.subdomain)
    setNewAvailability(null)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setNewSubdomain('')
    setNewAvailability(null)
    setIsEditing(false)
  }

  const updateSubdomain = async () => {
    if (!newSubdomain || !newAvailability?.available) return

    try {
      setLoading(true)
      const response = await axios.post(`${config.REACT_APP_API_URL}/organization/update-subdomain`, {
        organizationId,
        subdomain: newSubdomain.toLowerCase(),
        baseDomain
      })

      if (response.data.success) {
        setActiveDomain(prev => ({
          ...prev,
          subdomain: response.data.organization.subdomain,
          fullDomain: response.data.organization.fullDomain,
          subdomainStatus: response.data.organization.subdomainStatus,
          subdomainLastVerified: new Date().toISOString()
        }))
        setNewSubdomain('')
        setNewAvailability(null)
        setIsEditing(false)
        setError(null)
      } else {
        setError(response.data.message || 'Failed to update subdomain')
      }
    } catch (error) {
      console.error('Error updating subdomain:', error)
      setError('Failed to update subdomain. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Permission check after all hooks
  if (!isInitialized || !checkPermission("Subdomain")) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            {/* <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div> */}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
        </div>
      )}
      {!activeDomain && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Add Your Subdomain</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomain Name
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    placeholder="your-subdomain"
                    className="p-2 w-64 rounded-l-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue flex-1"
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    .{baseDomain}
                  </span>
                </div>
                <button
                  onClick={() => checkSubdomainAvailability(subdomain, setAvailability)}
                  disabled={!subdomain || isChecking}
                  className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80 disabled:bg-gray-400 whitespace-nowrap"
                >
                  {isChecking ? 'Checking...' : 'Check Availability'}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Use only lowercase letters, numbers, and hyphens. Must start and end with alphanumeric characters.
              </p>
            </div>

            {availability && (
              <div className={`flex items-center space-x-2 ${availability.available ? 'text-green-600' : 'text-red-600'
                }`}>
                {availability.available ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XCircleIcon className="h-5 w-5" />
                )}
                <span>{availability.message}</span>
                {availability.available && (
                  <button
                    onClick={activateSubdomain}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Activate & Redirect to Subdomain
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeDomain && !isEditing && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Your Subdomain</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{activeDomain.fullDomain}</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${activeDomain.subdomainStatus === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {activeDomain.subdomainStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Added: {new Date(activeDomain.subdomainAddedDate).toLocaleDateString()}
                  {activeDomain.subdomainLastVerified && (
                    <span className="ml-4">
                      Last Verified: {new Date(activeDomain.subdomainLastVerified).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={startEditing}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Change
                </button>
                <button
                  onClick={deactivateSubdomain}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDomain && isEditing && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Change Subdomain</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Subdomain Name
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value.toLowerCase())}
                    placeholder="new-subdomain"
                    className="rounded-l-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue flex-1"
                  />
                  <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    .{baseDomain}
                  </span>
                </div>
                <button
                  onClick={() => checkSubdomainAvailability(newSubdomain, setNewAvailability)}
                  disabled={!newSubdomain || isChecking}
                  className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80 disabled:bg-gray-400 whitespace-nowrap"
                >
                  {isChecking ? 'Checking...' : 'Check Availability'}
                </button>
              </div>
            </div>

            {newAvailability && (
              <div className={`flex items-center space-x-2 ${newAvailability.available ? 'text-green-600' : 'text-red-600'
                }`}>
                {newAvailability.available ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XCircleIcon className="h-5 w-5" />
                )}
                <span>{newAvailability.message}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              {newAvailability?.available && (
                <button
                  onClick={updateSubdomain}
                  className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
                >
                  Update Subdomain
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DNS Configuration Guide */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">DNS Configuration Guide</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Your subdomain will be automatically configured on our system. Once activated, it will be accessible at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Subdomain Configuration</h4>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Format:</p>
                <code className="bg-gray-100 px-2 py-1 rounded">your-subdomain.{baseDomain}</code>
              </div>
              <div>
                <p className="text-sm text-gray-500">Example:</p>
                <code className="bg-gray-100 px-2 py-1 rounded">company-name.{baseDomain}</code>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 border-l-4 border-custom-blue p-4">
            <p className="text-sm text-custom-blue">
              <strong>Note:</strong> All subdomains are automatically secured with SSL certificates and will be accessible via HTTPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DomainManagement