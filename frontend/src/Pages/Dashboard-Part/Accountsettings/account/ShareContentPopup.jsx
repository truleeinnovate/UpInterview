import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function ShareContentPopup({ content, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: content?.name || '',
    type: content?.type || 'interview',
    recipients: content?.sharedWith || [],
    expiryDays: 7,
    role: 'viewer'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleAddRecipient = () => {
    const recipientInput = document.getElementById('recipient')
    const recipient = recipientInput.value.trim()

    if (recipient) {
      const isEmail = recipient.includes('@')
      setFormData(prev => ({
        ...prev,
        recipients: [
          ...prev.recipients,
          {
            type: isEmail ? 'user' : 'domain',
            [isEmail ? 'name' : 'domain']: recipient,
            role: formData.role
          }
        ]
      }))
      recipientInput.value = ''
    }
  }

  const handleRemoveRecipient = (index) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {content ? 'Edit Shared Content' : 'Share New Content'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Name
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="interview">Interview Template</option>
                <option value="assessment">Assessment</option>
                <option value="template">Template</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry (Days)
              </label>
              <input
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Recipients
              </label>
              <div className="flex space-x-2 mb-4">
                <input
                  id="recipient"
                  type="text"
                  placeholder="Email or domain"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>
                      {recipient.type === 'user' ? recipient.name : recipient.domain}
                      <span className="text-gray-500 ml-2">({recipient.role})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
              {content ? 'Save Changes' : 'Share Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}