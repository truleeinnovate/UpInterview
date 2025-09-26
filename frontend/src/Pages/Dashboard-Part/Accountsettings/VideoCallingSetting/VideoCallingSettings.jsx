// added by Ranjith


import { useState } from 'react'
import { 
  VideoCameraIcon, 
  Cog6ToothIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export function VideoCallingSettings() {
  const [settings, setSettings] = useState({
    defaultProvider: 'zoom', // 'platform', 'google-meet', 'zoom', 'teams'
    credentialType: 'zoom', // 'platform' or 'tenant'
    credentials: {
      googleMeet: {
        clientId: '',
        clientSecret: '',
        refreshToken: ''
      },
      zoom: {
        apiKey: '',
        apiSecret: '',
        accountId: ''
      },
      teams: {
        tenantId: '',
        clientId: '',
        clientSecret: ''
      }
    },
    testConnection: {
      status: null, // 'testing', 'success', 'failed'
      message: ''
    }
  })

  const [showCredentials, setShowCredentials] = useState({
    googleMeet: false,
    zoom: false,
    teams: false
  })

  const videoProviders = [
    // {
    //   id: 'platform',
    //   name: 'Platform Video Calling',
    //   description: 'Use our built-in video calling solution',
    //   icon: VideoCameraIcon,
    //   specifications: [
    //     'HD Video & Audio Quality',
    //     'Built-in Screen Sharing',
    //     'Automatic Recording',
    //     'Real-time Chat',
    //     'No Setup Required',
    //     'Seamless Integration'
    //   ]
    // },
    
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Use Zoom for professional video interviews',
      icon: VideoCameraIcon,
      specifications: [
        'Professional Video Quality',
        'Zoom Rooms Support',
        'Webinar Capabilities',
        'Local & Cloud Recording',
        'Breakout Rooms',
        'Advanced Security Features'
      ]
    },
    {
      id: 'google-meet',
      name: 'Google Meet',
      description: 'Integrate with Google Meet for video interviews',
      icon: VideoCameraIcon,
      specifications: [
        'Google Workspace Integration',
        'Calendar Sync',
        'Cloud Recording',
        'Live Captions & Transcription',
        'Up to 250 Participants',
        'Mobile App Support'
      ]
    },
   
    // {
    //   id: 'teams',
    //   name: 'Microsoft Teams',
    //   description: 'Integrate with Microsoft Teams',
    //   icon: VideoCameraIcon,
    //   specifications: [
    //     'Office 365 Integration',
    //     'Teams Channels',
    //     'Meeting Recording',
    //     'Collaboration Tools',
    //     'Enterprise Security',
    //     'PowerPoint Integration'
    //   ]
    // }
  ]

  const handleProviderChange = (providerId) => {
    setSettings(prev => ({
      ...prev,
      defaultProvider: providerId ? providerId : 'zoom',
      credentialType: providerId === 'zoom' ? 'zoom' : 'zoom',
      testConnection: { status: null, message: '' }
    }))
  }

  const handleCredentialTypeChange = (type) => {
    setSettings(prev => ({
      ...prev,
      credentialType: type,
      testConnection: { status: null, message: '' }
    }))
  }

  const handleCredentialChange = (provider, field, value) => {
    setSettings(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [provider]: {
          ...prev.credentials[provider],
          [field]: value
        }
      }
    }))
  }

  const testConnection = async () => {
    setSettings(prev => ({
      ...prev,
      testConnection: { status: 'testing', message: 'Testing connection...' }
    }))

    // Simulate API call
    setTimeout(() => {
      const isValid = Math.random() > 0.3 // 70% success rate for demo
      setSettings(prev => ({
        ...prev,
        testConnection: {
          status: isValid ? 'success' : 'failed',
          message: isValid 
            ? 'Connection successful! Your credentials are valid.'
            : 'Connection failed. Please check your credentials and try again.'
        }
      }))
    }, 2000)
  }

  const saveSettings = () => {
    // In a real application, this would save to backend
    alert('Video calling settings saved successfully!')
  }

  const renderCredentialForm = (provider) => {
    // Convert kebab-case to camelCase for object key access
    const providerKey = provider.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    
    const providerConfig = {
      'google-meet': {
        fields: [
          { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Google OAuth Client ID' },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Google OAuth Client Secret' },
          { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token' }
        ],
        docs: 'https://developers.google.com/meet/api'
      },
      zoom: {
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Zoom API Key' },
          { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Zoom API Secret' },
          { key: 'accountId', label: 'Account ID', type: 'text', placeholder: 'Zoom Account ID' }
        ],
        docs: 'https://marketplace.zoom.us/docs/api-reference'
      },
      teams: {
        fields: [
          { key: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'Microsoft Tenant ID' },
          { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Azure App Client ID' },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Azure App Client Secret' }
        ],
        docs: 'https://docs.microsoft.com/en-us/graph/api/overview'
      }
    }

    const config = providerConfig[provider]
    if (!config) return null

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm text-blue-700">
            To use your own {videoProviders.find(p => p.id === provider)?.name} credentials, you'll need to create an application in their developer portal.
            <a href={config.docs} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
              View Setup Guide →
            </a>
          </p>
        </div>

        {config.fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="relative">
              <input
                type={field.type === 'password' && showCredentials[provider] ? 'text' : field.type}
                value={settings.credentials[providerKey][field.key]}
                onChange={(e) => handleCredentialChange(providerKey, field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#217989] focus:ring-[#217989] pr-10"
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => setShowCredentials(prev => ({
                    ...prev,
                    [providerKey]: !prev[providerKey]
                  }))}
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
            disabled={settings.testConnection.status === 'testing'}
            className="px-4 py-2 bg-[#217989] text-white rounded-lg hover:bg-[#1a6b7a] disabled:bg-gray-400"
          >
            {settings.testConnection.status === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>

          {settings.testConnection.status && (
            <div className={`flex items-center space-x-2 ${
              settings.testConnection.status === 'success' ? 'text-green-600' : 
              settings.testConnection.status === 'failed' ? 'text-red-600' : 'text-[#217989]'
            }`}>
              {settings.testConnection.status === 'success' && <CheckCircleIcon className="h-5 w-5" />}
              {settings.testConnection.status === 'failed' && <ExclamationTriangleIcon className="h-5 w-5" />}
              <span className="text-sm">{settings.testConnection.message}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Video Calling Settings</h2>
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-[#217989] text-white rounded-lg hover:bg-[#1a6b7a]"
        >
          Save Settings
        </button>
      </div>

      {/* Provider Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Video Calling Provider</h3>
            <p className="text-sm text-gray-600 mt-1">Choose your preferred video conferencing solution for interviews</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#217989] rounded-full"></div>
            <span className="text-sm text-gray-600">
              Current: {videoProviders.find(p => p.id === settings.defaultProvider)?.name}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
          {videoProviders.map(provider => (
            <div
              key={provider.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                settings.defaultProvider === provider.id
                  ? 'border-[#217989] bg-[#217989]/5'
                  : 'border-gray-200 hover:border-[#217989]/50 bg-white'
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
                <div className={`p-3 rounded-lg ${
                  settings.defaultProvider === provider.id 
                    ? 'bg-[#217989] text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <provider.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{provider.name}</h4>
                  <p className="text-xs text-gray-600">{provider.description}</p>
                  {provider.id === 'platform' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#217989]/10 text-[#217989]">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
              
              {/* Provider Specifications */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Key Features:</h5>
                <ul className="space-y-1">
                  {provider.specifications.slice(0, 3).map((spec, index) => (
                    <li key={index} className="flex items-center text-xs text-gray-600">
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
          <h4 className="font-medium text-gray-900 mb-3">Need help choosing?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-[#217989]">Platform Video:</span>
              <p className="text-gray-600">Best for quick setup and seamless integration</p>
            </div>
            <div>
              <span className="font-medium text-[#217989]">Google Meet:</span>
              <p className="text-gray-600">Ideal for Google Workspace users</p>
            </div>
            <div>
              <span className="font-medium text-[#217989]">Zoom/Teams:</span>
              <p className="text-gray-600">Perfect for enterprise environments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credential Configuration */}
      {settings.defaultProvider !== 'platform' && (
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
                    checked={settings.credentialType === 'platform'}
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

      {/* Platform Default Info */}
      {settings.defaultProvider === 'platform' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Platform Video Calling</h3>
          <div className="bg-[#217989]/5 border-l-4 border-[#217989] p-4 rounded-r-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-[#217989] mr-2" />
              <p className="text-sm text-[#217989]">
                You're using our built-in video calling solution. This provides the best integration experience 
                with automatic meeting creation, recording, and seamless interview management.
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Features Included:</h4>
            <ul className="space-y-2">
              {videoProviders[0].specifications.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 text-[#217989] mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
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
        <p className="text-sm text-gray-600">Select your preferred video calling provider and configure credentials if needed.</p>
      </div>
    </div>
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
        2
      </div>
      <div>
        <h4 className="font-medium">Schedule Interviews</h4>
        <p className="text-sm text-gray-600">When scheduling interviews, meetings will be automatically created using your selected provider.</p>
      </div>
    </div>
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-6 h-6 bg-[#217989]/10 text-[#217989] rounded-full flex items-center justify-center text-sm font-medium">
        3
      </div>
      <div>
        <h4 className="font-medium">Join Meetings</h4>
        <p className="text-sm text-gray-600">Interview participants will receive meeting links and can join directly from the platform.</p>
      </div>
    </div>
  </div>
</div>
    </div>
  )
}