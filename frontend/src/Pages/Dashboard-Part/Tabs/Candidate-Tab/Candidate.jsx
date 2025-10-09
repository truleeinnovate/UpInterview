// v1.0.0  -  Ashraf  -  removed dynamic permissons state and added effective directly
// v1.0.1  -  Ashraf  -  added extend/cancel functionality for individual candidate assessments. show all data when isAssessmentView is true and add status column for assessment view
// v1.0.2  -  Ashok   -  fixed search by name as can search by full name
// v1.0.3  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.4  -  Venkatesh   -  added new filter options like created date, relevant experience, role, university
// v1.0.5  -  Ashok   -  Improved responsiveness
// v1.0.6  -  Ashok   -  Disabled outer scrollbar
// v1.0.7  -  Ashok   -  Added table view for mobiles (small devices)
// v1.0.8  -  Ashok   -  changed kanban UI
// v1.0.9  -  Ashok   -  table columns modified
// v2.0.0  -  Ashok   -  changed kanban column names
// v2.0.1  -  Ashok   -  changed actions in kanban

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  CircleUser,
  Pencil,
  Mail,
  Rotate3d,
  Trash,
  MoreVertical,
} from "lucide-react";
import { useCustomContext } from "../../../../Context/Contextfetch";
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
// v1.0.8 <----------------------------------------------------------------------
// import KanbanView from "../../../../Components/Shared/Kanban/KanbanView";
import KanbanView from "./CandidateKanban.jsx";
// v1.0.8 ---------------------------------------------------------------------->
import AddCandidateForm from "./AddCandidateForm.jsx";
import CandidateDetails from "./CandidateViewDetails/CandidateDetails";
import { useMediaQuery } from "react-responsive";
import { Outlet } from "react-router-dom";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useCandidates } from "../../../../apiHooks/useCandidates";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import { usePermissions } from "../../../../Context/PermissionsContext";
// <-------------------------------v1.0.1
import { useAssessments } from "../../../../apiHooks/useAssessments";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { Button } from "../CommonCode-AllTabs/ui/button";
import { notify } from "../../../../services/toastService.js";
import DeleteConfirmModal from "../CommonCode-AllTabs/DeleteConfirmModal.jsx";
// v1.0.6 <-------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
import { logger } from "../../../../utils/logger.js";
// v1.0.6 ------------------------------------------------------------------->
import { formatDateTime } from "../../../../utils/dateFormatter.js";

// v2.0.1 <-----------------------------------------------------------------------
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
      {mainActions.map((action) => (
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
      ))}

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
// v2.0.1 ----------------------------------------------------------------------->

