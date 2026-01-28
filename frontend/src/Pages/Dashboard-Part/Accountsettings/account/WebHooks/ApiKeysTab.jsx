import React, { useState, useEffect, useCallback } from "react";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { createPortal } from "react-dom";
import { config } from "../../../../../config";
import Cookies from "js-cookie";

const ApiKeysTab = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    organization: "",
    permissions: ["candidates:read"],
  });

  const getAuthHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    
    const authToken = Cookies.get("authToken");
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    
    return headers;
  };

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch(`${config.REACT_APP_API_URL}/apikeys`, {
        credentials: 'include',
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
    
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${config.REACT_APP_API_URL}/apikeys`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          organization: formData.organization,
          permissions: formData.permissions
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success: close modal, reset form, refresh API keys list
        setShowModal(false);
        setFormData({ 
          organization: "", 
          permissions: ["candidates:read"],
        });
        fetchApiKeys(); // Refresh the list
        
        // Show success message (optional)
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

  const handleDelete = (id) => {
    const key = apiKeys.find((k) => (k.id || k._id) === id);
    if (key) {
      setDeleteTarget(key);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id || deleteTarget._id;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${config.REACT_APP_API_URL}/apikeys/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (response.ok) {
        // Optimistically update list and then refetch from backend to stay in sync
        setApiKeys((prev) => prev.filter((key) => (key.id || key._id) !== id));
        await fetchApiKeys();
      } else {
        const data = await response.json().catch(() => null);
        console.error('Error deleting API key:', response.status, data || response.statusText);
      }
    } catch (error) {
      console.error('Network error while deleting API key:', error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    // Auto-hide the copied tooltip after a short delay
    setTimeout(() => {
      setCopiedKeyId((current) => (current === id ? null : current));
    }, 1500);
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => ( // UPDATED: Removed redundant Array.isArray check (already handled in fetch)
                <tr key={apiKey.id || apiKey._id}> {/* UPDATED: Use _id if id not present (Mongoose uses _id) */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {apiKey.organization}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center space-x-2">
                      <code
                        className="text-sm bg-gray-100 px-2 py-1 rounded font-mono truncate max-w-72"
                        title={visibleKeys[apiKey.id || apiKey._id] ? apiKey.key : ""}
                      >
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
                      <div className="relative">
                        <button
                          onClick={() => copyToClipboard(apiKey.id || apiKey._id, apiKey.key)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {copiedKeyId === (apiKey.id || apiKey._id) && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap">
                            Copied
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const permissions = apiKey.permissions || [];
                        const visiblePermissions = permissions.slice(0, 2);
                        const remainingPermissions = permissions.slice(2);

                        return (
                          <>
                            {visiblePermissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                            {remainingPermissions.length > 0 && (
                              <span
                                className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full cursor-default"
                                title={remainingPermissions.join(", ")}
                              >
                                +{remainingPermissions.length}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
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
                  <td className="px-3 py-3 whitespace-nowrap">
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

      {/* Create API Key Modal */}
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
                      <p className="text-xs text-gray-600 mb-2">Candidates</p>
                      <div className="flex flex-wrap gap-4">
                        {["candidates:read", "candidates:write", "candidates:bulk"].map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="rounded border-gray-300 accent-custom-blue text-custom-blue shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {permission.split(':')[1]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Positions</p>
                      <div className="flex flex-wrap gap-4">
                        {["positions:read", "positions:write", "positions:bulk"].map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="rounded border-gray-300 accent-custom-blue text-custom-blue shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {permission.split(':')[1]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-2">ATS Integration</p>
                      <div className="flex flex-wrap gap-4">
                        {["ats:read", "ats:write"].map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="rounded border-gray-300 accent-custom-blue text-custom-blue shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {permission.split(':')[1]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        organization: "",
                        permissions: []
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

      {/* Delete Confirmation Modal */}
      {deleteTarget &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">Delete API Key</h3>
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to permanently delete this API key for{' '}
                <span className="font-semibold">{deleteTarget.organization}</span>?
                {' '}This action cannot be undone.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs font-mono break-all mb-4">
                {deleteTarget.key}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ApiKeysTab;