// v1.0.0  -  Ashraf  -  removed expity date
// v1.0.1  -  Ashraf  -  added new assessment button
// v1.0.2 ---Venkatesh---change assessmentID to first in table column and add status column style
// v1.0.3  -  Ashraf  -  added extend/cancel functionality for candidate assessments. replaced actions button with direct extend/cancel buttons and restored original columns. added automatic expiry check functionality
// v1.0.4  -  Venkatesh  -  added common status column style
// v1.0.5  -  Ashok   -  Added new Kanban view
// v1.0.6  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.7  -  Ashok   -  Improved responsiveness
// v1.0.8  -  Ashok   -  Added common code to kanban
// v1.0.9  -  Ashok   -  added clickable title to navigate to details page at kanban
// v2.0.0  -  Ashok   -  added common code for empty state messages

import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import { motion } from "framer-motion";
import Header from "../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { useScheduleAssessments } from "../../../../apiHooks/useScheduleAssessments.js";
import { usePermissions } from "../../../../Context/PermissionsContext";
// <-------------------------------v1.0.3
import {
  Eye,
  Pencil,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Share2,
  Mail,
  MoreVertical,
} from "lucide-react";
// ------------------------------v1.0.3 >
// <-------------------------------v1.0.3 >
import AssessmentActionPopup from "../Assessment-Tab/AssessmentViewDetails/AssessmentActionPopup.jsx";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import axios from "axios";
import { config } from "../../../../config.js";
import toast from "react-hot-toast";
// ------------------------------v1.0.3 >
// <---------------------- v1.0.1
import ShareAssessment from "../Assessment-Tab/ShareAssessment.jsx";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
// <---------------------- v1.0.1 >

// v1.0.5 <-------------------------------------------------------------------------------------
// import KanbanView from "./Kanban.jsx";
import KanbanView from "../../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.5 ------------------------------------------------------------------------------------->
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
// v1.0.8 <--------------------------------------------------------------------------
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage.js";

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
// v1.0.8 -------------------------------------------------------------------------->

