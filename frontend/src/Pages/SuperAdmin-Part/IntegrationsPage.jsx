import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import LogDetailsPopup from "../../Components/SuperAdminComponents/InternalLogs/LogDetailsPopup";
import { AiOutlineEye, AiOutlineDownload } from "react-icons/ai";

import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../../Components/SuperAdminComponents/Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Components/Shared/Kanban/KanbanView.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";

function IntegrationsPage() {
  const [view, setView] = useState("table");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: "", max: "" },
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);

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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0004",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0005",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0006",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0007",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0008",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0009",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0010",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0011",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0012",
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
    {
      timeStamp: "2025-06-02T10:05:00Z",
      logId: "LOG-0013",
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

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        filters.experience.max
    );
  };

  const dataToUse = logs;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((integration) => {
      const fieldsToSearch = [integration.logId].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(integration.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        integration.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          integration.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          integration.CurrentExperience <= selectedFilters.experience.max);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        matchesSearchQuery && matchesStatus && matchesTech && matchesExperience
      );
    });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData()?.length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData()?.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData()?.length);

  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  const handleStatusChange = (requestId, newStatus) => {};

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

  const tableColumns = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (vale, row) => formatDate(row.timeStamp),
    },
    {
      key: "logId",
      header: "Log ID",
      render: (value, row) => (
        <span className="font-mono text-xs">{row.logId}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge
          status={getStatusDisplay(row.status)}
          text={row.status.toUpperCase()}
        />
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (value, row) => (
        <StatusBadge
          status={getSeverityDisplay(row.severity)}
          text={row.severity.toUpperCase()}
        />
      ),
    },
    {
      key: "processName",
      header: "Process",
    },
    {
      key: "message",
      header: "Message",
    },
    {
      key: "executionTime",
      header: "Execution Time",
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    },
    {
      key: "360-view",
      label: "360° View",
      icon: <UserCircle className="w-4 h-4 text-purple-600" />,
      onClick: (row) => row?._id && navigate(`/candidate/${row._id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    {
      key: "resend-link",
      label: "Resend Link",
      icon: <Mail className="w-4 h-4 text-blue-600" />,
      disabled: (row) => row.status === "completed",
    },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [];

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`view-details/${item._id}`);
        }}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      {!isLoading ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              item?._id && navigate(`/candidate/${item._id}`);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="360° View"
          >
            <UserCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`edit/${item._id}`);
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResendLink(item.id);
          }}
          disabled={item.status === "completed"}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Resend Link"
        >
          <Mail className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="absolute md:mt-3 sm:mt-5 top-16 left-0 right-0 bg-background">
        <div className="flex justify-between items-center px-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <div className="flex space-x-2">
            <button className="flex items-center btn-secondary">
              <AiOutlineDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Logs</div>
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

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden px-4">
          <Toolbar
            view={view}
            setView={setView}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            onFilterClick={handleFilterIconClick}
            isFilterPopupOpen={isFilterPopupOpen}
            isFilterActive={isFilterActive}
            dataLength={dataToUse?.length}
            searchPlaceholder="Search integrations..."
            filterIconRef={filterIconRef}
          />
        </div>

        {/* New table content */}
        <main>
          <div className="sm:px-0">
            {logs.length === 0 ? (
              <Loading />
            ) : (
              <motion.div className="bg-white">
                <div className="relative w-full">
                  {view === "table" ? (
                    <div className="w-full">
                      <TableView
                        data={currentFilteredRows}
                        columns={tableColumns}
                        loading={isLoading}
                        actions={tableActions}
                        emptyState="No logs found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((candidate) => ({
                          ...logs,
                          id: candidate.id,
                          title: `${candidate.FirstName || ""} ${
                            candidate.LastName || ""
                          }`,
                          subtitle:
                            candidate.CurrentRole ||
                            candidate.CurrentExperience ||
                            "N/A",
                          avatar: "",
                          status: "active",
                          isAssessmentView: <p>Is assignment view</p>,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No logs found."
                      />
                    </div>
                  )}

                  <FilterPopup
                    isOpen={isFilterPopupOpen}
                    onClose={() => setFilterPopupOpen(false)}
                    onApply={handleFilterChange}
                    initialFilters={selectedFilters}
                    filterIconRef={filterIconRef}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </main>
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
