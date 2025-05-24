import { useState } from 'react'
import { webhooks, webhookEvents, webhookStats } from '../mockData/webhooksData'
import { ViewDetailsButton, EditButton } from '../common/Buttons'
import { SidePopup } from '../common/SidePopup'
import { WebhookFormPopup } from './WebhookFormPopup'

const Webhooks = () => {
  const [selectedWebhook, setSelectedWebhook] = useState(null)
  const [editingWebhook, setEditingWebhook] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleSaveWebhook = (webhookData) => {
    console.log('Save webhook:', webhookData)
    setEditingWebhook(null)
    setIsCreating(false)
  }

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-indigo-800">Webhook Management</h3>
            <div className="mt-2 text-sm text-indigo-700">
              <p>Configure and manage webhooks to integrate with external systems:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Set up real-time event notifications</li>
                <li>Monitor webhook deliveries and performance</li>
                <li>Configure retry policies and security settings</li>
                <li>View detailed delivery logs and metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Webhooks</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Webhooks</h3>
          <p className="mt-2 text-3xl font-bold">{webhookStats.totalWebhooks}</p>
          <p className="mt-1 text-sm text-gray-500">
            {webhookStats.activeWebhooks} active
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Deliveries</h3>
          <p className="mt-2 text-3xl font-bold">{webhookStats.totalDeliveries}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="mt-2 text-3xl font-bold">{webhookStats.successRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
          <p className="mt-2 text-3xl font-bold">{webhookStats.averageResponseTime}ms</p>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {webhooks.map(webhook => (
                <tr key={webhook.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{webhook.name}</div>
                    <div className="text-sm text-gray-500">Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {webhook.event}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-xs truncate">{webhook.endpoint}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {webhook.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {webhook.successRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <ViewDetailsButton onClick={() => setSelectedWebhook(webhook)} />
                      <EditButton onClick={() => setEditingWebhook(webhook)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Details Popup */}
      {selectedWebhook && (
        <SidePopup
          title="Webhook Details"
          onClose={() => setSelectedWebhook(null)}
          position="right"
          size="medium"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedWebhook.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="font-medium">{selectedWebhook.event}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Endpoint</p>
                  <p className="font-medium break-all">{selectedWebhook.endpoint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">{new Date(selectedWebhook.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Triggered</p>
                  <p className="font-medium">{new Date(selectedWebhook.lastTriggered).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Configuration</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Secret Key</p>
                  <p className="font-mono bg-gray-50 p-2 rounded mt-1">{selectedWebhook.secret}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Headers</p>
                  <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">
                    {JSON.stringify(selectedWebhook.headers, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Retry Configuration</p>
                  <div className="mt-1">
                    <p className="text-sm">Max Attempts: {selectedWebhook.retryConfig.maxAttempts}</p>
                    <p className="text-sm">Backoff Rate: {selectedWebhook.retryConfig.backoffRate}x</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Recent Deliveries</h3>
              <div className="space-y-4">
                {selectedWebhook.recentDeliveries.map(delivery => (
                  <div key={delivery.id} className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{new Date(delivery.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Response Time: {delivery.responseTime}ms</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        delivery.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {delivery.status}
                      </span>
                    </div>
                    <p className="text-sm mt-2">
                      Response Code: {delivery.responseCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SidePopup>
      )}

      {/* Webhook Form Popup */}
      {(isCreating || editingWebhook) && (
        <WebhookFormPopup
          webhook={editingWebhook}
          events={webhookEvents}
          onSave={handleSaveWebhook}
          onClose={() => {
            setEditingWebhook(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

export default Webhooks