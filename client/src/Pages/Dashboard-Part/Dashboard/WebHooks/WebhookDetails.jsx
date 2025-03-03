import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

const WebhookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [webhook, setWebhook] = useState(null);

  const fetchWebhookData = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/webhooks/${id}`);
      const webhookData = {
        ...response.data,
        dateTime: new Date(response.data.createdAt).toLocaleString()
      };
      setWebhook(webhookData);
    } catch (error) {
      console.error('Error fetching webhook:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchWebhookData();
  }, [fetchWebhookData]);

  const handleNavigateToWebhooks = useCallback(() => {
    navigate("/webhook-events");
  }, [navigate]);

  const formattedWebhookData = useMemo(() => {
    if (!webhook) return null;

    return {
      id: webhook._id.slice(-5, -1),
      dateTime: webhook.dateTime || new Date(webhook.createdAt).toLocaleString(),
      callbackUrl: webhook.callbackUrl,
      events: webhook.events,
      secret: webhook.secret,
      createdInfo: `${webhook.createdBy}, ${webhook.createdAt}`,
      modifiedInfo: `${webhook.modifiedBy}, ${webhook.modifiedAt}`
    };
  }, [webhook]);

  if (!webhook) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="p-3">
        <h2 className="text-lg text-gray-400">
          <span
            className="text-teal-600 font-bold cursor-pointer"
            onClick={handleNavigateToWebhooks}
          >
            Webhooks
          </span>{" "}
          / {formattedWebhookData.id}
        </h2>
      </div>

      <div className="border-b border-none border-gray-200">
        <ul className="flex gap-8 px-4">
          <li className="border-b-2 border-teal-700 cursor-pointer">
            Details
          </li>
        </ul>
      </div>

      <div className="p-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-6">Event Details:</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-8">
                <span className="font-medium text-gray-700 w-32">Event ID</span>
                <span className="text-gray-600">{formattedWebhookData.id}</span>
              </div>
              <div className="flex gap-8">
                <span className="font-medium text-gray-700 w-32">Date & Time</span>
                <span className="text-gray-600">{formattedWebhookData.dateTime}</span>
              </div>
            </div>

            <div className="flex gap-8">
              <span className="font-medium text-gray-700 w-32">Callback URL</span>
              <span className="text-teal-600">{formattedWebhookData.callbackUrl}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-8">
                <span className="font-medium text-gray-700 w-32">Events</span>
                <span className="text-gray-600">{formattedWebhookData.events}</span>
              </div>

              <div className="flex gap-8">
                <span className="font-medium text-gray-700 w-32">Shared Secret</span>
                <span className="text-gray-600">{formattedWebhookData.secret}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-6">System Details:</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-8">
                <span className="font-medium text-gray-700 w-32">Created By</span>
                <span className="text-gray-600">{formattedWebhookData.createdInfo}</span>
              </div>
              <div className="flex gap-8">
                <span className="font-medium text-gray-700 w-32">Modified By</span>
                <span className="text-gray-600">{formattedWebhookData.modifiedInfo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookDetails;