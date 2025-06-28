import { useState } from "react";
import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../../utils/dateUtils";

function WebhooksTab() {
  const [webhooks] = useState([
    {
      id: 1,
      name: "Interview Completed",
      endpoint: "https://api.acmecorp.com/webhooks/interviews",
      status: "active",
      lastTriggered: "2025-06-02T10:15:00Z",
      successRate: "99.8%",
      events: ["interview.completed", "interview.cancelled"],
      headers: {
        "X-API-Key": "********",
        "Content-Type": "application/json",
      },
      retryCount: 3,
      retryDelay: 60,
    },
    {
      id: 2,
      name: "Assessment Submitted",
      endpoint: "https://api.acmecorp.com/webhooks/assessments",
      status: "active",
      lastTriggered: "2025-06-02T09:30:00Z",
      successRate: "100%",
      events: ["assessment.submitted", "assessment.scored"],
      headers: {
        "X-API-Key": "********",
        "Content-Type": "application/json",
      },
      retryCount: 3,
      retryDelay: 30,
    },
    {
      id: 3,
      name: "Candidate Status Changed",
      endpoint: "https://api.acmecorp.com/webhooks/candidates",
      status: "inactive",
      lastTriggered: "2025-06-01T15:45:00Z",
      successRate: "95.5%",
      events: ["candidate.status.updated"],
      headers: {
        "X-API-Key": "********",
        "Content-Type": "application/json",
      },
      retryCount: 3,
      retryDelay: 60,
    },
  ]);

  const [selectedWebhook, setSelectedWebhook] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Webhooks</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your webhook endpoints and configurations
          </p>
        </div>
        <button className="btn-primary">Add Webhook</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800">Total Webhooks</h4>
          <p className="text-2xl font-semibold text-blue-900 mt-2">
            {webhooks.length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800">
            Active Webhooks
          </h4>
          <p className="text-2xl font-semibold text-green-900 mt-2">
            {webhooks.filter((w) => w.status === "active").length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-800">
            Average Success Rate
          </h4>
          <p className="text-2xl font-semibold text-purple-900 mt-2">
            {(
              webhooks.reduce((acc, w) => acc + parseFloat(w.successRate), 0) /
              webhooks.length
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {webhook.name}
                  </h4>
                  <StatusBadge status={webhook.status} />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm">Test</button>
                  <button className="btn-secondary text-sm">Edit</button>
                  <button className="btn-secondary text-sm">Delete</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Endpoint URL</span>
                    <p className="font-mono text-sm">{webhook.endpoint}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Events</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">
                      Last Triggered
                    </span>
                    <p className="text-sm">
                      {formatDate(webhook.lastTriggered)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Success Rate</span>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: webhook.successRate }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {webhook.successRate}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Retry Configuration
                    </span>
                    <p className="text-sm">
                      {webhook.retryCount} attempts, {webhook.retryDelay}s delay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Available Events
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "interview.scheduled",
            "interview.completed",
            "interview.cancelled",
            "assessment.created",
            "assessment.submitted",
            "assessment.scored",
            "candidate.created",
            "candidate.updated",
            "candidate.status.updated",
            "position.created",
            "position.updated",
            "user.created",
            "user.updated",
          ].map((event) => (
            <div key={event} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={event}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={event} className="text-sm text-gray-700">
                {event}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WebhooksTab;
