// v1.0.0 - Ashok - added console statements to check the app on online
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Pages/SuperAdmin-Part/InternalLogs/Kanban.jsx";
import {
  Eye,
  // Mail,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
// import axios from "axios";
// import { config } from "../../config.js";
import SidebarPopup from "../../Components/SuperAdminComponents/SidebarPopup/SidebarPopup.jsx";
import { usePermissions } from "../../Context/PermissionsContext.js";
import {
  useInternalLogs,
  useInternalLogById,
} from "../../apiHooks/superAdmin/useInternalLogs";

function InternalLogsPage() {
  const { superAdminPermissions } = usePermissions();
  const [view, setView] = useState("table");
  // const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [editModeOn, setEditModeOn] = useState(false);
  // const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    severity: []
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Internal Logs | Admin Portal";
  }, []);

  // const [selectedLog, setSelectedLog] = useState(null);
  const [selectedLogId, setSelectedLogId] = useState(null);
  // const [logs, setLogs] = useState([]);

  // Debounce search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get logs with pagination and filters
  const { logs, pagination, stats, isLoading, refetch } = useInternalLogs({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    status: selectedFilters.status.join(','),
    severity: selectedFilters.severity.join(',')
  });
  const { log: selectedLog } = useInternalLogById(selectedLogId); // from apiHooks
  // v1.0.0 <------------------------------------------------------------------------
  console.log("2. INTERNAL LOGS AFTER RESPONSE: ", logs);
  console.log("4. SELECTED INTERNAL LOG BY ID: ", selectedLog);
  // v1.0.0 ------------------------------------------------------------------------>

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [isSeverityOpen, setIsSeverityOpen] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState([]);

  const handleSeverityToggle = (severity) => {
    setSelectedSeverity((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setSelectedSeverity(selectedFilters.severity);
      setIsCurrentStatusOpen(false);
      setIsSeverityOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      severity: []
    };
    setSelectedStatus([]);
    setSelectedSeverity([]);
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      severity: selectedSeverity
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 || filters.severity.length > 0
    );
    setFilterPopupOpen(false);
  };

  // Get Internal logs API
  // useEffect(() => {
  //   const getInternalLogs = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/internal-logs`
  //       );
  //       setLogs(response.data.data);
  //     } catch (error) {
  //       console.error("Error fetching internal logs:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   getInternalLogs();
  // }, []);

  // Get Internal log by ID API
  // useEffect(() => {
  //   const getInternalLogById = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/internal-logs/${selectedLogId}`
  //       );
  //       setSelectedLog(response.data);
  //     } catch (error) {
  //       console.error("Error fetching internal logs:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (selectedLogId) {
  //     getInternalLogById();
  //   }
  // }, [selectedLogId]);

  // Kanban view setter
  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const handleFilterIconClick = () => {
    if (pagination?.totalItems > 0 || logs?.length > 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  // Use server-side paginated data directly
  const currentFilteredRows = logs || [];
  const totalPages = pagination?.totalPages || 0;

  const nextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination?.hasPrev) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    // Pagination reset is handled in debounce effect
  };

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

  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //   }).format(amount);
  // };

  // const getStatusDisplay = (status) => {
  //   switch (status) {
  //     case "success":
  //       return "success";
  //     case "error":
  //       return "error";
  //     case "warning":
  //       return "warning";
  //     default:
  //       return "neutral";
  //   }
  // };

  // const getSeverityDisplay = (severity) => {
  //   switch (severity) {
  //     case "high":
  //       return "error";
  //     case "medium":
  //       return "warning";
  //     case "low":
  //       return "success";
  //     default:
  //       return "neutral";
  //   }
  // };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const tableColumns = [
    {
      key: "logId",
      header: "Log ID",
      render: (value, row) =>
        superAdminPermissions?.InternalLogs?.View ? (
          <span
            className="text-sm cursor-pointer text-custom-blue font-semibold"
            onClick={() => {
              setSelectedLogId(row?._id);
              setIsPopupOpen(true);
            }}
          >
            {capitalizeFirstLetter(row?.logId)}
          </span>
        ) : (
          <span className="text-sm text-gray-700">
            {capitalizeFirstLetter(row?.logId)}
          </span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(row.status)} />
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(row.severity)} />
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
    {
      key: "timestamp",
      header: "Timestamp",
      render: (vale, row) => formatDate(row.timeStamp),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    ...(superAdminPermissions?.InternalLogs?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => {
              setSelectedLogId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),

   
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "severity",
      header: "Severity",
      render: (value, row) => (
        <div className="font-medium">
          {<StatusBadge status={row?.severity} /> || "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(value)} />
      ),
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const actions = [
    ...(superAdminPermissions?.InternalLogs?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => {
              setSelectedLogId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),

    
  ];

  // Render Actions for Kanban
  const renderKanbanActions = (item) => (
    <div className="flex items-center gap-1">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );

  const renderFilterContent = () => {
    const statusOptions = ["success", "error", "warning"];
    const severityOptions = ["low", "medium", "high"];

    return (
      <div className="space-y-3">
        {/* Current Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
          >
            <span className="font-medium text-gray-700">Current Status</span>
            {isCurrentStatusOpen ? <ChevronUp /> : <ChevronDown />}
          </div>
          {isCurrentStatusOpen && (
            <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
              {statusOptions.map((status) => (
                <label
                  key={status}
                  className="flex items-center space-x-2 cursor-pointer text-sm capitalize"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatus.includes(status)}
                    onChange={() => handleCurrentStatusToggle(status)}
                    className="accent-custom-blue"
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Severity Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsSeverityOpen(!isSeverityOpen)}
          >
            <span className="font-medium text-gray-700">Severity</span>
            {isSeverityOpen ? <ChevronUp /> : <ChevronDown />}
          </div>
          {isSeverityOpen && (
            <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
              {severityOptions.map((severity) => (
                <label
                  key={severity}
                  className="flex items-center space-x-2 cursor-pointer text-sm capitalize"
                >
                  <input
                    type="checkbox"
                    checked={selectedSeverity.includes(severity)}
                    onChange={() => handleSeverityToggle(severity)}
                    className="accent-custom-blue"
                  />
                  <span>{severity}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPopupContent = (log) => {
    return (
      <div className="px-4">
        <div className="rounded-sm px-4 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-center items-center  gap-4 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                    {log?.logId?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                  log?.Status === 'active' ? 'bg-green-100 text-green-800' :
                  log?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {log?.Status ? log?.Status.charAt(0).toUpperCase() + log?.Status.slice(1) : "?"}
  
                </span> */}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {log?.logId ? log.logId : "N/A"}
                  </h3>

                  {/* <p className="text-gray-600 mt-1">
                    {log?.position || "position"}
                  </p> */}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-md font-medium text-gray-500 mb-3">
                      Basic Information
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">
                          Timestamp:
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(log?.timeStamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span>
                          {log?.status ? (
                            <StatusBadge status={log?.status.toUpperCase()} />
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">Severity:</span>
                        <span>
                          {log?.severity ? (
                            <StatusBadge status={log?.severity.toUpperCase()} />
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">Server:</span>
                        <span className="text-sm font-medium">
                          {log?.serverName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-md font-medium text-gray-500 mb-3">
                      Process Information
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">
                          Process Name:
                        </span>
                        <span className="text-sm font-medium">
                          {log?.processName}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">
                          Execution Time:
                        </span>
                        <span className="text-sm font-medium">
                          {log?.executionTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-md font-medium text-gray-500 mb-3">
                    Request Details
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Endpoint:</span>
                      <span className="text-sm font-medium break-all">
                        {log?.requestEndPoint}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="text-sm font-medium">
                        {log?.requestMethod}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">
                        Response Code:
                      </span>
                      <span className="text-sm font-medium">
                        {log?.responseStatusCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-md font-medium text-gray-500 mb-3">
                    Additional Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Owner ID:</span>
                      <span className="text-sm font-medium">
                        {log?.ownerId}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Tenant ID:</span>
                      <span className="text-sm font-medium">
                        {log?.tenantId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-md font-medium text-gray-500 mb-3">
                    Message
                  </h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {log?.message}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  {log?.requestBody && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        Request Body
                      </h3>
                      <pre className="text-md bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(log.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  {log?.responseBody && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-md font-medium text-gray-500 mb-3">
                        Response Body
                      </h3>
                      <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(log.responseBody, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  {log?.responseError && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        Error Details
                      </h3>
                      <p className="text-sm text-red-600">
                        {log?.responseError}
                      </p>
                      {log?.responseMessage && (
                        <p className="mt-2 text-sm text-gray-600">
                          {log?.responseMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="fixed md:mt-3 sm:mt-5 top-16 left-0 right-0 bg-background">
        <div className="flex justify-between items-center px-4 mb-4 mt-4">
          <h1 className="text-2xl font-bold text-custom-blue">Internal Logs</h1>
          {/* <div className="flex space-x-2">
            <button className="flex items-center btn-secondary border border-gray-200 rounded-md py-1 px-2">
              <AiOutlineDownload className="mr-2" />
              Export
            </button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Logs</div>
            <div className="text-xl font-semibold">{stats?.totalLogs || 0}</div>
          </div>
          {/* v1.0.0 <---------------------------------------------------------------------------------------------------------------------- */}
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Success</div>
            <div className="text-xl font-semibold text-success-600">
              {stats?.successLogs || 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Warnings</div>
            <div className="text-xl font-semibold text-warning-600">
              {stats?.warningLogs || 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Errors</div>
            <div className="text-xl font-semibold text-error-600">
              {stats?.errorLogs || 0}
            </div>
          </div>
          {/* v1.0.0 ----------------------------------------------------------------------------------------------------------------------> */}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden px-4">
          <Toolbar
            view={view}
            setView={setView}
            searchQuery={searchQuery}
            onSearch={(e) => handleSearch(e.target.value)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            onFilterClick={handleFilterIconClick}
            isFilterPopupOpen={isFilterPopupOpen}
            isFilterActive={isFilterActive}
            dataLength={logs?.length || 0}
            searchPlaceholder="Search logs..."
            filterIconRef={filterIconRef}
          />
        </div>

        {/* New table log */}
        <main>
          <div className="sm:px-0">
            <motion.div className="bg-white">
              <div className="relative w-full">
                {view === "table" ? (
                  <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                    <TableView
                      data={currentFilteredRows}
                      columns={tableColumns}
                      loading={isLoading}
                      actions={tableActions}
                      emptyState="No logs found."
                      customHeight="h-[calc(100vh-16.5rem)]"
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <KanbanView
                      data={currentFilteredRows.map((log) => ({
                        ...log,
                        id: log?._id,
                        title: log?.logId ? log?.logId : "N/A",
                        subtitle: log?.timeStamp
                          ? formatDate(log?.timeStamp)
                          : "N/A",
                      }))}
                      logs={logs}
                      columns={kanbanColumns}
                      loading={isLoading}
                      renderActions={renderKanbanActions}
                      emptyState="No logs found."
                    />
                  </div>
                )}

                {/* Render FilterPopup */}
                <FilterPopup
                  isOpen={isFilterPopupOpen}
                  onClose={() => setFilterPopupOpen(false)}
                  onApply={handleApplyFilters}
                  onClearAll={handleClearAll}
                  filterIconRef={filterIconRef}
                >
                  {renderFilterContent()}
                </FilterPopup>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Details view popup */}
      <div>
        {isPopupOpen && selectedLog && (
          <SidebarPopup
            title="Internal Log"
            onClose={() => setIsPopupOpen(false)}
          >
            {renderPopupContent(selectedLog)}
          </SidebarPopup>
        )}
      </div>
    </div>
  );
}

export default InternalLogsPage;
