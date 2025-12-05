// v1.0.0 - Ashok - added console statement and made some changes. Integrations not getting on online
// v1.0.1 - Ashok - fixed style issue
// v1.0.2 - Ashok - changed name from Integrations to Integration Logs

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge.jsx";

import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Pages/SuperAdmin-Part/IntegrationLogs/Kanban.jsx";
import {
  Eye,
  // Mail,
  // UserCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
// import axios from "axios";
// import { config } from "../../config.js";
import SidebarPopup from "../../Components/SuperAdminComponents/SidebarPopup/SidebarPopup.jsx";
import { usePermissions } from "../../Context/PermissionsContext.js";
import {
  useIntegrationLogs,
  useIntegrationLogById,
} from "../../apiHooks/superAdmin/useIntegrationLogs";

function IntegrationsPage() {
  const { superAdminPermissions } = usePermissions();
  const [view, setView] = useState("table");
  // const [selectedCandidate, setSelectedCandidate] = useState(null);
  // const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // const [editModeOn, setEditModeOn] = useState(false);
  // const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    currentStatus: "",
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Integration Logs | Admin Portal";
  }, []);

  // const [selectedLog, setSelectedLog] = useState(null);
  const [selectedLogId, setSelectedLogId] = useState(null);
  // const [integrations, setIntegrations] = useState([]);

  const { integrations, pagination, stats, isLoading } = useIntegrationLogs({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    status: selectedFilters.status,
  });
  const { selectedLog } = useIntegrationLogById(selectedLogId); // from apiHooks
  // v1.0.0 <-----------------------------------------------------------------------------------
  console.log("2. INTEGRATIONS LOGS AFTER RESPONSE: ", integrations);
  console.log("4. SELECTED INTEGRATION LOG: ", selectedLog);
  // v1.0.0 ----------------------------------------------------------------------------------->

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("active");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setCurrentStatus(selectedFilters.currentStatus);
      setIsCurrentStatusOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      currentStatus: "",
    };
    setSelectedStatus([]);
    setCurrentStatus("");
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      currentStatus: selectedCurrentStatus,
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 || filters.currentStatus.length > 0
    );
    setFilterPopupOpen(false);
  };

  // Get Internal logs API
  // useEffect(() => {
  //   const getIntegrations = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/integration-logs`
  //       );
  //       setIntegrations(response.data);
  //     } catch (error) {
  //       console.error("Error fetching internal logs:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   getIntegrations();
  // }, []);

  // Get Internal log by ID API
  // useEffect(() => {
  //   const getIntegrationLogById = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/integration-logs/${selectedLogId}`
  //       );
  //       setSelectedLog(response.data);
  //     } catch (error) {
  //       console.error("Error fetching internal logs:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (selectedLogId) {
  //     getIntegrationLogById();
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

  const dataToUse = integrations;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const nextPage = () => {
    // Guard using metadata
    if (pagination?.hasNext) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination?.hasPrev) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const normalizeMessage = (message) => {
    if (!message) return "";
    if (typeof message === "string") return message;
    if (message && typeof message.message === "string") return message.message;
    try {
      return JSON.stringify(message);
    } catch (e) {
      return String(message);
    }
  };

  const truncateMessage = (message, maxLength = 60) => {
    const text = normalizeMessage(message);
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const tableColumns = [
    {
      key: "logId",
      header: "Log ID",
      render: (value, row) =>
        superAdminPermissions?.IntegrationLogs?.View ? (
          <span
            className="text-sm cursor-pointer text-custom-blue font-semibold"
            onClick={() => {
              setSelectedLogId(row?._id);
              setIsPopupOpen(true);
            }}
          >
            {capitalizeFirstLetter(row?.logId) || "N/A"}
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
        <div className="font-medium">
          {row?.status ? <StatusBadge status={row?.status} /> : "N/A"}
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (value, row) => (
        <div className="font-medium">
          {row?.severity ? <StatusBadge status={row.severity} /> : "N/A"}
        </div>
      ),
    },
    {
      key: "processName",
      header: "Process",
    },
    {
      key: "message",
      header: "Message",
      render: (value) => {
        const fullMessage = value || "";
        const preview = truncateMessage(fullMessage);
        return (
          <span className="text-sm" title={fullMessage}>
            {preview}
          </span>
        );
      },
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
    ...(superAdminPermissions?.IntegrationLogs?.View
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
          {row?.severity ? <StatusBadge status={row?.severity} /> : "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <div className="font-medium">
          {row?.status ? <StatusBadge status={row?.status} /> : "N/A"}
        </div>
      ),
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const actions = [
    ...(superAdminPermissions?.IntegrationLogs?.View
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
  // Render Filter Content
  const renderFilterContent = () => {
    // filters options
    const statusOptions = ["success", "warning", "error"];

    return (
      <div className="space-y-3">
        {/* Current Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
          >
            <span className="font-medium text-gray-700">Current Status</span>
            {isCurrentStatusOpen ? (
              <ChevronUp className="text-xl text-gray-700" />
            ) : (
              <ChevronDown className="text-xl text-gray-700" />
            )}
          </div>
          {isCurrentStatusOpen && (
            <div className="mt-1 space-y-2 pl-2">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Popup content
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
                    {log?.CurrentRole || "position"}
                  </p> */}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-500 mb-3">
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
                            <StatusBadge
                              status={capitalizeFirstLetter(log?.status)}
                            />
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">Severity:</span>
                        <span>
                          {log?.severity ? (
                            <StatusBadge
                              status={capitalizeFirstLetter(log?.severity)}
                            />
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
                    <h3 className="text-lg font-medium text-gray-500 mb-3">
                      Process Information
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">
                          Process Name:
                        </span>
                        <span className="text-sm font-medium">
                          {log?.processName ? log?.processName : "N/A"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-gray-600">
                          Execution Time:
                        </span>
                        <span className="text-sm font-medium">
                          {log?.executionTime ? log?.executionTime : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-500 mb-3">
                    Request Details
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Endpoint:</span>
                      <span className="text-sm font-medium break-all">
                        {log?.endpoint ? log?.endpoint : "N/A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="text-sm font-medium">
                        {log?.requestMethod ? log?.requestMethod : "N/A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">
                        Response Code:
                      </span>
                      <span className="text-sm font-medium">
                        {log?.responseStatusCode
                          ? log?.responseStatusCode
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-500 mb-3">
                    Additional Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Owner ID:</span>
                      <span className="text-sm font-medium">
                        {log?.ownerId ? log?.ownerId : "N/A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-gray-600">Tenant ID:</span>
                      <span className="text-sm font-medium">
                        {log?.tenantId ? log?.tenantId : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-500 mb-3">
                    Message
                  </h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {normalizeMessage(log?.message) || "N/A"}
                  </p>
                </div>

                {log.requestBody && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-500 mb-3">
                      Request Body
                    </h3>
                    <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(log.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {log.responseBody && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-500 mb-3">
                      Response Body
                    </h3>
                    <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(log.responseBody, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  {log.responseError && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        Error Details
                      </h3>
                      <p className="text-sm text-red-600">
                        {normalizeMessage(log.responseError) || "N/A"}
                      </p>
                      {log.responseMessage && (
                        <p className="mt-2 text-sm text-gray-600">
                          {normalizeMessage(log.responseMessage)}
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
          <h1 className="text-2xl font-bold text-custom-blue">
            Integration Logs
          </h1>
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
            <div className="text-xl font-semibold">{pagination?.totalItems ?? 0}</div>
          </div>
          {/* v1.0.0 <------------------------------------------------------------------------------------------ */}
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Success</div>
            <div className="text-xl font-semibold text-success-600">
              {stats?.byStatus?.success ?? 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Warnings</div>
            <div className="text-xl font-semibold text-warning-600">
              {stats?.byStatus?.warning ?? 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Errors</div>
            <div className="text-xl font-semibold text-error-600">
              {stats?.byStatus?.error ?? 0}
            </div>
          </div>
          {/* v1.0.0 ------------------------------------------------------------------------------> */}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden px-4">
          <Toolbar
            view={view}
            setView={setView}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            currentPage={pagination?.currentPage ?? 0}
            totalPages={pagination?.totalPages ?? 1}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            onFilterClick={handleFilterIconClick}
            isFilterPopupOpen={isFilterPopupOpen}
            isFilterActive={isFilterActive}
            dataLength={pagination?.totalItems ?? 0}
            searchPlaceholder="Search integrations..."
            filterIconRef={filterIconRef}
          />
        </div>

        {/* New table content */}
        <main>
          <div className="sm:px-0">
            <motion.div className="bg-white">
              <div className="relative w-full">
                {view === "table" ? (
                  <div className="w-full">
                    <TableView
                      data={Array.isArray(dataToUse) ? dataToUse : []}
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
                      data={(Array.isArray(dataToUse) ? dataToUse : []).map((integrationLog) => ({
                        ...integrationLog,
                        id: integrationLog._id,
                        title: integrationLog.logId || "N/A",
                        subtitle: formatDate(integrationLog?.timeStamp),
                      }))}
                      integrations={integrations}
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
            title="Integration Log"
            onClose={() => setIsPopupOpen(false)}
          >
            {renderPopupContent(selectedLog)}
          </SidebarPopup>
        )}
      </div>
    </div>
  );
}

export default IntegrationsPage;
