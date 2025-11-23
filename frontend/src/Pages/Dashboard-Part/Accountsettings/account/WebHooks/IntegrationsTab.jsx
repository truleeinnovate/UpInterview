import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import Portal from "./Portal";
import InputField from "../../../../../Components/FormFields/InputField";
import DropdownWithSearchField from "../../../../../Components/FormFields/DropdownWithSearchField";
import { config } from "../../../../../config";
import { getAuthToken } from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import { notify } from "../../../../../services/toastService";

const IntegrationsTab = () => {
  const [integrations, setIntegrations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState(null);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    webhookUrl: "",
    secret: "",
    platformTemplate: "",
    events: [],
    authentication: {
      type: "hmac_signature",
      bearerToken: "",
      apiKey: { headerName: "X-API-Key", keyValue: "" },
      basicAuth: { username: "", password: "" },
      hmacSecret: "",
      oauth2: { clientId: "", clientSecret: "", tokenUrl: "", scope: "" },
    },
  });

  const availableEvents = [
    { id: "interview.round.status.updated", label: "interview.round.status.updated" },
    { id: "assessment.status.updated", label: "assessment.status.updated" },
    { id: "feedback.status.updated", label: "feedback.status.updated" },
  ];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const authToken = getAuthToken();
      const response = await fetch(`${config.REACT_APP_API_URL}/integrations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch integrations');
      }

      const data = await response.json();
      setIntegrations(data.data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      // Consider adding user feedback here (e.g., toast notification)
    }
  };

  // Function to validate form data
  const validateForm = (data) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'Name is required';
    if (!data.webhookUrl?.trim()) {
      errors.webhookUrl = 'Webhook URL is required';
    } else if (!/^https?:\/\//.test(data.webhookUrl)) {
      errors.webhookUrl = 'Webhook URL must start with http:// or https://';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm(formData);
    if (!isValid) {
      // Show first error
      const firstError = Object.values(errors)[0];
      notify.error(firstError);
      return;
    }

    const isEditing = !!editingIntegration;
    console.log('Form submission started', { isEditing, formData });

    try {
      const integrationId = isEditing
        ? (editingIntegration._id || editingIntegration.id)
        : null;

      const url = isEditing && integrationId
        ? `${config.REACT_APP_API_URL}/integrations/${integrationId}`
        : `${config.REACT_APP_API_URL}/integrations`;

      const method = isEditing ? "PUT" : "POST";

      console.log('Making API request:', { url, method, data: formData });

      const authToken = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        ...(authToken && { "Authorization": `Bearer ${authToken}` })
      };

      console.log('Sending request with headers:', headers);

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      console.log('API Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        console.log('Request successful, refreshing integrations...');
        await fetchIntegrations();
        setShowModal(false);
        setEditingIntegration(null);

        const resetFormData = {
          name: "",
          organization: "",
          webhookUrl: "",
          secret: "",
          events: [],
          authentication: {
            type: "hmac_signature",
            bearerToken: "",
            apiKey: { headerName: "X-API-Key", keyValue: "" },
            basicAuth: { username: "", password: "" },
            hmacSecret: "",
            oauth2: { clientId: "", clientSecret: "", tokenUrl: "", scope: "" },
          },
        };

        console.log('Form reset and modal closed');
        setFormData(resetFormData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
      }
    } catch (error) {
      console.error('Error in handleSubmit:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        formData: formData
      });
    }
  };

  const handleDeleteClick = (integration) => {
    setIntegrationToDelete(integration);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!integrationToDelete) return;

    try {
      const authToken = getAuthToken();
      const response = await fetch(`${config.REACT_APP_API_URL}/integrations/${integrationToDelete._id || integrationToDelete.id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete integration');
      }

      // Refresh the integrations list
      await fetchIntegrations();

      // Show success message
      notify.success('Integration deleted successfully');
    } catch (error) {
      console.error("Error deleting integration:", error);
    } finally {
      setShowDeleteModal(false);
      setIntegrationToDelete(null);
    }
  };

  const handleToggleEnabled = async (integration) => {
    try {
      // Use _id instead of id as MongoDB uses _id by default
      const integrationId = integration._id || integration.id;
      if (!integrationId) {
        console.error('No integration ID found');
        notify.error('Failed to toggle integration: No ID found');
        return;
      }

      const updatedIntegration = {
        ...integration,
        enabled: !integration.enabled
      };

      const response = await fetch(`${config.REACT_APP_API_URL || ''}/integrations/${integrationId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updatedIntegration)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update integration status');
      }

      // Update the local state to reflect the change
      setIntegrations(prevIntegrations =>
        prevIntegrations.map(item =>
          (item._id === integration._id || item.id === integration.id)
            ? { ...item, enabled: !integration.enabled }
            : item
        )
      );

      notify.success(`Integration ${!integration.enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error("Error toggling integration:", error);
      notify.error(error.message || 'Failed to toggle integration status');
    }
  };

  const handleEdit = (integration) => {
    setEditingIntegration(integration);
    const authData = integration.authentication || { type: "hmac_signature" };

    // Set form data with proper defaults for all authentication types
    const formData = {
      name: integration.name || "",
      organization: integration.organization || "",
      webhookUrl: integration.webhookUrl || "",
      secret: integration.secret || "",
      platformTemplate: integration.platformTemplate || "",
      events: Array.isArray(integration.events) ? [...integration.events] : [],
      authentication: {
        type: authData.type || "hmac_signature",
        bearerToken: authData.bearerToken || "",
        apiKey: {
          headerName: authData.apiKey?.headerName || "X-API-Key",
          keyValue: authData.apiKey?.keyValue || ""
        },
        basicAuth: {
          username: authData.basicAuth?.username || "",
          password: authData.basicAuth?.password || ""
        },
        hmacSecret: authData.hmacSecret || integration.secret || "",
        oauth2: {
          clientId: authData.oauth2?.clientId || "",
          clientSecret: authData.oauth2?.clientSecret || "",
          tokenUrl: authData.oauth2?.tokenUrl || "",
          scope: authData.oauth2?.scope || ""
        }
      }
    };

    setFormData(formData);
    setShowModal(true);
  };

  const handleEventChange = (eventId) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      organization: "",
      webhookUrl: "",
      secret: "",
      platformTemplate: "",
      events: [],
      authentication: {
        type: "hmac_signature",
        bearerToken: "",
        apiKey: { headerName: "X-API-Key", keyValue: "" },
        basicAuth: { username: "", password: "" },
        hmacSecret: "",
        oauth2: { clientId: "", clientSecret: "", tokenUrl: "", scope: "" },
        jwtToken: "",
        customHeader: { name: "", value: "" },
      },
    });
  };

  const platformTemplates = {
    sap_successfactors: {
      name: "SAP SuccessFactors Integration",
      authentication: {
        type: "oauth2",
        oauth2: {
          tokenUrl: "https://api.successfactors.com/oauth/token",
          scope: "read write",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    workday: {
      name: "Workday Integration",
      authentication: {
        type: "oauth2",
        oauth2: {
          tokenUrl: "https://wd2-impl-services1.workday.com/ccx/oauth2/token",
          scope: "recruiting",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    greenhouse: {
      name: "Greenhouse Integration",
      authentication: {
        type: "api_key",
        apiKey: {
          headerName: "Authorization",
          keyValue: "Basic {base64_encoded_api_key}",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    zoho_recruit: {
      name: "Zoho Recruit Integration",
      authentication: {
        type: "oauth2",
        oauth2: {
          tokenUrl: "https://accounts.zoho.com/oauth/v2/token",
          scope: "ZohoRecruit.modules.ALL",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    bamboohr: {
      name: "BambooHR Integration",
      authentication: {
        type: "api_key",
        apiKey: {
          headerName: "Authorization",
          keyValue: "Basic {api_key}",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    lever: {
      name: "Lever Integration",
      authentication: {
        type: "api_key",
        apiKey: {
          headerName: "Authorization",
          keyValue: "Basic {api_key}",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    smartrecruiters: {
      name: "SmartRecruiters Integration",
      authentication: {
        type: "oauth2",
        oauth2: {
          tokenUrl: "https://api.smartrecruiters.com/oauth/token",
          scope: "candidates_read candidates_write",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    adp: {
      name: "ADP Workforce Now Integration",
      authentication: {
        type: "jwt_token",
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    icims: {
      name: "iCIMS Integration",
      authentication: {
        type: "custom_header",
        customHeader: {
          name: "Authorization",
          value: "Bearer {access_token}",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
    ultipro: {
      name: "UltiPro Integration",
      authentication: {
        type: "custom_header",
        customHeader: {
          name: "US-Customer-Api-Key",
          value: "{api_key}",
        },
      },
      events: [
        "interview.round.status.updated",
        "assessment.status.updated",
        "feedback.status.updated",
      ],
    },
  };

  const handlePlatformTemplateChange = (templateKey) => {
    if (!templateKey) {
      setFormData(prev => ({
        ...prev,
        platformTemplate: "",
        // Reset to default values if needed
        authentication: {
          type: "hmac_signature",
          bearerToken: "",
          apiKey: { headerName: "X-API-Key", keyValue: "" },
          basicAuth: { username: "", password: "" },
          hmacSecret: "",
          oauth2: { clientId: "", clientSecret: "", tokenUrl: "", scope: "" },
        },
        events: []
      }));
      return;
    }

    const template = platformTemplates[templateKey];
    if (template) {
      setFormData(prev => ({
        ...prev,
        platformTemplate: templateKey,
        name: template.name || prev.name,
        authentication: { ...prev.authentication, ...(template.authentication || {}) },
        events: [...new Set([...prev.events, ...(template.events || [])])],
      }));
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Webhook Integrations
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-custom-blue hover:bg-custom-blue text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Integration</span>
        </button>
      </div>

      <div className="grid gap-6">
        {(Array.isArray(integrations) ? integrations : []).map(
          (integration) => (
            <div
              key={integration.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {integration.organization}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 truncate max-w-[400px] w-fit" title={integration.webhookUrl}>
                    {integration.webhookUrl.length > 40 ? integration.webhookUrl.slice(0, 40) + '...' : integration.webhookUrl}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleEnabled(integration)}
                    className={`p-2 rounded-lg transition-colors ${integration.enabled
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-50"
                      }`}
                    title={integration.enabled ? "Disable" : "Enable"}
                  >
                    {integration.enabled ? (
                      <Power className="w-4 h-4" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(integration)}
                    className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(integration)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(integration.events && Array.isArray(integration.events)
                  ? integration.events.filter((eventId) =>
                      availableEvents.some((e) => e.id === eventId)
                    )
                  : []
                ).map((event) => (
                  <span
                    key={event}
                    className="px-2 py-1 border border-gray-200 bg-gray-100 text-xs rounded-full"
                  >
                    {availableEvents.find((e) => e.id === event)?.label ||
                      event}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Created:{" "}
                  {new Date(integration.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-4">
                  <span>
                    Auth: {integration.authentication?.type || "hmac_signature"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${integration.enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {integration.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          )
        )}

        {(Array.isArray(integrations) ? integrations : []).length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <p className="text-gray-500 mb-4">
              No integrations configured yet.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-custom-blue hover:bg-custom-blue text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Your First Integration
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingIntegration
                    ? "Edit Integration"
                    : "Add New Integration"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <DropdownWithSearchField
                      label="Platform Template (Optional)"
                      name="platformTemplate"
                      value={formData.platformTemplate || ""}
                      options={[
                        { value: "", label: "Select a platform template..." },
                        {
                          label: "Enterprise Platforms",
                          options: [
                            { value: "sap_successfactors", label: "SAP SuccessFactors" },
                            { value: "workday", label: "Workday" },
                            { value: "adp", label: "ADP Workforce Now" },
                            { value: "ultipro", label: "UltiPro" },
                          ],
                        },
                        {
                          label: "Modern ATS Platforms",
                          options: [
                            { value: "greenhouse", label: "Greenhouse" },
                            { value: "lever", label: "Lever" },
                            { value: "smartrecruiters", label: "SmartRecruiters" },
                            { value: "zoho_recruit", label: "Zoho Recruit" },
                            { value: "bamboohr", label: "BambooHR" },
                            { value: "icims", label: "iCIMS" },
                          ],
                        },
                      ]}
                      placeholder="Select a platform template..."
                      onChange={(e) => handlePlatformTemplateChange(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Select a platform to automatically configure
                      authentication and recommended events
                    </p>
                  </div>

                  <div className="mb-4">
                    <InputField
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Webhook integration name"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <InputField
                      label="Organization"
                      name="organization"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          organization: e.target.value,
                        }))
                      }
                      placeholder="Organization name"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.webhookUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          webhookUrl: e.target.value,
                        }))
                      }
                      autoComplete="off"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="https://customer.com/webhooks/hrms"
                      required
                    />
                  </div>

                  {/* Authentication Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Webhook Authentication
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Configure how we should authenticate when sending webhooks
                      to your endpoint
                    </p>

                    <div className="mb-4">
                      <DropdownWithSearchField
                        label="Authentication Method"
                        name="authentication.type"
                        value={formData.authentication.type || "hmac_signature"}
                        options={[
                          {
                            value: "hmac_signature",
                            label: "HMAC Signature (Recommended)",
                          },
                          { value: "bearer_token", label: "Bearer Token" },
                          { value: "api_key", label: "API Key" },
                          { value: "basic_auth", label: "Basic Authentication" },
                          { value: "oauth2", label: "OAuth 2.0" },
                          { value: "none", label: "None" },
                        ]}
                        placeholder="Select authentication method"
                        required
                        isSearchable={false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              type: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    {/* HMAC Signature */}
                    {formData.authentication.type === "hmac_signature" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          HMAC Secret
                        </label>
                        <input
                          type="password"
                          value={formData.authentication.hmacSecret}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              authentication: {
                                ...prev.authentication,
                                hmacSecret: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="Enter shared secret for HMAC signature"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          We'll use this secret to sign webhook payloads. You
                          can verify authenticity using the X-Webhook-Signature
                          header.
                        </p>
                      </div>
                    )}

                    {/* Bearer Token */}
                    {formData.authentication.type === "bearer_token" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bearer Token
                        </label>
                        <input
                          type="password"
                          value={formData.authentication.bearerToken}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              authentication: {
                                ...prev.authentication,
                                bearerToken: e.target.value,
                              },
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="Enter your bearer token"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          We'll include this token in the Authorization header:
                          Bearer {"{token}"}
                        </p>
                      </div>
                    )}

                    {/* API Key */}
                    {formData.authentication.type === "api_key" && (
                      <div className="mb-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key Header Name
                          </label>
                          <input
                            type="text"
                            value={formData.authentication.apiKey.headerName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  apiKey: {
                                    ...prev.authentication.apiKey,
                                    headerName: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="X-API-Key"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key Value
                          </label>
                          <input
                            type="password"
                            value={formData.authentication.apiKey.keyValue}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  apiKey: {
                                    ...prev.authentication.apiKey,
                                    keyValue: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Enter your API key"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          We'll include your API key in the specified header
                          when sending webhooks.
                        </p>
                      </div>
                    )}

                    {/* Basic Auth */}
                    {formData.authentication.type === "basic_auth" && (
                      <div className="mb-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={formData.authentication.basicAuth.username}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  basicAuth: {
                                    ...prev.authentication.basicAuth,
                                    username: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            value={formData.authentication.basicAuth.password}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  basicAuth: {
                                    ...prev.authentication.basicAuth,
                                    password: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Enter password"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          We'll use Basic Authentication with these credentials.
                        </p>
                      </div>
                    )}

                    {/* OAuth 2.0 */}
                    {formData.authentication.type === "oauth2" && (
                      <div className="mb-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client ID
                          </label>
                          <input
                            type="text"
                            value={
                              formData.authentication.oauth2?.clientId || ""
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  oauth2: {
                                    ...prev.authentication.oauth2,
                                    clientId: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="OAuth2 Client ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Secret
                          </label>
                          <input
                            type="password"
                            value={
                              formData.authentication.oauth2?.clientSecret || ""
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  oauth2: {
                                    ...prev.authentication.oauth2,
                                    clientSecret: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="OAuth2 Client Secret"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Token URL
                          </label>
                          <input
                            type="url"
                            value={
                              formData.authentication.oauth2?.tokenUrl || ""
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  oauth2: {
                                    ...prev.authentication.oauth2,
                                    tokenUrl: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="https://your-system.com/oauth/token"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Scope
                          </label>
                          <input
                            type="text"
                            value={formData.authentication.oauth2?.scope || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                authentication: {
                                  ...prev.authentication,
                                  oauth2: {
                                    ...prev.authentication.oauth2,
                                    scope: e.target.value,
                                  },
                                },
                              }))
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="read write"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          We'll handle OAuth2 token management and include
                          access tokens in webhook requests.
                        </p>
                      </div>
                    )}

                    {/* None */}
                    {formData.authentication.type === "none" && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ No authentication will be used. This is not
                          recommended for production environments.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Events to Subscribe <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {availableEvents.map((event) => {
                        const isChecked = formData.events.includes(event.id);
                        return (
                          <label key={event.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleEventChange(event.id)}
                              className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {event.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingIntegration(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.name?.trim() || !formData.webhookUrl?.trim()}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${!formData.name?.trim() || !formData.webhookUrl?.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-custom-blue hover:bg-custom-blue/80"
                        }`}
                      title={!formData.name?.trim() ? "Name is required" : !formData.webhookUrl?.trim() ? "Webhook URL is required" : ""}
                    >
                      {editingIntegration ? "Update Integration" : "Create Integration"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Integration</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the integration "{integrationToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setIntegrationToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default IntegrationsTab;
