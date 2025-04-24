import { useState } from 'react'
import { SidePopup } from '../common/SidePopup'

export function WebhookFormPopup({ webhook, events, onSave, onClose }) {
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

  return (
    <SidePopup
      title={webhook ? 'Edit Webhook' : 'Create Webhook'}
      onClose={onClose}
      position="right"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {webhook ? 'Save Changes' : 'Create Webhook'}
          </button>
        </div>
      </form>
    </SidePopup>
  )
}