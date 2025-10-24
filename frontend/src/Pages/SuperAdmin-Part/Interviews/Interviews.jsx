// v1.0.0 - Ashok - Added button group for All, Organizations, Individuals
import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { Eye, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import KanbanView from "./KanbanView.jsx";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import InterviewDetailsSidebar from "./InterviewDetailsSidebar.jsx";
// v1.0.0 <------------------------------------------------------------
import { config } from "../../../config.js";
import axios from "axios";
import { Tooltip } from "@mantine/core";
// v1.0.0 ------------------------------------------------------------>

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
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null); // For view details
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // v1.0.0 --------------------------------------------->
  useEffect(() => {
    const getInterviews = async () => {
      try {
        setIsLoading(true); // Start loading
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/interview/interview-rounds`
        );
        if (response.data.success) {
          setInterviews(response.data.data);
          console.log("INTERVIEW ROUNDS DATA ==============> : ", response.data.data);

          // Debug: Check organization types in the data
          const orgTypes = response.data.data.reduce((acc, round) => {
            const type = round.organizationType || 'undefined';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          console.log("Organization Types Distribution (frontend):", orgTypes);
          console.log("Organization Types Distribution (backend):", response.data.typeDistribution);

          // Debug: Sample first 3 rounds
          console.log("Sample rounds:", response.data.data.slice(0, 3).map(r => ({
            id: r._id,
            orgType: r.organizationType,
            orgName: r.organization
          })));
        } else {
          console.error("Failed to fetch interview rounds");
        }
      } catch (err) {
        console.error("Error fetching interview rounds:", err);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    getInterviews();
  }, []);
  // v1.0.0 --------------------------------------------->

  // v1.0.0 <---------------------------------------------
  const [selectedType, setSelectedType] = useState("all"); // Show all by default
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

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];

    const filtered = dataToUse.filter((round) => {
      // Filter by organization/individual using organizationType field
      const matchesType = selectedType === "all"
        ? true  // Show all types
        : selectedType === "organization"
        ? round?.organizationType === "organization"  // Only show organization type
        : round?.organizationType === "individual"; // Show individual type

      const fieldsToSearch = [
        round?.status,
        round?.interviewCode,
        round?.interviewerNames,
        round?.organization,
        round?.roundTitle,
        round?.interviewMode,
        round?.interviewType,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(round?.status);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesType && matchesSearchQuery && matchesStatus;
    });

    // Debug logging
    console.log(`FilteredData: selectedType=${selectedType}, total=${dataToUse.length}, filtered=${filtered.length}`);

    return filtered;
  };

  // Pagination
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
        <Tooltip label={row.interviewerNames || "No interviewers assigned"}>
          <div className="truncate max-w-[200px]">
            <div className="text-sm text-gray-700">
              {row.interviewerNames || "No interviewers assigned"}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      key: "organization",
      header: "Organization",
      render: (value, row) => (
        <div className="truncate max-w-[150px]">
          <div className="text-sm text-gray-700">
            {row.organization || "N/A"}
          </div>
        </div>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={row.status || "Draft"} />,
    },
    {
      key: "createdOn",
      header: "Created On",
      render: (value, row) => (
        <div className="flex items-center truncate max-w-[120px]">
          <span className="text-sm text-gray-500">
            {row.createdOn
              ? new Date(row.createdOn).toLocaleDateString()
              : "N/A"}
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
      icon: <Eye className="w-4 h-4 text-blue-600" />,
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
        <div className="text-sm text-gray-700 truncate">
          {row.interviewerNames || "No interviewers"}
        </div>
      ),
    },
    {
      key: "organization",
      header: "Organization",
      render: (value, row) => (
        <div className="text-sm text-gray-700">
          {row.organization || "N/A"}
        </div>
      ),
    },
    {
      key: "createdOn",
      header: "Created On",
      render: (value, row) => (
        <div className="text-sm text-gray-500">
          {row.createdOn
            ? new Date(row.createdOn).toLocaleDateString()
            : "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={row.status || "Draft"} />
      ),
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const actions = [
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
      "NoShow"
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
                Interviews
              </span>
            </div>
          </div>
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
            dataLength={dataToUse?.length}
            searchPlaceholder="Search interviews..."
            filterIconRef={filterIconRef} // Pass ref to Toolbar
          />
        </div>

        <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === "table" ? (
                <div className="w-full mb-8 bg-red">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Interviews found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    data={currentFilteredRows.map((round) => ({
                      ...round,
                      id: round._id,
                      title: round.interviewCode || "N/A",
                      subtitle: round.roundTitle || "Interview Round",
                      interviewerNames: round.interviewerNames || "No interviewers",
                      organization: round.organization || "N/A",
                      organizationType: round.organizationType || "individual",
                      createdOn: round.createdOn,
                      status: round.status || "Draft"
                    }))}
                    interviews={interviews}
                    columns={kanbanColumns}
                    loading={isLoading}
                    renderActions={renderKanbanActions}
                    emptyState="No interview rounds found."
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
