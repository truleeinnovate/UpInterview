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
  // const [editModeOn, setEditModeOn] = useState(false);
  // const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
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

  const { integrations, isLoading } = useIntegrationLogs(); // from apiHooks
  const { selectedLog } = useIntegrationLogById(selectedLogId); // from apiHooks

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

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((integration) => {
      const fieldsToSearch = [
        integration.logId ? integration.logId : integration._id,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(integration.status);
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
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

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

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
            icon: <Eye className="w-4 h-4 text-blue-600" />,
            onClick: (row) => {
              setSelectedLogId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => setSelectedLogId(row._id),
    // },

    ...(superAdminPermissions?.IntegrationLogs?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => navigate(`edit/${row._id}`),
          },
        ]
      : []),
    // {
    //   key: "resend-link",
    //   label: "Resend Link",
    //   icon: <Mail className="w-4 h-4 text-blue-600" />,
    //   disabled: (row) => row.status === "completed",
    // },
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
            icon: <Eye className="w-4 h-4 text-blue-600" />,
            onClick: (row) => {
              setSelectedLogId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),

    ...(superAdminPermissions?.IntegrationLogs?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => navigate(`edit/${row._id}`),
          },
        ]
      : []),
    // {
    //   key: "login-as-user",
    //   label: "Login as User",
    //   icon: <AiOutlineUser className="w-4 h-4 text-blue-600" />,
    //   onClick: (row) => handleLoginAsUser(row._id),
    // },
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
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
    const statusOptions = ["success", "pending", "captured", "charged"];

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

                  <p className="text-gray-600 mt-1">
                    {log?.CurrentRole || "position"}
                  </p>
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
                    {log?.message ? log?.message : "N/A"}
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
                        {log.responseError}
                      </p>
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
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="fixed md:mt-3 sm:mt-5 top-16 left-0 right-0 bg-background">
        <div className="flex justify-between items-center px-4 mb-4 mt-4">
          <h1 className="text-2xl font-bold text-custom-blue">Integrations</h1>
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
            <div className="text-xl font-semibold">{integrations?.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Errors</div>
            <div className="text-xl font-semibold text-error-600">
              {integrations?.filter((log) => log.status === "error").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Warnings</div>
            <div className="text-xl font-semibold text-warning-600">
              {integrations?.filter((log) => log.status === "warning").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Success</div>
            <div className="text-xl font-semibold text-success-600">
              {integrations?.filter((log) => log.status === "success").length}
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
                      data={currentFilteredRows.map((integrationLog) => ({
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
