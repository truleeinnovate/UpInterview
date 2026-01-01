// v1.0.0 - Ashok - Added button group for All, Organizations, Individuals
import React from "react";
import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { Eye, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
// import KanbanView from "./KanbanView.jsx";
import KanbanView from "../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import InterviewDetailsSidebar from "./InterviewDetailsSidebar.jsx";
// v1.0.0 <------------------------------------------------------------
import { config } from "../../../config.js";
import axios from "axios";
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect.jsx";
// v1.0.0 ------------------------------------------------------------>

import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { formatDateTime } from "../../../utils/dateFormatter.js";

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

const Interviewers = () => {
  // const { superAdminPermissions } = usePermissions();

  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    currentStatus: "",
  });
  // const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null); // For view details
  console.log("interviewData--", selectedInterview);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [listType, setListType] = useState("interviews"); // interviews | mock
  const ITEMS_PER_PAGE = 10;
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    itemsPerPage: ITEMS_PER_PAGE,
  });
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    // When search is cleared, update immediately (no debounce) so results reset right away
    if (!searchQuery) {
      setDebouncedSearch("");
      return;
    }

    // For non-empty queries, keep a small debounce to avoid spamming the API while typing
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // v1.0.0 <---------------------------------------------
  const [selectedType, setSelectedType] = useState("all"); // Show all by default
  // v1.0.0 --------------------------------------------->

  useEffect(() => {
    const getInterviews = async () => {
      try {
        setIsLoading(true);
        if (listType === "mock") {
          setSelectedType("all");
        }

        const params = {
          type: listType === "mock" ? "mock" : "interview",
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch,
          status: (selectedFilters.status || []).join(","),
          organizationType: selectedType === "all" ? "" : selectedType,
        };

        const response = await axios.get(
          `${config.REACT_APP_API_URL}/interview/interview-rounds`,
          { params }
        );

        if (response.data?.success) {
          const data = response.data?.data || [];
          const pag = response.data?.pagination || {
            currentPage,
            totalPages: Math.ceil((data.length || 0) / ITEMS_PER_PAGE) || 1,
            totalItems: data.length || 0,
            hasNext: false,
            hasPrev: currentPage > 0,
            itemsPerPage: ITEMS_PER_PAGE,
          };
          setInterviews(data);
          setPagination(pag);
        } else {
          setInterviews([]);
          setPagination((p) => ({ ...p, totalItems: 0, totalPages: 1 }));
        }
      } catch (err) {
        console.error("Error fetching interview rounds:", err);
        setInterviews([]);
        setPagination((p) => ({ ...p, totalItems: 0, totalPages: 1 }));
      } finally {
        setIsLoading(false);
      }
    };

    getInterviews();
  }, [listType, currentPage, debouncedSearch, selectedFilters, selectedType]);
  // v1.0.0 --------------------------------------------->

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("inProgress");

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

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const dataToUse = interviews;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  // Server-side filtering/pagination handled by API; `interviews` already current page.
  const totalPages = pagination?.totalPages || 1;
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
  const prevPage = () => setCurrentPage((p) => Math.max(0, p - 1));

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const tableColumns = [
    {
      key: "interviewCode",
      header: "Interview ID",
      render: (value, row) => (
        <div className="flex items-center">
          <div>
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              // onClick={() => handleViewInterview(row)}
            >
              {row.interviewCode || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "interviewerNames",
      header: "Interviewer",
      render: (value, row) => (
        <div
          title={capitalizeFirstLetter(row.interviewerNames)}
          className="truncate max-w-[200px] cursor-default"
        >
          <div className="text-sm text-gray-700">
            {capitalizeFirstLetter(row.interviewerNames) ||
              "No interviewers assigned"}
          </div>
        </div>
      ),
    },
    {
      key: "organization",
      header: "Organization",
      render: (value, row) => (
        <div className="truncate max-w-[150px]">
          <div className="text-sm text-gray-700">
            {capitalizeFirstLetter(row?.organization) || "N/A"}
          </div>
        </div>
      ),
    },

    {
      key: "status",
      header: "Current Status",
      render: (value, row) => <StatusBadge status={row.status || "Draft"} />,
    },
    
    {
      key: "createdOn",
      header: "Created On",
      render: (value, row) => (
        <div className="flex items-center truncate max-w-[120px]">
          <span className="text-sm text-gray-500">
            {row.createdOn ? formatDateTime(row.createdOn) : "N/A"}
          </span>
        </div>
      ),
    },
  ];
  // v1.0.0 ----------------------------------------------------------------------------------->

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => {
        setSelectedInterview(row);
        setIsPopupOpen(true);
      },
    },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "interviewerNames",
      header: "Interviewers",
      render: (value, row) => (
        <div
          title={row.interviewerNames}
          className="text-sm text-gray-700 truncate max-w-[160px] cursor-default"
        >
          {capitalizeFirstLetter(row.interviewerNames) || "No interviewers"}
        </div>
      ),
    },
    {
      key: "organization",
      header: "Organization",
      render: (value, row) => (
        <div className="text-sm text-gray-700">
          {capitalizeFirstLetter(row.organization) || "N/A"}
        </div>
      ),
    },
    {
      key: "createdOn",
      header: "Created On",
      render: (value, row) => (
        <div className="text-sm text-gray-500">
          {row.createdOn ? formatDateTime(row.createdOn) : "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={row.status || "Draft"} />,
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const kanbanActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => {
        setSelectedInterview(row);
        setIsPopupOpen(true);
      },
    },
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
    // filters options matching InterviewRounds schema
    const statusOptions = [
      "Draft",
      "RequestSent",
      "Scheduled",
      "InProgress",
      "Completed",
      "InCompleted",
      "Rescheduled",
      "Rejected",
      "Selected",
      "Cancelled",
      "Incomplete",
      "NoShow",
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
                  <div className="mt-2 rounded-md p-2 space-y-2">
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
                        <span className="text-sm">{status}</span>
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

  return (
    <>
      {/* v1.0.0 <----------------------------------------------------------------------------------- */}
      <div className="fixed md:mt-4 sm:mt-4 lg:mt-4 xl:mt-4 2xl:mt-4 left-0 right-0 bg-background">
        <div className="flex justify-between items-center">
          <div className="flex justify-between p-4">
            <div>
              <span className="text-2xl font-semibold text-custom-blue">
                {listType === "mock" ? "Mock Interviews" : "Interviews"}
              </span>
            </div>
          </div>
          {/* Only show organization/individual filter for regular interviews */}
          {listType !== "mock" && (
            <div className="flex self-end rounded-lg border border-gray-300 p-1 mb-4 mr-4">
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
                  selectedType === "organization"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setSelectedType("organization")}
              >
                Organizations
              </button>
              <button
                className={`px-4 py-1 rounded-md text-sm ${
                  selectedType === "individual"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setSelectedType("individual")}
              >
                Individuals
              </button>
            </div>
          )}
        </div>
        <div className="fixed top-38 sm:top-42 md:top-46 left-0 right-0 px-4">
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
            dataLength={pagination?.totalItems ?? dataToUse?.length}
            searchPlaceholder="Search interviews..."
            filterIconRef={filterIconRef} // Pass ref to Toolbar
            startContent={
              <div style={{ minWidth: 220 }}>
                <DropdownSelect
                  options={[
                    { value: "interviews", label: "Interviews" },
                    { value: "mock", label: "Mock Interviews" },
                  ]}
                  value={{
                    value: listType,
                    label:
                      listType === "mock" ? "Mock Interviews" : "Interviews",
                  }}
                  onChange={(opt) => setListType(opt?.value || "interviews")}
                  placeholder="Select Type"
                  menuPortalTarget={document.body}
                />
              </div>
            }
          />
        </div>

        <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === "table" ? (
                <div className="w-full mb-8 bg-red">
                  <TableView
                    data={interviews}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Interviews found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    data={interviews.map((round) => ({
                      ...round,
                      id: round._id,
                      title: round.interviewCode || "N/A",
                      subtitle: round.roundTitle || "Interview Round",
                      interviewerNames:
                        round.interviewerNames || "No interviewers",
                      organization: round.organization || "N/A",
                      organizationType: round.organizationType || "individual",
                      createdOn: round.createdOn,
                      status: round.status || "Draft",
                    }))}
                    interviews={interviews}
                    columns={kanbanColumns}
                    loading={isLoading}
                    // renderActions={renderKanbanActions}
                    emptyState="No interview rounds found."
                    renderActions={(item) => (
                      <KanbanActionsMenu
                        item={item}
                        kanbanActions={kanbanActions}
                      />
                    )}
                    onTitleClick={(item) => {
                      setSelectedInterview(item);
                      setIsPopupOpen(true);
                    }}
                    kanbanTitle="Internal Log"
                    customHeight="calc(100vh - 320px)"
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
      {/* v1.0.0 -----------------------------------------------------------------------------------> */}

      {/* Interview Details Sidebar */}
      <InterviewDetailsSidebar
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedInterview(null);
        }}
        interviewData={selectedInterview}
      />

      <Outlet />
    </>
  );
};

export default Interviewers;