const ScheduleAssessment = () => {
  const { effectivePermissions } = usePermissions();
  // <-------------------------------v1.0.3
  const { assessmentData, checkExpiredAssessments, updateAllScheduleStatuses } =
    useAssessments();
  const { scheduleData, isLoading } = useScheduleAssessments();
  console.log("Schedule Data:", scheduleData);
  const navigate = useNavigate();
  // <---------------------- v1.0.1
  const [isShareOpen, setIsShareOpen] = useState(false);
  // <---------------------- v1.0.1 >
  // <---------------------- v1.0.3
  const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedAction, setSelectedAction] = useState(""); // 'extend', 'cancel', or 'resend'
  // const [selectedAssessmentTemplateId, setSelectedAssessmentTemplateId] =
  //   useState(null);
  // Function to check if action buttons should be shown based on schedule status
  const shouldShowActionButtons = (schedule) => {
    const status = schedule.status?.toLowerCase();
    // Hide buttons for completed, cancelled, expired, and failed statuses
    return !["completed", "cancelled", "expired", "failed"].includes(status);
  };
  // Function to handle manual schedule status updates
  const handleUpdateAllScheduleStatuses = () => {
    updateAllScheduleStatuses.mutate();
  };
  // ------------------------------v1.0.3 >
  const assessmentIds = assessmentData?.map((a) => a._id) || [];
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const filterIconRef = useRef(null);

  // Filter state
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  // <-------------------------------v1.0.3
  const [statusOptions] = useState([
    "Scheduled",
    "Completed",
    "Cancelled",
    "Expired",
    "Failed",
  ]);
  // ------------------------------v1.0.3 >
  // Applied filters
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState({ min: "", max: "" });
  const [selectedExpiryDate, setSelectedExpiryDate] = useState(""); // '', 'expired', 'next7', 'next30'
  const [selectedCreatedDate, setSelectedCreatedDate] = useState(""); // '', 'last7', 'last30', 'last90'

  // Draft filters edited inside popup (not applied until Apply is clicked)
  const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
  const [tempSelectedTemplates, setTempSelectedTemplates] = useState([]);
  const [tempOrderRange, setTempOrderRange] = useState({ min: "", max: "" });
  const [tempExpiryDatePreset, setTempExpiryDatePreset] = useState("");
  const [tempCreatedDatePreset, setTempCreatedDatePreset] = useState("");

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isExpiryDateOpen, setIsExpiryDateOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);

  // v1.0.8 <-------------------------------------------------------------
  useScrollLock(viewMode === "kanban");
  // v1.0.8 ------------------------------------------------------------->

  // Derived pagination
  const rowsPerPage = 10;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Helper function to normalize spaces for better search
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  // Filters and search apply here
  const filteredSchedules = (
    Array.isArray(scheduleData) ? scheduleData : []
  ).filter((s) => {
    // Restrict to selected assessments
    if (assessmentIds.length && s.assessmentId) {
      const aId =
        typeof s.assessmentId === "object"
          ? s.assessmentId._id || s.assessmentId.toString()
          : s.assessmentId.toString();
      if (!assessmentIds.includes(aId)) return false;
    }

    // Status filter
    const matchesStatus =
      selectedStatus.length === 0 ||
      selectedStatus.includes(
        (s.status || "").charAt(0).toUpperCase() + (s.status || "").slice(1)
      );

    // Template filter
    const matchesTemplate = () => {
      if (selectedTemplates.length === 0) return true;
      const templateId =
        typeof s.assessmentId === "object"
          ? s.assessmentId._id
          : s.assessmentId;
      return selectedTemplates.includes(templateId);
    };

    // Order range filter
    const orderValue = parseInt(s.order) || 0;
    const matchesOrder =
      (selectedOrder.min === "" || orderValue >= Number(selectedOrder.min)) &&
      (selectedOrder.max === "" || orderValue <= Number(selectedOrder.max));

    // Expiry date filter
    const matchesExpiryDate = () => {
      if (!selectedExpiryDate) return true;
      if (!s.expiryAt) return false;
      const expiryAt = new Date(s.expiryAt);
      const now = new Date();
      const daysDiff = Math.floor((expiryAt - now) / (1000 * 60 * 60 * 24));

      switch (selectedExpiryDate) {
        case "expired":
          return daysDiff < 0;
        case "next7":
          return daysDiff >= 0 && daysDiff <= 7;
        case "next30":
          return daysDiff >= 0 && daysDiff <= 30;
        default:
          return true;
      }
    };

    // Created date filter
    const matchesCreatedDate = () => {
      if (!selectedCreatedDate) return true;
      if (!s.createdAt) return false;
      const createdAt = new Date(s.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

      switch (selectedCreatedDate) {
        case "last7":
          return daysDiff <= 7;
        case "last30":
          return daysDiff <= 30;
        case "last90":
          return daysDiff <= 90;
        default:
          return true;
      }
    };

    // Enhanced search filter
    const normalizedQuery = normalizeSpaces(searchQuery);

    // Get assessment template details
    let assessmentTemplateTitle = null;
    let assessmentTemplateCode = null;

    if (s.assessmentId) {
      if (typeof s.assessmentId === "object") {
        assessmentTemplateTitle = s.assessmentId.AssessmentTitle;
        assessmentTemplateCode =
          s.assessmentId.AssessmentCode || s.assessmentId._id;
      } else {
        // If assessmentId is just an ID string, find the assessment in assessmentData
        const assessment = assessmentData?.find(
          (a) => a._id === s.assessmentId
        );
        if (assessment) {
          assessmentTemplateTitle = assessment.AssessmentTitle;
          assessmentTemplateCode = assessment.AssessmentCode || assessment._id;
        } else {
          // Fallback to using the ID itself as searchable
          assessmentTemplateCode = s.assessmentId;
        }
      }
    }

    const fields = [
      s.scheduledAssessmentCode,
      s.order?.toString(),
      s.expiryAt,
      s.status,
      assessmentTemplateTitle,
      assessmentTemplateCode,
    ].filter(Boolean);

    const matchesSearch =
      searchQuery === "" ||
      fields.some((f) => normalizeSpaces(f).includes(normalizedQuery));

    return (
      matchesStatus &&
      matchesTemplate() &&
      matchesOrder &&
      matchesExpiryDate() &&
      matchesCreatedDate() &&
      matchesSearch
    );
  });

  const totalPages = Math.ceil(filteredSchedules.length / rowsPerPage) || 1;
  const currentRows = filteredSchedules.slice(startIndex, endIndex);

  // Effects
  useEffect(() => {
    document.title = "Assessments";
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
      setTempSelectedStatus(selectedStatus);
      setTempSelectedTemplates(selectedTemplates);
      setTempOrderRange(selectedOrder);
      setTempExpiryDatePreset(selectedExpiryDate);
      setTempCreatedDatePreset(selectedCreatedDate);
      // Reset all open states
      setIsStatusOpen(false);
      setIsTemplateOpen(false);
      setIsOrderOpen(false);
      setIsExpiryDateOpen(false);
      setIsCreatedDateOpen(false);
    }
  }, [
    isFilterPopupOpen,
    selectedStatus,
    selectedTemplates,
    selectedOrder,
    selectedExpiryDate,
    selectedCreatedDate,
  ]);

  // Handlers
  const handleStatusToggle = (status) => {
    setTempSelectedStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
  };

  const handleTemplateToggle = (templateId) => {
    setTempSelectedTemplates((prev) => {
      if (prev.includes(templateId)) {
        return prev.filter((t) => t !== templateId);
      }
      return [...prev, templateId];
    });
  };

  const handleOrderChange = (e, type) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || "");
    setTempOrderRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleApplyFilters = () => {
    setSelectedStatus(tempSelectedStatus);
    setSelectedTemplates(tempSelectedTemplates);
    setSelectedOrder(tempOrderRange);
    setSelectedExpiryDate(tempExpiryDatePreset);
    setSelectedCreatedDate(tempCreatedDatePreset);
    setIsFilterActive(
      tempSelectedStatus.length > 0 ||
        tempSelectedTemplates.length > 0 ||
        tempOrderRange.min !== "" ||
        tempOrderRange.max !== "" ||
        tempExpiryDatePreset !== "" ||
        tempCreatedDatePreset !== ""
    );
    setFilterPopupOpen(false);
  };
  // ------------------------------v1.0.3 >
  const handleClearFilters = () => {
    setSelectedStatus([]);
    setSelectedTemplates([]);
    setSelectedOrder({ min: "", max: "" });
    setSelectedExpiryDate("");
    setSelectedCreatedDate("");
    setTempSelectedStatus([]);
    setTempSelectedTemplates([]);
    setTempOrderRange({ min: "", max: "" });
    setTempExpiryDatePreset("");
    setTempCreatedDatePreset("");
    setIsFilterActive(false);
  };

  const handleFilterIconClick = () => {
    setFilterPopupOpen(!isFilterPopupOpen);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleView = (schedule) => {
    navigate(`/assessment/${schedule._id}`, {
      state: { schedule: schedule },
    });
  };

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
  };

  // Simple helper to get assessment template ID
  const getAssessmentTemplateId = (row) => {
    return row?.assessmentId?._id || row?.assessmentId;
  };

  const handleResendClick = (schedule) => {
    // Get assessment template ID directly from the row data
    const assessmentTemplateId = getAssessmentTemplateId(schedule);
    console.log("Debug - Resend Assessment Template ID:", assessmentTemplateId);

    // Use the same logic as handleActionClick since candidate data is already available
    handleActionClick(schedule, "resend");
  };

  // <---------------------- v1.0.3
  // const handleActionClick = async (schedule, action) => {
  //   try {
  //     // Get and store the assessment template ID from the original row data
  //     const assessmentTemplateId = getAssessmentTemplateId(schedule);
  //     setSelectedAssessmentTemplateId(assessmentTemplateId);
  //     console.log(
  //       "Debug - Stored Assessment Template ID:",
  //       assessmentTemplateId
  //     );

  //     // Fetch candidate data for this schedule if not already available
  //     if (!schedule.candidates || schedule.candidates.length === 0) {
  //       if (assessmentTemplateId) {
  //         // const response = await axios.get(
  //         //   `${config.REACT_APP_API_URL}/schedule-assessment/${assessmentTemplateId}/schedules`
  //         // );
  //           const { scheduleData, isLoading } = useScheduleAssessments(assessmentTemplateId);
  //         if (response.data.success && response.data.data) {
  //           const scheduleWithCandidates = response.data.data.find(
  //             (s) => s._id === schedule._id
  //           );
  //           if (scheduleWithCandidates) {
  //             setSelectedSchedule(scheduleWithCandidates);
  //           } else {
  //             setSelectedSchedule(schedule);
  //           }
  //         } else {
  //           setSelectedSchedule(schedule);
  //         }
  //       } else {
  //         setSelectedSchedule(schedule);
  //       }
  //     } else {
  //       setSelectedSchedule(schedule);
  //     }
  //     setSelectedAction(action);
  //     setIsActionPopupOpen(true);
  //   } catch (error) {
  //     console.error("Error fetching candidate data:", error);
  //     setSelectedSchedule(schedule);
  //     setSelectedAction(action);
  //     setIsActionPopupOpen(true);
  //   }
  // };

  const handleActionClick = (schedule, action) => {
    const assessmentTemplateId = getAssessmentTemplateId(schedule);

    // setSelectedAssessmentTemplateId(assessmentTemplateId);
    setSelectedSchedule(schedule); // ← Critical!
    setSelectedAction(action);
    setIsActionPopupOpen(true);
  };

  const handleActionSuccess = () => {
    // The useAssessments mutations will automatically invalidate and refresh the data
    // No manual reload needed - React Query will handle the refresh
  };
  const handleCheckExpired = async () => {
    try {
      await checkExpiredAssessments.mutateAsync();
    } catch (error) {
      console.error("Error checking expired assessments:", error);
    }
  };

  //  v1.0.8 <-----------------------------------------------------------
  // v1.0.5 <-------------------------------------------------------------
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // v1.0.5 ------------------------------------------------------------->
  //  v1.0.8 ----------------------------------------------------------->

  // ------------------------ empty state message -------------------------------
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  const initialDataCount = scheduleData?.length || 0;
  const currentFilteredCount = currentRows?.length || 0;
  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "Assessments"
  );
  // ------------------------ empty state message -------------------------------

  // <-------------------------------v1.0.3
  const tableColumns = [
    // Assessment Template ID
    //<---------v1.0.2-----
    {
      key: "scheduledAssessmentCode",
      header: "Assessment ID",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {row.order || "Not Provided"}
        </div>
      ),
    },
    //-------v1.0.2----->
    {
      key: "assessmentId",
      header: "Assessment Template ID",
      render: (value, row) => {
        // Determine Assessment object (it may come populated or we find it in assessmentData)
        let assessmentObj = null;
        if (value) {
          if (typeof value === "object") {
            assessmentObj = value;
          } else {
            assessmentObj = (assessmentData || []).find((a) => a._id === value);
          }
        }
        const code =
          assessmentObj?.AssessmentCode || assessmentObj?._id || "Not Provided";
        return (
          <div
            className="text-sm font-medium text-custom-blue cursor-pointer"
            onClick={() => handleView(row)}
          >
            {code}
          </div>
        );
      },
    },
    // Assessment Template Name
    {
      key: "assessmentTemplateName",
      header: "Assessment Template Name",
      render: (_, row) => {
        const value = row.assessmentId;
        let assessmentObj = null;
        if (value) {
          if (typeof value === "object") {
            assessmentObj = value;
          } else {
            assessmentObj = (assessmentData || []).find((a) => a._id === value);
          }
        }
        const title = assessmentObj?.AssessmentTitle || "Not Provided";
        return (
          <div
            className="text-sm font-medium text-custom-blue cursor-pointer"
            onClick={() => handleView(row)}
          >
            {title.charAt
              ? title.charAt(0).toUpperCase() + title.slice(1)
              : title}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      //<---------------------- v1.0.2--------
      //<---------------------- v1.0.4
      render: (v) => (
        <StatusBadge
          status={v}
          text={v ? v.charAt(0).toUpperCase() + v.slice(1) : "Not Provided"}
        />
      ),
    },
    // ---------------------- v1.0.2-------->
    // ------------------------------v1.0.4>
  ];

  const tableActions = [
    ...(effectivePermissions.Assessments?.View
      ? [
          {
            key: "view",
            label: "View",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: handleView,
          },
        ]
      : []),
    // <-------------------------------v1.0.3
    {
      key: "extend",
      label: "Extend",
      icon: <Calendar className="w-4 h-4 text-custom-blue" />,
      onClick: (schedule) => handleActionClick(schedule, "extend"),
      show: shouldShowActionButtons,
    },
    {
      key: "cancel",
      label: "Cancel",
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      onClick: (schedule) => handleActionClick(schedule, "cancel"),
      show: shouldShowActionButtons,
    },
    {
      key: "resend",
      label: "Resend Link",
      icon: <Mail className="w-4 h-4 text-green-600" />,
      onClick: (schedule) => handleResendClick(schedule),
      show: shouldShowActionButtons,
    },
    // ------------------------------v1.0.3 >
  ];

  // v1.0.5 <---------------------------------------------------------------------------------------

  // v1.0.8 <---------------------------------------------------------------------------------------
  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "isActive",
      header: "Is Active",
      render: (value, row) => (
        <span>
          {row?.isActive ? (
            <StatusBadge status={"Active"} />
          ) : (
            <StatusBadge status={"Inactive"} />
          )}
        </span>
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

  // Shared Actions Configuration for Kanban
  const kanbanActions = () => [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        handleView(row);
      },
    },
    {
      key: "extend",
      label: "Extend",
      icon: <Calendar className="w-4 h-4 text-custom-blue" />,
      onClick: (schedule) => handleActionClick(schedule, "extend"),
      show: shouldShowActionButtons,
    },
    {
      key: "cancel",
      label: "Cancel",
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      onClick: (schedule) => handleActionClick(schedule, "cancel"),
      show: shouldShowActionButtons,
    },
    {
      key: "resend",
      label: "Resend Link",
      icon: <Mail className="w-4 h-4 text-green-600" />,
      onClick: (schedule) => handleResendClick(schedule),
      show: shouldShowActionButtons,
    },
  ];

  // v1.0.8 --------------------------------------------------------------------------------------->
  // v1.0.5 --------------------------------------------------------------------------------------->
  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            {/* <---------------------- v1.0.1 */}
            <Header
              title="Assessments"
              addButtonText="Add Assessment"
              onAddClick={() => handleShareClick()}
              canCreate={effectivePermissions.Assessments?.Create}
            />
            {/* <---------------------- v1.0.1 > */}
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
              dataLength={Array.isArray(scheduleData) ? scheduleData.length : 0}
              searchPlaceholder="Search Assessments..."
              filterIconRef={filterIconRef}
            />
            {/* <-------------------------------v1.0.3 */}

            {/* Manual Update Status Button - helps to update status or refresh status manually */}
            {/* <div className="flex justify-end mb-4">
              <button
                onClick={handleUpdateAllScheduleStatuses}
                disabled={updateAllScheduleStatuses.isPending}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${updateAllScheduleStatuses.isPending ? 'animate-spin' : ''}`} />
                {updateAllScheduleStatuses.isPending ? 'Updating...' : 'Update All Statuses'}
              </button>
            </div> */}
            {/* ------------------------------v1.0.3 > */}
          </div>
        </main>
      </div>
      {/* v1.0.7 <------------------------------------------------------------------------------ */}
      <main className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {/* v1.0.7 ------------------------------------------------------------------------------> */}
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "table" ? (
              //  v1.0.7 <------------------------------------------------------------------------------
              <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                <TableView
                  data={currentRows}
                  columns={tableColumns}
                  actions={tableActions}
                  loading={isLoading}
                  emptyState={emptyStateMessage}
                  className="table-fixed w-full"
                />
              </div>
            ) : (
              //  v1.0.7 ------------------------------------------------------------------------------>
              //  v1.0.8 ------------------------------------------------------------------------------>
              // v1.0.5 <-----------------------------------------------------------------------
              <KanbanView
                loading={isLoading}
                data={currentRows.map((assessment) => ({
                  ...assessment,
                  id: assessment._id,
                  title: assessment?.order || "N/A",
                  subTitle: formatDate(assessment?.createdAt),
                }))}
                columns={kanbanColumns}
                renderActions={(item) => (
                  <KanbanActionsMenu
                    item={item}
                    kanbanActions={kanbanActions}
                  />
                )}
                onTitleClick={handleView}
                emptyState={emptyStateMessage}
                kanbanTitle="Assessment"
              />
              // v1.0.8 ------------------------------------------------------------------------>
              // v1.0.5 ------------------------------------------------------------------------>
            )}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearFilters}
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
                    <div className="mt-1 space-y-1 pl-3 max-h-40 overflow-y-auto">
                      {statusOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={tempSelectedStatus.includes(option)}
                            onChange={() => handleStatusToggle(option)}
                            className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Range Filter */}
                {/* <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsOrderOpen(!isOrderOpen)}
                  >
                    <span className="font-medium text-gray-700">Order Priority</span>
                    {isOrderOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isOrderOpen && (
                    <div className="mt-2 pl-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={tempOrderRange.min}
                          onChange={(e) => handleOrderChange(e, "min")}
                          placeholder="Min"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                        <span className="text-sm">to</span>
                        <input
                          type="number"
                          value={tempOrderRange.max}
                          onChange={(e) => handleOrderChange(e, "max")}
                          placeholder="Max"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div> */}

                {/* Expiry Date Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsExpiryDateOpen(!isExpiryDateOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Expiry Date
                    </span>
                    {isExpiryDateOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isExpiryDateOpen && (
                    <div className="mt-2 pl-3 space-y-1">
                      {[
                        { value: "", label: "Any time" },
                        { value: "expired", label: "Already expired" },
                        { value: "next7", label: "Expires in next 7 days" },
                        { value: "next30", label: "Expires in next 30 days" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={tempExpiryDatePreset === option.value}
                            onChange={(e) =>
                              setTempExpiryDatePreset(e.target.value)
                            }
                            className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

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
                            checked={tempCreatedDatePreset === option.value}
                            onChange={(e) =>
                              setTempCreatedDatePreset(e.target.value)
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
      {/* <---------------------- v1.0.1 */}
      {isShareOpen && (
        <ShareAssessment
          isOpen={isShareOpen}
          onCloseshare={handleCloseShare}
          assessment={isShareOpen}
          fromscheduleAssessment={true}
        />
      )}
      {/* <---------------------- v1.0.1 > */}
      {/* <---------------------- v1.0.3 */}
      {isActionPopupOpen && selectedSchedule && (
        <AssessmentActionPopup
          isOpen={isActionPopupOpen}
          onClose={() => {
            setIsActionPopupOpen(false);
            setSelectedSchedule(null);
            setSelectedAction("");
            // setSelectedAssessmentTemplateId(null);
          }}
          schedule={selectedSchedule} // ← Pass full schedule
          onSuccess={handleActionSuccess}
          defaultAction={selectedAction}
        />
      )}
      {/* ------------------------------ v1.0.3 >  */}
    </div>
  );
};

export default ScheduleAssessment;
