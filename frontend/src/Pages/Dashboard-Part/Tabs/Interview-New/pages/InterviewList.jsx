//<---------v1.0.0---------Venkatesh-----add current round column
// v1.0.1 - Ashok - improved searching by full name
// v1.0.2  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.3  -  Ashok   -  improved responsiveness
// v1.0.4  -  Ashok   -  made first leter capital
// v1.0.5  -  Ashok   -  fixed style issues

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronUp,
  ChevronDown,
  Calendar,
  ExternalLink,
  Eye,
  Pencil,
  ArrowRight,
  Trash,
} from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip } from "@mantine/core";
import Loading from "../../../../../Components/Loading.js";
import PositionSlideDetails from "../../Position-Tab/PositionSlideDetails.jsx";
import Header from "../../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../../../../Components/Shared/Table/TableView.jsx";
import { FilterPopup } from "../../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import KanbanBoard from "../components/KanbanBoard.jsx";
import StatusBadge from "../../CommonCode-AllTabs/StatusBadge";
import InterviewerAvatar from "../../CommonCode-AllTabs/InterviewerAvatar";
import { useInterviews } from "../../../../../apiHooks/useInterviews.js";
import { usePermissions } from "../../../../../Context/PermissionsContext";
import { formatDateTime } from "../../../../../utils/dateFormatter";
import DeleteConfirmModal from "../../CommonCode-AllTabs/DeleteConfirmModal.jsx";
import { notify } from "../../../../../services/toastService.js";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { getEmptyStateMessage } from "../../../../../utils/EmptyStateMessage/emptyStateMessage.js";

