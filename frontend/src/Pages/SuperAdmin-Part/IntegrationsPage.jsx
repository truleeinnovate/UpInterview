import { useState, useEffect } from "react";
import DataTable from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import LogDetailsPopup from "../components/InternalLogs/LogDetailsPopup";
import {
  AiOutlineFilter,
  AiOutlineEye,
  AiOutlineDownload,
} from "react-icons/ai";

function IntegrationsPage() {
  useEffect(() => {
    document.title = "Internal Logs | Admin Portal";
  }, []);

  const [selectedLog, setSelectedLog] = useState(null);

  const [logs] = useState([
    {
      timeStamp: "2025-06-02T10:15:00Z",
      logId: "LOG-001",
      status: "success",
      code: "200",
      message: "Interview completed successfully",
      serverName: "interview-service-01",
      severity: "low",
      processName: "InterviewRecording",
      executionTime: "125ms",
      requestEndPoint: "/api/v1/interviews/complete",
      requestMethod: "POST",
      requestBody: { interviewId: "12345", duration: 3600 },
      responseStatusCode: "200",
      responseMessage: "Interview marked as complete",
      responseBody: { success: true },
      ownerId: "USER-001",
      tenantId: "TENANT-001",
    },
    {
      timeStamp: "2025-06-02T10:10:00Z",
      logId: "LOG-002",
      status: "error",
      code: "500",
      message: "Database connection failed",
      serverName: "assessment-service-02",
      severity: "high",
      processName: "AssessmentScoring",
      executionTime: "2500ms",
      requestEndPoint: "/api/v1/assessments/score",
      requestMethod: "POST",
      requestBody: { assessmentId: "67890" },
      responseStatusCode: "500",
      responseError: "Internal Server Error",
      responseMessage: "Failed to connect to database",
      ownerId: "USER-002",
      tenantId: "TENANT-002",
    },
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-003",
      status: "warning",
      code: "429",
      message: "Rate limit approaching",
      serverName: "api-gateway-01",
      severity: "medium",
      processName: "RateLimiter",
      executionTime: "5ms",
      requestEndPoint: "/api/v1/candidates",
      requestMethod: "GET",
      responseStatusCode: "200",
      responseMessage: "Rate limit warning",
      ownerId: "USER-003",
      tenantId: "TENANT-001",
    },
  ]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      default:
        return "neutral";
    }
  };

  const getSeverityDisplay = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "neutral";
    }
  };

  const columns = [
    {
      field: "timeStamp",
      header: "Timestamp",
      render: (row) => formatDate(row.timeStamp),
    },
    {
      field: "logId",
      header: "Log ID",
      render: (row) => <span className="font-mono text-xs">{row.logId}</span>,
    },
    {
      field: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={getStatusDisplay(row.status)}
          text={row.status.toUpperCase()}
        />
      ),
    },
    {
      field: "severity",
      header: "Severity",
      render: (row) => (
        <StatusBadge
          status={getSeverityDisplay(row.severity)}
          text={row.severity.toUpperCase()}
        />
      ),
    },
    {
      field: "processName",
      header: "Process",
    },
    {
      field: "message",
      header: "Message",
    },
    {
      field: "executionTime",
      header: "Execution Time",
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <button
            className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
            title="View Details"
            onClick={() => setSelectedLog(row)}
          >
            <AiOutlineEye size={18} />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50"
            title="Download"
          >
            <AiOutlineDownload size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <AiOutlineFilter className="mr-2" />
            Filter
          </button>
          <button className="btn-secondary">
            <AiOutlineDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Integrations</div>
          <div className="text-xl font-semibold">{logs.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Errors</div>
          <div className="text-xl font-semibold text-error-600">
            {logs.filter((log) => log.status === "error").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Warnings</div>
          <div className="text-xl font-semibold text-warning-600">
            {logs.filter((log) => log.status === "warning").length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Success</div>
          <div className="text-xl font-semibold text-success-600">
            {logs.filter((log) => log.status === "success").length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={logs}
          searchable={true}
          pagination={true}
        />
      </div>

      {selectedLog && (
        <LogDetailsPopup
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

export default IntegrationsPage;
