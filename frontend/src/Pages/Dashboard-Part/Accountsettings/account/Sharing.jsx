import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { sharingSettings, sharedContent, sharingAnalytics } from '../mockData/sharingData'
import { EditButton } from '../common/Buttons'
import { SharingSettingsPopup } from './SharingSettingsPopup'
import { ShareContentPopup } from './ShareContentPopup'

const Sharing = () => {
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)

  const handleUpdateSettings = (newSettings) => {
    console.log('Update settings:', newSettings)
    setIsEditingSettings(false)
  }

  const handleShare = (shareData) => {
    console.log('Share content:', shareData)
    setIsSharing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sharing Settings</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsSharing(true)}
            className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
          >
            Share New Content
          </button>
          <button
            onClick={() => setIsEditingSettings(true)}
            className="px-2 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
          >
            <EditButton className="text-white hover:text-white"/>
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">General Settings</h3>
        <div className="space-y-4">
          {Object.entries(sharingSettings.general).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  value ? 'bg-custom-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Shared Content</h3>
        <div className="space-y-4">
          {sharedContent.map(content => (
            <div key={content.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{content.name}</h4>
                  <p className="text-sm text-gray-500">
                    Shared by {content.sharedBy} • {new Date(content.created).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    content.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {content.status}
                  </span>
                  <EditButton onClick={() => setSelectedContent(content)} />
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Shared With</h5>
                <div className="space-y-2">
                  {content.sharedWith.map((recipient, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>
                        {recipient.type === 'user' ? recipient.name : recipient.domain}
                        <span className="text-gray-500 ml-2">({recipient.role})</span>
                      </span>
                      <button className="text-red-600 hover:text-red-800">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sharing Analytics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Sharing Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Total Shares</h4>
            <p className="text-2xl font-bold">{sharingAnalytics.totalShares}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Active Shares</h4>
            <p className="text-2xl font-bold">{sharingAnalytics.activeShares}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Expired Shares</h4>
            <p className="text-2xl font-bold">{sharingAnalytics.expiredShares}</p>
          </div>
        </div>
      </div>

      {/* Popups */}
      {isEditingSettings && (
        <SharingSettingsPopup
          settings={sharingSettings}
          onSave={handleUpdateSettings}
          onClose={() => setIsEditingSettings(false)}
        />
      )}

      {(isSharing || selectedContent) && (
        <ShareContentPopup
          content={selectedContent}
          onSave={handleShare}
          onClose={() => {
            setIsSharing(false)
            setSelectedContent(null)
          }}
        />
      )}
    </div>
  )
}

export default Sharing