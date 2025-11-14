import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { createPortal } from "react-dom";
import InputField from "../../../../../Components/FormFields/InputField";
import { config } from "../../../../../config";
import { getAuthToken } from "../../../../../utils/AuthCookieManager/AuthCookieManager";

const IntegrationsTab = () => {
  const [integrations, setIntegrations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [formData, setFormData] = useState({
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
  });

  const availableEvents = [
    { id: "candidate.created", label: "Candidate Created" },
    { id: "candidate.status_updated", label: "Candidate Status Updated" },
    { id: "candidates.bulk_created", label: "Candidates Bulk Created" },
    { id: "positions.bulk_created", label: "Positions Bulk Created" },
    { id: "application.submitted", label: "Application Submitted" },
    { id: "application.status_updated", label: "Application Status Updated" },
    { id: "interview.scheduled", label: "Interview Scheduled" },
    { id: "interview.cancelled", label: "Interview Cancelled" },
    { id: "interview.rescheduled", label: "Interview Rescheduled" },
    {
      id: "interview.feedback_submitted",
      label: "Interview Feedback Submitted",
    },
    { id: "offer.created", label: "Offer Created" },
    { id: "offer.accepted", label: "Offer Accepted" },
    { id: "offer.rejected", label: "Offer Rejected" },
    { id: "offer.withdrawn", label: "Offer Withdrawn" },
    { id: "offer.status_updated", label: "Offer Status Updated" },
    { id: "position.created", label: "Position Created" },
    { id: "position.updated", label: "Position Updated" },
    { id: "position.closed", label: "Position Closed" },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started', { isEditing: !!editingIntegration, formData });
    
    try {
      const url = editingIntegration
        ? `${config.REACT_APP_API_URL}/integrations/${editingIntegration.id}`
        : `${config.REACT_APP_API_URL}/integrations`;
      const method = editingIntegration ? "PUT" : "POST";
      
      console.log('Making API request:', { url, method, data: formData });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this integration?")) {
      try {
        await fetch(`/api/integrations/${id}`, { method: "DELETE" });
        await fetchIntegrations();
      } catch (error) {
        console.error("Error deleting integration:", error);
      }
    }
  };

  const handleToggleEnabled = async (integration) => {
    try {
      await fetch(`/api/integrations/${integration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...integration, enabled: !integration.enabled }),
      });
      await fetchIntegrations();
    } catch (error) {
      console.error("Error toggling integration:", error);
    }
  };

  const handleEdit = (integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      organization: integration.organization,
      webhookUrl: integration.webhookUrl,
      secret: integration.secret,
      events: integration.events,
      authentication: integration.authentication || {
        type: "hmac_signature",
        bearerToken: "",
        apiKey: { headerName: "X-API-Key", keyValue: "" },
        basicAuth: { username: "", password: "" },
        hmacSecret: integration.secret || "",
        oauth2: { clientId: "", clientSecret: "", tokenUrl: "", scope: "" },
      },
    });
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
      events: [],
      platformTemplate: "",
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
        "candidate.created",
        "candidate.status_updated",
        "interview.scheduled",
        "offer.created",
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
        "candidate.created",
        "candidate.status_updated",
        "interview.scheduled",
        "offer.created",
        "offer.accepted",
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
        "candidate.created",
        "application.submitted",
        "interview.scheduled",
        "interview.feedback_submitted",
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
        "candidate.created",
        "candidate.status_updated",
        "interview.scheduled",
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
      events: ["candidate.created", "offer.created", "offer.accepted"],
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
        "candidate.created",
        "application.submitted",
        "interview.scheduled",
        "offer.created",
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
        "candidate.created",
        "application.submitted",
        "interview.scheduled",
      ],
    },
    adp: {
      name: "ADP Workforce Now Integration",
      authentication: {
        type: "jwt_token",
      },
      events: [
        "candidate.created",
        "candidate.status_updated",
        "offer.created",
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
        "candidate.created",
        "application.submitted",
        "interview.scheduled",
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
      events: ["candidate.created", "offer.created"],
    },
  };

  const handlePlatformTemplateChange = (templateKey) => {
    if (!templateKey) {
      setFormData((prev) => ({ ...prev, platformTemplate: "" }));
      return;
    }

    const template = platformTemplates[templateKey];
    if (template) {
      setFormData((prev) => ({
        ...prev,
        platformTemplate: templateKey,
        name: template.name,
        authentication: { ...prev.authentication, ...template.authentication },
        events: template.events,
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
                  <p className="text-sm text-gray-500 mt-1">
                    {integration.webhookUrl}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleEnabled(integration)}
                    className={`p-2 rounded-lg transition-colors ${
                      integration.enabled
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
                    onClick={() => handleDelete(integration.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(integration.events && Array.isArray(integration.events)
                  ? integration.events
                  : []
                ).map((event) => (
                  <span
                    key={event}
                    className="px-2 py-1 bg-brand-100 text-brand-800 text-xs rounded-full"
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
                    className={`px-2 py-1 rounded-full text-xs ${
                      integration.enabled
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
      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingIntegration
                    ? "Edit Integration"
                    : "Add New Integration"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Template (Optional)
                    </label>
                    <select
                      value={formData.platformTemplate || ""}
                      onChange={(e) =>
                        handlePlatformTemplateChange(e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    >
                      <option value="">Select a platform template...</option>
                      <optgroup label="Enterprise Platforms">
                        <option value="sap_successfactors">
                          SAP SuccessFactors
                        </option>
                        <option value="workday">Workday</option>
                        <option value="adp">ADP Workforce Now</option>
                        <option value="ultipro">UltiPro</option>
                      </optgroup>
                      <optgroup label="Modern ATS Platforms">
                        <option value="greenhouse">Greenhouse</option>
                        <option value="lever">Lever</option>
                        <option value="smartrecruiters">SmartRecruiters</option>
                        <option value="zoho_recruit">Zoho Recruit</option>
                        <option value="bamboohr">BambooHR</option>
                        <option value="icims">iCIMS</option>
                      </optgroup>
                    </select>
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
                      placeholder="e.g., Acme HRMS Integration"
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
                      placeholder="e.g., Acme Corp"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Authentication Method
                      </label>
                      <select
                        value={formData.authentication.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              type: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="hmac_signature">
                          HMAC Signature (Recommended)
                        </option>
                        <option value="bearer_token">Bearer Token</option>
                        <option value="api_key">API Key</option>
                        <option value="basic_auth">Basic Authentication</option>
                        <option value="oauth2">OAuth 2.0</option>
                        <option value="none">None</option>
                      </select>
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
                      Events to Subscribe
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {availableEvents.map((event) => (
                        <label key={event.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event.id)}
                            onChange={() => handleEventChange(event.id)}
                            className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {event.label}
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
                        setEditingIntegration(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-custom-blue hover:bg-custom-blue text-white rounded-lg transition-colors"
                    >
                      {editingIntegration
                        ? "Update Integration"
                        : "Create Integration"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default IntegrationsTab;
