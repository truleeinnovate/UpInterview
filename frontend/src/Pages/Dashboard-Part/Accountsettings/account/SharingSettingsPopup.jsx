import { useState } from 'react'
import { X, Minimize, Expand } from 'lucide-react';
import Modal from 'react-modal';
import classNames from 'classnames';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

export function SharingSettingsPopup({ settings, onSave, onClose }) {
  const [formData, setFormData] = useState({
    general: { ...settings.general },
    permissions: { ...settings.permissions },
    security: { ...settings.security },
    domains: { ...settings.domains }
  })
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false)
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const modalClass = classNames(
      'fixed bg-white shadow-2xl border-l border-gray-200',
      {
        'overflow-y-auto': !isModalOpen,
        'overflow-hidden': isModalOpen,
        'inset-0': isFullScreen,
        'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
      }
    );

  return (
     <Modal
            isOpen={true}
            onRequestClose={handleClose}
            className={modalClass}
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
          >
            <div className={classNames('h-full', { 'max-w-7xl mx-auto px-2': isFullScreen })}>
              <div>
                <div className="flex justify-between items-center mb-2 mx-3 mt-3">
                  <h2 className="text-xl font-bold text-custom-blue">Edit Sharing Settings</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
                    >
                      {isFullScreen ? (
                        <ArrowsPointingInIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ArrowsPointingOutIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                {Object.entries(formData.general).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        general: {
                          ...prev.general,
                          [key]: !value
                        }
                      }))}
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

            {/* Security Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Security Settings</h3>
              <div className="space-y-4">
                {Object.entries(formData.security).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        security: {
                          ...prev.security,
                          [key]: !value
                        }
                      }))}
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

            {/* Domain Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Domain Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Domains
                  </label>
                  <textarea
                    value={formData.domains.allowedDomains.join('\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      domains: {
                        ...prev.domains,
                        allowedDomains: e.target.value.split('\n').filter(Boolean)
                      }
                    }))}
                    className="w-full px-2 py-2 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
                    rows={3}
                    placeholder="Enter domains (One Per Line)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blocked Domains
                  </label>
                  <textarea
                    value={formData.domains.blockList.join('\n')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      domains: {
                        ...prev.domains,
                        blockList: e.target.value.split('\n').filter(Boolean)
                      }
                    }))}
                    className="w-full px-2 py-2 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
                    rows={3}
                    placeholder="Enter domains (One Per Line)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
            >
              Save Changes
            </button>
          </div>
        </form>
              </div>
            </div>
    
    
          </Modal>
    
  )
}