function Candidate({
  candidates,
  onResendLink,
  isAssessmentView,
  resendLoading = {},
}) {
  // ------------------------------v1.0.1 >
  // <---------------------- v1.0.0
  // All hooks at the top
  const { effectivePermissions, isInitialized } = usePermissions();
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
    //<-----v1.0.4--------
    relevantExperience: { min: "", max: "" },
    roles: [],
    universities: [],
    createdDate: "", // '', 'last7', 'last30'
    //-----v1.0.4-------->
  });
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  //<-----v1.0.4--------
  const [isRelevantExperienceOpen, setIsRelevantExperienceOpen] =
    useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isUniversityOpen, setIsUniversityOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedTech, setSelectedTech] = useState([]);
  const [experience, setExperience] = useState({ min: "", max: "" }); // Total (CurrentExperience)
  const [relevantExperience, setRelevantExperience] = useState({
    min: "",
    max: "",
  });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  const { skills, qualifications, currentRoles, colleges } = useMasterData();
  //-----v1.0.4-------->
  const { candidateData, deleteCandidateData, isLoading } = useCandidates();
  const navigate = useNavigate();
  // v1.0.7 <----------------------------------------------------------------------
  // const isTablet = useMediaQuery({ maxWidth: 1024 });
  const isTablet = useMediaQuery({ maxWidth: 320 });
  // v1.0.7 ---------------------------------------------------------------------->
  const filterIconRef = useRef(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // <---------------------- v1.0.2
  // Helper function to check if a candidate is cancelled (handles all case variations)

  // v1.0.6 <--------------------------------------------------------
  // v1.0.7 <--------------------------------------------------------
  useScrollLock(
    showDeleteConfirmModal || view === "table" || view === "kanban"
  );
  // v1.0.7 -------------------------------------------------------->
  // v1.0.6 -------------------------------------------------------->

  const isCandidateCancelled = (candidate) => {
    const status = candidate?.status;
    if (!status) {
      return false;
    }

    // Simple case-insensitive check
    const normalizedStatus = status.toString().toLowerCase().trim();

    const isCancelled = normalizedStatus === "cancelled";

    return isCancelled;
  };

  //  Ranjith added delete Candidate functionality
  const handleDeleteCandidate = async () => {
    try {
      // console.log("deleteCandidate", deleteCandidate);
      let res = await deleteCandidateData(
        deleteCandidate?._id || deleteCandidate?.id || "N/A"
      );
      // await deleteRoundMutation(round._id);
      if (res.status === "success") {
        setShowDeleteConfirmModal(false);
        notify.success("Candidate Deleted successfully");
      }
    } catch (error) {
      console.error("Error Deleting Round:", error);
      notify.error("Failed to Delete Round");
    }
  };

  // Helper function to check if any action buttons should be shown for a candidate
  // const shouldShowActionButtons = (candidate) => {
  //   // Normalize status to lowercase for case-insensitive comparison
  //   const status = candidate.status?.toString().toLowerCase().trim();

  //   // Check for cancelled status - use the same logic as isCandidateCancelled
  //   const isCancelled = status === "cancelled";

  //   // Never show action buttons for cancelled candidates (case-insensitive)
  //   if (isCancelled) {
  //     return false;
  //   }

  //   // Don't show action buttons for completed, expired, failed, or pass statuses
  //   if (["completed", "expired", "failed", "pass"].includes(status)) {
  //     return false;
  //   }

  //   return true;
  // };

  // Simplified function to check if a specific button should be shown
  const shouldShowButton = (candidate, buttonType) => {
    // Check if candidate is cancelled - if so, hide ALL buttons
    const isCancelled = isCandidateCancelled(candidate);

    if (isCancelled) {
      return false;
    }

    // Check specific button logic
    if (buttonType === "resend") {
      // Don't show resend button for completed, cancelled, failed, or pass statuses
      const status = candidate.status?.toString().toLowerCase().trim();
      const canResend = !["completed", "cancelled", "failed", "pass"].includes(
        status
      );
      return canResend;
    }

    return false;
  };

  // Helper function to get status color for assessment view
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "extended":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "in_progress":
        return "text-purple-600 bg-purple-50";
      case "expired":
        return "text-orange-600 bg-orange-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "pass":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
  // ------------------------------ v1.0.2 >

  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setSelectedTech(selectedFilters.tech);
      setExperience(selectedFilters.experience);
      //<-----v1.0.4--------
      setRelevantExperience(
        selectedFilters.relevantExperience || { min: "", max: "" }
      );
      setSelectedRoles(selectedFilters.roles || []);
      setSelectedUniversities(selectedFilters.universities || []);
      setCreatedDatePreset(selectedFilters.createdDate || "");
      setIsQualificationOpen(false);
      setIsSkillsOpen(false);
      setIsExperienceOpen(false);
      setIsRelevantExperienceOpen(false);
      setIsRoleOpen(false);
      setIsUniversityOpen(false);
      setIsCreatedDateOpen(false);
      //-----v1.0.4-------->
    }
  }, [isFilterPopupOpen, selectedFilters]);

  useEffect(() => {
    // Only run on isTablet change
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  // No need for separate effect, we'll use gapOnTop directly in the style prop

  // Only after all hooks
  if (!isInitialized) {
    return null;
  }

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTechToggle = (tech) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  //<-----v1.0.4--------
  const handleRoleToggle = (roleName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleUniversityToggle = (universityName) => {
    setSelectedUniversities((prev) =>
      prev.includes(universityName)
        ? prev.filter((u) => u !== universityName)
        : [...prev, universityName]
    );
  };
  //-----v1.0.4-------->

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, Number(e.target.value) || ""));
    setExperience((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  //<-----v1.0.4--------
  const handleRelevantExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, Number(e.target.value) || ""));
    setRelevantExperience((prev) => ({
      ...prev,
      [type]: value,
    }));
  };
  //<-----v1.0.4--------

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      tech: [],
      experience: { min: "", max: "" },
      //<-----v1.0.4--------
      relevantExperience: { min: "", max: "" },
      roles: [],
      universities: [],
      createdDate: "",
      //-----v1.0.4-------->
    };
    setSelectedStatus([]);
    setSelectedTech([]);
    setExperience({ min: "", max: "" });
    //<-----v1.0.4--------
    setRelevantExperience({ min: "", max: "" });
    setSelectedRoles([]);
    setSelectedUniversities([]);
    setCreatedDatePreset("");
    //-----v1.0.4-------->
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const dataToUse = isAssessmentView ? candidates : candidateData;

  console.log("dataToUse", dataToUse);

  logger.log("dataToUse", dataToUse);

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      tech: selectedTech,
      experience: {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 15,
      },
      //<-----v1.0.4--------
      relevantExperience: {
        min: Number(relevantExperience.min) || 0,
        max: Number(relevantExperience.max) || 15,
      },
      roles: selectedRoles,
      universities: selectedUniversities,
      createdDate: createdDatePreset,
      //-----v1.0.4-------->
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        //<-----v1.0.4--------
        filters.experience.max ||
        filters.roles.length > 0 ||
        filters.universities.length > 0 ||
        filters.relevantExperience.min ||
        filters.relevantExperience.max ||
        !!filters.createdDate
      //-----v1.0.4-------->
    );
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  // v1.0.2 <------------------------------------------------------------------------
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";
  // v1.0.2 ------------------------------------------------------------------------>

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((user) => {
      const fieldsToSearch = [
        user.LastName,
        user.FirstName,
        user.Email,
        user.Phone,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(user.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        user.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          user.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          user.CurrentExperience <= selectedFilters.experience.max);

      //<-----v1.0.4--------
      const matchesRelevantExperience =
        (!selectedFilters.relevantExperience?.min ||
          user.RelevantExperience >= selectedFilters.relevantExperience.min) &&
        (!selectedFilters.relevantExperience?.max ||
          user.RelevantExperience <= selectedFilters.relevantExperience.max);

      const matchesRole =
        selectedFilters.roles.length === 0 ||
        (user.CurrentRole && selectedFilters.roles.includes(user.CurrentRole));

      const matchesUniversity =
        selectedFilters.universities.length === 0 ||
        (user.UniversityCollege &&
          selectedFilters.universities.includes(user.UniversityCollege));

      //-----v1.0.4-------->
      // v1.0.2 <-----------------------------------------------------------------
      // NEW: normalize and check full name (both orders)
      const normalizedQuery = normalizeSpaces(searchQuery);

      const fullNameNormal = normalizeSpaces(
        `${user.FirstName || ""} ${user.LastName || ""}`
      );

      const fullNameReverse = normalizeSpaces(
        `${user.LastName || ""} ${user.FirstName || ""}`
      );

      const matchesSearchQuery =
        fieldsToSearch.some((field) =>
          normalizeSpaces(field).includes(normalizedQuery)
        ) ||
        fullNameNormal.includes(normalizedQuery) ||
        fullNameReverse.includes(normalizedQuery);

      //<-----v1.0.4--------
      // Created date filter
      let matchesCreatedDate = true;
      if (selectedFilters.createdDate === "last7") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesCreatedDate = user.createdAt
          ? new Date(user.createdAt) >= sevenDaysAgo
          : true;
      } else if (selectedFilters.createdDate === "last30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesCreatedDate = user.createdAt
          ? new Date(user.createdAt) >= thirtyDaysAgo
          : true;
      }

      // v1.0.2 ------------------------------------------------------------------>
      return (
        matchesSearchQuery &&
        matchesStatus &&
        matchesTech &&
        matchesExperience &&
        matchesRelevantExperience &&
        matchesRole &&
        matchesUniversity &&
        matchesCreatedDate
        //-----v1.0.4-------->
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
    setCurrentPage(0);
  };

  // Table Columns Configuration
  const tableColumns = [
    {
      key: "name",
      header: "Candidate Name",
      render: (value, row) => (
        // console.log("row ",row,value),
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            {row?.ImageData ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={row?.ImageData?.path || null}
                alt={row?.FirstName || "Candidate"}
                onError={(e) => {
                  e.target.src = "/default-profile.png";
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                {row.FirstName ? row.FirstName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>
          <div className="ml-3">
            <div
              // v1.0.9 <------------------------------------------------------------------------------
              className="text-sm font-medium text-custom-blue cursor-pointer truncate max-w-[140px]"
              // v1.0.9 ------------------------------------------------------------------------------>
              onClick={
                () =>
                  navigate(
                    isAssessmentView
                      ? `/assessment/${row?.assessmentId}/view-details/${row?._id}`
                      : // `/assessments/candidate-details/${row._id}`
                        effectivePermissions.Candidates?.View &&
                          `view-details/${row._id}`,
                    {
                      state: isAssessmentView
                        ? {
                            from: `/assessment-details/${row?.assessmentId}`,
                            assessmentId: row?.assessmentId,
                          }
                        : { from: "/candidate" },
                    }
                  )

                //  effectivePermissions.Candidates?.View && navigate(`view-details/${row._id}`)
              }
            >
              {(row?.FirstName.charAt(0).toUpperCase() +
                row.FirstName.slice(1) || "") +
                " " +
                (row.LastName.charAt(0).toUpperCase() + row.LastName.slice(1) ||
                  "")}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "Email",
      header: "Email",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          {/* v1.0.9 <--------------------------------- */}
          <span className="truncate max-w-[140px]">
            {value || "Not Provided"}
          </span>
          {/* v1.0.9 ---------------------------------> */}
        </div>
      ),
    },
    {
      key: "Phone",
      header: "Contact",
      render: (value, row) => row?.CountryCode + " " + value || "Not Provided",
    },
    {
      key: "HigherQualification",
      header: "Higher Qualification",
      render: (value) => (
        // v1.0.9 <----------------------------------------------
        <span className="block truncate max-w-[140px]">
          {value || "Not Provided"}
        </span>
        // v1.0.9 ---------------------------------------------->
      ),
    },
    {
      key: "CurrentExperience",
      header: "Current Experience",
      render: (value) => value || "Not Provided",
    },
    {
      key: "skills",
      header: "Skills",
      render: (value) => (
        // v1.0.9 <-----------------------------------------------------------------------------
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 1).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-custom-bg text-custom-blue rounded-full text-xs"
            >
              {skill.skill || "Not Provided"}
            </span>
          ))}
          {value.length > 1 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{value.length - 1}
            </span>
          )}
        </div>
        // v1.0.9 ----------------------------------------------------------------------------->
      ),
    },
    //<-----v1.0.4--------
    {
      key: "createdAt",
      header: "Created At",
      render: (value, row) => formatDateTime(row.createdAt) || "N/A",
    },
    //-----v1.0.4-------->
    // <---------------------- v1.0.2
    // Add status column only for assessment view
    ...(isAssessmentView
      ? [
          {
            key: "status",
            header: "Status",
            render: (value, row) => {
              const status = row.status || "pending";
              return (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    status
                  )}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              );
            },
          },
          {
            key: "expiryAt",
            header: "Expiry Date",
            render: (value, row) => {
              if (!row.expiryAt) return "N/A";

              const now = new Date();
              const expiry = new Date(row.expiryAt);
              const timeDiff = expiry.getTime() - now.getTime();

              if (timeDiff <= 0) {
                return (
                  <span className="text-red-600 text-sm font-medium">
                    Expired
                  </span>
                );
              }

              const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );

              let timeText = "";
              if (days > 0) {
                timeText = `${days}d ${hours}h`;
              } else if (hours > 0) {
                timeText = `${hours}h`;
              } else {
                const minutes = Math.floor(
                  (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
                );
                timeText = `${minutes}m`;
              }

              return (
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {expiry.toLocaleDateString()}
                  </div>
                  <div
                    className={`text-xs ${
                      timeDiff < 24 * 60 * 60 * 1000
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {timeText} remaining
                  </div>
                </div>
              );
            },
          },
        ]
      : []),
    // ------------------------------ v1.0.2 >
  ];

  // Table Actions Configuration
  const tableActions = [
    ...(effectivePermissions.Candidates?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) =>
              navigate(
                isAssessmentView
                  ? `/assessment/${row?.assessmentId}/view-details/${row._id}`
                  : // `/assessments/candidate-details/${row._id}`
                    `view-details/${row._id}`,
                {
                  state: isAssessmentView
                    ? {
                        from: `/assessment-details/${row?.assessmentId}`,
                        assessmentId: row?.assessmentId,
                      }
                    : { from: "/candidate" },
                }
              ),
            // navigate(
            //   isAssessmentView
            //     ? `candidate-details/${row._id}`
            //     : `view-details/${row._id}`,
            //   {
            //     state: isAssessmentView
            //       ? {
            //           from: `/assessment-details/${row?.assessmentId}`,
            //           assessmentId: row?.assessmentId,
            //         }
            //       : { from: "/candidate" },
            //   }
            // ),
          },
        ]
      : []),
    ...(!isAssessmentView
      ? [
          {
            key: "360-view",
            label: "360° View",
            icon: <Rotate3d size={24} className="text-custom-blue" />,
            onClick: (row) => row?._id && navigate(`/candidate/${row._id}`),
          },
          ...(effectivePermissions.Candidates?.Edit
            ? [
                {
                  key: "edit",
                  label: "Edit",
                  icon: <Pencil className="w-4 h-4 text-green-600" />,
                  onClick: (row) => navigate(`edit/${row._id}`),
                },
              ]
            : []),
          ...(effectivePermissions.Candidates?.Delete
            ? [
                {
                  key: "delete",
                  label: "Delete",
                  icon: <Trash className="w-4 h-4 text-red-600" />,
                  // onClick: (row) => navigate(`delete/${row._id}`),
                  onClick: (row) => {
                    setShowDeleteConfirmModal(true);
                    setDeleteCandidate(row);
                  },
                },
              ]
            : []),
        ]
      : []),
    ...(isAssessmentView
      ? [
          // <-------------------------------v1.0.1
          // Only show resend link for candidates that can be resent
          {
            key: "resend-link",
            label: "Resend Link",
            icon: (row) => {
              const isLoading = resendLoading[row.id];
              return isLoading ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 text-custom-blue"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <Mail className="w-4 h-4 text-custom-blue" />
              );
            },
            onClick: (row) => {
              if (!resendLoading[row.id]) {
                onResendLink(row.id);
              }
            },
            show: (row) => {
              const result = shouldShowButton(row, "resend");
              return result;
            },
            disabled: (row) => resendLoading[row.id],
          },
        ]
      : []),
    // ------------------------------v1.0.1 >
  ];

  // v1.0.8 <------------------------------------------------------------------------------
  // Render Actions for Kanban
  // const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
  //   <div className="flex items-center">
  //     {effectivePermissions.Candidates?.View && (
  //       <button
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           isAssessmentView
  //             ? navigate(`/${item?.assessmentId}/view-details/${item._id}`)
  //             : navigate(`view-details/${item._id}`);
  //         }}
  //         // onClick={(e) => {
  //         //   e.stopPropagation();
  //         //   navigate(`view-details/${item._id}`);
  //         // }}
  //         className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
  //         title="View Details"
  //       >
  //         <Eye className="w-4 h-4" />
  //       </button>
  //     )}
  //     {!isAssessmentView ? (
  //       <>
  //         <button
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             item?._id && navigate(`/candidate/${item._id}`);
  //           }}
  //           className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
  //           title="360° View"
  //         >
  //           <CircleUser className="w-4 h-4" />
  //         </button>
  //         {effectivePermissions.Candidates?.Edit && (
  //           <button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               navigate(`edit/${item._id}`);
  //             }}
  //             className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
  //             title="Edit"
  //           >
  //             <Pencil className="w-4 h-4" />
  //           </button>
  //         )}
  //       </>
  //     ) : (
  //       <>
  //         {/* // <-------------------------------v1.0.1 */}
  //         {/* Only show resend link for candidates that can be resent */}
  //         {(() => {
  //           const result = shouldShowButton(item, "resend");
  //           return result;
  //         })() && (
  //           <button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               if (!resendLoading[item.id]) {
  //                 onResendLink(item.id);
  //               }
  //             }}
  //             disabled={resendLoading[item.id]}
  //             className={`p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors ${
  //               resendLoading[item.id] ? "opacity-50 cursor-not-allowed" : ""
  //             }`}
  //             title="Resend Link"
  //           >
  //             {resendLoading[item.id] ? (
  //               <svg
  //                 className="animate-spin h-4 w-4 text-custom-blue"
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //               >
  //                 <circle
  //                   className="opacity-25"
  //                   cx="12"
  //                   cy="12"
  //                   r="10"
  //                   stroke="currentColor"
  //                   strokeWidth="4"
  //                 ></circle>
  //                 <path
  //                   className="opacity-75"
  //                   fill="currentColor"
  //                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //                 ></path>
  //               </svg>
  //             ) : (
  //               <Mail className="w-4 h-4" />
  //             )}
  //           </button>
  //         )}
  //       </>
  //     )}
  //     {effectivePermissions.Candidates?.Delete && (
  //       <button
  //         // onClick: (row) => navigate(`delete/${row._id}`),
  //         onClick={() => {
  //           setShowDeleteConfirmModal(true);
  //           setDeleteCandidate(item);
  //         }}
  //       >
  //         <Trash className="w-4 h-4 text-red-600" />
  //       </button>
  //     )}
  //   </div>
  // );

  // const kanbanActions = [
  //   ...(effectivePermissions.Candidates?.View
  //     ? [
  //         {
  //           key: "view",
  //           label: "View Details",
  //           icon: <Eye className="w-4 h-4 text-blue-600" />,
  //           // onClick: (row) => handleView(row),
  //         },
  //       ]
  //     : []),

  //   ...(effectivePermissions.Candidates?.Edit
  //     ? [
  //         {
  //           key: "change_status",
  //           label: "Change Status",
  //           // icon: <Repeat className="w-4 h-4 text-green-600" />,
  //           // onClick: (row) => openStatusModal(row),
  //         },
  //       ]
  //     : []),
  //   ...(effectivePermissions.Candidates?.Edit
  //     ? [
  //         {
  //           key: "edit",
  //           label: "Edit",
  //           icon: <Pencil className="w-4 h-4 text-green-600" />,
  //           // onClick: (row) => handleEdit(row),
  //         },
  //       ]
  //     : []),
  //   ...(effectivePermissions.Candidates?.Delete
  //     ? [
  //         {
  //           key: "delete",
  //           label: "Delete",
  //           icon: <Trash className="w-4 h-4 text-red-600" />,
  //           onClick: (row) => {
  //             setShowDeleteConfirmModal(true);
  //             // setDeletePosition(row);
  //           },
  //         },
  //       ]
  //     : []),
  // ];
  const kanbanColumns = [
    {
      key: "email",
      header: "Email",
      render: (value, row) => <span>{row?.Email}</span> || "N/A",
    },
    // v2.0.0 <-------------------------------------------------------------
    {
      key: "phone",
      header: "Phone",
      render: (value, row) => <span>{row?.Phone}</span> || "N/A",
    },
    {
      key: "currentExperience",
      header: "Experience",
      render: (value, row) =>
        (
          <span>
            {row?.CurrentExperience}
            <span className="ml-1">
              {row?.CurrentExperience > 1 ? "Years" : "Year"}
            </span>
          </span>
        ) || "N/A",
    },
    // v2.0.0 ------------------------------------------------------------->
    {
      key: "skills",
      header: "Skills",
      render: (skills) =>
        skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {skills?.length > 0 ? (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {skills[0].skill?.length > 12
                      ? skills[0].skill.slice(0, 12) + "..."
                      : skills[0].skill}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">No Skills</span>
                )}
                {skills?.length > 0 && (
                  <span className="text-gray-500 text-xs">
                    +{skills.length - 0} more
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          "N/A"
        ),
    },
  ];

  const kanbanActions = [
    // View Details
    ...(effectivePermissions.Candidates?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (item, e) => {
              isAssessmentView
                ? navigate(`/${item?.assessmentId}/view-details/${item._id}`)
                : navigate(`view-details/${item._id}`);
            },
          },
        ]
      : []),

    // 360° View (only if not in assessment view)
    ...(!isAssessmentView
      ? [
          {
            key: "360view",
            label: "360° View",
            icon: <CircleUser className="w-4 h-4 text-purple-600" />,
            onClick: (item, e) => {
              item?._id && navigate(`/candidate/${item._id}`);
            },
          },
        ]
      : []),

    // Edit (only if not in assessment view)
    ...(!isAssessmentView && effectivePermissions.Candidates?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (item, e) => {
              navigate(`edit/${item._id}`);
            },
          },
        ]
      : []),

    // Resend Link (only if in assessment view)
    ...(isAssessmentView
      ? [
          {
            key: "resend",
            label: "Resend Link",
            icon: <Mail className="w-4 h-4 text-custom-blue" />,
            isVisible: (item) => shouldShowButton(item, "resend"),
            onClick: (item, e) => {
              if (!resendLoading[item.id]) {
                onResendLink(item.id);
              }
            },
            loading: (item) => resendLoading[item.id],
            disabled: (item) => resendLoading[item.id],
          },
        ]
      : []),

    // Delete
    ...(effectivePermissions.Candidates?.Delete
      ? [
          {
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: (item) => {
              setShowDeleteConfirmModal(true);
              setDeleteCandidate(item);
            },
          },
        ]
      : []),
  ];

  // const renderKanbanActions = (item) => (
  //   <div className="flex items-center gap-2">
  //     {kanbanActions.map((action) => (
  //       <button
  //         key={action.key}
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           action.onClick(item);
  //         }}
  //         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  //         title={action.label}
  //       >
  //         {action.icon}
  //       </button>
  //     ))}
  //   </div>
  // );
  // v1.0.8 ------------------------------------------------------------------------------>

  return (
    <div className={isAssessmentView ? "" : "bg-background min-h-screen"}>
      <main
        className={
          isAssessmentView
            ? ""
            : "w-full px-9 py-2 sm:mt-20 md:mt-24 sm:px-2 lg:px-8 xl:px-8 2xl:px-8"
        }
      >
        {!isAssessmentView && (
          <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
            <main className="px-6">
              <div className="sm:px-0">
                <Header
                  title="Candidates"
                  onAddClick={() => navigate("new")}
                  addButtonText="Add Candidate"
                  canCreate={effectivePermissions.Candidates?.Create}
                />
                {/* // <---------------------- v1.0.0 */}
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
                  searchPlaceholder="Search Candidates..."
                  filterIconRef={filterIconRef}
                />
              </div>
            </main>
          </div>
        )}
        <main
          // v1.0.7 <----------------------------------------------------------
          className={
            isAssessmentView
              ? ""
              : "fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background"
          }
          // v1.0.7 ---------------------------------------------------------->
        >
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {/* v1.0.7 <--------------------------------------------------- */}
              {/* v1.0.8 <---------------------------------------------------------------------------------------------- */}
              <div className="relative w-full">
                {/* v1.0.7 ---------------------------------------------------> */}
                {view === "table" ? (
                  <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                    {/* v1.0.8 ----------------------------------------------------------------------------------------------> */}
                    <TableView
                      data={currentFilteredRows}
                      columns={tableColumns}
                      loading={isLoading}
                      actions={tableActions}
                      emptyState="No Candidates Found."
                      autoHeight={isAssessmentView}
                    />
                  </div>
                ) : (
                  // v1.0.8 <-------------------------------------------------------------------
                  <div className="w-full">
                    {/* <KanbanView
                      data={currentFilteredRows.map((candidate) => ({
                        ...candidate,
                        id: candidate._id,
                        title: `${candidate?.FirstName || ""} ${
                          candidate?.LastName || ""
                        }`.trim(),
                        firstName: `${
                          candidate?.FirstName.charAt(0).toUpperCase() +
                            candidate?.FirstName.slice(1) || ""
                        } ${
                          candidate?.LastName.charAt(0).toUpperCase() +
                            candidate?.LastName.slice(1) || ""
                        }`.trim(),
                        currentRole:
                          candidate?.CurrentRole ||
                          candidate?.CurrentExperience ||
                          "N/A",
                        email: candidate?.Email || "N/A",
                        phone:
                          candidate?.CountryCode + " " + candidate?.Phone ||
                          "N/A",
                        industry: candidate?.HigherQualification || "N/A",
                        linkedinUrl: candidate?.CurrentExperience || "N/A",
                        skills: candidate?.skills || [],
                        avatar: candidate?.ImageData?.path || null,
                        status:
                          candidate?.HigherQualification || "Not Provided",
                        expiryAt: candidate?.expiryAt || null, // Add expiry date for assessment view
                        // <-------------------------------v1.0.1
                        isAssessmentView: isAssessmentView,
                      }))}
                      columns={kanbanColumns}
                      loading={isLoading}
                      renderActions={renderKanbanActions}
                      emptyState="No Candidates Found."
                    /> */}
                    <KanbanView
                      loading={isLoading}
                      data={currentFilteredRows.map((candidate) => ({
                        ...candidate,
                        id: candidate._id,
                        title: `${candidate?.FirstName || ""} ${
                          candidate?.LastName || ""
                        }`.trim(),
                        firstName: `${
                          candidate?.FirstName.charAt(0).toUpperCase() +
                            candidate?.FirstName.slice(1) || ""
                        } ${
                          candidate?.LastName.charAt(0).toUpperCase() +
                            candidate?.LastName.slice(1) || ""
                        }`.trim(),
                        currentRole:
                          candidate?.CurrentRole ||
                          candidate?.CurrentExperience ||
                          "N/A",
                        avatar: candidate?.ImageData?.path || null,
                      }))}
                      columns={kanbanColumns}
                      // v2.0.1 <-------------------------------------------------
                      // renderActions={renderKanbanActions}
                      renderActions={(item) => (
                        <KanbanActionsMenu
                          item={item}
                          kanbanActions={kanbanActions}
                        />
                      )}
                      emptyState="No candidates found."
                    />
                    {/* // v2.0.1 -------------------------------------------------> */}
                  </div>
                  // v1.0.8 ------------------------------------------------------------------->
                )}
                <FilterPopup
                  isOpen={isFilterPopupOpen}
                  onClose={() => setFilterPopupOpen(false)}
                  onApply={handleApplyFilters}
                  onClearAll={handleClearAll}
                  filterIconRef={filterIconRef}
                >
                  <div className="space-y-3">
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setIsQualificationOpen(!isQualificationOpen)
                        }
                      >
                        <span className="font-medium text-gray-700">
                          Qualification
                        </span>
                        {isQualificationOpen ? (
                          <ChevronUp className="text-xl text-gray-700" />
                        ) : (
                          <ChevronDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isQualificationOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {qualifications?.length > 0 ? (
                            qualifications.map((q) => (
                              <label
                                key={q.QualificationName}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStatus.includes(
                                    q.QualificationName
                                  )}
                                  onChange={() =>
                                    handleStatusToggle(q.QualificationName)
                                  }
                                  // v1.0.3 <--------------------------------------------------------------
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                  // v1.0.3 -------------------------------------------------------------->
                                />
                                <span className="text-sm">
                                  {q.QualificationName}
                                </span>
                              </label>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No Qualifications Available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          Skills
                        </span>
                        {isSkillsOpen ? (
                          <ChevronUp className="text-xl text-gray-700" />
                        ) : (
                          <ChevronDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isSkillsOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {skills?.length > 0 ? (
                            skills.map((skill) => (
                              <label
                                key={skill.SkillName}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedTech.includes(
                                    skill.SkillName
                                  )}
                                  onChange={() =>
                                    handleTechToggle(skill.SkillName)
                                  }
                                  // v1.0.3 <--------------------------------------------------------------
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                  // v1.0.3 -------------------------------------------------------------->
                                />
                                <span className="text-sm">
                                  {skill.SkillName}
                                </span>
                              </label>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No skills available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          Experience
                        </span>
                        {isExperienceOpen ? (
                          <ChevronUp className="text-xl text-gray-700" />
                        ) : (
                          <ChevronDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isExperienceOpen && (
                        <div className="mt-1 space-y-2 pl-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Min (years)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="15"
                                placeholder="Min..."
                                value={experience.min}
                                onChange={(e) =>
                                  handleExperienceChange(e, "min")
                                }
                                className="mt-1 block w-full px-1 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Max (years)
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="Max..."
                                max="15"
                                value={experience.max}
                                onChange={(e) =>
                                  handleExperienceChange(e, "max")
                                }
                                className="mt-1 block w-full px-1 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/*<-----v1.0.4-------- */}
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setIsRelevantExperienceOpen(!isRelevantExperienceOpen)
                        }
                      >
                        <span className="font-medium text-gray-700">
                          Relevant Experience
                        </span>
                        {isRelevantExperienceOpen ? (
                          <ChevronUp className="text-xl text-gray-700" />
                        ) : (
                          <ChevronDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isRelevantExperienceOpen && (
                        <div className="mt-1 space-y-2 pl-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Min (years)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="15"
                                placeholder="Min..."
                                value={relevantExperience.min}
                                onChange={(e) =>
                                  handleRelevantExperienceChange(e, "min")
                                }
                                className="mt-1 block w-full px-1 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Max (years)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="15"
                                placeholder="Max..."
                                value={relevantExperience.max}
                                onChange={(e) =>
                                  handleRelevantExperienceChange(e, "max")
                                }
                                className="mt-1 block w-full px-1 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsRoleOpen(!isRoleOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          Current Role
                        </span>
                        {isRoleOpen ? (
                          <ChevronUp className="text-xl text-gray-700" />
                        ) : (
                          <ChevronDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isRoleOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {currentRoles?.length > 0 ? (
                            currentRoles.map((role) => (
                              <label
                                key={role.RoleName}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRoles.includes(
                                    role.RoleName
                                  )}
                                  onChange={() =>
                                    handleRoleToggle(role.RoleName)
                                  }
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">{role.RoleName}</span>
                              </label>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No roles available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsUniversityOpen(!isUniversityOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          University/College
                        </span>
                        {isUniversityOpen ? (
                          <ChevronUp className="text-xl text-gray-700" />
                        ) : (
                          <ChevronDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isUniversityOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {colleges?.length > 0 ? (
                            colleges.map((college) => (
                              <label
                                key={college.University_CollegeName}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedUniversities.includes(
                                    college.University_CollegeName
                                  )}
                                  onChange={() =>
                                    handleUniversityToggle(
                                      college.University_CollegeName
                                    )
                                  }
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">
                                  {college.University_CollegeName}
                                </span>
                              </label>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No colleges available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
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
                        <div className="mt-1 space-y-1 pl-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="createdDate"
                              value=""
                              checked={createdDatePreset === ""}
                              onChange={() => setCreatedDatePreset("")}
                              className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">All</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="createdDate"
                              value="last7"
                              checked={createdDatePreset === "last7"}
                              onChange={() => setCreatedDatePreset("last7")}
                              className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">Last 7 days</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="createdDate"
                              value="last30"
                              checked={createdDatePreset === "last30"}
                              onChange={() => setCreatedDatePreset("last30")}
                              className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">Last 30 days</span>
                          </label>
                        </div>
                      )}
                    </div>
                    {/*-----v1.0.4-------->*/}
                  </div>
                </FilterPopup>
              </div>
            </motion.div>
          </div>
        </main>
      </main>
      {selectCandidateView && (
        <CandidateDetails
          candidate={selectedCandidate}
          onClose={() => setSelectCandidateView(false)}
        />
      )}
      {!isAssessmentView && showAddForm && (
        <AddCandidateForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setSelectedCandidate(null);
            setEditModeOn(false);
          }}
          selectedCandidate={selectedCandidate}
          isEdit={editModeOn}
        />
      )}

      {/* Ranjith added deleted functionality  */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleDeleteCandidate}
        title="Candidate"
        entityName={
          deleteCandidate?.FirstName + " " + deleteCandidate?.LastName
        }
      />

      <Outlet />
    </div>
  );
}

export default Candidate;
