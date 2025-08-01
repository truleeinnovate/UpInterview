import { useState } from "react";
import { Minimize, Expand, X } from "lucide-react";

function LogDetailsPopup({ log, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`relative bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full ${
          isExpanded
            ? "w-full"
            : "w-full sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2"
        }`}
      >
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Log Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">Log ID: {log.logId}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleExpand}
                className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title={isExpanded ? "Compress" : "Expand"}
              >
                {isExpanded ? <Minimize size={20} /> : <Expand size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-5rem)] p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Timestamp:</span>
                    <span className="text-sm font-medium">
                      {new Date(log.timeStamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`text-sm font-medium ${
                        log.status === "success"
                          ? "text-green-600"
                          : log.status === "error"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {log?.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Severity:</span>
                    <span
                      className={`text-sm font-medium ${
                        log.severity === "high"
                          ? "text-red-600"
                          : log.severity === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {log?.severity?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Server:</span>
                    <span className="text-sm font-medium">
                      {log.serverName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Process Information
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Process Name:</span>
                    <span className="text-sm font-medium">
                      {log.processName}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">
                      Execution Time:
                    </span>
                    <span className="text-sm font-medium">
                      {log.executionTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Request Details
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Endpoint:</span>
                    <span className="text-sm font-medium break-all">
                      {log.requestEndPoint}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Method:</span>
                    <span className="text-sm font-medium">
                      {log.requestMethod}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">
                      Response Code:
                    </span>
                    <span className="text-sm font-medium">
                      {log.responseStatusCode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Owner ID:</span>
                    <span className="text-sm font-medium">{log.ownerId}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="text-sm text-gray-600">Tenant ID:</span>
                    <span className="text-sm font-medium">{log.tenantId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Message
              </h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {log.message}
              </p>
            </div>

            {log.requestBody && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Request Body
                </h3>
                <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(log.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {log.responseBody && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Response Body
                </h3>
                <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(log.responseBody, null, 2)}
                </pre>
              </div>
            )}

            {log.responseError && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Error Details
                </h3>
                <p className="text-sm text-red-600">{log.responseError}</p>
                {log.responseMessage && (
                  <p className="mt-2 text-sm text-gray-600">
                    {log.responseMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogDetailsPopup;
