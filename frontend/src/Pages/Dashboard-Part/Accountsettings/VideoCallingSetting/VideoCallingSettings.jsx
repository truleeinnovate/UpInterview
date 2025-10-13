// added by Ranjith
// v1.0.0 - Ashok - fixed z-index style issue for confirmation popup
// v1.0.1 - Ashok - fixed responsiveness issues, added shimmer loader, fixed re-rendering issue
// v1.0.2 - Ashok - Improved loading view

import { useEffect, useState } from "react";
import {
  VideoCameraIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { config } from "../../../../config";
import { notify } from "../../../../services/toastService";
// v1.0.0 <---------------------------------------------------------------
import { createPortal } from "react-dom";
import { useVideoSettingsQuery } from "../../../../apiHooks/VideoDetail";
// v1.0.0 --------------------------------------------------------------->

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;
  // v1.0.0 <--------------------------------------------------------------------------------
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#217989] text-white rounded-lg hover:bg-[#1a6b7a]"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
  // v1.0.0 -------------------------------------------------------------------------------->
};

export function VideoCallingSettings() {
  const {
    data,
    isLoading,
    isError,
    // error,
    refetch,
    // isOrganization,
  } = useVideoSettingsQuery();

    // Add this line to fix all setSettings errors:
    // const [settings, setSettings] = useState(data?.data || null);

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingProvider, setPendingProvider] = useState(null);

  // ✅ FIX: Properly handle data updates
  useEffect(() => {
    if (data?.data) {
      setSettings(data.data);
    }
  }, [data]);

  console.log("settings", settings);
  console.log("isLoading", data?.data?.defaultProvider);

  // Get user token information
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const isOrganization = tokenPayload?.organization;

  const [showCredentials, setShowCredentials] = useState({
    googleMeet: false,
    zoom: false,
    teams: false,
  });

  const videoProviders = [
    {
      id: "zoom",
      name: "Zoom",
      description: "Use Zoom for professional video interviews",
      icon: VideoCameraIcon,
      specifications: [
        "Professional Video Quality",
        "Zoom Rooms Support",
        "Webinar Capabilities",
        "Local & Cloud Recording",
        "Breakout Rooms",
        "Advanced Security Features",
      ],
    },
    {
      id: "google-meet",
      name: "Google Meet",
      description:
        "Integrate with Google Meet for video interviews (Note: Only if the scheduler joins, the candidate can join.)",
      icon: VideoCameraIcon,
      specifications: [
        "Google Workspace Integration",
        "Calendar Sync",
        "Cloud Recording",
        "Live Captions & Transcription",
        "Up to 250 Participants",
        "Mobile App Support",
      ],
    },
  ];

  // v1.0.1 <---------------------------------------------------------------------------
  useEffect(() => {
    if (settings && isOrganization === false) {
      setSettings((prev) => ({
        ...prev,
        credentialType: "platform",
      }));
    }
  }, [settings, isOrganization]);

  useEffect(() => {
    if (
      settings &&
      isOrganization === false &&
      settings.credentialType !== "platform"
    ) {
      setSettings((prev) => ({
        ...prev,
        credentialType: "platform",
      }));
    }
  }, [settings, isOrganization]);
  // v1.0.1 --------------------------------------------------------------------------->

  // useEffect(() => {
  //   const fetchSettings = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       const { data } = await axios.get(
  //         `${config.REACT_APP_API_URL}/video-details/get-settings`,
  //         {
  //           params: {
  //             tenantId: tenantId,
  //             ownerId: ownerId,
  //           },
  //         }
  //       );

  //       console.log("✅ API Response:", data);

  //       if (data.success && data.data) {
  //         setSettings(data.data);
  //       } else {
  //         // If no settings, set default
  //         setSettings({
  //           defaultProvider: "zoom",
  //           credentialType: "platform",
  //           credentials: {
  //             googleMeet: {
  //               clientId: "",
  //               clientSecret: "",
  //               refreshToken: "",
  //               isConfigured: false,
  //             },
  //             zoom: {
  //               apiKey: "",
  //               apiSecret: "",
  //               accountId: "",
  //               isConfigured: false,
  //             },
  //             teams: {
  //               tenantId: "",
  //               clientId: "",
  //               clientSecret: "",
  //               isConfigured: false,
  //             },
  //           },
  //           testConnection: {
  //             status: null,
  //             message: "",
  //           },
  //         });
  //       }
  //     } catch (err) {
  //       console.error("❌ Error loading settings:", err);
  //       setError(err.message);

  //       // Set default settings on error
  //       setSettings({
  //         defaultProvider: "zoom",
  //         credentialType: "platform",
  //         credentials: {
  //           googleMeet: {
  //             clientId: "",
  //             clientSecret: "",
  //             refreshToken: "",
  //             isConfigured: false,
  //           },
  //           zoom: {
  //             apiKey: "",
  //             apiSecret: "",
  //             accountId: "",
  //             isConfigured: false,
  //           },
  //           teams: {
  //             tenantId: "",
  //             clientId: "",
  //             clientSecret: "",
  //             isConfigured: false,
  //           },
  //         },
  //         testConnection: {
  //           status: null,
  //           message: "",
  //         },
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (tenantId && ownerId) {
  //     fetchSettings();
  //   }
  // }, [tenantId, ownerId]);

  // Handle provider change with confirmation
  const handleProviderChange = (providerId) => {
    // If provider is already selected, do nothing
    if (settings.defaultProvider === providerId) return;

    // Show confirmation modal
    setPendingProvider(providerId);
    setShowConfirmation(true);
  };

  // Confirm provider change
  const confirmProviderChange = () => {
    if (pendingProvider) {
      setSettings((prev) => ({
        ...prev,
        defaultProvider: pendingProvider,
        credentialType: pendingProvider === "platform" ? "platform" : "tenant",
        testConnection: { status: null, message: "" },
      }));

      setShowConfirmation(false);
      setPendingProvider(null);

      // Show success toast
      notify.success(
        `Provider changed to ${
          videoProviders.find((p) => p.id === pendingProvider)?.name
        }`
      );
    }
  };

  // Cancel provider change
  const cancelProviderChange = () => {
    setShowConfirmation(false);
    setPendingProvider(null);
  };

  const handleCredentialTypeChange = (type) => {
    setSettings((prev) => ({
      ...prev,
      credentialType: type,
      testConnection: { status: null, message: "" },
    }));
  };

  const handleCredentialChange = (provider, field, value) => {
    setSettings((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [provider]: {
          ...prev.credentials[provider],
          [field]: value,
        },
      },
    }));
  };

  // Test connection function
  const testConnection = async () => {
    if (!settings) return;

    setSettings((prev) => ({
      ...prev,
      testConnection: { status: "testing", message: "Testing connection..." },
    }));

    try {
      const response = await axios.post(
        `${config.REACT_APP_API_URL}/video-details/test-connection`,
        {
          provider: settings.defaultProvider,
          credentials: settings.credentials[settings.defaultProvider],
          tenantId: tenantId,
          ownerId: ownerId,
        }
      );
      console.log(response.data);
      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          testConnection: {
            status: "success",
            message:
              response.data.message ||
              "Connection successful! Your credentials are valid.",
          },
        }));
        notify.success("Connection test successful!");
      } else {
        setSettings((prev) => ({
          ...prev,
          testConnection: {
            status: "failed",
            message:
              response.data.message ||
              "Connection failed. Please check your credentials.",
          },
        }));
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setSettings((prev) => ({
        ...prev,
        testConnection: {
          status: "failed",
          message:
            error.response?.data?.message ||
            "Connection test failed. Please try again.",
        },
      }));
    }
  };

  // Save settings function with PATCH API call
  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);

    try {
      // Prepare the data for PATCH request
      const updateData = {
        defaultProvider: settings.defaultProvider,
        credentialType: settings.credentialType,
        credentials: settings.credentials,
        tenantId: tenantId,
        ownerId: ownerId,
      };

    

      // Make PATCH request to update settings
      const response = await axios.patch(
        `${config.REACT_APP_API_URL}/video-details/update-settings`,
        updateData
      );

      if (response.data.success) {
        notify.success("Settings saved successfully!");

        // Update local settings with the response data if needed
        if (response.data.data) {
          setSettings(response.data.data);
        }
      } else {
        throw new Error(response.data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      notify.success(
        error.response?.data?.message ||
          "Failed to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderCredentialForm = (provider) => {
    // Convert kebab-case to camelCase for object key access
    const providerKey = provider.replace(/-([a-z])/g, (g) =>
      g[1].toUpperCase()
    );

    const providerConfig = {
      "google-meet": {
        fields: [
          {
            key: "clientId",
            label: "Client ID",
            type: "text",
            placeholder: "Google OAuth Client ID",
          },
          {
            key: "clientSecret",
            label: "Client Secret",
            type: "password",
            placeholder: "Google OAuth Client Secret",
          },
          {
            key: "refreshToken",
            label: "Refresh Token",
            type: "password",
            placeholder: "OAuth Refresh Token",
          },
        ],
        docs: "https://developers.google.com/meet/api",
      },
      zoom: {
        fields: [
          {
            key: "apiKey",
            label: "API Key",
            type: "text",
            placeholder: "Zoom API Key",
          },
          {
            key: "apiSecret",
            label: "API Secret",
            type: "password",
            placeholder: "Zoom API Secret",
          },
          {
            key: "accountId",
            label: "Account ID",
            type: "text",
            placeholder: "Zoom Account ID",
          },
        ],
        docs: "https://marketplace.zoom.us/docs/api-reference",
      },
      teams: {
        fields: [
          {
            key: "tenantId",
            label: "Tenant ID",
            type: "text",
            placeholder: "Microsoft Tenant ID",
          },
          {
            key: "clientId",
            label: "Client ID",
            type: "text",
            placeholder: "Azure App Client ID",
          },
          {
            key: "clientSecret",
            label: "Client Secret",
            type: "password",
            placeholder: "Azure App Client Secret",
          },
        ],
        docs: "https://docs.microsoft.com/en-us/graph/api/overview",
      },
    };

    const config = providerConfig[provider];
    if (!config) return null;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm text-blue-700">
            To use your own{" "}
            {videoProviders.find((p) => p.id === provider)?.name} credentials,
            you'll need to create an application in their developer portal.
            <a
              href={config.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              View Setup Guide →
            </a>
          </p>
        </div>

        {config.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="relative">
              <input
                type={
                  field.type === "password" && showCredentials[provider]
                    ? "text"
                    : field.type
                }
                value={settings.credentials[providerKey]?.[field.key] || ""}
                onChange={(e) =>
                  handleCredentialChange(providerKey, field.key, e.target.value)
                }
                placeholder={field.placeholder}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#217989] focus:ring-[#217989] pr-10"
              />
              {field.type === "password" && (
                <button
                  type="button"
                  onClick={() =>
                    setShowCredentials((prev) => ({
                      ...prev,
                      [providerKey]: !prev[providerKey],
                    }))
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCredentials[providerKey] ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center space-x-3">
          <button
            onClick={testConnection}
            disabled={settings.testConnection?.status === "testing"}
            className="px-4 py-2 bg-[#217989] text-white rounded-lg hover:bg-[#1a6b7a] disabled:bg-gray-400"
          >
            {settings.testConnection?.status === "testing"
              ? "Testing..."
              : "Test Connection"}
          </button>

          {settings.testConnection?.status && (
            <div
              className={`flex items-center space-x-2 ${
                settings.testConnection.status === "success"
                  ? "text-green-600"
                  : settings.testConnection.status === "failed"
                  ? "text-red-600"
                  : "text-[#217989]"
              }`}
            >
              {settings.testConnection.status === "success" && (
                <CheckCircleIcon className="h-5 w-5" />
              )}
              {settings.testConnection.status === "failed" && (
                <ExclamationTriangleIcon className="h-5 w-5" />
              )}
              <span className="text-sm">{settings.testConnection.message}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      // v1.0.2 <----------------------------------------------------------------------------
      <div className="space-y-6 sm:mt-6 md:mt-6">
        {/* Header */}
        <div className="flex justify-between items-center px-2">
          <div className="h-6 w-48 rounded shimmer"></div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-24 rounded shimmer"></div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="flex sm:flex-col md:flex-col sm:items-start md:items-start items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-5 w-32 rounded shimmer"></div>
              <div className="h-3 w-56 rounded shimmer"></div>
            </div>
            <div className="flex items-center space-x-2 sm:mt-4 md:mt-4">
              <div className="w-4 h-4 rounded-full shimmer"></div>
              <div className="h-3 w-28 rounded shimmer"></div>
            </div>
          </div>

          {/* Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
            {[1, 2].map((_, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg h-10 w-10 shimmer"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-4 w-24 rounded shimmer"></div>
                    <div className="h-3 w-32 rounded shimmer"></div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                  <div className="h-3 w-20 rounded shimmer"></div>
                  <ul className="space-y-1">
                    <li className="h-3 w-full rounded shimmer"></li>
                    <li className="h-3 w-5/6 rounded shimmer"></li>
                    <li className="h-3 w-3/4 rounded shimmer"></li>
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Provider Comparison */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg space-y-3">
            <div className="h-4 w-48 rounded shimmer"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-20 rounded shimmer"></div>
                <div className="h-3 w-32 rounded shimmer"></div>
              </div>
              <div className="space-y-1">
                <div className="h-3 w-24 rounded shimmer"></div>
                <div className="h-3 w-28 rounded shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Credential Configuration */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="h-5 w-40 rounded shimmer"></div>
          <div className="space-y-3">
            {[1, 2].map((_, index) => (
              <div
                key={index}
                className="flex items-center p-4 border rounded-lg space-x-3"
              >
                <div className="h-4 w-4 rounded-full shimmer"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-32 rounded shimmer"></div>
                  <div className="h-3 w-48 rounded shimmer"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-16 rounded shimmer"></div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="h-5 w-36 rounded shimmer"></div>
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full shimmer"></div>
              <div className="space-y-1 flex-1">
                <div className="h-4 w-32 rounded shimmer"></div>
                <div className="h-3 w-full rounded shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      // v1.0.2 ----------------------------------------------------------------------------->
    );
  }

  // ✅ FIX: Show error if it exists
  if (error && !settings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading settings: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load settings</p>
      </div>
    );
  }

  return (
    // v1.0.1 <---------------------------------------------------------------------------
    <div className="space-y-6 sm:mt-6 md:mt-6">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={confirmProviderChange}
        onCancel={cancelProviderChange}
        title="Change Video Provider"
        message={`Are you sure you want to change your video provider to ${
          videoProviders.find((p) => p.id === pendingProvider)?.name
        }? This may affect your existing video call settings.`}
      />

      <div className="flex justify-between items-center px-2">
        <h2 className="sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl font-bold">
          Video Calling Settings
        </h2>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="text-sm px-4 py-2 bg-[#217989] text-white rounded-lg hover:bg-[#1a6b7a] disabled:bg-gray-400 flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Settings</span>
          )}
        </button>
      </div>

      {/* Provider Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex sm:flex-col md:flex-col sm:items-start md:items-start items-center justify-between mb-6">
          <div>
            <h3 className="sm:text-md md:text-md lg:text-md xl:text-xl 2xl:text-xl font-semibold text-gray-900">
              Video Calling Provider
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose your preferred video conferencing solution for interviews
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:mt-4 md:mt-4">
            <div className="w-3 h-3 bg-[#217989] rounded-full"></div>
            <span className="text-sm text-gray-600">
              Current:{" "}
              {
                videoProviders.find((p) => p.id === settings.defaultProvider)
                  ?.name
              }
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          {videoProviders.map((provider) => (
            <div
              key={provider.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                settings.defaultProvider === provider.id
                  ? "border-[#217989] bg-[#217989]/5"
                  : "border-gray-200 hover:border-[#217989]/50 bg-white"
              }`}
              onClick={() => handleProviderChange(provider.id)}
            >
              {/* Selection Indicator */}
              {settings.defaultProvider === provider.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#217989] rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Provider Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`p-3 rounded-lg ${
                    settings.defaultProvider === provider.id
                      ? "bg-[#217989] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <provider.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{provider.name}</h4>
                  <p className="text-xs text-gray-600">
                    {provider.description}
                  </p>
                </div>
              </div>

              {/* Provider Specifications */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  Key Features:
                </h5>
                <ul className="space-y-1">
                  {provider.specifications.slice(0, 3).map((spec, index) => (
                    <li
                      key={index}
                      className="flex items-center text-xs text-gray-600"
                    >
                      <div className="w-1 h-1 bg-[#217989] rounded-full mr-2"></div>
                      {spec}
                    </li>
                  ))}
                  {provider.specifications.length > 3 && (
                    <li className="text-xs text-gray-500 italic">
                      +{provider.specifications.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Provider Comparison */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">
            Need help choosing?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-[#217989]">Zoom:</span>
              <p className="text-gray-600">
                Perfect for enterprise environments
              </p>
            </div>
            <div>
              <span className="font-medium text-[#217989]">Google Meet:</span>
              <p className="text-gray-600">Ideal for Google Workspace users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credential Configuration */}
      {/* {settings.defaultProvider !== 'platform' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Credential Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Credential Type
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="credentialType"
                    value="platform"
                    checked={ settings.credentialType === 'platform'}
                    onChange={(e) => handleCredentialTypeChange(e.target.value)}
                    className="text-[#217989] focus:ring-[#217989]"
                  />
                  <div className="ml-3">
                    <div className="font-medium">Use Platform Credentials</div>
                    <div className="text-sm text-gray-500">
                      Use our managed {videoProviders.find(p => p.id === settings.defaultProvider)?.name} integration (Recommended)
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="credentialType"
                    value="tenant"
                    checked={settings.credentialType === 'tenant'}
                    onChange={(e) => handleCredentialTypeChange(e.target.value)}
                    className="text-[#217989] focus:ring-[#217989]"
                  />
                  <div className="ml-3">
                    <div className="font-medium">Use Your Own Credentials</div>
                    <div className="text-sm text-gray-500">
                      Connect your own {videoProviders.find(p => p.id === settings.defaultProvider)?.name} account for full control
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {settings.credentialType === 'tenant' && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">
                  {videoProviders.find(p => p.id === settings.defaultProvider)?.name} Credentials
                </h4>
                {renderCredentialForm(settings.defaultProvider)}
              </div>
            )}

            {settings.credentialType === 'platform' && (
              <div className="bg-[#217989]/5 border-l-4 border-[#217989] p-4 rounded-r-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-[#217989] mr-2" />
                  <p className="text-sm text-[#217989]">
                    You're using our managed {videoProviders.find(p => p.id === settings.defaultProvider)?.name} integration. 
                    No additional setup required - meetings will be created automatically during interview scheduling.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
*/}

      {/* Credential Configuration */}
      {settings.defaultProvider !== "platform" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Credential Configuration</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Credential Type
              </label>

              <div className="space-y-3">
                {/* Always show Platform Credentials */}
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="credentialType"
                    value="platform"
                    checked={settings.credentialType === "platform"}
                    onChange={(e) => handleCredentialTypeChange(e.target.value)}
                    className="text-[#217989] focus:ring-[#217989]"
                    disabled={isOrganization === false}
                    // added by Ranjith – disable change when org is false
                  />
                  <div className="ml-3">
                    <div className="font-medium">Use Platform Credentials</div>
                    <div className="text-sm text-gray-500">
                      Use our managed{" "}
                      {
                        videoProviders.find(
                          (p) => p.id === settings.defaultProvider
                        )?.name
                      }{" "}
                      integration (Recommended)
                    </div>
                  </div>
                </label>

                {/* Show “Use Your Own Credentials” only if organization is true */}
                {isOrganization === true && (
                  // added by Ranjith – show tenant option only for organization=true
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="credentialType"
                      value="tenant"
                      checked={settings.credentialType === "tenant"}
                      onChange={(e) =>
                        handleCredentialTypeChange(e.target.value)
                      }
                      className="text-[#217989] focus:ring-[#217989]"
                    />
                    <div className="ml-3">
                      <div className="font-medium">
                        Use Your Own Credentials
                      </div>
                      <div className="text-sm text-gray-500">
                        Connect your own{" "}
                        {
                          videoProviders.find(
                            (p) => p.id === settings.defaultProvider
                          )?.name
                        }{" "}
                        account for full control
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Show tenant credential form only if selected & organization=true */}
            {isOrganization === true &&
              settings.credentialType === "tenant" && (
                // added by Ranjith – tenant credential form only for organization=true
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-4">
                    {
                      videoProviders.find(
                        (p) => p.id === settings.defaultProvider
                      )?.name
                    }{" "}
                    Credentials
                  </h4>
                  {renderCredentialForm(settings.defaultProvider)}
                </div>
              )}

            {/* Always show platform info box */}
            {settings.credentialType === "platform" && (
              <div className="bg-[#217989]/5 border-l-4 border-[#217989] p-4 rounded-r-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-[#217989] mr-2" />
                  <p className="text-sm text-[#217989]">
                    You're using our managed{" "}
                    {
                      videoProviders.find(
                        (p) => p.id === settings.defaultProvider
                      )?.name
                    }{" "}
                    integration. No additional setup required - meetings will be
                    created automatically during interview scheduling.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h4 className="font-medium">Configure Provider</h4>
              <p className="text-sm text-gray-600">
                Select your preferred video calling provider and configure
                credentials if needed.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h4 className="font-medium">Schedule Interviews</h4>
              <p className="text-sm text-gray-600">
                When scheduling interviews, meetings will be automatically
                created using your selected provider.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h4 className="font-medium">Join Meetings</h4>
              <p className="text-sm text-gray-600">
                Interview participants will receive meeting links and can join
                directly from the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    // v1.0.1 --------------------------------------------------------------------------->
  );
}

// // added by Ranjith

// import { useEffect, useState } from 'react'
// import {
//   VideoCameraIcon,
//   Cog6ToothIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   EyeIcon,
//   EyeSlashIcon
// } from '@heroicons/react/24/outline'
// import axios from 'axios'
// import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
// import Cookies from "js-cookie";
// import { config } from '../../../../config';

// export function VideoCallingSettings() {
//   // const [settings, setSettings] = useState({
//   //   defaultProvider: 'zoom', // 'platform', 'google-meet', 'zoom', 'teams'
//   //   credentialType: 'zoom', // 'platform' or 'tenant'
//   //   credentials: {
//   //     googleMeet: {
//   //       clientId: '',
//   //       clientSecret: '',
//   //       refreshToken: ''
//   //     },
//   //     zoom: {
//   //       apiKey: '',
//   //       apiSecret: '',
//   //       accountId: ''
//   //     },
//   //     teams: {
//   //       tenantId: '',
//   //       clientId: '',
//   //       clientSecret: ''
//   //     }
//   //   },
//   //   testConnection: {
//   //     status: null, // 'testing', 'success', 'failed'
//   //     message: ''
//   //   }
//   // })

//   const [settings, setSettings] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

// // Get user token information
//   const tokenPayload = decodeJwt(Cookies.get("authToken"));
//   const ownerId = tokenPayload?.userId;
//   const tenantId = tokenPayload?.tenantId;

//   const [showCredentials, setShowCredentials] = useState({
//     googleMeet: false,
//     zoom: false,
//     teams: false
//   })

//   const videoProviders = [
//     // {
//     //   id: 'platform',
//     //   name: 'Platform Video Calling',
//     //   description: 'Use our built-in video calling solution',
//     //   icon: VideoCameraIcon,
//     //   specifications: [
//     //     'HD Video & Audio Quality',
//     //     'Built-in Screen Sharing',
//     //     'Automatic Recording',
//     //     'Real-time Chat',
//     //     'No Setup Required',
//     //     'Seamless Integration'
//     //   ]
//     // },

//     {
//       id: 'zoom',
//       name: 'Zoom',
//       description: 'Use Zoom for professional video interviews',
//       icon: VideoCameraIcon,
//       specifications: [
//         'Professional Video Quality',
//         'Zoom Rooms Support',
//         'Webinar Capabilities',
//         'Local & Cloud Recording',
//         'Breakout Rooms',
//         'Advanced Security Features'
//       ]
//     },
//     {
//       id: 'google-meet',
//       name: 'Google Meet',
//       description: 'Integrate with Google Meet for video interviews',
//       icon: VideoCameraIcon,
//       specifications: [
//         'Google Workspace Integration',
//         'Calendar Sync',
//         'Cloud Recording',
//         'Live Captions & Transcription',
//         'Up to 250 Participants',
//         'Mobile App Support'
//       ]
//     },

//     // {
//     //   id: 'teams',
//     //   name: 'Microsoft Teams',
//     //   description: 'Integrate with Microsoft Teams',
//     //   icon: VideoCameraIcon,
//     //   specifications: [
//     //     'Office 365 Integration',
//     //     'Teams Channels',
//     //     'Meeting Recording',
//     //     'Collaboration Tools',
//     //     'Enterprise Security',
//     //     'PowerPoint Integration'
//     //   ]
//     // }
//   ]

//   // useEffect(() => {
//   //   const fetchSettings = async () => {
//   //     try {
//   //       // const { data } = await axios.get(`${config?.REACT_APP_API_URL}/api/get-settings`, {
//   //       //   params: { tenantId, ownerId }
//   //       // })
//   //       // const data = await axios.get(
//   //       //   `${config.REACT_APP_API_URL}/api/get-settings?tenantId=${tenantId}&ownerId=${ownerId}`
//   //       // );
//   //       const data = await axios.get(
//   //           `${config.REACT_APP_API_URL}/api/get-settings`,{
//   //            params: {
//   //         tenantId: tenantId,
//   //         ownerId: ownerId
//   //            }
//   //       })
//   //       console.log("data ", data);

//   //       // setSettings(data)
//   //     } catch (err) {
//   //       console.error('Error loading settings:', err)
//   //     }
//   //   }
//   //   fetchSettings()
//   // }, [tenantId, ownerId])

//   useEffect(() => {
//     console.log("tenantId", tenantId);
//     console.log("ownerId", ownerId);
//     const fetchSettings = async () => {
//       try {
//         setLoading(true)
//         setError(null)

//         // ✅ FIX: Properly destructure response and set settings
//         const { data } = await axios.get(
//           `${config.REACT_APP_API_URL}/video-details/get-settings`,
//           {
//             params: {
//               tenantId: tenantId,
//               ownerId: ownerId
//             }
//           }
//         )

//         console.log("✅ API Response:", data);

//         // ✅ FIX: Set the settings from the API response
//         if (data.success && data.data) {
//           setSettings(data.data)
//         } else {
//           // If no settings, set default
//           setSettings({
//             defaultProvider: 'zoom',
//             credentialType: 'platform',
//             credentials: {
//               googleMeet: {
//                 clientId: '',
//                 clientSecret: '',
//                 refreshToken: '',
//                 isConfigured: false
//               },
//               zoom: {
//                 apiKey: '',
//                 apiSecret: '',
//                 accountId: '',
//                 isConfigured: false
//               },
//               teams: {
//                 tenantId: '',
//                 clientId: '',
//                 clientSecret: '',
//                 isConfigured: false
//               }
//             },
//             testConnection: {
//               status: null,
//               message: ''
//             }
//           })
//         }
//       } catch (err) {
//         console.error('❌ Error loading settings:', err)
//         setError(err.message)

//         // ✅ FIX: Set default settings on error
//         setSettings({
//           defaultProvider: 'zoom',
//           credentialType: 'platform',
//           credentials: {
//             googleMeet: {
//               clientId: '',
//               clientSecret: '',
//               refreshToken: '',
//               isConfigured: false
//             },
//             zoom: {
//               apiKey: '',
//               apiSecret: '',
//               accountId: '',
//               isConfigured: false
//             },
//             teams: {
//               tenantId: '',
//               clientId: '',
//               clientSecret: '',
//               isConfigured: false
//             }
//           },
//           testConnection: {
//             status: null,
//             message: ''
//           }
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (tenantId && ownerId) {
//       fetchSettings()
//     }
//   }, [tenantId, ownerId])

//   // ✅ FIX: Better loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#217989] mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading settings...</p>
//         </div>
//       </div>
//     )
//   }

//   // ✅ FIX: Show error if it exists
//   if (error && !settings) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//         <p className="text-red-800">Error loading settings: {error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-2 text-red-600 underline"
//         >
//           Retry
//         </button>
//       </div>
//     )
//   }

//   const handleProviderChange = (providerId) => {
//     setSettings(prev => ({
//       ...prev,
//       defaultProvider: providerId ? providerId : 'zoom',
//       credentialType: providerId === 'zoom' ? 'zoom' : 'zoom',
//       testConnection: { status: null, message: '' }
//     }))
//   }

//   const handleCredentialTypeChange = (type) => {
//     setSettings(prev => ({
//       ...prev,
//       credentialType: type,
//       testConnection: { status: null, message: '' }
//     }))
//   }

//   const handleCredentialChange = (provider, field, value) => {
//     setSettings(prev => ({
//       ...prev,
//       credentials: {
//         ...prev.credentials,
//         [provider]: {
//           ...prev.credentials[provider],
//           [field]: value
//         }
//       }
//     }))
//   }

//   const testConnection = async () => {
//     setSettings(prev => ({
//       ...prev,
//       testConnection: { status: 'testing', message: 'Testing connection...' }
//     }))

//     // Simulate API call
//     setTimeout(() => {
//       const isValid = Math.random() > 0.3 // 70% success rate for demo
//       setSettings(prev => ({
//         ...prev,
//         testConnection: {
//           status: isValid ? 'success' : 'failed',
//           message: isValid
//             ? 'Connection successful! Your credentials are valid.'
//             : 'Connection failed. Please check your credentials and try again.'
//         }
//       }))
//     }, 2000)
//   }

//   const saveSettings = () => {
//     // In a real application, this would save to backend
//     alert('Video calling settings saved successfully!')
//   }

//   const renderCredentialForm = (provider) => {
//     // Convert kebab-case to camelCase for object key access
//     const providerKey = provider.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

//     const providerConfig = {
//       'google-meet': {
//         fields: [
//           { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Google OAuth Client ID' },
//           { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Google OAuth Client Secret' },
//           { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token' }
//         ],
//         docs: 'https://developers.google.com/meet/api'
//       },
//       zoom: {
//         fields: [
//           { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Zoom API Key' },
//           { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Zoom API Secret' },
//           { key: 'accountId', label: 'Account ID', type: 'text', placeholder: 'Zoom Account ID' }
//         ],
//         docs: 'https://marketplace.zoom.us/docs/api-reference'
//       },
//       teams: {
//         fields: [
//           { key: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'Microsoft Tenant ID' },
//           { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Azure App Client ID' },
//           { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Azure App Client Secret' }
//         ],
//         docs: 'https://docs.microsoft.com/en-us/graph/api/overview'
//       }
//     }

//     const config = providerConfig[provider]
//     if (!config) return null

//     return (
//       <div className="space-y-4">
//         <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
//           <p className="text-sm text-blue-700">
//             To use your own {videoProviders.find(p => p.id === provider)?.name} credentials, you'll need to create an application in their developer portal.
//             <a href={config.docs} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
//               View Setup Guide →
//             </a>
//           </p>
//         </div>

//         {config.fields.map(field => (
//           <div key={field.key}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {field.label}
//             </label>
//             <div className="relative">
//               <input
//                 type={field.type === 'password' && showCredentials[provider] ? 'text' : field.type}
//                 value={settings.credentials[providerKey][field.key]}
//                 onChange={(e) => handleCredentialChange(providerKey, field.key, e.target.value)}
//                 placeholder={field.placeholder}
//                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#217989] focus:ring-[#217989] pr-10"
//               />
//               {field.type === 'password' && (
//                 <button
//                   type="button"
//                   onClick={() => setShowCredentials(prev => ({
//                     ...prev,
//                     [providerKey]: !prev[providerKey]
//                   }))}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   {showCredentials[providerKey] ? (
//                     <EyeSlashIcon className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <EyeIcon className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}

//         <div className="flex items-center space-x-3">
//           <button
//             onClick={testConnection}
//             disabled={settings.testConnection.status === 'testing'}
//             className="px-4 py-2 bg-[#217989] text-white rounded-lg hover:bg-[#1a6b7a] disabled:bg-gray-400"
//           >
//             {settings.testConnection.status === 'testing' ? 'Testing...' : 'Test Connection'}
//           </button>

//           {settings.testConnection.status && (
//             <div className={`flex items-center space-x-2 ${
//               settings.testConnection.status === 'success' ? 'text-green-600' :
//               settings.testConnection.status === 'failed' ? 'text-red-600' : 'text-[#217989]'
//             }`}>
//               {settings.testConnection.status === 'success' && <CheckCircleIcon className="h-5 w-5" />}
//               {settings.testConnection.status === 'failed' && <ExclamationTriangleIcon className="h-5 w-5" />}
//               <span className="text-sm">{settings.testConnection.message}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Video Calling Settings</h2>
//         <button
//           onClick={saveSettings}
//           className="px-4 py-2 bg-[#217989] text-white rounded-lg hover:bg-[#1a6b7a]"
//         >
//           Save Settings
//         </button>
//       </div>

//       {/* Provider Selection */}
//       <div className="bg-white p-6 rounded-lg shadow">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h3 className="text-xl font-semibold text-gray-900">Video Calling Provider</h3>
//             <p className="text-sm text-gray-600 mt-1">Choose your preferred video conferencing solution for interviews</p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-3 h-3 bg-[#217989] rounded-full"></div>
//             <span className="text-sm text-gray-600">
//               Current: {videoProviders.find(p => p.id === settings.defaultProvider)?.name}
//             </span>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
//           {videoProviders.map(provider => (
//             <div
//               key={provider.id}
//               className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
//                 settings.defaultProvider === provider.id
//                   ? 'border-[#217989] bg-[#217989]/5'
//                   : 'border-gray-200 hover:border-[#217989]/50 bg-white'
//               }`}
//               onClick={() => handleProviderChange(provider.id)}
//             >
//               {/* Selection Indicator */}
//               {settings.defaultProvider === provider.id && (
//                 <div className="absolute top-2 right-2 w-5 h-5 bg-[#217989] rounded-full flex items-center justify-center">
//                   <CheckCircleIcon className="h-3 w-3 text-white" />
//                 </div>
//               )}

//               {/* Provider Header */}
//               <div className="flex items-center space-x-3 mb-3">
//                 <div className={`p-3 rounded-lg ${
//                   settings.defaultProvider === provider.id
//                     ? 'bg-[#217989] text-white'
//                     : 'bg-gray-100 text-gray-600'
//                 }`}>
//                   <provider.icon className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h4 className="font-medium text-gray-900">{provider.name}</h4>
//                   <p className="text-xs text-gray-600">{provider.description}</p>
//                   {provider.id === 'platform' && (
//                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#217989]/10 text-[#217989]">
//                       Recommended
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Provider Specifications */}
//               <div className="mt-3 pt-3 border-t border-gray-200">
//                 <h5 className="text-xs font-medium text-gray-700 mb-2">Key Features:</h5>
//                 <ul className="space-y-1">
//                   {provider.specifications.slice(0, 3).map((spec, index) => (
//                     <li key={index} className="flex items-center text-xs text-gray-600">
//                       <div className="w-1 h-1 bg-[#217989] rounded-full mr-2"></div>
//                       {spec}
//                     </li>
//                   ))}
//                   {provider.specifications.length > 3 && (
//                     <li className="text-xs text-gray-500 italic">
//                       +{provider.specifications.length - 3} more features
//                     </li>
//                   )}
//                 </ul>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Provider Comparison */}
//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <h4 className="font-medium text-gray-900 mb-3">Need help choosing?</h4>
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 text-sm">
//             <div>
//               <span className="font-medium text-[#217989]">Platform Video:</span>
//               <p className="text-gray-600">Best for quick setup and seamless integration</p>
//             </div>
//             <div>
//               <span className="font-medium text-[#217989]">Google Meet:</span>
//               <p className="text-gray-600">Ideal for Google Workspace users</p>
//             </div>
//             <div>
//               <span className="font-medium text-[#217989]">Zoom/Teams:</span>
//               <p className="text-gray-600">Perfect for enterprise environments</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Credential Configuration */}
//       {settings.defaultProvider !== 'platform' && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium mb-4">Credential Configuration</h3>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3">
//                 Choose Credential Type
//               </label>
//               <div className="space-y-3">
//                 <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
//                   <input
//                     type="radio"
//                     name="credentialType"
//                     value="platform"
//                     checked={settings.credentialType === 'platform'}
//                     onChange={(e) => handleCredentialTypeChange(e.target.value)}
//                     className="text-[#217989] focus:ring-[#217989]"
//                   />
//                   <div className="ml-3">
//                     <div className="font-medium">Use Platform Credentials</div>
//                     <div className="text-sm text-gray-500">
//                       Use our managed {videoProviders.find(p => p.id === settings.defaultProvider)?.name} integration (Recommended)
//                     </div>
//                   </div>
//                 </label>

//                 <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
//                   <input
//                     type="radio"
//                     name="credentialType"
//                     value="tenant"
//                     checked={settings.credentialType === 'tenant'}
//                     onChange={(e) => handleCredentialTypeChange(e.target.value)}
//                     className="text-[#217989] focus:ring-[#217989]"
//                   />
//                   <div className="ml-3">
//                     <div className="font-medium">Use Your Own Credentials</div>
//                     <div className="text-sm text-gray-500">
//                       Connect your own {videoProviders.find(p => p.id === settings.defaultProvider)?.name} account for full control
//                     </div>
//                   </div>
//                 </label>
//               </div>
//             </div>

//             {settings.credentialType === 'tenant' && (
//               <div className="mt-6">
//                 <h4 className="text-lg font-medium mb-4">
//                   {videoProviders.find(p => p.id === settings.defaultProvider)?.name} Credentials
//                 </h4>
//                 {renderCredentialForm(settings.defaultProvider)}
//               </div>
//             )}

//             {settings.credentialType === 'platform' && (
//               <div className="bg-[#217989]/5 border-l-4 border-[#217989] p-4 rounded-r-lg">
//                 <div className="flex items-center">
//                   <CheckCircleIcon className="h-5 w-5 text-[#217989] mr-2" />
//                   <p className="text-sm text-[#217989]">
//                     You're using our managed {videoProviders.find(p => p.id === settings.defaultProvider)?.name} integration.
//                     No additional setup required - meetings will be created automatically during interview scheduling.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Platform Default Info */}
//       {settings.defaultProvider === 'platform' && (
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium mb-4">Platform Video Calling</h3>
//           <div className="bg-[#217989]/5 border-l-4 border-[#217989] p-4 rounded-r-lg">
//             <div className="flex items-center">
//               <CheckCircleIcon className="h-5 w-5 text-[#217989] mr-2" />
//               <p className="text-sm text-[#217989]">
//                 You're using our built-in video calling solution. This provides the best integration experience
//                 with automatic meeting creation, recording, and seamless interview management.
//               </p>
//             </div>
//           </div>

//           <div className="mt-4">
//             <h4 className="font-medium mb-2">Features Included:</h4>
//             <ul className="space-y-2">
//               {videoProviders[0].specifications.map((feature, index) => (
//                 <li key={index} className="flex items-center text-sm text-gray-600">
//                   <CheckCircleIcon className="h-4 w-4 text-[#217989] mr-2" />
//                   {feature}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}

//       {/* Usage Instructions */}
//      <div className="bg-white p-6 rounded-lg shadow">
//   <h3 className="text-lg font-medium mb-4">How It Works</h3>
//   <div className="space-y-4">
//     <div className="flex items-start space-x-3">
//       <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
//         1
//       </div>
//       <div>
//         <h4 className="font-medium">Configure Provider</h4>
//         <p className="text-sm text-gray-600">Select your preferred video calling provider and configure credentials if needed.</p>
//       </div>
//     </div>
//     <div className="flex items-start space-x-3">
//       <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
//         2
//       </div>
//       <div>
//         <h4 className="font-medium">Schedule Interviews</h4>
//         <p className="text-sm text-gray-600">When scheduling interviews, meetings will be automatically created using your selected provider.</p>
//       </div>
//     </div>
//     <div className="flex items-start space-x-3">
//       <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
//         3
//       </div>
//       <div>
//         <h4 className="font-medium">Join Meetings</h4>
//         <p className="text-sm text-gray-600">Interview participants will receive meeting links and can join directly from the platform.</p>
//       </div>
//     </div>
//   </div>
// </div>
//     </div>
//   )
// }
