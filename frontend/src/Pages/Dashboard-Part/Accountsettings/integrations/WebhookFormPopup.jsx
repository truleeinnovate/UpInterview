import { useState } from 'react'
import { X, Minimize, Expand } from 'lucide-react';
import Modal from 'react-modal';
import classNames from 'classnames';

// Set app element for accessibility
Modal.setAppElement('#root');

export function WebhookFormPopup({ webhook, events, onSave, onClose }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    event: webhook?.event || '',
    endpoint: webhook?.endpoint || '',
    description: webhook?.description || '',
    status: webhook?.status || 'active',
    secret: webhook?.secret || '',
    headers: webhook?.headers || {},
    retryConfig: webhook?.retryConfig || {
      maxAttempts: 3,
      backoffRate: 2
    }
  })

  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleAddHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setFormData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [newHeaderKey.trim()]: newHeaderValue.trim()
        }
      }))
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const handleRemoveHeader = (key) => {
    setFormData(prev => {
      const headers = { ...prev.headers }
      delete headers[key]
      return { ...prev, headers }
    })
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
            onRequestClose={onClose}
            className={modalClass}
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
          >
            <div className={classNames('h-full', { 'max-w-7xl mx-auto px-2': isFullScreen })}>
              <div>
                <div className="flex justify-between items-center mb-2 mx-3 mt-3">
                  <h2 className="text-xl font-bold text-custom-blue">Basic Webhook Information</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
                    >
                      {isFullScreen ? (
                        <Minimize className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Expand className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              <div className='px-4 py-4'>
                <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={formData.event}
                onChange={(e) => setFormData(prev => ({ ...prev, event: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select an event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint URL
              </label>
              <input
                type="url"
                value={formData.endpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-lg font-medium mb-4">Security</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter webhook secret"
            />
            <p className="mt-1 text-sm text-gray-500">
              Used to verify webhook payload authenticity
            </p>
          </div>
        </div>

        {/* Headers */}
        <div>
          <h3 className="text-lg font-medium mb-4">Custom Headers</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                placeholder="Header name"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                placeholder="Header value"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddHeader}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div>
                    <span className="font-medium">{key}: </span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHeader(key)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retry Configuration */}
        <div>
          <h3 className="text-lg font-medium mb-4">Retry Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                value={formData.retryConfig.maxAttempts}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  retryConfig: {
                    ...prev.retryConfig,
                    maxAttempts: parseInt(e.target.value)
                  }
                }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backoff Rate
              </label>
              <input
                type="number"
                value={formData.retryConfig.backoffRate}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  retryConfig: {
                    ...prev.retryConfig,
                    backoffRate: parseFloat(e.target.value)
                  }
                }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="5"
                step="0.5"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
          >
            {webhook ? 'Save Changes' : 'Create Webhook'}
          </button>
        </div>
                </form>
                </div>
              </div>
            </div>
    
    </Modal>
      
    
  )
}