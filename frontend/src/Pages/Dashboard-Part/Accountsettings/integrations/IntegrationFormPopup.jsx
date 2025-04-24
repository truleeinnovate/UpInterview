import { useState } from 'react'
import { SidePopup } from '../common/SidePopup'

export function IntegrationFormPopup({ integration, availableIntegrations, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: integration?.name || '',
    type: integration?.type || '',
    status: integration?.status || 'active',
    apiKey: integration?.apiKey || '',
    endpoint: integration?.endpoint || '',
    syncFrequency: integration?.syncFrequency || '15min',
    syncConfig: integration?.syncConfig || {
      employees: false,
      departments: false,
      positions: false,
      jobPostings: false,
      candidates: false,
      applications: false,
      interviews: false
    }
  })

  const [selectedIntegration, setSelectedIntegration] = useState(
    integration ? availableIntegrations.find(i => i.id === integration.type.toLowerCase()) : null
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleIntegrationSelect = (integrationId) => {
    const selected = availableIntegrations.find(i => i.id === integrationId)
    setSelectedIntegration(selected)
    setFormData(prev => ({
      ...prev,
      type: selected.type,
      name: selected.name
    }))
  }

  return (
    <SidePopup
      title={integration ? 'Edit Integration' : 'Add Integration'}
      onClose={onClose}
      position="right"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Integration Selection */}
        {!integration && (
          <div>
            <h3 className="text-lg font-medium mb-4">Select Integration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableIntegrations.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleIntegrationSelect(item.id)}
                  className={`p-4 border rounded-lg text-left hover:border-blue-500 ${
                    selectedIntegration?.id === item.id ? 'border-blue-500 ring-2 ring-blue-200' : ''
                  }`}
                >
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        {(integration || selectedIntegration) && (
          <>
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Integration Name
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Endpoint
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
                    Sync Frequency
                  </label>
                  <select
                    value={formData.syncFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, syncFrequency: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="5min">Every 5 minutes</option>
                    <option value="15min">Every 15 minutes</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Sync Configuration</h3>
              <div className="space-y-3">
                {Object.entries(formData.syncConfig).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        syncConfig: {
                          ...prev.syncConfig,
                          [key]: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

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
            disabled={!integration && !selectedIntegration}
          >
            {integration ? 'Save Changes' : 'Add Integration'}
          </button>
        </div>
      </form>
    </SidePopup>
  )
}