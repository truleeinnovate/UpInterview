// v1.0.0 - Ashok - changed some fields at table and added cards at top section
// v1.0.1 - Ashok - commented top two sections and adjusted table height
// v1.0.2 - Ashok - corrected name from Interview Requests to Interviewer Requests
// v1.0.3 - Ashok - used common kanban component for interview requests kanban view

import { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
// import KanbanView from "../../Pages/Interview-Request/InterviewKanban.jsx";
import KanbanView from "../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import {
  Eye,
  // Mail,
  // UserCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
  // Phone,
  // GraduationCap,
  // School,
  // ExternalLink,
  // X,
  Briefcase,
  // User,
  Calendar,
  Timer,
  HelpCircle,
  CircleDot,
  MoreVertical,
} from "lucide-react";

// import axios from "axios";
// import { config } from "../../config.js";
import SidebarPopup from "../../Components/SuperAdminComponents/SidebarPopup/SidebarPopup.jsx";
import { usePermissions } from "../../Context/PermissionsContext.js";
import {
  useInterviewRequests,
  useInterviewRequestById,
} from "../../apiHooks/superAdmin/useInterviewRequests.js";
import { capitalizeFirstLetter } from "../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { formatDateTime } from "../../utils/dateFormatter.js";

const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  const mainActions = kanbanActions.filter((a) =>
    ["view", "edit"].includes(a.key)
  );
  const overflowActions = kanbanActions.filter(
    (a) => !["view", "edit"].includes(a.key)
  );

  //  Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsKanbanMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="flex items-center gap-2 relative">
      {/* Always visible actions */}
      {mainActions.map((action) => {
        const baseClasses =
          "p-1.5 rounded-lg transition-colors hover:bg-opacity-20";
        const bgClass =
          action.key === "view"
            ? "text-custom-blue hover:bg-custom-blue/10"
            : action.key === "edit"
            ? "text-green-600 hover:bg-green-600/10"
            : "text-blue-600 bg-green-600/10";

        return (
          <button
            key={action.key}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(item, e);
            }}
            className={`${baseClasses} ${bgClass}`}
            title={action.label}
          >
            {action.icon}
          </button>
        );
      })}

      {/* More button (shows dropdown) */}
      {overflowActions.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsKanbanMoreOpen((prev) => !prev);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="More"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {isKanbanMoreOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {overflowActions.map((action) => (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKanbanMoreOpen(false);
                    action.onClick(item, e);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  title={action.label}
                >
                  {action.icon && (
                    <span className="mr-2 w-4 h-4 text-gray-500">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InternalRequest = () => {
  const { superAdminPermissions } = usePermissions();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // const [editModeOn, setEditModeOn] = useState(false);
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

  // const [interviewRequests, setInterviewRequests] = useState([]);

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("inProgress");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  // const [selectedRequest, setSelectedRequest] = useState(null);

  const ITEMS_PER_PAGE = 10;
  // v1.0.0 <------------------------------------------------------------------------
  const [selectedType] = useState("all");
  // v1.0.0 ------------------------------------------------------------------------>
  const { interviewRequests, pagination, isLoading } = useInterviewRequests({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    status: selectedFilters.status.join(","),
    type:
      typeof selectedType === "string" && selectedType !== "all"
        ? selectedType
        : "",
  }); // server-side
  // console.log("interviewRequests==",interviewRequests);
  const { interviewRequest } = useInterviewRequestById(selectedRequestId); // from apiHooks
  // console.log("interviewRequest==========",interviewRequest);

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

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

  useEffect(() => {
    document.title = "Tenants | Admin Portal";
  }, []);

  // Setting view
  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const dataToUse = interviewRequests || [];

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  // Server-side pagination
  const totalPages = pagination?.totalPages || 0;
  const nextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination?.hasPrev) {
      setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
    }
  };

  const currentFilteredRows =
    selectedType === "all"
      ? dataToUse
      : dataToUse.filter(
          (request) =>
            request.interviewerType?.toLowerCase() ===
            selectedType.toLowerCase()
        );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search (debounced fetch)
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatStatus = (status = "") => {
    return status
      .toString()
      .trim()
      .replace(/[_\s-]+/g, " ") // replace underscores, hyphens, or multiple spaces with single space
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Table Columns
  const tableColumns = [
    // v1.0.0 <------------------------------------------------------------------------
    {
      key: "interviewRequestCode",
      header: "Interview Request ID",
      render: (vale, row) => (
        <span
          className={`font-medium ${
            superAdminPermissions?.InterviewRequest?.View
              ? "text-custom-blue cursor-pointer"
              : "text-gray-900"
          }`}
          onClick={(e) => {
            e.stopPropagation(); // Prevents row-level handlers (if any)
            if (superAdminPermissions?.InterviewRequest?.View && row?._id) {
              setSelectedRequestId(row._id);
              setIsPopupOpen(true);
            }
          }}
        >
          {row?.interviewRequestCode ? row?.interviewRequestCode : "N/A"}
        </span>
      ),
    },
    {
      key: "interviewerId",
      header: "Interviewer ID",
      render: (vale, row) => (
        <span
          className={`font-medium ${
            superAdminPermissions?.InterviewRequest?.View
              ? "text-custom-blue cursor-pointer"
              : "text-gray-900"
          }`}
          onClick={(e) => {
            e.stopPropagation(); // Prevents row-level handlers (if any)
            if (superAdminPermissions?.InterviewRequest?.View && row?._id) {
              setSelectedRequestId(row._id);
              setIsPopupOpen(true);
            }
          }}
        >
          {row?.interviewerId ? row?.interviewerId?._id : "N/A"}
        </span>
      ),
    },
    {
      key: "interviewerName",
      header: "Interviewer Name",
      render: (value, row) => (
        <span
          className="block cursor-default truncate max-w-[160px]"
          title={`${
            capitalizeFirstLetter(row?.interviewerId?.lastName) || ""
          } ${
            capitalizeFirstLetter(row?.interviewerId?.firstName) || ""
          }`.trim()}
        >
          {row?.interviewerId?.firstName || row?.interviewerId?.lastName
            ? `${capitalizeFirstLetter(row?.interviewerId?.lastName) || ""} ${
                capitalizeFirstLetter(row?.interviewerId?.firstName) || ""
              }`.trim()
            : "N/A"}
        </span>
      ),
    },
    {
      key: "interviewerTyp",
      header: "Interviewer Type",
      render: (value, row) => (
        <span>{capitalizeFirstLetter(row?.interviewerType)}</span>
      ),
    },
    // v1.0.0 ------------------------------------------------------------------------>
    {
      key: "position",
      header: "Position",
      render: (value, row) => (
        <span
          className="block cursor-default truncate max-w-[160px]"
          title={capitalizeFirstLetter(row?.positionId?.title)}
        >
          {row?.positionId
            ? capitalizeFirstLetter(row?.positionId?.title)
            : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={formatStatus(row.status)} />,
    },
    {
      key: "requestedAt",
      header: " Requested At",
      render: (value, row) => (
        <span>{row ? formatDateTime(row?.requestedAt) : "N/A"}</span>
      ),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    ...(superAdminPermissions?.InterviewRequest?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => {
              setSelectedRequestId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <requestCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    // },
    // ...(superAdminPermissions?.InterviewRequest?.Edit
    //   ? [
    //       {
    //         key: "edit",
    //         label: "Edit",
    //         icon: <Pencil className="w-4 h-4 text-green-600" />,
    //         onClick: (row) => navigate(`edit/${row._id}`),
    //       },
    //     ]
    //   : []),
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
      key: "interviewerName",
      header: "Interviewer Name",
      render: (value, row) => (
        <span
          className="block cursor-default truncate max-w-[160px]"
          title={`${
            capitalizeFirstLetter(row?.interviewerId?.lastName) || ""
          } ${
            capitalizeFirstLetter(row?.interviewerId?.firstName) || ""
          }`.trim()}
        >
          {row?.interviewerId?.firstName || row?.interviewerId?.lastName
            ? `${capitalizeFirstLetter(row?.interviewerId?.lastName) || ""} ${
                capitalizeFirstLetter(row?.interviewerId?.firstName) || ""
              }`.trim()
            : "N/A"}
        </span>
      ),
    },
    {
      key: "interviewerTyp",
      header: "Interviewer Type",
      render: (value, row) => (
        <div className="font-medium">
          {capitalizeFirstLetter(row?.interviewerType) || "N/A"}
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      render: (value, row) => (
        <span
          className="block cursor-default truncate max-w-[160px]"
          title={capitalizeFirstLetter(row?.positionId?.title)}
        >
          {row?.positionId
            ? capitalizeFirstLetter(row?.positionId?.title)
            : "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={formatStatus(value)} />,
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const kanbanActions = [
    ...(superAdminPermissions?.InterviewRequest?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => {
              setSelectedRequestId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),

    // ...(superAdminPermissions?.InterviewRequest?.Edit
    //   ? [
    //       {
    //         key: "edit",
    //         label: "Edit",
    //         icon: <Pencil className="w-4 h-4 text-green-600" />,
    //         onClick: (row) => navigate(`edit/${row._id}`),
    //       },
    //     ]
    //   : []),
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
      {kanbanActions.map((action) => (
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
    const statusOptions = [
      "inprogress",
      "accepted",
      "declined",
      "expired",
      "cancelled",
    ];

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
  const renderPopupContent = (request) => {
    return (
      <div className="px-4">
        <div className="rounded-sm px-4 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-center items-center  gap-4 mb-4">
                <div className="relative">
                  {request?.interviewerId?.imageData ? (
                    <img
                      src={request?.interviewerId?.imageData?.path}
                      alt={request?.firstName || request?.lastName}
                      onError={(e) => {
                        e.target.src = "/default-profile.png";
                      }}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                      {request?.interviewRequestCode
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>
                  )}
                  {/* <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                    {request?.interviewRequestCode?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </div> */}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {request?.interviewRequestCode
                      ? request.interviewRequestCode
                      : "N/A"}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {formatDate(
                      request?.requestedAt
                        ? request?.requestedAt
                        : "Not Provided"
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Interview Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Interviewer Name
                            </p>
                            {/* v1.0.0 <---------------------------------------------------- */}
                            <p className="text-gray-700">
                              {request?.interviewerId?.firstName ||
                              request?.interviewerId?.lastName
                                ? `${request?.interviewerId?.firstName || ""} ${
                                    request?.interviewerId?.lastName || ""
                                  }`.trim()
                                : "N/A"}
                            </p>

                            {/* v1.0.0 ----------------------------------------------------->*/}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Requested Date
                            </p>
                            <p className="text-gray-700">
                              {formatDate(request?.requestedAt) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Requested Date
                            </p>
                            <p className="text-gray-700">
                              {formatDate(request?.requestedAt) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Date of Expiry
                            </p>
                            <p className="text-gray-700">
                              {formatDate(request?.expiryDateTime) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Timer className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-gray-700">
                              {request?.duration || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <Briefcase className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Interviewer Type
                              </p>
                              <p className="text-gray-700">
                                {request?.interviewerType || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <CircleDot className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="text-gray-700 truncate">
                                {(
                                  <StatusBadge
                                    status={capitalizeFirstLetter(
                                      request?.status
                                    )}
                                  />
                                ) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <HelpCircle className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Request Message
                              </p>
                              <p className="text-gray-700 truncate">
                                {request?.requestMessage || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="fixed top-12 right-0 left-0 sm:top-8 md:top-8 lg:top-12 xl:top-12 2xl:top-12">
        <div className="flex flex-col justify-between p-4 w-full">
          {/* v1.0.0 <--------------------------------------------------------------------------- */}
          {/* <main className="flex justify-between items-center">
            <div className="flex flex-col items-center w-full">
              <div className="flex self-end rounded-lg border border-gray-300 p-1 mb-4 mt-2">
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    selectedType === "all"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedType("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    selectedType === "internal"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedType("internal")}
                >
                  Internal
                </button>
                <button
                  className={`px-4 py-1 rounded-md text-sm ${
                    selectedType === "external"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setSelectedType("external")}
                >
                  External
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-3 w-full">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-xs text-gray-500">
                    Total Interview Requests
                  </div>
                  <div className="text-xl font-semibold">
                    {interviewRequests?.length}
                  </div>
                </div>
                {
                  <>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                      <div className="text-xs text-gray-500">Internal</div>
                      <div className="text-xl font-semibold">
                        {
                          interviewRequests?.filter(
                            (t) => t.interviewerType === "internal"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                      <div className="text-xs text-gray-500">External</div>
                      <div className="text-xl font-semibold">
                        {
                          interviewRequests?.filter(
                            (t) => t.interviewerType === "external"
                          ).length
                        }
                      </div>
                    </div>
                  </>
                }
              </div>
            </div>
          </main> */}
          {/* v1.0.0 --------------------------------------------------------------------------------> */}
          <div className="mt-3">
            <span className="text-2xl font-semibold text-custom-blue">
              Interviewer Requests
            </span>
          </div>
        </div>
        <div className="fixed left-0 right-0 sm:top-72 md:top-72 lg:top-58 xl:top-58 2xl:top-58 px-4">
          {/* Toolbar */}
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
            dataLength={pagination?.totalItems || dataToUse?.length || 0}
            searchPlaceholder="Search requests..."
            filterIconRef={filterIconRef} // Pass ref to Toolbar
          />
        </div>
        <div className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === "table" ? (
                <div className="w-full mb-8 bg-red">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Interview Requests found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    // v1.0.0 <------------------------------------------------------------------------
                    // data={currentFilteredRows.map((interview) => ({
                    //   ...interview,
                    //   id: interview._id,
                    //   title: interview.interviewRequestCode || "N/A",
                    //   subtitle: formatDate(interview?.requestedAt) || "N/A",
                    // }))}
                    data={(selectedType === "all"
                      ? currentFilteredRows
                      : currentFilteredRows.filter(
                          (interview) =>
                            interview.interviewerType?.toLowerCase() ===
                            selectedType
                        )
                    ).map((interview) => ({
                      ...interview,
                      id: interview._id,
                      title: interview.interviewRequestCode || "N/A",
                      subtitle: formatDate(interview?.requestedAt) || "N/A",
                    }))}
                    // v1.0.0 ------------------------------------------------------------------------>
                    interviewRequests={interviewRequests}
                    columns={kanbanColumns}
                    loading={isLoading}
                    renderActions={(item) => (
                      <KanbanActionsMenu
                        item={item}
                        kanbanActions={kanbanActions}
                      />
                    )}
                    // renderActions={renderKanbanActions}
                    onTitleClick={(row) => {
                      setSelectedRequestId(row._id);
                      setIsPopupOpen(true);
                    }}
                    emptyState="No Interview Requests Found."
                    kanbanTitle="Interviewer Request"
                    customHeight = "calc(100vh - 250px)"
                  />
                </div>
              )}

              {/* FilterPopup */}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                {renderFilterContent()}
              </FilterPopup>
            </motion.div>
          </div>
        </div>
      </div>

      <div>
        {isPopupOpen && interviewRequest && (
          <SidebarPopup
            title="Interviewer"
            onClose={() => setIsPopupOpen(false)}
          >
            {renderPopupContent(interviewRequest)}
          </SidebarPopup>
        )}
      </div>
      <Outlet />
    </>
  );
};

export default InternalRequest;
