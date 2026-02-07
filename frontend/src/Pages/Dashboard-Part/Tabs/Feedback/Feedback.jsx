// v1.0.0  -  Venkatesh  -  Initial setup for Feedbacks with table and kanban views
// v1.0.1  -  Venkatesh  -  Added toolbar with search, pagination, and filter functionality
// v1.0.2  -  Venkatesh  -  Added edit modes for Candidate, Interviews, Skills, and Overall Impressions tabs
// v1.0.3  -  Ashraf  -  added api get from apimodel
// v1.0.4  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.5  -  Ashok   -  Improved responsiveness
// v1.0.6  -  Ashok   -  Fixed style issues and added common code to empty state message

import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import { motion } from "framer-motion";
import { Tooltip } from "@mantine/core";
import Header from "../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileTextIcon,
  Pencil,
  Star,
  XCircle,
} from "lucide-react";
// import toast from "react-hot-toast";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
import SummarizedFeedbackModal from "./SummarizedFeedbackModal.jsx";
import FeedbackKanban from "./FeedbackKanban.jsx";

import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import { useInterviews } from "../../../../apiHooks/useInterviews.js";
// <------------------------v1.0.3
import { useFeedbacks } from "../../../../apiHooks/useFeedbacks.js";
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage.js";
import {
  getFeedbackColumns,
  getFeedbackActions,
} from "../../../../utils/tableColumnAndActionData.jsx";


