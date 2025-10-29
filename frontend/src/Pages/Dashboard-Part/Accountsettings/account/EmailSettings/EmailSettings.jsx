import { useState, useEffect } from 'react';
import { AlertCircle, Send, Edit2, X, Save, Mail } from 'lucide-react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { config } from '../../../../../config';
import { notify } from '../../../../../services/toastService';

function EmailSettings() {

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;
  const ownerId = tokenPayload.userId;
  console.log("tenantId EmailSettings", tenantId);
  console.log("ownerId EmailSettings", ownerId);
  if (!tenantId || !ownerId) {
    throw new Error('Tenant ID and Owner ID are required');
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [editedSettings, setEditedSettings] = useState(null);
  const [settings, setSettings] = useState({
    fromAddress: 'support@example.com',
    originHost: 'smtp.example.com',
    appPassword: '••••••••••••',
    defaultAddress: 'company@example.com',
    useCustomEmail: false,
    isConfigured: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEmailTemplate = {
    subject: 'Test Email from Template Manager',
    content: `
Dear recipient,

This is a test email sent from the Template Manager system to verify your email configuration.

Configuration Details:
- From Address: {{fromAddress}}
- Host: {{host}}

If you received this email, your email settings are configured correctly.

Best regards,
Template Manager Team
    `.trim()
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateHost = (host) => {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(host);
  };

  const handleEdit = () => {
    // When edit button is clicked, copy current settings exactly as they are
    setEditedSettings({ ...settings });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedSettings(null);
    setIsEditing(false);
  };

  const handleSaveEmailSettings = async () => {
    if (editedSettings.useCustomEmail) {
      if (!validateEmail(editedSettings.fromAddress)) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!validateHost(editedSettings.originHost)) {
        toast.error('Please enter a valid host address');
        return;
      }
      if (!editedSettings.appPassword) {
        toast.error('Please enter the app password');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(config.REACT_APP_API_URL + '/emailTemplate/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedSettings,
          tenantId,
          ownerId,
          isConfigured: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save email settings');
      }

      const savedSettings = await response.json();
      setSettings(savedSettings);
      setIsEditing(false);
      setEditedSettings(null);
      notify.success('Email settings saved successfully!');
    } catch (err) {
      setError(err.message);
      notify.error('Failed to save email settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTestEmailContent = () => {
    const fromAddress = settings.useCustomEmail ? settings.fromAddress : settings.defaultAddress;
    return testEmailTemplate.content
      .replace('{{fromAddress}}', fromAddress)
      .replace('{{host}}', settings.useCustomEmail ? settings.originHost : 'Default Mail Server');
  };

  const handleTestEmail = async () => {
    if (!validateEmail(testEmailAddress)) {
      toast.error('Please enter a valid test email address');
      return;
    }

    setIsSendingTest(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test email sent successfully!');
      setShowTestEmail(false);
      setTestEmailAddress('');
    } catch (error) {
      toast.error('Failed to send test email. Please try again.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleToggleCustomEmail = (e) => {
    if (!isEditing) {
      return; // Don't allow toggle when not in edit mode
    }
    const useCustom = e.target.checked;
    setEditedSettings(prev => ({
      ...prev,
      useCustomEmail: useCustom,
      //isConfigured: useCustom ? prev.isConfigured : false
    }));
  };

  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const response = await fetch(
          `${config.REACT_APP_API_URL}/emailTemplate/email-settings?tenantId=${tenantId}&ownerId=${ownerId}`
        );
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching email settings:', error);
        setError('Failed to fetch email settings');
      }
    };
    fetchEmailSettings();
  }, [tenantId, ownerId]);

  const currentSettings = isEditing ? editedSettings : settings;

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="space-y-4 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        <div className="bg-white rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium">Email Configuration</h4>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setShowTestEmail(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Test Email</span>
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveEmailSettings}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-custom-blue text-white hover:bg-custom-blue/80 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium">Custom Email Configuration</h5>
                <p className="text-sm text-gray-500">Use your own email server for sending templates</p>
              </div>
              <label className={`relative inline-flex items-center ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={currentSettings.useCustomEmail}
                  onChange={handleToggleCustomEmail}
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom-blue"></div>
              </label>
            </div>

            <div className={`${isEditing ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email Address *
                </label>
                <input
                  type="email"
                  placeholder='support@example.com'
                  className={`mt-1 block w-full rounded-md shadow-sm transition-colors ${isEditing
                      ? 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      : 'bg-gray-50 border-gray-200'
                    }`}
                  value={currentSettings.fromAddress}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      fromAddress: e.target.value
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origin Host Address *
                </label>
                <input
                  type="text"
                  placeholder="smtp.example.com"
                  className={`mt-1 block w-full rounded-md shadow-sm transition-colors ${isEditing
                      ? 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      : 'bg-gray-50 border-gray-200'
                    }`}
                  value={currentSettings.originHost}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      originHost: e.target.value
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className={`mt-1 block w-full rounded-md shadow-sm transition-colors ${isEditing
                      ? 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      : 'bg-gray-50 border-gray-200'
                    }`}
                  value={currentSettings.appPassword}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      appPassword: e.target.value
                    })
                  }
                  disabled={!isEditing}
                />
                {isEditing && (
                  <p className="mt-1 text-sm text-gray-500">
                    Use an app-specific password for enhanced security
                  </p>
                )}
              </div>

              {currentSettings.useCustomEmail && !isEditing && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="text-sm text-green-700">
                      <p className="font-medium">Email Configuration Active</p>
                      <p className="mt-1">Your custom email settings are configured and ready to use.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!currentSettings.useCustomEmail && !isEditing && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-custom-blue mt-0.5" />
                  <div className="text-sm text-custom-blue">
                    <p>Using default email configuration:</p>
                    <p className="mt-1 font-medium">{currentSettings.defaultAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Important Notes:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Use a valid SMTP server address</li>
                      <li>Ensure the email address has proper permissions</li>
                      <li>Store the app password securely</li>
                      <li>Test the connection after saving</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signature Editor Component */}
        {/* <SignatureEditor /> */}
      </div>
      {/* Test Email Modal */}
      {showTestEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto mx-4">
            <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-medium">Send Test Email</h3>
              <button
                onClick={() => setShowTestEmail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              {/* Test Email Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b px-4 py-2">
                    <div className="grid grid-cols-[auto,1fr] gap-x-2 text-sm">
                      <span className="text-gray-500">From:</span>
                      <span className="font-medium">{currentSettings.useCustomEmail ? currentSettings.fromAddress : currentSettings.defaultAddress}</span>
                      <span className="text-gray-500">Subject:</span>
                      <span className="font-medium">{testEmailTemplate.subject}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-600">
                      {getTestEmailContent()}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-custom-blue mt-0.5" />
                  <div className="text-sm text-custom-blue">
                    <p className="font-medium">About Test Emails</p>
                    <p className="mt-1">
                      This will send a test email using your current configuration. Use this to verify your email settings are working correctly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button
                onClick={() => setShowTestEmail(false)}
                className="mr-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleTestEmail}
                disabled={isSendingTest}
                className="bg-custom-blue text-white px-4 py-2 rounded-lg hover:bg-custom-blue/80 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>{isSendingTest ? 'Sending...' : 'Send Test'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

EmailSettings.propTypes = {
  tenantId: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default EmailSettings;