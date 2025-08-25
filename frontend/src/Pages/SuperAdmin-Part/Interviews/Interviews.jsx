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
  const [interviews, setInterviews] = useState([]);

  // v1.0.0 --------------------------------------------->
  useEffect(() => {
    const getInterviews = async () => {
      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/interview/interviews`
        );
        setInterviews(response.data);
        console.log("INTERVIEWS DATA ==============> : ", response.data);
      } catch (err) {
        console.log(err);
      }
    };

    getInterviews();
  }, []);
  // v1.0.0 --------------------------------------------->

  // v1.0.0 <---------------------------------------------
  const [selectedType, setSelectedType] = useState("organization");
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
    return dataToUse.filter((interview) => {
      const fieldsToSearch = [
        interview?.status,
        interview?.interviewNo,
        interview?.contactId?.firstName,
        interview?.contactId?.lastName,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(interview?.status);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
    });
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

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // v1.0.0 <-----------------------------------------------------------------------------------
  // Table Columns
  // const tableColumns = [
  //   {
  //     key: "interviewNo",
  //     header: "Interview ID",
  //     render: (vale, row) => (
  //       <span>{row?.interviewNo ? row?.interviewNo : "N/A"}</span>
  //     ),
  //   },

  //   {
  //     key: "name",
  //     header: "Name",
  //     render: (vale, row) => (
  //       <span>
  //         {row?.contactId?.firstName
  //           ? row?.contactId?.firstName
  //           : row?.contactId?.lastName}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "skills",
  //     header: "Skills",
  //     render: (value, row) => (
  //       <span>
  //         {row?.contactId?.skills?.length
  //           ? row?.contactId?.skills.join(", ")
  //           : "N/A"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "experience",
  //     header: "Experience",
  //     render: (value, row) => (
  //       <span>
  //         {row?.contactId?.experience ? row?.contactId?.experience : "N/A"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "rating",
  //     header: "Rating",
  //     render: (value, row) => <span>{row.rating ? row.rating : "N/A"}</span>,
  //   },
  //   {
  //     key: "pricePerHour",
  //     header: "Price/Hour",
  //     render: (value, row) => (
  //       <span>{row?.requestedRate?.hourlyRate || "N/A"}</span>
  //     ),
  //   },
  //   {
  //     key: "status",
  //     header: "Status",
  //     render: (value, row) => (
  //       <StatusBadge status={capitalizeFirstLetter(row.status)} />
  //     ),
  //   },
  // ];

  const tableColumns = [
    {
      key: "order",
      header: "Interview ID",
      render: (value, row) => (
        <div className="flex items-center">
          <div>
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              // onClick={() => handleViewInterview(row)}
            >
              {row.interviewCode || ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "candidateName",
      header: "Candidate Name",
      render: (value, row) => {
        const candidate = row.candidate;
        return (
          <Tooltip
            label={`${candidate?.FirstName || ""} ${candidate?.LastName || ""}`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8">
                {candidate?.imageUrl ? (
                  <img
                    src={candidate?.ImageData?.path}
                    alt={candidate?.LastName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                    {candidate?.LastName
                      ? candidate?.LastName?.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                )}
              </div>
              <div className="ml-3 truncate max-w-[120px]">
                <div
                  className="text-sm font-medium text-custom-blue cursor-pointer truncate"
                  // onClick={() => handleView(candidate)}
                >
                  {(candidate?.FirstName
                    ? candidate.FirstName.charAt(0).toUpperCase() +
                      candidate.FirstName.slice(1)
                    : "") +
                    " " +
                    (candidate?.LastName
                      ? candidate.LastName.charAt(0).toUpperCase() +
                        candidate.LastName.slice(1)
                      : "")}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {candidate?.Email || "No Email"}
                </div>
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "position",
      header: "Position",
      render: (value, row) => {
        const position = row.position;
        return (
          <Tooltip
            label={`${position?.title || "Unknown"} • ${
              position?.companyname || "No Company"
            } • ${position?.Location || "No location"}`}
          >
            <div className="truncate max-w-[120px]">
              <div
                className="text-sm font-medium text-custom-blue cursor-pointer truncate"
                // onClick={() => handleViewPosition(position)}
              >
                {position?.title
                  ? position.title.charAt(0).toUpperCase() +
                    position.title.slice(1)
                  : "Unknown"}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {position?.companyname || "No Company"} •{" "}
                {position?.Location || "No location"}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "interviewers",
      header: "Interviewers",
      render: (value, row) => {
        const rounds = row.rounds || [];
        const nextRound =
          rounds
            .filter((round) =>
              ["Scheduled", "RequestSent"].includes(round.status)
            )
            .sort((a, b) => a.sequence - b.sequence)[0] || null;
        const nextRoundInterviewers =
          nextRound?.interviewers?.map((interviewer) => ({
            ...interviewer,
            isExternal: nextRound?.interviewerType === "external",
          })) || [];
        return (
          <Tooltip
            label={nextRoundInterviewers
              .map((i) => i.name || "Unknown")
              .join(", ")}
          >
            <div className="flex flex-wrap gap-1 truncate max-w-[120px]">
              {/* {nextRoundInterviewers.slice(0, 2).map((interviewer) => (
                <InterviewerAvatar
                  key={interviewer?._id}
                  interviewer={interviewer}
                  size="sm"
                />
              ))} */}
              {nextRoundInterviewers.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{nextRoundInterviewers.length - 2}
                </span>
              )}
              {!nextRoundInterviewers.length && (
                <span className="text-sm text-gray-500">None</span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "progress",
      header: "Progress",
      render: (value, row) => {
        const rounds = row.rounds || [];
        const completedRounds = rounds.filter(
          (round) => round.status === "Completed"
        ).length;
        const totalRounds = rounds.length;
        return (
          <div className="truncate max-w-[120px]">
            <div className="text-sm text-gray-700">
              {completedRounds} of {totalRounds} Rounds
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-custom-blue h-2 rounded-full"
                style={{
                  width: `${
                    totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      key: "currentRound",
      header: "Current Round",
      render: (value, row) => {
        const rounds = row.rounds || [];
        const currentRound =
          rounds
            .filter((round) =>
              ["Scheduled", "RequestSent"].includes(round.status)
            )
            .sort((a, b) => a.sequence - b.sequence)[0] || null;
        return (
          <div className="min-w-[200px] max-w-[250px]">
            {currentRound ? (
              <div>
                <div className="text-sm font-medium text-gray-700">
                  {currentRound.roundTitle} • {currentRound.interviewType}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <StatusBadge status={currentRound.status} size="sm" />
                  <div className="text-xs text-gray-500">
                    {currentRound.dateTime ? (
                      <span>{currentRound.dateTime.split(" - ")[0]}</span>
                    ) : (
                      <span>Not scheduled</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-500">No current round</span>
            )}
          </div>
        );
      },
    },
    {
      key: "nextRound",
      header: "Next Round",
      render: (value, row) => {
        const rounds = row.rounds || [];
        const nextRound =
          rounds.sort((a, b) => a.sequence - b.sequence)[1] || null;
        return (
          <Tooltip
            label={
              nextRound
                ? `${nextRound.roundTitle} (${nextRound.interviewType})`
                : "No upcoming rounds"
            }
          >
            <div className="truncate max-w-[120px]">
              {nextRound ? (
                <>
                  <div className="text-sm font-medium text-gray-700 truncate">
                    {nextRound.roundTitle}
                  </div>
                  <div className="flex items-center mt-1">
                    <StatusBadge status={nextRound.status} size="sm" />
                    <span className="ml-2 text-xs text-gray-500 truncate">
                      {nextRound.interviewType}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-sm text-gray-500">None</span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "organization",
      header: "Organization",
      render: (value, row) => {
        const position = row.position;
        return (
          <div className="flex items-center truncate max-w-[120px]">
            {/* <Calendar className="h-4 w-4 mr-1 text-gray-500" /> */}
            <span className="text-sm text-gray-500">
              {position?.companyname || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      key: "createdOn",
      header: "Created On",
      render: (value, row) => (
        <div className="flex items-center truncate max-w-[120px]">
          {/* <Calendar className="h-4 w-4 mr-1 text-gray-500" /> */}
          <span className="text-sm text-gray-500">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={row.status} />,
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
        // setSelectedInterviewId(row._id);
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "hourlyRate",
      header: "Price per hour",
      render: (value, row) => (
        <div className="font-medium">
          {row.requestedRate?.hourlyRate || "N/A"}
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
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        // handleOpenPopup(row);
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
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
    // filters options
    const statusOptions = ["draft", "cancelled", "completed"];

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
                    // loading={isLoading}
                    actions={tableActions}
                    emptyState="No Interviews found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    data={currentFilteredRows.map((interview) => ({
                      ...interview,
                      id: interview._id,
                      title: interview.interviewNo || "N/A",
                      subtitle:
                        interview?.contactId?.firstName &&
                        interview?.contactId?.lastName
                          ? `${interview?.contactId.firstName} ${interview?.contactId.lastName}`
                          : "N/A",
                    }))}
                    interviews={interviews}
                    columns={kanbanColumns}
                    // loading={isLoading}
                    renderActions={renderKanbanActions}
                    emptyState="No interviews found."
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
      <Outlet />
    </>
  );
};

export default Interviewers;
