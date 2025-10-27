import StatusBadge from "../common/StatusBadge";
import { useState } from "react";

function IntegrationsTab({ isFullscreen = false }) {
  const [webhooks] = useState([
    {
      id: 1,
      name: "Interview Completed",
      endpoint: "https://api.acmecorp.com/webhooks/interviews",
      status: "active",
      lastTriggered: "2025-06-02T10:15:00Z",
      successRate: "99.8%",
    },
    {
      id: 2,
      name: "Assessment Submitted",
      endpoint: "https://api.acmecorp.com/webhooks/assessments",
      status: "active",
      lastTriggered: "2025-06-02T09:30:00Z",
      successRate: "100%",
    },
    {
      id: 3,
      name: "Candidate Status Changed",
      endpoint: "https://api.acmecorp.com/webhooks/candidates",
      status: "inactive",
      lastTriggered: "2025-06-01T15:45:00Z",
      successRate: "95.5%",
    },
  ]);

  return (
    <div className="space-y-6">
      <div
        className={`w-full ${
          isFullscreen
            ? "flex flex-col gap-6"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
        }`}
      >
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              ATS Integration
            </h3>
            <StatusBadge status="active" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Connected to Workday</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Sync</span>
              <span className="text-gray-900">2 hours ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sync Status</span>
              <span className="text-green-600">Healthy</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              HRIS Integration
            </h3>
            <StatusBadge status="active" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Connected to BambooHR</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Sync</span>
              <span className="text-gray-900">1 hour ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sync Status</span>
              <span className="text-green-600">Healthy</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Calendar Integration
            </h3>
            <StatusBadge status="active" />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connected to Google Calendar
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Sync</span>
              <span className="text-gray-900">30 mins ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sync Status</span>
              <span className="text-green-600">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API Usage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">API Key Status</p>
              <p className="text-sm text-gray-500">Last rotated 30 days ago</p>
            </div>
            <button className="btn-secondary">Rotate Key</button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly API Calls</span>
              <span className="text-sm font-medium text-gray-900">
                45,678 / 100,000
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: "45.678%" }}
              ></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Average Response Time
              </span>
              <span className="text-sm font-medium text-gray-900">156ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium text-gray-900">0.12%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Webhooks</h3>
          <button className="btn-primary">Add Webhook</button>
        </div>

        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                  <StatusBadge status={webhook.status} />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm">Test</button>
                  <button className="btn-secondary text-sm">Edit</button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Endpoint:</span>
                  <span className="text-gray-900 font-mono">
                    {webhook.endpoint}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Last Triggered:</span>
                  <span className="text-gray-900">
                    {new Date(webhook.lastTriggered).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Success Rate:</span>
                  <span className="text-gray-900">{webhook.successRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Webhook Events
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="interview_completed"
                className="rounded text-primary-600"
              />
              <label
                htmlFor="interview_completed"
                className="text-sm text-gray-700"
              >
                Interview Completed
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="assessment_submitted"
                className="rounded text-primary-600"
              />
              <label
                htmlFor="assessment_submitted"
                className="text-sm text-gray-700"
              >
                Assessment Submitted
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="candidate_status"
                className="rounded text-primary-600"
              />
              <label
                htmlFor="candidate_status"
                className="text-sm text-gray-700"
              >
                Candidate Status Changed
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="user_created"
                className="rounded text-primary-600"
              />
              <label htmlFor="user_created" className="text-sm text-gray-700">
                User Created
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="position_updated"
                className="rounded text-primary-600"
              />
              <label
                htmlFor="position_updated"
                className="text-sm text-gray-700"
              >
                Position Updated
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsTab;