const Feedback = () => {
  const navigate = useNavigate();
  useScrollLock(true);
  // const { interviewData, isLoading: interviewsLoading } = useInterviews();

  // console.log("[Feedback] Debug:", {
  //   interviewData: !!interviewData,
  //   feedbacksData: !!feedbacksData,
  //   feedbacksLoading,
  //   feedbacksError: !!feedbacksError,
  //   feedbacksDataLength: feedbacksData?.length || 0,
  // });
  // ------------------------------v1.0.3 >

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  // Get context data (removed unused variables)
  // const { user } = useCustomContext();
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const filterIconRef = useRef(null);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  // <------------------------v1.0.3
  const [statusOptions] = useState(["draft", "submitted"]);
  // ------------------------------v1.0.3 >
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [tempSelectedPositions, setTempSelectedPositions] = useState([]);
  const [selectedModes, setSelectedModes] = useState([]);
  const [tempSelectedModes, setTempSelectedModes] = useState([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [tempSelectedInterviewers, setTempSelectedInterviewers] = useState([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);
  const [tempSelectedRecommendations, setTempSelectedRecommendations] =
    useState([]);
  const [selectedRating, setSelectedRating] = useState({ min: "", max: "" });
  const [tempRatingRange, setTempRatingRange] = useState({ min: "", max: "" });
  const [selectedInterviewDate, setSelectedInterviewDate] = useState("");
  const [tempInterviewDatePreset, setTempInterviewDatePreset] = useState("");

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isInterviewerOpen, setIsInterviewerOpen] = useState(false);
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isInterviewDateOpen, setIsInterviewDateOpen] = useState(false);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);


  // ------------------------------v1.0.3 >
  // State for filters and pagination
  const [filters, setFilters] = useState({
    page: 0,
    limit: 10,
    search: "",
    status: [],
    positions: [],
    modes: [],
    interviewers: [],
    recommendations: [],
    ratingMin: "",
    ratingMax: "",
    interviewDate: "",
  });

  const {
    data: feedbacksResponse,
    isLoading: feedbacksLoading,
    error: feedbacksError,
  } = useFeedbacks(filters);

  console.log("feedbacksResponse", feedbacksResponse);
  console.log("tokenPayload", tokenPayload);

  // Use data from the hook
  // const feedbacks = feedbacksData || [];
  // Extract data from response
  const feedbacks = feedbacksResponse?.feedbacks || [];
  const paginationInfo = feedbacksResponse?.pagination || {
    currentPage: 0,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  };
  const loading = feedbacksLoading;
  const error = feedbacksError;
  // Removed modal-related state variables as modal is now in separate component

  // Update filtered feedbacks when feedbacks data changes
  useEffect(() => {
    // Only update if the arrays are actually different
    if (
      feedbacks.length !== filteredFeedbacks.length ||
      feedbacks.some(
        (item, index) => item._id !== filteredFeedbacks[index]?._id
      )
    ) {
      setFilteredFeedbacks(feedbacks);
    }
  }, [feedbacks]);
  //
  // ------------------------------v1.0.3 >
  const rowsPerPage = 10;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  useEffect(() => {
    document.title = "Feedback";
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update filters when search query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchQuery,
        page: 0, // Reset to first page when searching
      }));
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update current page in filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: paginationInfo.currentPage,
    }));
  }, [paginationInfo.currentPage]);

  // Sync filter states when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setTempSelectedStatus(selectedStatus);
      setTempSelectedPositions(selectedPositions);
      setTempSelectedModes(selectedModes);
      setTempSelectedInterviewers(selectedInterviewers);
      setTempSelectedRecommendations(selectedRecommendations);
      setTempRatingRange(selectedRating);
      setTempInterviewDatePreset(selectedInterviewDate);
      // Reset all open states
      setIsStatusOpen(false);
      setIsPositionOpen(false);
      setIsModeOpen(false);
      setIsInterviewerOpen(false);
      setIsRecommendationOpen(false);
      setIsRatingOpen(false);
      setIsInterviewDateOpen(false);
    }
  }, [
    isFilterPopupOpen,
    selectedStatus,
    selectedPositions,
    selectedModes,
    selectedInterviewers,
    selectedRecommendations,
    selectedRating,
    selectedInterviewDate,
  ]);

  const handleStatusToggle = (status) => {
    setTempSelectedStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
  };

  const handlePositionToggle = (positionId) => {
    setTempSelectedPositions((prev) => {
      if (prev.includes(positionId)) {
        return prev.filter((p) => p !== positionId);
      }
      return [...prev, positionId];
    });
  };

  const handleModeToggle = (mode) => {
    setTempSelectedModes((prev) => {
      if (prev.includes(mode)) {
        return prev.filter((m) => m !== mode);
      }
      return [...prev, mode];
    });
  };

  const handleInterviewerToggle = (interviewerId) => {
    setTempSelectedInterviewers((prev) => {
      if (prev.includes(interviewerId)) {
        return prev.filter((i) => i !== interviewerId);
      }
      return [...prev, interviewerId];
    });
  };

  const handleRecommendationToggle = (recommendation) => {
    setTempSelectedRecommendations((prev) => {
      if (prev.includes(recommendation)) {
        return prev.filter((r) => r !== recommendation);
      }
      return [...prev, recommendation];
    });
  };

  const handleRatingChange = (e, type) => {
    const value =
      e.target.value === ""
        ? ""
        : Math.min(5, Math.max(0, Number(e.target.value) || ""));
    setTempRatingRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleApplyFilters = () => {
    setSelectedStatus(tempSelectedStatus);
    setSelectedPositions(tempSelectedPositions);
    setSelectedModes(tempSelectedModes);
    setSelectedInterviewers(tempSelectedInterviewers);
    setSelectedRecommendations(tempSelectedRecommendations);
    setSelectedRating(tempRatingRange);
    setSelectedInterviewDate(tempInterviewDatePreset);

    // Update the API filters
    setFilters((prev) => ({
      ...prev,
      status: tempSelectedStatus,
      positions: tempSelectedPositions,
      modes: tempSelectedModes,
      interviewers: tempSelectedInterviewers,
      recommendations: tempSelectedRecommendations,
      ratingMin: tempRatingRange.min,
      ratingMax: tempRatingRange.max,
      interviewDate: tempInterviewDatePreset,
      page: 0, // Reset to first page when applying filters
    }));

    setIsFilterActive(
      tempSelectedStatus.length > 0 ||
      tempSelectedPositions.length > 0 ||
      tempSelectedModes.length > 0 ||
      tempSelectedInterviewers.length > 0 ||
      tempSelectedRecommendations.length > 0 ||
      tempRatingRange.min !== "" ||
      tempRatingRange.max !== "" ||
      tempInterviewDatePreset !== ""
    );
    setFilterPopupOpen(false);
    setFilteredFeedbacks(feedbacks);

    // const filtered = feedbacks.filter((f) => {
    //   // Status filter
    //   const matchesStatus =
    //     tempSelectedStatus.length === 0 ||
    //     tempSelectedStatus.includes(f.status || "");

    //   // Position filter
    //   const matchesPosition =
    //     tempSelectedPositions.length === 0 ||
    //     (f.positionId && tempSelectedPositions.includes(f.positionId._id));

    //   // Interview Mode filter
    //   const matchesMode =
    //     tempSelectedModes.length === 0 ||
    //     (f.interviewRoundId?.interviewMode &&
    //       tempSelectedModes.includes(f.interviewRoundId.interviewMode));

    //   // Interviewer filter
    //   const matchesInterviewer =
    //     tempSelectedInterviewers.length === 0 ||
    //     (f.interviewerId &&
    //       tempSelectedInterviewers.includes(f.interviewerId._id));

    //   // Recommendation filter
    //   const matchesRecommendation =
    //     tempSelectedRecommendations.length === 0 ||
    //     (f.overallImpression?.recommendation &&
    //       tempSelectedRecommendations.includes(
    //         f.overallImpression.recommendation
    //       ));

    //   // Rating range filter
    //   const rating = f.overallImpression?.overallRating || 0;
    //   const matchesRating =
    //     (tempRatingRange.min === "" || rating >= Number(tempRatingRange.min)) &&
    //     (tempRatingRange.max === "" || rating <= Number(tempRatingRange.max));

    //   // Interview date filter
    //   const matchesInterviewDate = () => {
    //     if (!tempInterviewDatePreset) return true;
    //     if (!f.interviewRoundId?.dateTime) return false;
    //     const interviewDate = new Date(
    //       f.interviewRoundId.dateTime.split(" ")[0]
    //     );
    //     const now = new Date();
    //     const daysDiff = Math.floor(
    //       (now - interviewDate) / (1000 * 60 * 60 * 24)
    //     );

    //     switch (tempInterviewDatePreset) {
    //       case "last7":
    //         return daysDiff <= 7;
    //       case "last30":
    //         return daysDiff <= 30;
    //       case "last90":
    //         return daysDiff <= 90;
    //       default:
    //         return true;
    //     }
    //   };

    //   // Search filter
    //   const candidateName = f.candidateId
    //     ? `${f.candidateId.FirstName || ""} ${f.candidateId.LastName || ""}`
    //     : "";
    //   const positionTitle = f.positionId?.title || "";
    //   const fields = [
    //     f.feedbackCode,
    //     candidateName,
    //     positionTitle,
    //     f.status,
    //   ].filter(Boolean);
    //   const matchesSearch = fields.some((field) =>
    //     field.toString().toLowerCase().includes(searchQuery.toLowerCase())
    //   );

    //   return (
    //     matchesStatus &&
    //     matchesPosition &&
    //     matchesMode &&
    //     matchesInterviewer &&
    //     matchesRecommendation &&
    //     matchesRating &&
    //     matchesInterviewDate() &&
    //     matchesSearch
    //   );
    // });
    // setFilteredFeedbacks(filtered);
  };
  // ------------------------------v1.0.3 >
  const handleClearFilters = () => {
    setSelectedStatus([]);
    setSelectedPositions([]);
    setSelectedModes([]);
    setSelectedInterviewers([]);
    setSelectedRecommendations([]);
    setSelectedRating({ min: "", max: "" });
    setSelectedInterviewDate("");
    setTempSelectedStatus([]);
    setTempSelectedPositions([]);
    setTempSelectedModes([]);
    setTempSelectedInterviewers([]);
    setTempSelectedRecommendations([]);
    setTempRatingRange({ min: "", max: "" });
    setTempInterviewDatePreset("");
    setIsFilterActive(false);
    setFilteredFeedbacks(feedbacks);

    // Clear API filters
    setFilters((prev) => ({
      ...prev,
      status: [],
      positions: [],
      modes: [],
      interviewers: [],
      recommendations: [],
      ratingMin: "",
      ratingMax: "",
      interviewDate: "",
      page: 0,
    }));
  };

  const handleFilterIconClick = () => {
    setFilterPopupOpen(!isFilterPopupOpen);
  };

  // Helper function to normalize spaces for better search
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
    const normalizedQuery = normalizeSpaces(e.target.value);

    // const filtered = feedbacks.filter((f) => {
    //   // Enhanced search across more fields
    //   const candidateName = f.candidateId
    //     ? `${f.candidateId.FirstName || ""} ${f.candidateId.LastName || ""}`
    //     : "";
    //   const candidateEmail = f.candidateId?.Email || "";
    //   const positionTitle = f.positionId?.title || "";
    //   const positionCompany = f.positionId?.companyname || "";
    //   const positionLocation = f.positionId?.Location || "";
    //   const interviewerName = f.interviewerId
    //     ? `${f.interviewerId.firstName || ""} ${f.interviewerId.lastName || ""}`
    //     : "";
    //   const interviewMode = f.interviewRoundId?.interviewMode || "";
    //   const recommendation = f.overallImpression?.recommendation || "";

    //   const fields = [
    //     f.feedbackCode,
    //     candidateName,
    //     candidateEmail,
    //     positionTitle,
    //     positionCompany,
    //     positionLocation,
    //     interviewerName,
    //     interviewMode,
    //     f.status,
    //     recommendation,
    //   ].filter(Boolean);

    //   const matchesSearch =
    //     e.target.value === "" ||
    //     fields.some((field) =>
    //       normalizeSpaces(field).includes(normalizedQuery)
    //     );
    //   return matchesSearch;
    // });
    // setFilteredFeedbacks(filtered);
  };
  // ------------------------------v1.0.3 >
  // const nextPage = () => {
  //   setCurrentPage((prev) =>
  //     Math.min(prev + 1, Math.ceil(filteredFeedbacks.length / rowsPerPage) - 1)
  //   );
  // };

  // const prevPage = () => {
  //   setCurrentPage((prev) => Math.max(prev - 1, 0));
  // };

  // Pagination handlers
  const nextPage = () => {
    if (paginationInfo.currentPage < paginationInfo.totalPages - 1) {
      setFilters((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  const prevPage = () => {
    if (paginationInfo.currentPage > 0) {
      setFilters((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  const handleView = (feedback) => {
    navigate(`/feedback/view/${feedback._id}`, {
      state: { feedback: { ...feedback }, mode: "view" },
    });
  };

  const handleEdit = (feedback) => {
    navigate(`/feedback/edit/${feedback._id}`, {
      state: { feedback: { ...feedback }, mode: "edit" },
    });
  };

  const handleSummarize = (feedback) => {
    setSummaryData({
      candidate_name: feedback.candidateId
        ? `${feedback.candidateId.FirstName || ""} ${feedback.candidateId.LastName || ""
        }`
        : "Unknown",
      candidate_job_title: feedback.positionId?.title || "Unknown Position",
      overall_impression:
        feedback.overallImpression?.note || "No overall impression provided",
      recommendation:
        feedback.overallImpression?.recommendation || "Not specified",
      skills: feedback.skills || [],
      status: feedback.status || "Not specified",
      interview_mode:
        feedback.interviewRoundId?.interviewMode || "Not specified",
      scheduled_datetime:
        feedback.interviewRoundId?.dateTime || "Not specified",
      interviewer: feedback.interviewerId
        ? `${feedback.interviewerId.firstName || ""} ${feedback.interviewerId.lastName || ""
        }`
        : "Not specified",
    });
    setShowSummaryModal(true);
  };

  const handleAddFeedback = () => {
    navigate("/dashboard/feedbacks/add");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "draft":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
          />
        ))}
      </div>
    );
  };

  // -------------------------- Dynamic Empty State Messages using Utility -------------------------
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  // Use totalItems from the server response as the initial count
  const initialDataCount = paginationInfo.totalItems || 0;
  const currentFilteredCount = filteredFeedbacks.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "Feedback" // Entity Name
  );
  // -------------------------- Dynamic Empty State Messages using Utility -------------------------

  const tableColumns = getFeedbackColumns(navigate);

  const tableActions = getFeedbackActions(navigate, {
    callbacks: {
      onSummarize: handleSummarize,
    },
  });

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
          <main className="px-6">
            <div className="sm:px-0">
              <Header
                title="Feedback"
                addButtonText="Add Feedback"
                onAddClick={handleAddFeedback}
                canCreate={false}
              />
              <Toolbar
                view={viewMode}
                setView={setViewMode}
                searchQuery={searchQuery}
                onSearch={handleSearchInputChange}
                currentPage={currentPage}
                //totalPages={totalPages}
                totalPages={
                  Math.ceil(filteredFeedbacks.length / rowsPerPage) || 1
                }
                onPrevPage={prevPage}
                onNextPage={nextPage}
                onFilterClick={handleFilterIconClick}
                isFilterActive={isFilterActive}
                isFilterPopupOpen={isFilterPopupOpen}
                dataLength={filteredFeedbacks.length}
                searchPlaceholder="Search Feedback..."
                filterIconRef={filterIconRef}
              />
            </div>
          </main>
        </div>

        {/*  v1.0.5 <---------------------------------------------------------------------------------------- */}
        <main className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {viewMode === "table" ? (
                <div className="overflow-x-autow-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                  <TableView
                    //data={currentRows}
                    data={filteredFeedbacks.slice(startIndex, endIndex)}
                    columns={tableColumns}
                    actions={tableActions}
                    loading={loading}
                    emptyState={emptyStateMessage}
                    className="table-fixed w-full"
                  />
                </div>
              ) : (
                <FeedbackKanban
                  //feedbacks={currentRows}
                  feedbacks={filteredFeedbacks.slice(startIndex, endIndex)}
                  loading={loading}
                  onView={handleView}
                  onEdit={handleEdit}
                />
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
                              // v1.0.4 <-------------------------------------------------------------
                              className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            // v1.0.4 ------------------------------------------------------------->
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rating Range Filter */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsRatingOpen(!isRatingOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Overall Rating
                      </span>
                      {isRatingOpen ? (
                        <MdKeyboardArrowUp className="text-xl text-gray-700" />
                      ) : (
                        <MdKeyboardArrowDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isRatingOpen && (
                      <div className="mt-2 pl-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={tempRatingRange.min}
                            onChange={(e) => handleRatingChange(e, "min")}
                            placeholder="Min (1)"
                            className="w-20 p-1 border rounded"
                            min="1"
                            max="5"
                          />
                          <span className="text-sm">to</span>
                          <input
                            type="number"
                            value={tempRatingRange.max}
                            onChange={(e) => handleRatingChange(e, "max")}
                            placeholder="Max (5)"
                            className="w-20 p-1 border rounded"
                            min="1"
                            max="5"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interview Date Filter */}
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
                        <MdKeyboardArrowUp className="text-xl text-gray-700" />
                      ) : (
                        <MdKeyboardArrowDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isInterviewDateOpen && (
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
                              checked={tempInterviewDatePreset === option.value}
                              onChange={(e) =>
                                setTempInterviewDatePreset(e.target.value)
                              }
                              className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Position Filter */}
                  {(() => {
                    const positionMap = new Map();

                    feedbacks?.forEach((feedback) => {
                      if (
                        feedback.positionId &&
                        !positionMap.has(feedback.positionId._id)
                      ) {
                        positionMap.set(feedback.positionId._id, {
                          id: feedback.positionId._id,
                          title:
                            feedback.positionId.title || "Unknown Position",
                        });
                      }
                    });

                    const positions = Array.from(positionMap.values()).sort(
                      (a, b) => a.title.localeCompare(b.title)
                    );

                    return positions.length > 0 ? (
                      <div>
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => setIsPositionOpen(!isPositionOpen)}
                        >
                          <span className="font-medium text-gray-700">
                            Position
                          </span>
                          {isPositionOpen ? (
                            <MdKeyboardArrowUp className="text-xl text-gray-700" />
                          ) : (
                            <MdKeyboardArrowDown className="text-xl text-gray-700" />
                          )}
                        </div>
                        {isPositionOpen && (
                          <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                            {positions.map((position) => (
                              <label
                                key={position.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempSelectedPositions.includes(
                                    position.id
                                  )}
                                  onChange={() =>
                                    handlePositionToggle(position.id)
                                  }
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">
                                  {position.title.charAt(0).toUpperCase() +
                                    position.title.slice(1)}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {/* Dynamic Interview Mode Filter */}
                  {(() => {
                    const uniqueModes = [
                      ...new Set(
                        feedbacks
                          ?.map((f) => f.interviewRoundId?.interviewMode)
                          .filter(Boolean)
                      ),
                    ];

                    return uniqueModes.length > 0 ? (
                      <div>
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => setIsModeOpen(!isModeOpen)}
                        >
                          <span className="font-medium text-gray-700">
                            Interview Mode
                          </span>
                          {isModeOpen ? (
                            <MdKeyboardArrowUp className="text-xl text-gray-700" />
                          ) : (
                            <MdKeyboardArrowDown className="text-xl text-gray-700" />
                          )}
                        </div>
                        {isModeOpen && (
                          <div className="mt-1 space-y-1 pl-3">
                            {uniqueModes.map((mode) => (
                              <label
                                key={mode}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempSelectedModes.includes(mode)}
                                  onChange={() => handleModeToggle(mode)}
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">{mode}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {/* Dynamic Recommendation Filter */}
                  {(() => {
                    const uniqueRecommendations = [
                      ...new Set(
                        feedbacks
                          ?.map((f) => f.overallImpression?.recommendation)
                          .filter(Boolean)
                      ),
                    ];

                    return uniqueRecommendations.length > 0 ? (
                      <div>
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() =>
                            setIsRecommendationOpen(!isRecommendationOpen)
                          }
                        >
                          <span className="font-medium text-gray-700">
                            Recommendation
                          </span>
                          {isRecommendationOpen ? (
                            <MdKeyboardArrowUp className="text-xl text-gray-700" />
                          ) : (
                            <MdKeyboardArrowDown className="text-xl text-gray-700" />
                          )}
                        </div>
                        {isRecommendationOpen && (
                          <div className="mt-1 space-y-1 pl-3">
                            {uniqueRecommendations.map((recommendation) => (
                              <label
                                key={recommendation}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempSelectedRecommendations.includes(
                                    recommendation
                                  )}
                                  onChange={() =>
                                    handleRecommendationToggle(recommendation)
                                  }
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">
                                  {recommendation.charAt(0).toUpperCase() +
                                    recommendation.slice(1)}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {/* Dynamic Interviewer Filter */}
                  {(() => {
                    const interviewerMap = new Map();

                    feedbacks?.forEach((feedback) => {
                      if (
                        feedback.interviewRoundId?.interviewerType ===
                        "Internal" &&
                        feedback.interviewerId &&
                        !interviewerMap.has(feedback.interviewerId._id)
                      ) {
                        interviewerMap.set(feedback.interviewerId._id, {
                          id: feedback.interviewerId._id,
                          name:
                            `${feedback.interviewerId.firstName || ""} ${feedback.interviewerId.lastName || ""
                              }`.trim() || "Unknown",
                        });
                      }
                    });

                    const interviewers = Array.from(
                      interviewerMap.values()
                    ).sort((a, b) => a.name.localeCompare(b.name));

                    return interviewers.length > 0 ? (
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
                            {interviewers.map((interviewer) => (
                              <label
                                key={interviewer.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={tempSelectedInterviewers.includes(
                                    interviewer.id
                                  )}
                                  onChange={() =>
                                    handleInterviewerToggle(interviewer.id)
                                  }
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">
                                  {interviewer.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              </FilterPopup>
            </motion.div>
          </div>
        </main>
        {/*  v1.0.5 ----------------------------------------------------------------------------------------> */}
      </div>
      <SummarizedFeedbackModal
        open={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        data={summaryData}
      />
    </>
  );
};

export default Feedback;
