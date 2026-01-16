import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import Cookies from "js-cookie"
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { config } from '../../../../../config';

const WebhookLogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const tenantId = tokenPayload.tenantId;
    const ownerId = tokenPayload.userId;

  // Helper function to get cookie value by name
  const getCookie = useCallback((name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      // Get tenantId and ownerId from cookies
      // const tenantId = getCookie('tenantId');
      // const ownerId = getCookie('ownerId') || getCookie('userId');
      
      if (!tenantId || !ownerId) {
        console.warn('tenantId or ownerId not found in cookies');
        setLogs([]);
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        tenantId,
        ownerId,
        limit: 50
      });

      const response = await fetch(`${config.REACT_APP_API_URL}/integration-logs/by-tenant-owner?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data || []);
      } else {
        console.error('Error fetching logs:', data.message);
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [getCookie]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const getStatusIcon = (log) => {
    if (log.status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (log.status === 'error') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (log) => {
    if (log.status === 'success') return 'bg-green-100 text-green-800';
    if (log.status === 'error') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhook Logs</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor webhook delivery status and responses</p>
        </div>
        {/* <button
          onClick={fetchLogs}
          disabled={loading}
          className="bg-custom-blue hover:bg-custom-blue disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button> */}
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading logs...</p>
          </div>
        ) : (Array.isArray(logs) ? logs : []).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No webhook logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Integration
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Array.isArray(logs) ? logs : []).map((log) => (
                  <tr key={log._id || log.logId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log)}
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log)}`}>
                          {log.status || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{log.processName || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{log.integrationName || 'N/A'}</span>
                    </td>
                    {/* <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 truncate max-w-xs block">
                        {log.message || 'No message'}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(log.timeStamp || log.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-brand-600 hover:text-brand-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[75vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-custom-blue">
              <h3 className="text-lg font-semibold text-white">Webhook Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(75vh-80px)]">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Log ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.logId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedLog)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedLog)}`}>
                      {selectedLog.status || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
                  <p className="text-sm text-gray-900">{selectedLog.processName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Integration</label>
                  <p className="text-sm text-gray-900">{selectedLog.integrationName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flow Type</label>
                  <p className="text-sm text-gray-900">{selectedLog.flowType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                  <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timeStamp || selectedLog.createdAt)}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedLog.message || 'No message'}</p>
                </div>
              </div>

              {selectedLog.requestBody && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.requestBody, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.responseBody && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response Body</label>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.responseBody, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.responseError && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Error</label>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <pre className="text-sm text-red-800 whitespace-pre-wrap">
                      {typeof selectedLog.responseError === 'string' 
                        ? selectedLog.responseError 
                        : JSON.stringify(selectedLog.responseError, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              )}

              {(selectedLog.requestEndPoint || selectedLog.requestMethod) && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Request Details</label>
                  <div className="bg-gray-100 p-4 rounded-lg text-sm">
                    <div><strong>Method:</strong> {selectedLog.requestMethod || 'N/A'}</div>
                    <div><strong>Endpoint:</strong> {selectedLog.requestEndPoint || 'N/A'}</div>
                    <div><strong>Status Code:</strong> {selectedLog.responseStatusCode || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookLogsTab;