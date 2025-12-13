// v1.0.0  -  Ashraf  -  removed dynamic permissons state and added effective directly
// v1.0.1  -  Ashok   -  added status badge as common code
// v1.0.2  -  Ashok   -  Disabled outer scrollbar when popups (reschedule and cancel schedule) open
// v1.0.3  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.4  -  Ashok   -  Improved responsiveness
// v1.0.5  -  Ashok   -  added common code for kanban
// v1.0.6  -  Ashok   -  added clickable title to navigate to details page at kanban
// v1.0.7  -  Ashok   -  added common code to empty state messages and fixed style issues

import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import MockProfileDetails from "./MockProfileDetails";
import ReschedulePopup from "./ReschedulePopup.jsx";
import { motion } from "framer-motion";
import { Eye, MoreVertical, Pencil, Timer, XCircle } from "lucide-react";
import CancelPopup from "./ScheduleCancelPopup.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Header from "../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
// import MockInterviewKanban from "./MockInterviewKanban.jsx";
import MockInterviewKanban from "../../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { useMockInterviews } from "../../../../apiHooks/useMockInterviews.js";
import { usePermissions } from "../../../../Context/PermissionsContext";
// v1.0.1 <--------------------------------------------------------------------------
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
// v1.0.1 -------------------------------------------------------------------------->
// v1.0.2 <-----------------------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.2 ----------------------------------------------------------------------------------->
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage.js";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { formatDateTime } from "../../../../utils/dateFormatter.js";

// v1.0.5 <----------------------------------------------------------------------------
const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  // Call the function to get actions array for this item
  const actions = kanbanActions(item);
  const mainActions = actions.filter((a) => ["view", "edit"].includes(a.key));
  const overflowActions = actions.filter(
    (a) => !["view", "edit"].includes(a.key)
  );

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
      {/* {mainActions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item, e);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))} */}

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
// v1.0.5 ---------------------------------------------------------------------------->

const MockInterview = () => {
  const { effectivePermissions, isInitialized } = usePermissions();

  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const rowsPerPage = 10;
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    technology: [],
    duration: { min: "", max: "" },
    createdDate: "", // '', 'last7', 'last30', 'last90'
    interviewer: [],
  });
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTechnologyOpen, setIsTechnologyOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);
  const [isInterviewerOpen, setIsInterviewerOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState([]);
  const [durationRange, setDurationRange] = useState({ min: "", max: "" });
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [mockinterviewDataView, setmockinterviewDataView] = useState(false);
  const [reschedule, setReschedule] = useState(false);
  const [cancelSchedule, setCancelSchedule] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const filterIconRef = useRef(null);

  const { mockinterviewData, loading, totalCount, totalPages } =
    useMockInterviews({
      search: searchQuery,
      page: currentPage, // This is 0-based, will be converted to 1-based in hook
      limit: rowsPerPage,
      filters: selectedFilters,
    });

  // v1.0.2 <--------------------------------------------
  // v1.0.5 <---------------------------------------------------------------
  useScrollLock(reschedule || cancelSchedule || viewMode === "kanban");
  // v1.0.5 --------------------------------------------------------------->
  // v1.0.2 -------------------------------------------->

  useEffect(() => {
    document.title = "Mockinterview Tab";
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync filter states when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setSelectedTechnology(selectedFilters.technology);
      setDurationRange(selectedFilters.duration);
      setCreatedDatePreset(selectedFilters.createdDate);
      setSelectedInterviewers(selectedFilters.interviewer);
      // Reset all open states
      setIsStatusOpen(false);
      setIsTechnologyOpen(false);
      setIsDurationOpen(false);
      setIsCreatedDateOpen(false);
      setIsInterviewerOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  // Don't render until permissions are initialized
  if (!isInitialized) {
    return null;
  }

  // Check if user has access to MockInterviews
  if (!effectivePermissions.MockInterviews?.ViewTab) {
    return null;
  }
  // <---------------------- v1.0.0
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTechnologyToggle = (tech) => {
    setSelectedTechnology((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleDurationChange = (e, type) => {
    const value =
      e.target.value === ""
        ? ""
        : Math.max(0, Math.min(180, Number(e.target.value) || ""));
    setDurationRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleInterviewerToggle = (interviewer) => {
    setSelectedInterviewers((prev) =>
      prev.includes(interviewer)
        ? prev.filter((i) => i !== interviewer)
        : [...prev, interviewer]
    );
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      technology: selectedTechnology,
      duration: durationRange,
      createdDate: createdDatePreset,
      interviewer: selectedInterviewers,
    };
    setSelectedFilters(filters);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.technology.length > 0 ||
        filters.duration.min !== "" ||
        filters.duration.max !== "" ||
        filters.createdDate !== "" ||
        filters.interviewer.length > 0
    );
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      technology: [],
      duration: { min: "", max: "" },
      createdDate: "",
      interviewer: [],
    };
    setSelectedStatus([]);
    setSelectedTechnology([]);
    setDurationRange({ min: "", max: "" });
    setCreatedDatePreset("");
    setSelectedInterviewers([]);
    setSelectedFilters(clearedFilters);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleFilterIconClick = () => {
    // if (mockinterviewData?.length !== 0) {
    setFilterPopupOpen((prev) => !prev);
    // }
  };

  // Helper function to normalize spaces for better search
  // const normalizeSpaces = (str) =>
  //   str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  // const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  // const currentFilteredRows = FilteredData().slice(startIndex, endIndex);
  const currentFilteredRows = mockinterviewData || [];

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const onRescheduleClick = (mockinterview) => {
    setReschedule(mockinterview);
  };

  const onCancelClick = (row) => {
    setSelectedRow(row);
    setCancelSchedule(true);
  };

  const closeschedulepopup = () => {
    setReschedule(false);
  };

  // const closepopup = () => {
  //   setCancelSchedule(false);
  // };

  // v1.0.5 <-------------------------------------------------------------
  // const formatDate = (isoString) => {
  //   if (!isoString) return "";
  //   const date = new Date(isoString);
  //   return date.toLocaleString("en-GB", {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  // };
  // v1.0.5 ------------------------------------------------------------->

  // ------------------------- empty state message -------------------------------------
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  const initialDataCount = mockinterviewData?.length || 0;
  const currentFilteredCount = currentFilteredRows?.length || 0;
  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "mock interviews"
  ); // ------------------------- empty state message -------------------------------------
  const tableColumns = [
    {
      key: "mockInterviewCode",
      header: "Interview ID",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => navigate(`/mock-interview-details/${row._id}`)}
        >
          {row?.mockInterviewCode || "N/A"}
        </div>
      ),
    },
    {
      key: "title",
      header: "Interview Title",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => navigate(`/mock-interview-details/${row._id}`)}
        >
          {row?.rounds?.[0]?.roundTitle || "Not Provided"}
        </div>
      ),
    },
    {
      key: "CurrentRole",
      header: "Current Role",
      render: (value, row) => row?.roleDetails?.roleLabel || "Not Provided",
    },
    {
      key: "status",
      // v1.0.0 <--------------------------------------------------------------------
      header: "Status",

      // render: (value, row) => row?.rounds?.[0]?.status || "Not Provided",
      render: (value, row) => {
        return row?.rounds?.[0]?.status ? (
          <StatusBadge
            status={
              row.rounds[0].status === "RequestSent"
                ? "Request Sent"
                : row?.rounds[0]?.status
            }
          />
        ) : (
          <span className="text-gray-400 text-sm">Not Provided</span>
        );
      },
      // v1.0.0 -------------------------------------------------------------------->
    },
    {
      key: "duration",
      header: "Duration",
      render: (value, row) => row?.rounds?.[0]?.duration || "Not Provided",
    },
    {
      key: "interviewer",
      header: "Interviewer",
      render: (value, row) => {
        const interviewers = row?.rounds?.[0]?.interviewers || [];
        if (interviewers.length === 0) return "Not Provided";

        // Map interviewer names, accessing contact.Name or firstName/lastName
        const names = interviewers
          .map((interviewer) => {
            const contact = interviewer?.contact;
            return (
              contact?.Name ||
              `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim()
            );
          })
          .filter(Boolean); // Remove empty strings

        if (names.length === 0) return "Not Provided";

        // Show first name and truncate with ... if more than one
        const displayText = names.length > 1 ? `${names[0]}...` : names[0];
        const additionalCount = names.length > 1 ? names.length - 1 : 0;

        return (
          <div className="w-48 truncate flex items-center space-x-1">
            <span className="text-sm text-gray-900" title={names.join(", ")}>
              {displayText}
            </span>
            {additionalCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-black bg-gray-200 rounded-full">
                +{additionalCount}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created On",
      render: (value) => {
        // if (!value) return "Not Provided";
        // const date = new Date(value);
        // return date.toLocaleString("en-GB", {
        //   day: "2-digit",
        //   month: "2-digit",
        //   year: "numeric",
        //   hour: "numeric",
        //   minute: "2-digit",
        //   hour12: true,
        // });
        return formatDateTime(value);
      },
    },
  ];

  // const tableActions = [
  //   {
  //     key: "view",
  //     label: "View Details",
  //     icon: <Eye className="w-4 h-4 text-custom-blue" />,
  //     onClick: (row) => navigate(`/mock-interview-details/${row._id}`),
  //   },
  //   {
  //     key: "edit",
  //     label: "Edit",
  //     icon: <Pencil className="w-4 h-4 text-green-600" />,
  //     onClick: (row) =>
  //       navigate(`/mock-interview/${row._id}/edit`, {
  //         state: { from: "tableMode" },
  //       }),
  //   },
  //   {
  //     key: "reschedule",
  //     label: "Reschedule",
  //     icon: <Timer className="w-4 h-4 text-custom-blue" />,
  //     onClick: (row) => onRescheduleClick(row),
  //   },
  //   {
  //     key: "cancel",
  //     label: "Cancel",
  //     icon: <XCircle className="w-4 h-4 text-red-500" />,
  //     onClick: (row) => onCancelClick(row),
  //   },
  // ];

  // v1.0.5 <----------------------------------------------------------------------------------

  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      show: (row) => true, // always show
      onClick: (row) => navigate(`/mock-interview-details/${row._id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      show: (row) => row?.rounds?.[0]?.status === "Draft",
      onClick: (row) =>
        navigate(`/mock-interview/${row._id}/edit`, {
          state: { from: "tableMode" },
        }),
    },
    {
      key: "reschedule",
      label: "Reschedule",
      icon: <Timer className="w-4 h-4 text-custom-blue" />,
      show: (row) =>
        !["Draft", "Completed", "Rejected", "Selected", "Cancelled"].includes(
          row?.rounds?.[0]?.status
        ),
      onClick: (row) =>
        navigate(`/mock-interview/${row._id}/edit`, {
          state: { from: location.pathname },
        }),

      // onClick: (row) => onRescheduleClick(row),
    },
    {
      key: "cancel",
      label: "Cancel",
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      show: (row) =>
        !["Draft", "Completed", "Rejected", "Selected", "Cancelled"].includes(
          row?.rounds?.[0]?.status
        ),
      onClick: (row) => onCancelClick(row),
    },
  ];

  const kanbanColumns = [
    {
      key: "technology",
      header: "Technology",
      render: (value, row) => (
        <span>{capitalizeFirstLetter(row?.technology)}</span>
      ),
    },
    {
      key: "interviewer",
      header: "Interviewer",
      render: (value, row) => (
        <span className="text-gray-800 font-medium truncate">
          {row?.interviewer || row?.rounds?.[0]?.interviewer || "N/A"}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (value, row) => (
        <span className="text-gray-800 font-medium truncate">
          {row?.duration || row?.rounds?.[0]?.duration || "N/A"}{" "}
          {row?.duration || row?.rounds?.[0]?.duration ? "mins" : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <span className="text-gray-800 font-medium truncate">
          {row?.rounds?.[0]?.status === "RequestSent"
            ? "Request Sent"
            : (
                <StatusBadge
                  status={capitalizeFirstLetter(row?.rounds?.[0]?.status)}
                />
              ) || "N/A"}
        </span>
      ),
    },
  ];

  // const kanbanActions = () => [
  //   {
  //     key: "view",
  //     label: "View Details",
  //     icon: <Eye className="w-4 h-4 text-custom-blue" />,
  //     onClick: (row) =>
  //       navigate(`/mock-interview-details/${row._id}`, {
  //         state: { from: location.pathname },
  //       }),
  //   },
  //   {
  //     key: "edit",
  //     label: "Edit",
  //     icon: <Pencil className="w-4 h-4 text-green-600" />,
  //     onClick: (row) =>
  //       navigate(`/mock-interview/${row._id}/edit`, {
  //         state: { from: location.pathname },
  //       }),
  //   },
  //   {
  //     key: "reschedule",
  //     label: "Reschedule",
  //     icon: <Timer className="w-4 h-4 text-custom-blue" />,
  //     onClick: (row) => onRescheduleClick(row),
  //   },
  //   {
  //     key: "cancel",
  //     label: "Cancel",
  //     icon: <XCircle className="w-4 h-4 text-red-500" />,
  //     onClick: (row) => onCancelClick(row),
  //   },
  // ];

  const kanbanActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      show: (row) => true, // always show
      onClick: (row) =>
        navigate(`/mock-interview-details/${row._id}`, {
          state: { from: location.pathname },
        }),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      show: (row) => row?.rounds?.[0]?.status === "Draft",
      onClick: (row) =>
        navigate(`/mock-interview/${row._id}/edit`, {
          state: { from: location.pathname },
        }),
    },
    {
      key: "reschedule",
      label: "Reschedule",
      icon: <Timer className="w-4 h-4 text-custom-blue" />,
      show: (row) =>
        !["Draft", "Completed", "Rejected", "Selected", "Cancelled"].includes(
          row?.rounds?.[0]?.status
        ),
      onClick: (row) =>
        navigate(`/mock-interview/${row._id}/edit`, {
          state: { from: location.pathname },
        }),

      // onClick: (row) => onRescheduleClick(row),
    },
    {
      key: "cancel",
      label: "Cancel",
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      show: (row) =>
        !["Draft", "Completed", "Rejected", "Selected", "Cancelled"].includes(
          row?.rounds?.[0]?.status
        ),
      onClick: (row) => onCancelClick(row),
    },
  ];

  // v1.0.5 ---------------------------------------------------------------------------------->

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Mock Interviews"
              onAddClick={() => navigate("/mock-interview-create")}
              addButtonText="Add Interview"
              canCreate={effectivePermissions.MockInterviews?.Create}
            />
            {/* // <---------------------- v1.0.0 */}
            <Toolbar
              view={viewMode}
              setView={setViewMode}
              searchQuery={searchQuery}
              onSearch={handleSearchInputChange}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterActive={isFilterActive}
              isFilterPopupOpen={isFilterPopupOpen}
              dataLength={totalPages > 0 ? totalPages : 1}
              searchPlaceholder="Search by Title, Technology..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      {/* v1.0.4 <------------------------------------------------------------------------------------------- */}
      <main className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {/* v1.0.4 -------------------------------------------------------------------------------------------> */}
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "kanban" ? (
              // v1.0.5 <-----------------------------------------------------------
              <MockInterviewKanban
                loading={loading}
                data={currentFilteredRows.map((interview) => ({
                  ...interview,
                  id: interview?._id,
                  title: interview?.mockInterviewCode,
                  subTitle: formatDateTime(interview.createdAt),
                  navigateTo: `/mock-interview-details/${interview._id}`,
                }))}
                columns={kanbanColumns}
                renderActions={(item) => (
                  <KanbanActionsMenu
                    item={item}
                    kanbanActions={kanbanActions}
                  />
                )}
                emptyState={emptyStateMessage}
                kanbanTitle="Mock Interview"
              />
            ) : (
              // v1.0.5 ----------------------------------------------------------->
              // v1.0.4 <-----------------------------------------------------------------------------
              <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                <TableView
                  data={currentFilteredRows}
                  columns={tableColumns}
                  actions={tableActions}
                  loading={loading}
                  emptyState={emptyStateMessage}
                  className="table-fixed w-full"
                />
              </div>
              // v1.0.4 ----------------------------------------------------------------------------->
            )}

            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearAll}
              filterIconRef={filterIconRef}
            >
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {/* Status Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                  >
                    <span className="font-medium text-gray-700">Status</span>
                    {isStatusOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isStatusOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {[
                        "Draft",
                        "Scheduled",
                        "Completed",
                        "Cancelled",
                        "In Progress",
                        "Requests Sent",
                      ].map((status) => (
                        <label
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatus.includes(status)}
                            onChange={() => handleStatusToggle(status)}
                            className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duration Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsDurationOpen(!isDurationOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Duration (Minutes)
                    </span>
                    {isDurationOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isDurationOpen && (
                    <div className="mt-2 pl-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={durationRange.min}
                          onChange={(e) => handleDurationChange(e, "min")}
                          placeholder="Min"
                          className="w-20 p-1 border rounded"
                          min="0"
                          max="180"
                        />
                        <span className="text-sm">to</span>
                        <input
                          type="number"
                          value={durationRange.max}
                          onChange={(e) => handleDurationChange(e, "max")}
                          placeholder="Max"
                          className="w-20 p-1 border rounded"
                          min="0"
                          max="180"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Technology and Interviewer Filters */}
                {(() => {
                  const uniqueTechnologies = [
                    ...new Set(
                      mockinterviewData
                        ?.map((i) => i.technology)
                        .filter(Boolean) || []
                    ),
                  ];
                  const uniqueInterviewers = [
                    ...new Set(
                      mockinterviewData
                        ?.flatMap((i) => {
                          const interviewers =
                            i.rounds?.[0]?.interviewers || [];
                          return interviewers.map((interviewer) => {
                            const contact = interviewer?.contact;
                            return (
                              contact?.Name ||
                              `${contact?.firstName || ""} ${
                                contact?.lastName || ""
                              }`.trim()
                            );
                          });
                        })
                        .filter(Boolean) || []
                    ),
                  ];

                  return (
                    <>
                      {/* Technology Filter */}
                      {uniqueTechnologies.length > 0 && (
                        <div>
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() =>
                              setIsTechnologyOpen(!isTechnologyOpen)
                            }
                          >
                            <span className="font-medium text-gray-700">
                              Technology
                            </span>
                            {isTechnologyOpen ? (
                              <MdKeyboardArrowUp className="text-xl text-gray-700" />
                            ) : (
                              <MdKeyboardArrowDown className="text-xl text-gray-700" />
                            )}
                          </div>
                          {isTechnologyOpen && (
                            <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                              {uniqueTechnologies.map((tech) => (
                                <label
                                  key={tech}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedTechnology.includes(tech)}
                                    onChange={() =>
                                      handleTechnologyToggle(tech)
                                    }
                                    className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                  />
                                  <span className="text-sm">{tech}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interviewer Filter */}
                      {uniqueInterviewers.length > 0 && (
                        <div>
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() =>
                              setIsInterviewerOpen(!isInterviewerOpen)
                            }
                          >
                            <span className="font-medium text-gray-700">
                              Interviewer
                            </span>
                            {isInterviewerOpen ? (
                              <MdKeyboardArrowUp className="text-xl text-gray-700" />
                            ) : (
                              <MdKeyboardArrowDown className="text-xl text-gray-700" />
                            )}
                          </div>
                          {isInterviewerOpen && (
                            <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                              {uniqueInterviewers.map((interviewer) => (
                                <label
                                  key={interviewer}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedInterviewers.includes(
                                      interviewer
                                    )}
                                    onChange={() =>
                                      handleInterviewerToggle(interviewer)
                                    }
                                    className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                  />
                                  <span className="text-sm">{interviewer}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Created Date Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCreatedDateOpen(!isCreatedDateOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Created Date
                    </span>
                    {isCreatedDateOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isCreatedDateOpen && (
                    <div className="mt-2 pl-3 space-y-1">
                      {[
                        { value: "", label: "Any time" },
                        { value: "last7", label: "Last 7 days" },
                        { value: "last30", label: "Last 30 days" },
                        { value: "last90", label: "Last 90 days" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={createdDatePreset === option.value}
                            onChange={(e) =>
                              setCreatedDatePreset(e.target.value)
                            }
                            className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </FilterPopup>
          </motion.div>
        </div>
      </main>
      {mockinterviewDataView && (
        <MockProfileDetails
          mockinterviewId={mockinterviewDataView._id}
          onCloseprofile={() => setmockinterviewDataView(false)}
        />
      )}
      {cancelSchedule && (
        <CancelPopup
          row={selectedRow}
          onClose={() => setCancelSchedule(false)}
        />
      )}
      {reschedule && (
        <ReschedulePopup
          onClose={closeschedulepopup}
          MockEditData={reschedule}
        />
      )}
    </div>
  );
};

export default MockInterview;
