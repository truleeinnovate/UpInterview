import React, { useState, useEffect } from "react";
import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { createPortal } from "react-dom";
import { config } from "../../../../../config";

const ApiKeysTab = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [formData, setFormData] = useState({
    organization: "",
    permissions: ["read"],
  });

  // NEW: Retrieve auth token (adjust key if using context/store instead of localStorage)
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken"); // Or use useAuth hook: const { token } = useAuth();
    if (!token) {
      // Optional: Redirect to login or show error
      console.warn("No auth token found. Redirecting to login...");
      // window.location.href = "/login"; // Uncomment if needed
      return {};
    }
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json", // Only needed for POST/PUT
    };
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      // UPDATED: Add auth headers (Content-Type not needed for GET, but harmless)
      const headers = getAuthHeaders();
      const response = await fetch(`${config.REACT_APP_API_URL}/apikeys`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setApiKeys(Array.isArray(data.data) ? data.data : []); // UPDATED: Backend returns { data: [...] }, so access .data
    } catch (error) {
      console.error("Error fetching API keys:", error);
      setApiKeys([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // UPDATED: Add auth headers
      const headers = getAuthHeaders();
      const response = await fetch(`${config.REACT_APP_API_URL}/apikeys`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // UPDATED: Backend returns { data: apiKey }, but we refetch list anyway
      await fetchApiKeys();
      setShowModal(false);
      setFormData({ organization: "", permissions: ["read"] });
    } catch (error) {
      console.error("Error creating API key:", error);
      // Optional: Show user-friendly toast/error modal
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this API key? This action cannot be undone."
      )
    ) {
      try {
        // UPDATED: Add auth headers
        const headers = getAuthHeaders();
        const response = await fetch(`${config.REACT_APP_API_URL}/apikeys/${id}`, { 
          method: "DELETE",
          headers: { ...headers, "Content-Type": "application/json" } // Content-Type optional for DELETE
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        await fetchApiKeys();
      } catch (error) {
        console.error("Error deleting API key:", error);
      }
    }
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
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
                  <div className="space-y-2">
                    {["read", "write", "delete"].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {permission}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ organization: "", permissions: ["read"] });
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