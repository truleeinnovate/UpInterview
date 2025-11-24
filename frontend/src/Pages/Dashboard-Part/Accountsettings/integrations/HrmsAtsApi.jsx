import { useState } from 'react'
import { integrations, availableIntegrations, syncHistory, integrationMetrics } from '../mockData/hrmsData'
import { ViewDetailsButton, EditButton } from '../common/Buttons'
import { X, Minimize, Expand } from 'lucide-react';
import Modal from 'react-modal';
import classNames from 'classnames';
import { IntegrationFormPopup } from './IntegrationFormPopup'

// Set app element for accessibility
Modal.setAppElement('#root');


const HrmsAtsApi = () => {
   const [isFullScreen, setIsFullScreen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [editingIntegration, setEditingIntegration] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleSaveIntegration = (integrationData) => {
    setEditingIntegration(null)
    setIsCreating(false)
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
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-custom-blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-custom-blue">HRMS/ATS Integration</h3>
            <div className="mt-2 text-sm text-custom-blue">
              <p>Connect your HR and recruitment systems:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Sync employee and candidate data</li>
                <li>Automate job posting and application tracking</li>
                <li>Integrate with popular HRMS and ATS platforms</li>
                <li>Monitor sync status and performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">HRMS & ATS Integrations</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
        >
          Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Integrations</h3>
          <p className="mt-2 text-3xl font-bold">{integrationMetrics.totalIntegrations}</p>
          <p className="mt-1 text-sm text-gray-500">
            {integrationMetrics.activeIntegrations} active
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Syncs</h3>
          <p className="mt-2 text-3xl font-bold">{integrationMetrics.totalSyncs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="mt-2 text-3xl font-bold">{integrationMetrics.successRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Records Synced</h3>
          <p className="mt-2 text-3xl font-bold">{integrationMetrics.recordsSynced}</p>
        </div>
      </div>

      {/* Active Integrations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y border border-gray-200 divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {integrations.map(integration => (
                <tr key={integration.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{integration.name}</div>
                    <div className="text-sm text-gray-500">Syncs every {integration.syncFrequency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {integration.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {integration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(integration.lastSync).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {integration.metrics.successRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <ViewDetailsButton onClick={() => setSelectedIntegration(integration)} />
                      <EditButton onClick={() => setEditingIntegration(integration)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync History */}
      <div>
        <h3 className="text-lg font-medium mb-4">Recent Sync History</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y border border-gray-200 divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syncHistory.map(sync => (
                  <tr key={sync.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {sync.integration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sync.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sync.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sync.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sync.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sync.recordsProcessed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sync.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Integration Details Popup */}
      {selectedIntegration && (
        <Modal
                    isOpen={true}
                    className={modalClass}
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
                  >
                    <div className={classNames('h-full', { 'max-w-7xl mx-auto px-2': isFullScreen })}>
                      <div>
                        <div className="flex justify-between items-center mb-2 mx-3 mt-3">
                          <h2 className="text-xl font-bold text-custom-blue">Integration Information</h2>
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
                              onClick={() => setSelectedIntegration(null)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="py-4 px-4">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedIntegration.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedIntegration.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedIntegration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedIntegration.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sync Frequency</p>
                  <p className="font-medium">{selectedIntegration.syncFrequency}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">API Key</p>
                  <p className="font-mono bg-gray-50 p-2 rounded mt-1">{selectedIntegration.apiKey}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Endpoint</p>
                  <p className="font-mono bg-gray-50 p-2 rounded mt-1">{selectedIntegration.endpoint}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Sync Configuration</h3>
              <div className="space-y-2">
                {Object.entries(selectedIntegration.syncConfig).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Syncs</p>
                  <p className="font-medium">{selectedIntegration.metrics.totalSyncs}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="font-medium">{selectedIntegration.metrics.successRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Sync Duration</p>
                  <p className="font-medium">{selectedIntegration.metrics.lastSyncDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Records Synced</p>
                  <p className="font-medium">{selectedIntegration.metrics.recordsSynced}</p>
                </div>
              </div>
            </div>
          </div>
                      </div>
                    </div>
            
            </Modal>
        
      )}

      {/* Integration Form Popup */}
      {(isCreating || editingIntegration) && (
        <IntegrationFormPopup
          integration={editingIntegration}
          availableIntegrations={availableIntegrations}
          onSave={handleSaveIntegration}
          onClose={() => {
            setEditingIntegration(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

export default HrmsAtsApi