function InterviewList() {
  const { effectivePermissions } = usePermissions();
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectPositionView, setSelectPositionView] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);

  const rowsPerPage = 10;
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: "", max: "" },
    interviewType: [],
    interviewMode: [],
    position: [],
    company: [],
    roundStatus: [],
    interviewer: [],
    createdDate: "", // '', 'last7', 'last30', 'last90'
    interviewDate: { from: "", to: "" },
  });

  const {
    interviewData,
    total,
    // currentPage: currentPage + 1,
    // totalPages: serverTotalPages,
    isLoading, deleteInterviewMutation } = useInterviews(
      {
      searchQuery: debouncedSearch, // Debounced search for fewer requests
      status: selectedFilters.status,
      tech: selectedFilters.tech,
      experienceMin: selectedFilters.experience.min,
      experienceMax: selectedFilters.experience.max,
      interviewType: selectedFilters.interviewType,
      interviewMode: selectedFilters.interviewMode,
      position: selectedFilters.position,
      company: selectedFilters.company,
      roundStatus: selectedFilters.roundStatus,
      interviewer: selectedFilters.interviewer,
      createdDate: selectedFilters.createdDate,
      interviewDateFrom: selectedFilters.interviewDate.from,
      interviewDateTo: selectedFilters.interviewDate.to,
    },
    currentPage + 1,
    rowsPerPage
  );

  

  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedTech, setSelectedTech] = useState([]);
  const [experience, setExperience] = useState({ min: "", max: "" });
  const [expandedRows, setExpandedRows] = useState({});
  const filterIconRef = useRef(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isInterviewTypeOpen, setIsInterviewTypeOpen] = useState(false);
  const [isInterviewModeOpen, setIsInterviewModeOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isRoundStatusOpen, setIsRoundStatusOpen] = useState(false);
  const [isInterviewerOpen, setIsInterviewerOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);
  const [isInterviewDateOpen, setIsInterviewDateOpen] = useState(false);
  const [selectedInterviewTypes, setSelectedInterviewTypes] = useState([]);
  const [selectedInterviewModes, setSelectedInterviewModes] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedRoundStatuses, setSelectedRoundStatuses] = useState([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  const [interviewDateRange, setInterviewDateRange] = useState({
    from: "",
    to: "",
  });
  const [deleteInterview, setDeleteInterview] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  // Sync filter states when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setSelectedTech(selectedFilters.tech);
      setExperience(selectedFilters.experience);
      setSelectedInterviewTypes(selectedFilters.interviewType);
      setSelectedInterviewModes(selectedFilters.interviewMode);
      setSelectedPositions(selectedFilters.position);
      setSelectedCompanies(selectedFilters.company);
      setSelectedRoundStatuses(selectedFilters.roundStatus);
      setSelectedInterviewers(selectedFilters.interviewer);
      setCreatedDatePreset(selectedFilters.createdDate);
      setInterviewDateRange(selectedFilters.interviewDate);
      // Reset all open states
      setIsStatusOpen(false);
      setIsSkillsOpen(false);
      setIsExperienceOpen(false);
      setIsInterviewTypeOpen(false);
      setIsInterviewModeOpen(false);
      setIsPositionOpen(false);
      setIsCompanyOpen(false);
      setIsRoundStatusOpen(false);
      setIsInterviewerOpen(false);
      setIsCreatedDateOpen(false);
      setIsInterviewDateOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleView = (candidate) => {
    if (effectivePermissions.Candidates?.View && candidate?._id) {
      navigate(`/candidate/view-details/${candidate._id}`);
    }
  };

  const handleViewPosition = (position) => {
    if (effectivePermissions.Positions?.View) {
      setSelectedPosition(position);
      setSelectPositionView(true);
    }
  };

  const handleViewInterview = (interview) => {
    if (effectivePermissions.Interviews?.View) {
      navigate(`/interviews/${interview._id}`);
    }
  };

  const handleEditInterview = (interview) => {
    if (effectivePermissions.Interviews?.Edit) {
      navigate(`/interviews/${interview._id}/edit`);
    }
  };

  //  delete functionality
  const handleDeleteInterview = (interview) => {
    if (effectivePermissions.Interviews?.Delete) {
      setDeleteInterview(interview);
      setShowDeleteConfirmModal(true);
      // navigate(`/interviews/${interview._id}/delete`);
    }
  };

  // Your existing handleConfirmDelete function
  const handleConfirmDelete = async () => {
    if (deleteInterview?._id) {
      try {
        await deleteInterviewMutation(deleteInterview._id);
        notify.success("Interview deleted successfully");
        setShowDeleteConfirmModal(false);
        setDeleteInterview(null);
      } catch (error) {
        // Error is already handled in the mutation
        console.error("Failed to delete interview:", error);
        setShowDeleteConfirmModal(false);
        setDeleteInterview(null);
        const backendMessage =
          error?.response?.data?.message || "Failed to delete position";
        notify.error(backendMessage);
      }
    }
  };

  const handleFilterChange = useCallback((filters) => {
    setSelectedFilters(filters);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        filters.experience.max ||
        filters.interviewType.length > 0 ||
        filters.interviewMode.length > 0 ||
        filters.position.length > 0 ||
        filters.company.length > 0 ||
        filters.roundStatus.length > 0 ||
        filters.interviewer.length > 0 ||
        filters.createdDate ||
        filters.interviewDate.from ||
        filters.interviewDate.to
    );
    setCurrentPage(0); // reset to first page
  }, []);

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // const handleTechToggle = (tech) => {
  //   setSelectedTech((prev) =>
  //     prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
  //   );
  // };

  // const handleExperienceChange = (e, type) => {
  //   const value = Math.max(0, Math.min(15, Number(e.target.value) || ""));
  //   setExperience((prev) => ({
  //     ...prev,
  //     [type]: value,
  //   }));
  // };

  // const handleInterviewTypeToggle = (type) => {
  //   setSelectedInterviewTypes((prev) =>
  //     prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
  //   );
  // };

  // const handleInterviewModeToggle = (mode) => {
  //   setSelectedInterviewModes((prev) =>
  //     prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
  //   );
  // };

  const handlePositionToggle = (position) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const handleCompanyToggle = (company) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  const handleRoundStatusToggle = (status) => {
    setSelectedRoundStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // const handleInterviewerToggle = (interviewer) => {
  //   setSelectedInterviewers((prev) =>
  //     prev.includes(interviewer)
  //       ? prev.filter((i) => i !== interviewer)
  //       : [...prev, interviewer]
  //   );
  // };

  const handleInterviewerToggle = (id) => {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleInterviewDateChange = (e, type) => {
    setInterviewDateRange((prev) => ({
      ...prev,
      [type]: e.target.value,
    }));
  };

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      tech: [],
      experience: { min: "", max: "" },
      interviewType: [],
      interviewMode: [],
      position: [],
      company: [],
      roundStatus: [],
      interviewer: [],
      createdDate: "",
      interviewDate: { from: "", to: "" },
    };
    setSelectedStatus([]);
    setSelectedTech([]);
    setExperience(clearedFilters.experience);
    setSelectedInterviewTypes([]);
    setSelectedInterviewModes([]);
    setSelectedPositions([]);
    setSelectedCompanies([]);
    setSelectedRoundStatuses([]);
    setSelectedInterviewers([]);
    setCreatedDatePreset("");
    setInterviewDateRange({ from: "", to: "" });
    setSelectedFilters(clearedFilters);
    setCurrentPage(0); // reset to first page
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };
  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      tech: selectedTech,
      experience: { min: experience.min, max: experience.max },
      interviewType: selectedInterviewTypes,
      interviewMode: selectedInterviewModes,
      position: selectedPositions,
      company: selectedCompanies,
      roundStatus: selectedRoundStatuses,
      interviewer: selectedInterviewers,
      createdDate: createdDatePreset,
      interviewDate: interviewDateRange,
    };
    handleFilterChange(filters);
    setFilterPopupOpen(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // reset to first page
  };

  // Debounce search input to reduce requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch((searchQuery || '').trim()), 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleFilterIconClick = () => {
    setFilterPopupOpen((prev) => !prev);
  };

  // Auto-reset page if it exceeds available pages
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / rowsPerPage));
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [total, rowsPerPage, currentPage]);

  const toggleRowExpansion = (interviewId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [interviewId]: !prev[interviewId],
    }));
  };

  // v1.0.1 <------------------------------------------------------------------
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";
  // v1.0.1 ------------------------------------------------------------------>

  // const FilteredData = () => {
  //   if (!Array.isArray(interviewData)) return [];
  //   return interviewData.filter((interview) => {
  //     const fieldsToSearch = [
  //       interview.candidateId?.FirstName,
  //       interview.candidateId?.LastName,
  //       interview.candidateId?.Email,
  //       interview.positionId?.title,
  //       interview.positionId?.companyname,
  //       interview.interviewTitle,
  //       interview.interviewType,
  //       interview.status,
  //       interview.interviewCode,
  //     ].filter(Boolean);

  //     // v1.0.1 <---------------------------------------------------------------
  //     // const matchesSearchQuery = fieldsToSearch.some((field) =>
  //     //   field.toString().toLowerCase().includes(searchQuery.toLowerCase())
  //     // );

  //     const normalizedQuery = normalizeSpaces(searchQuery);

  //     // Full name both orders
  //     const fullNameNormal = normalizeSpaces(
  //       `${interview.candidateId?.FirstName || ""} ${interview.candidateId?.LastName || ""
  //       }`
  //     );
  //     const fullNameReverse = normalizeSpaces(
  //       `${interview.candidateId?.LastName || ""} ${interview.candidateId?.FirstName || ""
  //       }`
  //     );

  //     const matchesSearchQuery =
  //       fieldsToSearch.some((field) =>
  //         normalizeSpaces(field).includes(normalizedQuery)
  //       ) ||
  //       fullNameNormal.includes(normalizedQuery) ||
  //       fullNameReverse.includes(normalizedQuery);

  //     // v1.0.1 --------------------------------------------------------------->
  //     const matchesStatus =
  //       selectedFilters.status.length === 0 ||
  //       selectedFilters.status.includes(interview.status);

  //     const matchesTech =
  //       selectedFilters.tech.length === 0 ||
  //       interview.candidateId?.skills?.some((skill) =>
  //         selectedFilters.tech.includes(skill.SkillName || skill.skill)
  //       );

  //     const matchesExperience =
  //       (!selectedFilters.experience.min ||
  //         interview.candidateId?.CurrentExperience >=
  //         Number(selectedFilters.experience.min)) &&
  //       (!selectedFilters.experience.max ||
  //         interview.candidateId?.CurrentExperience <=
  //         Number(selectedFilters.experience.max));

  //     // New filter matches
  //     const matchesInterviewType =
  //       selectedFilters.interviewType.length === 0 ||
  //       selectedFilters.interviewType.includes(interview.interviewType);

  //     const matchesInterviewMode =
  //       selectedFilters.interviewMode.length === 0 ||
  //       selectedFilters.interviewMode.includes(interview.interviewMode);

  //     const matchesPosition =
  //       selectedFilters.position.length === 0 ||
  //       selectedFilters.position.includes(interview.positionId?.title);

  //     const matchesCompany =
  //       selectedFilters.company.length === 0 ||
  //       selectedFilters.company.includes(interview.positionId?.companyname);

  //     const matchesRoundStatus =
  //       selectedFilters.roundStatus.length === 0 ||
  //       interview.rounds?.some((round) =>
  //         selectedFilters.roundStatus.includes(round.status)
  //       );

  //     const matchesInterviewer =
  //       selectedFilters.interviewer.length === 0 ||
  //       interview.rounds?.some((round) =>
  //         round.interviewers?.some((interviewer) =>
  //           selectedFilters.interviewer.includes(interviewer.name)
  //         )
  //       );

  //     // Date filters
  //     const matchesCreatedDate = () => {
  //       if (!selectedFilters.createdDate) return true;
  //       const createdAt = new Date(interview.createdAt);
  //       const now = new Date();
  //       const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  //       switch (selectedFilters.createdDate) {
  //         case "last7":
  //           return daysDiff <= 7;
  //         case "last30":
  //           return daysDiff <= 30;
  //         case "last90":
  //           return daysDiff <= 90;
  //         default:
  //           return true;
  //       }
  //     };

  //     const matchesInterviewDate = () => {
  //       if (
  //         !selectedFilters.interviewDate.from &&
  //         !selectedFilters.interviewDate.to
  //       ) {
  //         return true;
  //       }

  //       const hasValidDate = interview.rounds?.some((round) => {
  //         if (!round.dateTime) return false;
  //         const roundDate = new Date(round.dateTime.split(" - ")[0]);

  //         if (
  //           selectedFilters.interviewDate.from &&
  //           selectedFilters.interviewDate.to
  //         ) {
  //           return (
  //             roundDate >= new Date(selectedFilters.interviewDate.from) &&
  //             roundDate <= new Date(selectedFilters.interviewDate.to)
  //           );
  //         } else if (selectedFilters.interviewDate.from) {
  //           return roundDate >= new Date(selectedFilters.interviewDate.from);
  //         } else if (selectedFilters.interviewDate.to) {
  //           return roundDate <= new Date(selectedFilters.interviewDate.to);
  //         }
  //         return true;
  //       });

  //       return hasValidDate;
  //     };

  //     return (
  //       matchesSearchQuery &&
  //       matchesStatus &&
  //       matchesTech &&
  //       matchesExperience &&
  //       matchesInterviewType &&
  //       matchesInterviewMode &&
  //       matchesPosition &&
  //       matchesCompany &&
  //       matchesRoundStatus &&
  //       matchesInterviewer &&
  //       matchesCreatedDate() &&
  //       matchesInterviewDate()
  //     );
  //   });
  // };

  // const totalPages = Math.ceil(interviewData?.length / rowsPerPage);
  // Use server-side pagination values
  // const totalPages = serverTotalPages || 1;
  const totalPages = Math.ceil(total / rowsPerPage);
  // const nextPage = () => {
  //   if (currentPage < totalPages - 1) {
  //     setCurrentPage((prev) => prev + 1);
  //   }
  // };

  // const prevPage = () => {
  //   if (currentPage > 0) {
  //     setCurrentPage((prev) => prev - 1);
  //   }
  // };

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

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, interviewData.length);
  // const currentFilteredRows = interviewData.slice(startIndex, endIndex);
  const currentFilteredRows = interviewData;

  // ------------------------ Dynamic Empty State Messages using Utility ----------------------
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  // Use the total count from the API response
  const initialDataCount = total || 0;
  const currentFilteredCount = currentFilteredRows?.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "interviews" // Entity Name
  );
  // ------------------------ Dynamic Empty State Messages using Utility ----------------------

  // Table Columns Configuration
  const tableColumns = [
    {
      key: "order",
      header: "Interview ID",
      render: (value, row) => (
        <div className="flex items-center">
          <div>
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              onClick={() =>
                effectivePermissions.Interviews?.View &&
                handleViewInterview(row)
              }
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
        const candidate = row.candidateId;
        return (
          <Tooltip
            label={`${candidate?.FirstName || ""} ${candidate?.LastName || ""}`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8">
                {candidate?.ImageData ? (
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
              {/* <div className="ml-3 truncate max-w-[120px]">
                <div
                  className="text-sm font-medium text-custom-blue cursor-pointer truncate"
                  onClick={() => handleView(candidate)}
                >
                  {(candidate?.FirstName
                    ? capitalizeFirstLetter(candidate.FirstName)
                    : "") +
                    " " +
                    (candidate?.LastName
                      ? capitalizeFirstLetter(candidate.LastName)
                      : "")}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {candidate?.Email || "No Email"}
                </div>
              </div> */}
              <div className="ml-3 max-w-[120px]">
                <div
                  className="text-sm font-medium text-custom-blue cursor-pointer truncate block"
                  onClick={() => handleView(candidate)}
                  title={`${capitalizeFirstLetter(
                    candidate?.FirstName || ""
                  )} ${capitalizeFirstLetter(candidate?.LastName || "")}`}
                >
                  {`${capitalizeFirstLetter(
                    candidate?.FirstName || ""
                  )} ${capitalizeFirstLetter(candidate?.LastName || "")}`}
                </div>

                <div
                  className="text-sm text-gray-500 truncate block cursor-default"
                  title={candidate?.Email}
                >
                  {candidate?.Email || "No Email"}
                </div>
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    // v1.0.3 <-----------------------------------------------------------
    {
      key: "position",
      header: "Position",
      render: (value, row) => {
        const position = row.positionId;
        return (
          <Tooltip
            label={`${position?.title || "Unknown"} • ${
              position?.companyname || "No Company"
            } • ${position?.Location || "No location"}`}
          >
            <div className="truncate max-w-[120px]">
              <div
                className="text-sm font-medium text-custom-blue cursor-pointer truncate"
                onClick={() => handleViewPosition(position)}
                title={position?.title}
              >
                {position?.title
                  ? capitalizeFirstLetter(position.title)
                  : "Unknown"}
              </div>
              <div
                className="text-sm text-gray-500 truncate cursor-default"
                title={position?.companyname}
              >
                {capitalizeFirstLetter(position?.companyname) || "No Company"} •{" "}
                {capitalizeFirstLetter(position?.Location) || "No location"}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    // v1.0.3 ----------------------------------------------------------->
    // {
    //   key: "interviewers",
    //   header: "Interviewers",
    //   render: (value, row) => {
    //     const rounds = row.rounds || [];
    //     const nextRound =
    //       rounds
    //         .filter((round) =>
    //           ["Scheduled", "RequestSent"].includes(round.status)
    //         )
    //         .sort((a, b) => a.sequence - b.sequence)[0] || null;
    //     const nextRoundInterviewers =
    //       nextRound?.interviewers?.map((interviewer) => ({
    //         ...interviewer,
    //         isExternal: nextRound?.interviewerType === "external",
    //       })) || [];
    //       console.log("nextRoundInterviewers", nextRoundInterviewers);

    //     return (
    //       <Tooltip
    //         label={nextRoundInterviewers
    //           .map((i) => i.name  || (i?.firstName + " " + i?.lastName) || "Unknown")
    //           .join(", ")}
    //       >
    //         <div className="flex flex-wrap gap-1 truncate max-w-[120px]">
    //           {nextRoundInterviewers.slice(0, 2).map((interviewer) => (
    //             <InterviewerAvatar
    //               key={interviewer?._id}
    //               interviewer={interviewer}
    //               size="sm"
    //             />
    //           ))}
    //           {nextRoundInterviewers.length > 2 && (
    //             <span className="text-xs text-gray-500">
    //               +{nextRoundInterviewers.length - 2}
    //             </span>
    //           )}
    //           {!nextRoundInterviewers.length && (
    //             <span className="text-sm text-gray-500">None</span>
    //           )}
    //         </div>
    //       </Tooltip>
    //     );
    //   },
    // },
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
    //<-------v1.0.1---------
    // v1.0.3 <------------------------------------------------------------------
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
                <div
                  className="text-sm font-medium text-gray-700 cursor-default"
                  title={`${capitalizeFirstLetter(
                    currentRound.roundTitle
                  )} • ${capitalizeFirstLetter(currentRound.interviewType)}`}
                >
                  {capitalizeFirstLetter(currentRound.roundTitle)} •{" "}
                  {capitalizeFirstLetter(currentRound.interviewType)}
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
    // v1.0.3 ------------------------------------------------------------------>
    //-------v1.0.1--------->
    {
      key: "nextRound",
      header: "Next Round",
      render: (value, row) => {
        const rounds = row.rounds || [];
        const nextRound =
          rounds
            // .filter((round) =>
            //   [ "Scheduled", "RequestSent"].includes(round.status)
            // )
            .sort((a, b) => a.sequence - b.sequence)[1] || null;
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
                  <div
                    className="text-sm font-medium text-gray-700 truncate cursor-default"
                    title={`${nextRound.roundTitle} (${nextRound.interviewType})`}
                  >
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
      key: "createdOn",
      header: "Created At",
      render: (value, row) => (
        <div className="flex items-center truncate max-w-[120px]">
          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
          <span
            className="text-sm text-gray-500 cursor-default"
            title={formatDateTime(row?.createdAt)}
          >
            {row.createdAt ? formatDateTime(row.createdAt) : "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(row.status)} />
      ),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    ...(effectivePermissions.Interviews?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: handleViewInterview,
          },
        ]
      : []),
    ...(effectivePermissions.Interviews?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: handleEditInterview,
          },
        ]
      : []),
    ...(effectivePermissions.Interviews?.Delete
      ? [
          {
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: handleDeleteInterview,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Interviews"
              onAddClick={() => navigate("/interviews/new")}
              addButtonText="New Interview"
              canCreate={effectivePermissions.Interviews?.Create}
            />
            <Toolbar
              view={viewMode}
              setView={setViewMode}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterPopupOpen={isFilterPopupOpen}
              isFilterActive={isFilterActive}
              dataLength={Math.max(1, total)}
              searchPlaceholder="Search Interviews..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      {/* v1.0.3 <--------------------------------------------------------------------------------------- */}
      <main className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {/* v1.0.3 ---------------------------------------------------------------------------------------> */}
        <div className="sm:px-0">
          <motion.div className="bg-white">
            <div className="relative w-full">
              {viewMode === "kanban" ? (
                <div className="w-full">
                  <KanbanBoard
                    interviews={currentFilteredRows}
                    onView={handleView}
                    onViewInterview={handleViewInterview}
                    onEditInterview={handleEditInterview}
                    onViewPosition={handleViewPosition}
                    effectivePermissions={effectivePermissions}
                    loading={isLoading}
                  />
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  {/* v1.0.3 <--------------------------------------------------------------------------------------------------------------------- */}
                  <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                    {/* v1.0.3 ---------------------------------------------------------------------------------------------------------------------> */}
                    <TableView
                      data={currentFilteredRows}
                      columns={tableColumns}
                      actions={tableActions}
                      loading={isLoading}
                      emptyState={emptyStateMessage}
                      className="table-fixed w-full"
                    />
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden xl:hidden 2xl:hidden space-y-4 p-4">
                    {isLoading
                      ? Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <motion.div
                              key={`placeholder-${index}`}
                              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 skeleton-animation"
                              initial={false}
                              animate={{ height: "auto" }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200"></div>
                                  <div className="ml-3 space-y-2">
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-48 bg-gray-200 rounded"></div>
                                  </div>
                                </div>
                                <div className="h-6 w-24 bg-gray-200 rounded"></div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                  </div>
                                  <div className="h-3 w-64 bg-gray-200 rounded mt-1"></div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                      : currentFilteredRows?.map((interview) => {
                          const candidate = interview.candidateId;
                          const position = interview.positionId;
                          const rounds = interview.rounds || [];
                          const completedRounds = rounds.filter(
                            (round) => round.status === "Completed"
                          ).length;
                          const totalRounds = rounds.length;
                          const nextRound =
                            rounds
                              .filter((round) =>
                                ["Scheduled", "RequestSent"].includes(
                                  round.status
                                )
                              )
                              .sort((a, b) => a.sequence - b.sequence)[0] ||
                            null;
                          const nextRoundInterviewers =
                            nextRound?.interviewers?.map((interviewer) => ({
                              ...interviewer,
                              isExternal:
                                nextRound?.interviewerType === "external",
                            })) || [];
                          const isExpanded = expandedRows[interview._id];

                          return (
                            <motion.div
                              key={interview._id}
                              className="bg-red-500 rounded-lg shadow-sm border border-gray-200 p-4"
                              initial={false}
                              animate={{ height: isExpanded ? "auto" : "auto" }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    {candidate?.imageUrl ? (
                                      <img
                                        src={candidate.imageUrl}
                                        alt={candidate.LastName}
                                        className="h-12 w-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold">
                                        {candidate?.LastName?.charAt(0) || "?"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    <div className="flex items-center">
                                      {/* v1.0.3 <----------------------------------------------- */}
                                      <div className="text-base font-medium text-gray-700">
                                        {(capitalizeFirstLetter(
                                          candidate?.FirstName
                                        ) || "") +
                                          " " +
                                          (capitalizeFirstLetter(
                                            candidate?.LastName
                                          ) || "")}
                                      </div>
                                      {/* v1.0.3 -----------------------------------------------> */}
                                      {effectivePermissions.Candidates
                                        ?.View && (
                                        <button
                                          onClick={() => handleView(candidate)}
                                          className="ml-2 text-custom-blue hover:text-custom-blue/80"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {candidate?.Email || "No email"}
                                    </div>
                                  </div>
                                </div>
                                <StatusBadge
                                  status={interview.status}
                                  size="lg"
                                />
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="text-sm font-medium text-gray-700">
                                        {position?.title || "Unknown"}
                                      </div>
                                      {effectivePermissions.Positions?.View && (
                                        <button
                                          onClick={() =>
                                            handleViewPosition(position)
                                          }
                                          className="ml-2 text-custom-blue hover:text-custom-blue/80"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {interview.createdAt
                                        ? new Date(
                                            interview.createdAt
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </div>
                                  </div>
                                  {/* v1.0.3 <----------------------------------------------- */}
                                  <div className="text-sm text-gray-500">
                                    {capitalizeFirstLetter(
                                      position?.companyname
                                    ) || "No Company"}{" "}
                                    •{" "}
                                    {capitalizeFirstLetter(
                                      position?.Location
                                    ) || "No location"}
                                  </div>
                                  {/* v1.0.3 -----------------------------------------------> */}
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-700">
                                      Progress
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {completedRounds} of {totalRounds} rounds
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-custom-blue h-2 rounded-full"
                                      style={{
                                        width: `${
                                          totalRounds > 0
                                            ? (completedRounds / totalRounds) *
                                              100
                                            : 0
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() =>
                                  toggleRowExpansion(interview._id)
                                }
                                className="mt-4 w-full flex items-center justify-center py-2 text-sm text-gray-500 hover:text-gray-700"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Show less</span>
                                    <ChevronUp className="ml-1 h-4 w-4" />
                                  </>
                                ) : (
                                  <>
                                    <span>Show more</span>
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  </>
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  {nextRound ? (
                                    <div className="space-y-3">
                                      {/* v1.0.3 <-------------------------------------------- */}
                                      <div>
                                        <div className="text-sm font-medium text-gray-700 mb-2">
                                          Next Round:{" "}
                                          {capitalizeFirstLetter(
                                            nextRound.roundTitle
                                          )}
                                        </div>
                                        <div className="flex items-center">
                                          <StatusBadge
                                            status={nextRound.status}
                                            size="sm"
                                          />
                                          <span className="ml-2 text-xs text-gray-500">
                                            {capitalizeFirstLetter(
                                              nextRound.interviewType
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                      {/* v1.0.3 <--------------------------------------------> */}
                                      {nextRoundInterviewers.length > 0 && (
                                        <div>
                                          <div className="text-sm font-medium text-gray-700 mb-2">
                                            Interviewers
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {nextRoundInterviewers.map(
                                              (interviewer) => (
                                                <InterviewerAvatar
                                                  key={interviewer?._id}
                                                  interviewer={interviewer}
                                                  size="md"
                                                />
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      No Upcoming Rounds
                                    </div>
                                  )}
                                  {effectivePermissions.Interviews?.View && (
                                    <button
                                      onClick={() =>
                                        handleViewInterview(interview)
                                      }
                                      className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      View Full Details
                                      <ArrowRight className="ml-1 h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                  </div>
                </>
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
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isStatusOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {[
                          "Draft",
                          "InProgress",
                          "Active",
                          "Completed",
                          "Cancelled",
                          "On Hold",
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

                  {/* Interview Type Filter */}
                  {/* <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsInterviewTypeOpen(!isInterviewTypeOpen)}
                    >
                      <span className="font-medium text-gray-700">Interview Type</span>
                      {isInterviewTypeOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isInterviewTypeOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {["Technical", "HR", "Managerial", "Behavioral", "Panel", "Assignment"].map((type) => (
                          <label
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedInterviewTypes.includes(type)}
                              onChange={() => handleInterviewTypeToggle(type)}
                              className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div> */}

                  {/* Interview Mode Filter */}
                  {/* <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsInterviewModeOpen(!isInterviewModeOpen)}
                    >
                      <span className="font-medium text-gray-700">Interview Mode</span>
                      {isInterviewModeOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isInterviewModeOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {["In-person", "Virtual", "Phone", "Video Call", "Hybrid"].map((mode) => (
                          <label
                            key={mode}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedInterviewModes.includes(mode)}
                              onChange={() => handleInterviewModeToggle(mode)}
                              className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">{mode}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div> */}

                  {/* Skills Filter */}
                  {/* <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                    >
                      <span className="font-medium text-gray-700">Skills</span>
                      {isSkillsOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isSkillsOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {[
                          "React", "Node.js", "JavaScript", "TypeScript",
                          "Python", "Java", "C++", "Angular", "Vue.js",
                          "MongoDB", "SQL", "AWS", "Docker", "Kubernetes"
                        ].map((tech) => (
                          <label
                            key={tech}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTech.includes(tech)}
                              onChange={() => handleTechToggle(tech)}
                              className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">{tech}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div> */}

                  {/* Experience Filter */}
                  {/* <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                    >
                      <span className="font-medium text-gray-700">Experience (Years)</span>
                      {isExperienceOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isExperienceOpen && (
                      <div className="mt-2 pl-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={experience.min}
                            onChange={(e) => handleExperienceChange(e, "min")}
                            placeholder="Min"
                            className="w-20 p-1 border rounded"
                            min="0"
                            max="15"
                          />
                          <span className="text-sm">to</span>
                          <input
                            type="number"
                            value={experience.max}
                            onChange={(e) => handleExperienceChange(e, "max")}
                            placeholder="Max"
                            className="w-20 p-1 border rounded"
                            min="0"
                            max="15"
                          />
                        </div>
                      </div>
                    )}
                  </div> */}

                  {/* Round Status Filter */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsRoundStatusOpen(!isRoundStatusOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Round Status
                      </span>
                      {isRoundStatusOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isRoundStatusOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {[
                          "Scheduled",
                          "Completed",
                          "Cancelled",
                          "RequestSent",
                          "Pending",
                          "InProgress",
                        ].map((status) => (
                          <label
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoundStatuses.includes(status)}
                              onChange={() => handleRoundStatusToggle(status)}
                              className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">{status}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interview Date Range Filter */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        setIsInterviewDateOpen(!isInterviewDateOpen)
                      }
                    >
                      <span className="font-medium text-gray-700">
                        Interview Date
                      </span>
                      {isInterviewDateOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isInterviewDateOpen && (
                      <div className="mt-2 pl-3 space-y-2">
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={interviewDateRange.from}
                            onChange={(e) =>
                              handleInterviewDateChange(e, "from")
                            }
                            className="w-full p-1 border rounded text-sm"
                            placeholder="From"
                          />
                          <input
                            type="date"
                            value={interviewDateRange.to}
                            onChange={(e) => handleInterviewDateChange(e, "to")}
                            className="w-full p-1 border rounded text-sm"
                            placeholder="To"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Get unique positions and companies from data */}
                  {(() => {
                    const uniquePositions = [
                      ...new Set(
                        interviewData
                          ?.map((i) => i.positionId?.title)
                          .filter(Boolean) || []
                      ),
                    ];
                    const uniqueCompanies = [
                      ...new Set(
                        interviewData
                          ?.map((i) => i.positionId?.companyname)
                          .filter(Boolean) || []
                      ),
                    ];
                    const uniqueInterviewers = [
                      ...new Set(
                        interviewData
                          ?.flatMap(
                            (i) =>
                              i.rounds?.flatMap((r) =>
                                r.interviewers?.map((int) => int.name)
                              ) || []
                          )
                          .filter(Boolean) || []
                      ),
                    ];

                    return (
                      <>
                        {/* Position Filter */}
                        {uniquePositions.length > 0 && (
                          <div>
                            <div
                              className="flex justify-between items-center cursor-pointer"
                              onClick={() => setIsPositionOpen(!isPositionOpen)}
                            >
                              <span className="font-medium text-gray-700">
                                Position
                              </span>
                              {isPositionOpen ? (
                                <ChevronUp className="text-xl text-gray-700" />
                              ) : (
                                <ChevronDown className="text-xl text-gray-700" />
                              )}
                            </div>
                            {isPositionOpen && (
                              <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                                {uniquePositions.map((position) => (
                                  <label
                                    key={position}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPositions.includes(
                                        position
                                      )}
                                      onChange={() =>
                                        handlePositionToggle(position)
                                      }
                                      className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                    />
                                    <span className="text-sm">{position}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Company Filter */}
                        {uniqueCompanies.length > 0 && (
                          <div>
                            <div
                              className="flex justify-between items-center cursor-pointer"
                              onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                            >
                              <span className="font-medium text-gray-700">
                                Company
                              </span>
                              {isCompanyOpen ? (
                                <ChevronUp className="text-xl text-gray-700" />
                              ) : (
                                <ChevronDown className="text-xl text-gray-700" />
                              )}
                            </div>
                            {isCompanyOpen && (
                              <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                                {uniqueCompanies.map((company) => (
                                  <label
                                    key={company}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedCompanies.includes(
                                        company
                                      )}
                                      onChange={() =>
                                        handleCompanyToggle(company)
                                      }
                                      className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                    />
                                    <span className="text-sm">{company}</span>
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
                                <ChevronUp className="text-xl text-gray-700" />
                              ) : (
                                <ChevronDown className="text-xl text-gray-700" />
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
                                    <span className="text-sm">
                                      {interviewer}
                                    </span>
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
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
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
            </div>
          </motion.div>
        </div>
      </main>
      {selectPositionView && (
        <PositionSlideDetails
          position={selectedPosition}
          onClose={() => setSelectPositionView(false)}
        />
      )}

      {/* Ranjith added deleetd functionality  */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Interview"
        entityName={deleteInterview?.title}
      />
    </div>
  );
}

export default InterviewList;
