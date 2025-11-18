import React, { useState, useEffect, useCallback } from "react";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { createPortal } from "react-dom";
import { config } from "../../../../../config";

const ApiKeysTab = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [formData, setFormData] = useState({
    organization: "",
    permissions: ["users:read"],
    description: "",
    expiresAt: "",
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    ipAddress: "",
    userAgent: ""
  });

  // NEW: Retrieve auth token (adjust key if using context/store instead of localStorage)
  const getAuthHeaders = () => {
    // Simplified - no authentication required for now
    const headers = {
      "Content-Type": "application/json",
    };
    return headers;
  };

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch(`${config.REACT_APP_API_URL}/apikeys`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data || data); // Handle different response formats
      } else {
        console.error('Error fetching API keys:', response.statusText);
        setApiKeys([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Network error:', error);
      setApiKeys([]); // Set empty array on network error
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Frontend] handleSubmit called');
    console.log('[Frontend] Form data:', formData);
    
    try {
      const headers = getAuthHeaders();
      console.log('[Frontend] Making POST request to:', `${config.REACT_APP_API_URL}/apikeys`);
      
      const response = await fetch(`${config.REACT_APP_API_URL}/apikeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          organization: formData.organization,
          permissions: formData.permissions,
          description: formData.description || null,
          expiresAt: formData.expiresAt || null,
          rateLimit: formData.rateLimit,
          ipAddress: formData.ipAddress ? formData.ipAddress.split(',').map(ip => ip.trim()).filter(ip => ip) : [],
          userAgent: formData.userAgent || null
        }),
      });

      console.log('[Frontend] Response status:', response.status);
      const data = await response.json();
      console.log('[Frontend] Response data:', data);

      if (response.ok) {
        // Success: close modal, reset form, refresh API keys list
        setShowModal(false);
        setFormData({ 
          organization: "", 
          permissions: ["users:read"],
          description: "",
          expiresAt: "",
          rateLimit: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          ipAddress: "",
          userAgent: ""
        });
        fetchApiKeys(); // Refresh the list
        
        // Show success message (optional)
        console.log('API Key created successfully:', data);
      } else {
        // Error: show error message
        console.error('Error creating API key:', data.message);
        // You might want to set an error state here to show to the user
      }
    } catch (error) {
      console.error('Network error:', error);
      // You might want to set an error state here to show to the user
    }
  };

  const handleDelete = async (id) => {
   
  };

  // Rest of the component unchanged...
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const maskKey = (key, isVisible) => {
    if (isVisible) return key;
    return key.substring(0, 8) + "•".repeat(20) + key.substring(key.length - 4);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage API keys for external HRMS/ATS systems
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-custom-blue hover:bg-custom-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate API Key</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => ( // UPDATED: Removed redundant Array.isArray check (already handled in fetch)
                <tr key={apiKey.id || apiKey._id}> {/* UPDATED: Use _id if id not present (Mongoose uses _id) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {apiKey.organization}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {maskKey(apiKey.key, visibleKeys[apiKey.id || apiKey._id])}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id || apiKey._id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title={visibleKeys[apiKey.id || apiKey._id] ? "Hide" : "Show"}
                      >
                        {visibleKeys[apiKey.id || apiKey._id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {(apiKey.permissions || []).map((permission) => ( // UPDATED: Safer null-check
                        <span
                          key={permission}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        apiKey.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {apiKey.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(apiKey.id || apiKey._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {apiKeys.length === 0 && ( // UPDATED: Simplified check
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No API keys generated yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-custom-blue hover:bg-custom-blue text-white px-4 py-2 rounded-lg transition-colors"
            >
              Generate Your First API Key
            </button>
          </div>
        )}
      </div>

      {/* Modal unchanged */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Generate New API Key
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        organization: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="e.g., Acme Corp"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Users</p>
                      {["users:read", "users:write", "users:delete"].map((permission) => (
                        <label key={permission} className="flex items-center mr-4">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission)}
                            onChange={() => handlePermissionChange(permission)}
                            className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {permission.split(':')[1]} Users
                          </span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Candidates</p>
                      {["candidates:read", "candidates:write", "candidates:delete"].map((permission) => (
                        <label key={permission} className="flex items-center mr-4">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission)}
                            onChange={() => handlePermissionChange(permission)}
                            className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {permission.split(':')[1]} Candidates
                          </span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Interviews</p>
                      {["interviews:read", "interviews:write", "interviews:delete"].map((permission) => (
                        <label key={permission} className="flex items-center mr-4">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission)}
                            onChange={() => handlePermissionChange(permission)}
                            className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {permission.split(':')[1]} Interviews
                          </span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">System</p>
                      {["analytics:read", "system:read", "system:write"].map((permission) => (
                        <label key={permission} className="flex items-center mr-4">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission)}
                            onChange={() => handlePermissionChange(permission)}
                            className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {permission.replace(':', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Describe the purpose of this API key..."
                    rows="2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expiresAt: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limits (requests per minute/hour/day)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={formData.rateLimit.requestsPerMinute}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rateLimit: {
                            ...prev.rateLimit,
                            requestsPerMinute: parseInt(e.target.value) || 60
                          }
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="60"
                      min="1"
                      max="1000"
                    />
                    <input
                      type="number"
                      value={formData.rateLimit.requestsPerHour}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rateLimit: {
                            ...prev.rateLimit,
                            requestsPerHour: parseInt(e.target.value) || 1000
                          }
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="1000"
                      min="1"
                      max="10000"
                    />
                    <input
                      type="number"
                      value={formData.rateLimit.requestsPerDay}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rateLimit: {
                            ...prev.rateLimit,
                            requestsPerDay: parseInt(e.target.value) || 10000
                          }
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="10000"
                      min="1"
                      max="100000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Default: 60/min, 1000/hour, 10000/day</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed IP Addresses (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ipAddress: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="192.168.1.1, 10.0.0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list. Leave empty to allow any IP</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Agent (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.userAgent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        userAgent: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="MyApp/1.0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Restrict to specific user agent</p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        organization: "",
                        permissions: ["users:read"],
                        description: "",
                        expiresAt: "",
                        rateLimit: {
                          requestsPerMinute: 60,
                          requestsPerHour: 1000,
                          requestsPerDay: 10000,
                        },
                        ipAddress: "",
                        userAgent: "",
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-custom-blue hover:bg-custom-blue text-white rounded-lg transition-colors"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ApiKeysTab;