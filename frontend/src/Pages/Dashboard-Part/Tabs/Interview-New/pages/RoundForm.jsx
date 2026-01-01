// v1.0.0 - Ashok - removed extra status text
// v1.0.1 - Ashok - Added scroll to first error functionality
// v1.0.2 - Ashraf - Added sending interview email,creating custom url for each user
// v1.0.3 - Ashok - fixed button text while loading from Creating links to Creating Links
//<-----v1.0.4----Venkatesh-----default and enforce scheduledDate when switching to "scheduled" after 2 hours from now
// v1.0.5 - Ashok - Improved responsiveness

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../CommonCode-AllTabs/Breadcrumb";

import {
  ChevronDown,
  X,
  User,
  Users,
  Trash2,
  Clock,
  Calendar,
  ChevronUp,
  //   Info,
} from "lucide-react";
import { Button } from "../../CommonCode-AllTabs/ui/button.jsx";
import axios from "axios";
import InternalInterviews from "./Internal-Or-Outsource/InternalInterviewers.jsx";
import OutsourcedInterviewerModal from "./Internal-Or-Outsource/OutsourceInterviewer.jsx";
import Cookies from "js-cookie";
import { validateInterviewRoundData } from "../../../../../utils/interviewRoundValidation.js";

import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../../config";
import QuestionBank from "../../QuestionBank-Tab/QuestionBank.jsx";

import { useInterviews } from "../../../../../apiHooks/useInterviews.js";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import { useInternalInterviewUsage } from "../../../../../apiHooks/useInternalInterviewUsage.js";
// import toast from "react-hot-toast";
// Test import to see if the file can be imported
// import { processMeetingUrls } from "../../../../../utils/meetingUrlGenerator.js";
import LoadingButton from "../../../../../Components/LoadingButton";
// v1.0.1 <----------------------------------------------------------------------------

import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError.js";
// import { shareAssessmentAPI } from "../../Assessment-Tab/AssessmentShareAPI.jsx";
// import { useQueryClient } from "@tanstack/react-query";
import DropdownWithSearchField from "../../../../../Components/FormFields/DropdownWithSearchField.jsx";
import InputField from "../../../../../Components/FormFields/InputField.jsx";
import DescriptionField from "../../../../../Components/FormFields/DescriptionField.jsx";
import InfoGuide from "../../CommonCode-AllTabs/InfoCards.jsx";
import { notify } from "../../../../../services/toastService.js";
import { ROUND_TITLES } from "../../CommonCode-AllTabs/roundTitlesConfig.js";
// import InternalInterviewUsageDisplay from "../../../../../Components/InternalInterviewUsageDisplay.jsx";
import { useVideoSettingsQuery } from "../../../../../apiHooks/VideoDetail.js";
import { useGroupsQuery } from "../../../../../apiHooks/useInterviewerGroups.js";
import DateChangeConfirmationModal from "../components/DateChangeConfirmationModal.jsx";

const {
  calculateExpiryDate,
} = require("../../../../../utils/calculateExpiryDateForInterviewRequests.js");

// v1.0.1 ---------------------------------------------------------------------------->
const moment = require("moment-timezone");

const formatDateTime = (date, showDate = true) => {
  if (!date) return "";

  // Validate date
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn("Invalid date passed to formatDateTime:", date);
    return "";
  }

  // Convert UTC date to local timezone for display
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Format date if required
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = d.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  // Format time
  const formattedTime = d.toLocaleTimeString("en-US", {
    timeZone: timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return showDate ? `${formattedDate} ${formattedTime}` : formattedTime;
};

const RoundFormInterviews = () => {
  // Add useScrollLock hook at the beginning
  const {
    useInterviewDetails,
    // interviewData,
    isMutationLoading,
    saveInterviewRound,
    updateInterviewRound,
    // updateRoundWithMeetingLinks,
  } = useInterviews();

  const ASSESSMENT_DROPDOWN_LIMIT = 50;
  const [assessmentLimit, setAssessmentLimit] = useState(
    ASSESSMENT_DROPDOWN_LIMIT
  );
  const [assessmentSearch, setAssessmentSearch] = useState("");

  const {
    assessmentData,
    totalCount: totalAssessments,
    isQueryLoading: isAssessmentQueryLoading,
    fetchAssessmentQuestions,
    useAssessmentById,
  } = useAssessments({
    page: 0,
    limit: assessmentLimit,
    ...(assessmentSearch && { search: assessmentSearch.trim() }),
  });
  // const { groups } = useCustomContext();
  // Get groups data and mutations from TanStack Query
  const { data: groups = [] } = useGroupsQuery();
  const { checkInternalInterviewUsage, isChecking } =
    useInternalInterviewUsage();
  // v1.0.2 <-----------------------------------------

  const {
    data,
    // isLoading,
    // isError,
    // error,
    // refetch,
    // isOrganization,
  } = useVideoSettingsQuery();

  // State for meeting creation loading
  const [isMeetingCreationLoading, setIsMeetingCreationLoading] =
    useState(false);
  const [meetingCreationProgress, setMeetingCreationProgress] = useState("");
  const [selectedMeetingPlatform, setSelectedMeetingPlatform] =
    useState("zoom"); // Default to Google Meet googlemeet
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions
  // v1.0.2 <-----------------------------------------

  const { interviewId, roundId } = useParams();
  const { data: interviewDetails } = useInterviewDetails(interviewId);
  // const stateisReschedule = useLocation().state;

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;
  const [errors, setErrors] = useState({});

  const interview = interviewDetails;
  // ||
  // interviewData?.find((interview) => interview._id === interviewId);
  const [assessmentTemplate, setAssessmentTemplate] = useState({
    assessmentId: "",
    assessmentName: "",
  });

  const [candidate, setCandidate] = useState(null);
  const [position, setPosition] = useState(null);
  const [rounds, setRounds] = useState(null);

  const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);
  const [isInternalInterviews, setInternalInterviews] = useState(false);
  // const [template, setTemplate] = useState(null);
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [ownerData, setOwnerData] = useState(null);
  const [selectedAssessmentData, setSelectedAssessmentData] = useState(null);

  const navigate = useNavigate();
  const [roundTitle, setRoundTitle] = useState("");
  const [customRoundTitle, setCustomRoundTitle] = useState("");
  const [interviewMode, setInterviewMode] = useState("");
  const [status, setStatus] = useState("");
  const [instructions, setInstructions] = useState("");
  const [sequence, setSequence] = useState(1);
  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] =
    useState(false);
  // const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [interviewQuestionsList, setInterviewQuestionsList] = useState([]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);

  const [interviewType, setInterviewType] = useState("instant"); // "instant" or "scheduled"
  const [scheduledDate, setScheduledDate] = useState(""); // Start Date & Time
  const [duration, setDuration] = useState(60); // Duration in minutes
  const [startTime, setStartTime] = useState(""); // Final Start Time
  const [endTime, setEndTime] = useState(""); // Calculated End Time
  const [combinedDateTime, setCombinedDateTime] = useState("");
  const [interviewerViewType, setInterviewerViewType] = useState("individuals"); // group or individuals
  const [interviewerGroupName, setInterviewerGroupName] = useState("");
  const [interviewerGroupId, setInterviewerGroupId] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [internalInterviewers, setInternalInterviewers] = useState([]);

  const [externalInterviewers, setExternalInterviewers] = useState([]);
  // Max hourly rate across all outsourced interviewers (used only for external rounds)
  const [externalMaxHourlyRate, setExternalMaxHourlyRate] = useState(0);
  const [showDateChangeConfirmation, setShowDateChangeConfirmation] =
    useState(false);
  const [pendingDateChange, setPendingDateChange] = useState(null); // { type: 'interviewType' | 'scheduledDate' | 'duration', value: any }
  const [originalScheduledDate, setOriginalScheduledDate] =
    useState(scheduledDate);
  const [originalInterviewType, setOriginalInterviewType] =
    useState(interviewType);

  // Add this state near your other state declarations
  const [hasManuallyClearedInterviewers, setHasManuallyClearedInterviewers] =
    useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // while editing
  const isEditing = !!roundId && roundId !== "new";
  const roundEditData = isEditing && rounds?.find((r) => r._id === roundId);
  const location = useLocation();
  const isReschedule = location.state?.isReschedule || false;

  const handleAssessmentMenuScrollToBottom = () => {
    if (isAssessmentQueryLoading) return;
    if (!totalAssessments || assessmentLimit >= totalAssessments) return;

    setAssessmentLimit((prev) => prev + ASSESSMENT_DROPDOWN_LIMIT);
  };

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!organization && userId) {
        try {
          const response = await axios.get(
            `${config.REACT_APP_API_URL}/users/owner/${userId}`
          );

          setOwnerData(response.data);
        } catch (error) {
          console.error("Error fetching owner data:", error);
        }
      }
    };
    fetchOwnerData();
  }, [organization, userId]);

  useEffect(() => {
    if (interview) {
      setCandidate(interview?.candidateId || null);
      setPosition(interview?.positionId || null);
      setRounds(interview?.rounds || []);
      setSelectedMeetingPlatform(data?.data?.defaultProvider);
      // setTemplate(interview?.templateId || null)
    }
  }, [interview, data]);

  // useEffect(() => {
  //   if (
  //     selectedInterviewType === "External" &&
  //     externalInterviewers.length > 0
  //   ) {
  //     setStatus("RequestSent");
  //   } else if (selectedInterviewType !== "External") {
  //     internalInterviewers.length > 0
  //       ? setStatus("Scheduled")
  //       : setStatus("Draft");
  //   }
  // }, [selectedInterviewType, externalInterviewers, internalInterviewers]);

  //<-----v1.0.4----
  // Helper: format a Date to 'YYYY-MM-DDTHH:mm' for <input type="datetime-local"/>
  const formatForDatetimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  // Helper: minimum selectable scheduled time = now + 2 hours (local time)
  const twoHoursFromNowLocal = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setSeconds(0, 0); // strip seconds/millis for consistency
    return formatForDatetimeLocal(d);
  };

  //-----v1.0.4---->

  // v1.0.1 <-------------------------------------------------------------------------
  const fieldRefs = {
    roundTitle: useRef(null),
    interviewMode: useRef(null),
    sequence: useRef(null),
    assessmentTemplate: useRef(null),
    instructions: useRef(null),
  };

  const updateTimes = useCallback(
    (newDuration) => {
      let start = null;
      let end = null;

      if (interviewType === "instant") {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15); // Start after 15 min

        // Convert to UTC
        const localTimeStr = moment(now)?.format("YYYY-MM-DD HH:mm");
        start = moment
          ?.tz(
            localTimeStr,
            "YYYY-MM-DD HH:mm",
            Intl.DateTimeFormat().resolvedOptions().timeZone
          )
          .utc()
          .toDate();

        const endTime = new Date(start);
        endTime.setMinutes(endTime.getMinutes() + newDuration);
        end = endTime;
      } else if (interviewType === "scheduled" && scheduledDate) {
        try {
          // Validate scheduledDate before using it
          const date = new Date(scheduledDate);
          if (isNaN(date.getTime())) {
            console.warn("Invalid scheduledDate:", scheduledDate);
            return; // Exit if date is invalid
          }

          // Convert scheduled date from local timezone to UTC
          const localTimeStr = moment(date).format("YYYY-MM-DD HH:mm");
          start = moment
            ?.tz(
              localTimeStr,
              "YYYY-MM-DD HH:mm",
              Intl.DateTimeFormat().resolvedOptions().timeZone
            )
            .utc()
            .toDate();

          const endTime = new Date(start);
          endTime.setMinutes(endTime.getMinutes() + newDuration);
          end = endTime;
        } catch (error) {
          console.error("Error processing scheduled date:", error);
          return; // Exit on error
        }
      }

      if (start && end) {
        // Additional validation before setting state
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn("Invalid start or end time calculated");
          return;
        }

        setStartTime(start.toISOString()); // Store in ISO for backend
        setEndTime(end.toISOString()); // Store in ISO for backend

        // ✅ Ensure start shows date & time, but end shows only time
        const formattedStart = formatDateTime(start, true);
        const formattedEnd = formatDateTime(end, false);

        // Additional validation for formatted dates
        if (formattedStart && formattedEnd) {
          let combinedDateTime = `${formattedStart} - ${formattedEnd}`;
          setCombinedDateTime(combinedDateTime);
        }
      }
    },
    [
      interviewType,
      scheduledDate,
      duration,
      isEditing,
      roundEditData,
      combinedDateTime,
    ]
  );

  // UPDATED: Set initial load complete after first render
  useEffect(() => {
    if (isEditing && roundEditData) {
      setIsInitialLoad(false);
    }
  }, [isEditing, roundEditData]);

  // Trigger time update when editing data is fully loaded OR when duration changes for new form
  useEffect(() => {
    if (
      (isEditing && roundEditData && duration && interviewType) ||
      (!isEditing && duration && interviewType)
    ) {
      updateTimes(duration);
    }
  }, [isEditing, roundEditData, duration, interviewType, updateTimes]);

  // Also update when duration changes
  useEffect(() => {
    if (startTime) {
      updateTimes();
    }
  }, [duration]);

  //<-----v1.0.4----
  // Default and enforce scheduledDate when switching to "scheduled"
  // useEffect(() => {
  //   if (interviewType === "scheduled") {
  //     const minVal = twoHoursFromNowLocal();
  //     if (!scheduledDate || scheduledDate < minVal) {
  //       setScheduledDate(minVal);
  //     }
  //   }
  // }, [interviewType]);

  useEffect(() => {
    if (interviewType === "scheduled") {
      const minVal = twoHoursFromNowLocal();
      if (!scheduledDate || scheduledDate < minVal) {
        setScheduledDate(minVal);
        // Trigger time calculation after setting scheduled date
        setTimeout(() => updateTimes(duration), 100);
      }
    }
  }, [interviewType]);
  //-----v1.0.4---->

  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      setInterviewQuestionsList((prevList) => {
        if (prevList.some((q) => q.questionId === question.questionId)) {
          return prevList;
        }
        return [
          ...prevList,
          {
            ...question,

            mandatory: "false", // Default to false when adding a new question
          },
        ]; // Add new question
      });

      setErrors((prev) => ({
        ...prev,
        questions: undefined,
      }));
    }
  };

  const handleToggleMandatory = (questionId) => {
    setInterviewQuestionsList((prev) =>
      prev.map((question) =>
        question.questionId === questionId
          ? {
              ...question,
              snapshot: {
                ...question.snapshot,
                mandatory:
                  question.snapshot.mandatory === "true" ? "false" : "true",
              },
            }
          : question
      )
    );
  };

  const handleRemoveQuestion = (questionId, e) => {
    e?.preventDefault(); // Prevent default behavior if event is provided
    e?.stopPropagation(); // Stop event bubbling if event is provided

    setInterviewQuestionsList((prev) =>
      prev.filter((question) => question.questionId !== questionId)
    );
    setRemovedQuestionIds((prev) => [...prev, questionId]);
  };

  const [isCustomRoundTitle, setIsCustomRoundTitle] = useState(false);

  // const handleSuggestedTabClick = (questionType) => {
  //   setActiveTab("SuggesstedQuestions");
  // };

  // const handleFavoriteTabClick = (questionType) => {
  //   setActiveTab("MyQuestionsList");
  // };

  // const [error, setError] = useState(null);
  useEffect(() => {
    // Clean up when component unmounts or roundId changes
    return () => {
      setInternalInterviewers([]);
      setExternalInterviewers([]);
      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setInterviewerViewType("individuals");
      setSelectedInterviewType(null);
    };
  }, [roundId]);

  useEffect(() => {
    // Clear interviewers when switching between internal/external
    if (
      selectedInterviewType === "External" &&
      internalInterviewers.length > 0
    ) {
      setInternalInterviewers([]);
      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setInterviewerViewType("individuals");
    }
  }, [selectedInterviewType]);

  // Add this cleanup effect
  useEffect(() => {
    return () => {
      // Clean up all modal states when component unmounts
      setShowOutsourcePopup(false);
      setInternalInterviews(false);
    };
  }, [roundId]);

  // console.log("roundEditData roundEditData", roundEditData);

  const editingAssessmentId =
    isEditing && roundEditData && roundEditData.assessmentId
      ? roundEditData.assessmentId
      : null;

  const { assessmentById: editingAssessment } = useAssessmentById(
    editingAssessmentId,
    {}
  );

  const assessmentOptions = React.useMemo(() => {
    const baseOptions = Array.isArray(assessmentData)
      ? assessmentData.map((a) => {
          const titleLabel = a.AssessmentTitle || "Untitled Assessment";
          const typeLabel = a.type
            ? a.type.charAt(0).toUpperCase() + a.type.slice(1)
            : "";

          return {
            value: a._id,
            label: (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "98%",
                }}
              >
                <span>{titleLabel}</span>
                {typeLabel && (
                  <span
                    className={
                      "text-md " +
                      (a.type === "custom"
                        ? "text-custom-blue"
                        : "text-green-600")
                    }
                  >
                    {typeLabel}
                  </span>
                )}
              </div>
            ),
            searchLabel: titleLabel,
          };
        })
      : [];

    if (editingAssessmentId && editingAssessment) {
      const exists = baseOptions.some(
        (opt) => opt.value === editingAssessmentId
      );

      if (!exists) {
        const editingTitleLabel =
          editingAssessment.AssessmentTitle ||
          assessmentTemplate?.assessmentName ||
          "Untitled Assessment";

        const editingTypeLabel = editingAssessment.type
          ? editingAssessment.type.charAt(0).toUpperCase() +
            editingAssessment.type.slice(1)
          : "";

        baseOptions.push({
          value: editingAssessmentId,
          label: (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "98%",
              }}
            >
              <span>{editingTitleLabel}</span>
              {editingTypeLabel && (
                <span
                  className={
                    "text-md " +
                    (editingAssessment.type === "custom"
                      ? "text-custom-blue"
                      : "text-green-600")
                  }
                >
                  {editingTypeLabel}
                </span>
              )}
            </div>
          ),
          searchLabel: editingTitleLabel,
        });
      }
    }

    return baseOptions;
  }, [
    assessmentData,
    editingAssessmentId,
    editingAssessment,
    assessmentTemplate?.assessmentName,
  ]);

  // Add this reset effect near other useEffects
  useEffect(() => {
    setHasManuallyClearedInterviewers(false);
  }, [roundId]);

  // Add this cleanup effect
  useEffect(() => {
    return () => {
      // Clean up all modal states when component unmounts
      setShowOutsourcePopup(false);
      setInternalInterviews(false);
    };
  }, [roundId]);

  // Add this useEffect to reset the flag when roundId changes
  // useEffect(() => {
  //   setHasManuallyClearedInterviewers(false);
  // }, [roundId]);

  // UPDATED: Modified - Only clear external interviewers on date/time changes AFTER initial load
  // useEffect(() => {
  //   // NEW: Skip clearing during initial load
  //   if (isInitialLoad) {
  //     return;
  //   }

  //   // NEW: Skip if we're in edit mode and haven't manually changed anything yet
  //   if (isEditing && !hasManuallyClearedInterviewers && roundEditData) {
  //     return;
  //   }

  //   // Clear external interviewers when date/time changes (but not on initial load)
  //   if (
  //     externalInterviewers.length > 0 &&
  //     (scheduledDate || interviewType === "instant")
  //   ) {
  //     console.log("🔄 Clearing external interviewers due to date/time change");
  //     setExternalInterviewers([]);
  //     setHasManuallyClearedInterviewers(true);

  //     // If only external interviewers were selected, reset the interview type
  //     if (
  //       selectedInterviewType === "External" &&
  //       internalInterviewers.length === 0
  //     ) {
  //       setSelectedInterviewType(null);
  //     }

  //     // Reset status if it was RequestSent
  //     if (status === "RequestSent") {
  //       setStatus("Draft");
  //     }
  //   }
  // }, [scheduledDate, interviewType]); // Keep dependencies but use guards above

  // UPDATED: Modified - Handle combinedDateTime changes
  // useEffect(() => {
  //   // NEW: Skip during initial load
  //   if (isInitialLoad) {
  //     return;
  //   }

  //   // NEW: Skip if we're in edit mode and haven't manually changed anything yet
  //   if (isEditing && !hasManuallyClearedInterviewers && roundEditData) {
  //     return;
  //   }

  //   if (
  //     interviewType === "scheduled" &&
  //     combinedDateTime &&
  //     externalInterviewers.length > 0
  //   ) {
  //     console.log(
  //       "🔄 Clearing external interviewers due to combinedDateTime change"
  //     );
  //     setExternalInterviewers([]);
  //     setHasManuallyClearedInterviewers(true);

  //     if (
  //       selectedInterviewType === "External" &&
  //       internalInterviewers.length === 0
  //     ) {
  //       setSelectedInterviewType(null);
  //     }

  //     // Reset status if it was RequestSent
  //     if (status === "RequestSent") {
  //       setStatus("Draft");
  //     }
  //   }
  // }, [combinedDateTime]);

  // UPDATED: Fix the status setting logic
  // useEffect(() => {
  //   // NEW: Skip status updates during initial load in edit mode
  //   if (isEditing && isInitialLoad) {
  //     return;
  //   }

  //   if (
  //     selectedInterviewType === "External" &&
  //     externalInterviewers.length > 0
  //   ) {
  //     setStatus("RequestSent");
  //   } else if (selectedInterviewType === "Internal") {
  //     // NEW: Better logic for internal interviewers
  //     if (internalInterviewers.length > 0) {
  //       // Only set to Scheduled if we have date/time configured
  //       const hasDateTimeConfigured =
  //         interviewType === "instant" ||
  //         (interviewType === "scheduled" && scheduledDate);

  //       setStatus(hasDateTimeConfigured ? "Scheduled" : "Draft");
  //     } else {
  //       setStatus("Draft");
  //     }
  //   } else {
  //     setStatus("Draft");
  //   }
  // }, [
  //   selectedInterviewType,
  //   externalInterviewers,
  //   internalInterviewers,
  //   interviewType,
  //   scheduledDate,
  //   isEditing,
  //   isInitialLoad,
  // ]);

  useEffect(() => {
    if (!isEditing) {
      // For new rounds: set default sequence
      const maxSequence =
        rounds?.length > 0 ? Math.max(...rounds.map((r) => r.sequence)) : 0;
      if (sequence !== maxSequence + 1) {
        setSequence(maxSequence + 1);
      }
      setIsInitialLoad(false);
      return;
    }

    if (!roundEditData || hasManuallyClearedInterviewers) {
      return; // Skip loading if data cleared manually
    }

    // === EDIT MODE: Load data from roundEditData ===
    const foundGroup = groups?.find(
      (g) => g?._id === roundEditData?.interviewerGroupId
    );

    // Assessment
    if (
      roundEditData.roundTitle === "Assessment" &&
      roundEditData.assessmentId
    ) {
      const newAssessmentTemplate = {
        assessmentId: roundEditData.assessmentId,
        assessmentName: editingAssessment?.AssessmentTitle || "",
      };
      setAssessmentTemplate(newAssessmentTemplate);
      setSelectedAssessmentData(editingAssessment || null);
    } else {
      setAssessmentTemplate({ assessmentId: "", assessmentName: "" });
      setSelectedAssessmentData(null);
    }

    // Basic fields
    setRoundTitle(roundEditData.roundTitle || "");
    setInterviewType(roundEditData.interviewType || "instant");
    setInterviewMode(roundEditData.interviewMode || "");
    setSelectedInterviewType(roundEditData.interviewerType || null);
    setInterviewQuestionsList(roundEditData.questions || []);
    if (status !== roundEditData.status) setStatus(roundEditData.status);
    setInstructions(roundEditData.instructions || "");
    setSequence(roundEditData.sequence || 1);
    setDuration(Number(roundEditData.duration) || 60);
    setInterviewerGroupName(foundGroup?.name || "");
    setInterviewerGroupId(roundEditData?.interviewerGroupId || "");
    setInterviewerViewType(roundEditData?.interviewerViewType || "individuals");

    // Store original scheduling values
    setOriginalScheduledDate(scheduledDate);
    setOriginalInterviewType(interviewType);

    // === Load Interviewers Safely ===
    // if (roundEditData.interviewers && roundEditData.interviewers.length > 0) {
    if (roundEditData.interviewerType === "Internal") {
      const normalized = roundEditData.interviewers.map((i) => ({
        _id: i._id,
        firstName: i.firstName || "",
        lastName: i.lastName || "",
        email: i.email || "",
      }));
      setInternalInterviewers(normalized);
      setExternalInterviewers([]);
    } else if (roundEditData.interviewerType === "External") {
      let source = [];

      // Priority 1: Use accepted interviewers if they exist
      if (
        Array.isArray(roundEditData.interviewers) &&
        roundEditData.interviewers.length > 0
      ) {
        source = roundEditData.interviewers;
      }
      // Priority 2: Fall back to pending outsource requests
      else if (
        Array.isArray(roundEditData.pendingOutsourceRequests) &&
        roundEditData.pendingOutsourceRequests.length > 0
      ) {
        source = roundEditData.pendingOutsourceRequests
          .map((req) => req.interviewerId)
          .filter(Boolean); // remove null/undefined
      }

      // Normalize to consistent shape for UI
      const normalized = source.map((i) => ({
        _id: i._id || i.id,
        id: i._id || i.id, // both id and _id for compatibility
        firstName: i.contact?.firstName || i.firstName || "Unknown",
        lastName: i.contact?.lastName || i.lastName || "",
        email: i.contact?.email || i.email || "",
        contact: i.contact || i, // preserve full object if needed
      }));

      console.log("normalized", normalized);

      setExternalInterviewers(normalized);
      setInternalInterviewers([]); // clear internal
    }
    // }
    else {
      // No interviewers in DB → clear both
      setInternalInterviewers([]);
      setExternalInterviewers([]);
      // Only reset type if none exist
      if (!roundEditData.interviewerType) {
        setSelectedInterviewType(null);
      }
    }

    // === Handle scheduled date/time parsing ===
    if (roundEditData.dateTime && roundEditData.interviewType === "scheduled") {
      const match = roundEditData.dateTime.match(
        /^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/
      );
      if (match) {
        let [, day, month, year, hour, minute, ampm] = match;
        let hours = parseInt(hour, 10);
        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        const parsedDate = new Date(
          year,
          month - 1,
          day,
          hours,
          parseInt(minute, 10)
        );

        if (!isNaN(parsedDate.getTime())) {
          setScheduledDate(formatForDatetimeLocal(parsedDate));

          const localTimeStr = moment(parsedDate).format("YYYY-MM-DD HH:mm");
          const utcStart = moment
            .tz(
              localTimeStr,
              "YYYY-MM-DD HH:mm",
              Intl.DateTimeFormat().resolvedOptions().timeZone
            )
            .utc()
            .toDate();
          const utcEnd = new Date(utcStart);
          utcEnd.setMinutes(
            utcEnd.getMinutes() + (Number(roundEditData.duration) || 60)
          );

          setStartTime(utcStart.toISOString());
          setEndTime(utcEnd.toISOString());

          const formattedStart = formatDateTime(utcStart, true);
          const formattedEnd = formatDateTime(utcEnd, false);
          setCombinedDateTime(`${formattedStart} - ${formattedEnd}`);
        }
      }
    }

    // Fetch questions for assessment round
    if (
      roundEditData.roundTitle === "Assessment" &&
      roundEditData.assessmentId
    ) {
      setQuestionsLoading(true);
      fetchAssessmentQuestions(roundEditData.assessmentId).then(({ data }) => {
        setQuestionsLoading(false);
        if (data?.sections) {
          setSectionQuestions(data.sections);
        }
      });
    }

    // NEW: Mark initial load as complete at the end
    setIsInitialLoad(false);
    // For new entries or when manually cleared
    // if (
    //   selectedInterviewType === "External" &&
    //   externalInterviewers.length > 0
    // ) {
    //   setStatus("RequestSent");
    // } else if (
    //   selectedInterviewType === "Internal" &&
    //   internalInterviewers.length > 0
    // ) {
    //   // Only set to Scheduled if we have internal interviewers AND date/time is set
    //   if (
    //     (interviewType === "scheduled" && scheduledDate) ||
    //     interviewType === "instant"
    //   ) {
    //     setStatus("Scheduled");
    //   } else {
    //     setStatus("Draft");
    //   }
    // } else {
    //   setStatus("Draft");
    // }
  }, [
    isEditing,
    roundEditData,
    rounds,
    groups,
    hasManuallyClearedInterviewers,
    editingAssessment,
  ]);

  // SUPER SIMPLE: Just check if field should be disabled
  const shouldDisable = (fieldName) => {
    // Fields that should be disabled in these statuses
    const disabledInStatus = {
      interviewMode: ["RequestSent", "Scheduled", "Rescheduled"],
      duration: ["RequestSent", "Scheduled", "Rescheduled"],
      interviewType: ["RequestSent", "Scheduled", "Rescheduled"],
      scheduledDate: ["RequestSent", "Scheduled", "Rescheduled"],
      internalInterviewersBtn: ["RequestSent", "Scheduled", "Rescheduled"],
      externalInterviewersBtn: ["RequestSent", "Scheduled", "Rescheduled"],
      removeInterviewerBtn: ["RequestSent", "Scheduled", "Rescheduled"],
      clearInterviewersBtn: ["RequestSent", "Scheduled", "Rescheduled"],
      dateChangeConfirmation: ["RequestSent", "Scheduled", "Rescheduled"],
    };

    const statusList = disabledInStatus[fieldName] || [];
    return statusList.includes(status);
  };

  // console.log("ExternalInterviewers", externalInterviewers, status);

  const handleScheduledDateChange = (e) => {
    const val = e.target.value;

    // If external interviewers exist and date is actually changing → clear them
    // if (externalInterviewers.length > 0 && val !== scheduledDate) {
    //   setExternalInterviewers([]);
    //   setHasManuallyClearedInterviewers(true);

    //   // Reset status if it was RequestSent
    //   if (status === "RequestSent") {
    //     setStatus("Draft");
    //   }

    //   if (selectedInterviewType === "External") {
    //     setSelectedInterviewType(null);
    //   }
    // }

    // Check if external interviewers exist and date is actually changing
    if (externalInterviewers.length > 0 && val !== scheduledDate) {
      // Set pending change and show confirmation popup
      setPendingDateChange({
        type: "scheduledDate",
        value: val,
      });
      setShowDateChangeConfirmation(true);
      return; // Don't proceed until user confirms
    }

    const minVal = twoHoursFromNowLocal();
    // Prevent selecting past/less than 2 hours from now
    const newScheduledDate = val && val < minVal ? minVal : val;

    // Clear external interviewers when date changes
    if (newScheduledDate !== scheduledDate && externalInterviewers.length > 0) {
      setExternalInterviewers([]);
      setHasManuallyClearedInterviewers(true); // Add this
      if (
        selectedInterviewType === "External" &&
        internalInterviewers.length === 0
      ) {
        setSelectedInterviewType(null);
      }
      // Show notification to user
      // toast.warn("Date changed - external interviewers have been cleared. Please reselect them.");
    }

    setScheduledDate(newScheduledDate);
  };

  const handleRoundTitleUnifiedChange = (e) => {
    const value = e.target.value;

    // If already in custom mode, treat changes as typing the custom title
    if (isCustomRoundTitle) {
      setCustomRoundTitle(value);
      setErrors((prev) => ({ ...prev, roundTitle: "" }));
      return;
    }

    // DropdownWithSearchField sends an empty string when "Other" is chosen.
    // Enter custom mode and keep roundTitle as "Other" for submission mapping.
    if (value === "") {
      setIsCustomRoundTitle(true);
      setRoundTitle("Other");
      setCustomRoundTitle("");
      setInstructions(""); // Clear instructions when selecting "Other"
      setErrors((prev) => ({ ...prev, roundTitle: "" }));
      return;
    }
    // Store previous round title to detect changes from "Assessment"
    const previousRoundTitle = roundTitle;
    // Normal predefined selection
    setRoundTitle(value);
    setCustomRoundTitle("");

    // Clear instructions whenever round title changes
    // setInstructions("");

    if (value === "Assessment") {
      setInterviewMode("Virtual");
      setInterviewQuestionsList([]);
      setInstructions(""); // Ensure instructions are cleared for Assessment

      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setInterviewerViewType("");
      setInterviewType("instant");
      setScheduledDate("");
      setDuration(60);
      setStartTime("");
      setEndTime("");
      setAssessmentTemplate({ assessmentId: "", assessmentName: "" });
      setSelectedAssessmentData(null);
      setCombinedDateTime("");

      setSectionQuestions({});
      setInternalInterviewers([]);
      setExternalInterviewers([]);
      setSelectedInterviewType(null);
      setHasManuallyClearedInterviewers(true);
    } else {
      // setInterviewMode("");
      setInstructions(previousRoundTitle === "Assessment" ? "" : instructions); // Clear instructions for non-Assessment rounds
      // setInterviewType("instant");
      // setScheduledDate("");
      // setDuration(60);
      // setStartTime("");
      // setEndTime("");
      setAssessmentTemplate({ assessmentId: "", assessmentName: "" });
      setSelectedAssessmentData(null);
      // setCombinedDateTime("");

      // setInterviewerGroupName("");
      // setInterviewerGroupId("");
      // setInterviewerViewType("");
    }

    setErrors((prev) => ({
      ...prev,
      roundTitle: "",
      interviewMode: "",
      instructions: "", // Clear instructions validation error
    }));
  };

  console.log("internalInterviewers:", internalInterviewers);

  // Replace the existing interviewType change handler
  const handleInterviewTypeChange = (type) => {
    // Clear external interviewers when switching between instant and scheduled
    if (type === interviewType) return;

    // If external interviewers exist and we're changing type, clear them
    // if (externalInterviewers.length > 0) {
    //   setExternalInterviewers([]);
    //   setHasManuallyClearedInterviewers(true);

    //   // Reset status if it was RequestSent
    //   if (status === "RequestSent") {
    //     setStatus("Draft");
    //   }

    //   if (selectedInterviewType === "External") {
    //     setSelectedInterviewType(null);
    //   }
    // }

    // Check if external interviewers exist and date/time is changing
    if (externalInterviewers.length > 0) {
      // Set pending change and show confirmation popup
      setPendingDateChange({
        type: "interviewType",
        value: type,
      });
      setShowDateChangeConfirmation(true);
      return; // Don't proceed until user confirms
    }

    // Check if internal interviewers exist and date/time is changing
    if (internalInterviewers.length > 0) {
      // Set pending change and show confirmation popup
      setPendingDateChange({
        type: "interviewType",
        value: type,
      });
      setShowDateChangeConfirmation(true);
      return; // Don't proceed until user confirms
    }

    // Also clear internal interviewers if no date/time for scheduled
    if (
      type === "scheduled" &&
      internalInterviewers.length > 0 &&
      !scheduledDate
    ) {
      setInternalInterviewers([]);
      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setInterviewerViewType("individuals");
      setSelectedInterviewType(null);
      setHasManuallyClearedInterviewers(true);
    }

    setInterviewType(type);
    // Reset scheduled date when switching to instant
    // Reset times based on new type
    if (type === "instant") {
      // Clear scheduled date
      setScheduledDate("");

      // Calculate instant time: now + 15 minutes
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);
      now.setSeconds(0, 0);

      const localTimeStr = moment(now).format("YYYY-MM-DD HH:mm");
      const utcStart = moment
        .tz(
          localTimeStr,
          "YYYY-MM-DD HH:mm",
          Intl.DateTimeFormat().resolvedOptions().timeZone
        )
        .utc()
        .toDate();

      const end = new Date(utcStart);
      end.setMinutes(end.getMinutes() + duration);

      // Manually update times immediately
      setStartTime(utcStart.toISOString());
      setEndTime(end.toISOString());

      const formattedStart = formatDateTime(utcStart, true);
      const formattedEnd = formatDateTime(end, false);
      setCombinedDateTime(`${formattedStart} - ${formattedEnd}`);
    } else if (type === "scheduled") {
      // Only set minimum if no date exists
      if (!scheduledDate) {
        const minVal = twoHoursFromNowLocal();
        setScheduledDate(minVal);
      }
      // updateTimes will handle the rest via useEffect
    }
  };

  // Also need to handle the confirmation popup actions for edit and rescheduled:
  const handleConfirmDateChange = () => {
    if (!pendingDateChange) return;

    // Always clear external interviewers on confirmed change
    if (externalInterviewers.length > 0) {
      setExternalInterviewers([]);
      setHasManuallyClearedInterviewers(true);
      if (selectedInterviewType === "External") {
        setSelectedInterviewType(null);
      }
    }

    // if (
    //   status === "Scheduled" ||
    //   status === "Rescheduled" ||
    //   status === "RequestSent"
    // ) {
    //   setStatus("Draft");
    // }

    // ADD THIS: Clear internal interviewers as well
    if (internalInterviewers.length > 0) {
      setInternalInterviewers([]);
      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setInterviewerViewType("individuals");
      setHasManuallyClearedInterviewers(true);
      if (selectedInterviewType === "Internal") {
        setSelectedInterviewType(null);
      }
    }

    // Apply the actual change
    if (pendingDateChange.type === "interviewType") {
      const newType = pendingDateChange.value;
      setInterviewType(newType);

      // Handle instant timing if switching to instant
      if (newType === "instant") {
        setScheduledDate("");
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        now.setSeconds(0, 0);
        const localTimeStr = moment(now).format("YYYY-MM-DD HH:mm");
        const utcStart = moment
          .tz(
            localTimeStr,
            "YYYY-MM-DD HH:mm",
            Intl.DateTimeFormat().resolvedOptions().timeZone
          )
          .utc()
          .toDate();
        const end = new Date(utcStart);
        end.setMinutes(end.getMinutes() + duration);
        setStartTime(utcStart.toISOString());
        setEndTime(end.toISOString());
        const formattedStart = formatDateTime(utcStart, true);
        const formattedEnd = formatDateTime(end, false);
        setCombinedDateTime(`${formattedStart} - ${formattedEnd}`);
      }
    } else if (pendingDateChange.type === "scheduledDate") {
      const minVal = twoHoursFromNowLocal();
      const newScheduledDate =
        pendingDateChange.value && pendingDateChange.value < minVal
          ? minVal
          : pendingDateChange.value;
      setScheduledDate(newScheduledDate);
    }

    // Step 5: Mark this as a confirmed change so handleSubmit knows to close popup on success
    setPendingDateChange((prev) => ({ ...prev, confirmed: true }));

    // Step 6: Trigger the full submit (which calls PATCH API) after state updates
    // We use setTimeout to ensure all state changes above are applied first
    // setTimeout(() => {
    handleSubmit(new Event("submit"), "changes-confirmed"); // Fake event to match handleSubmit signature
    // }, 100);

    // Clear pending state
    setShowDateChangeConfirmation(false);
    setPendingDateChange(null);
  };

  const handleInternalInterviewerSelect = (
    interviewers,
    viewType,
    groupName,
    groupId
  ) => {
    // if (selectedInterviewType === "External") {
    //   alert(
    //     "You need to clear external interviewers before selecting Internal interviewers."
    //   );
    //   return;
    // }

    // Clear external interviewers when selecting internal
    if (externalInterviewers.length > 0) {
      setExternalInterviewers([]);
    }

    // Clear existing interviewers when view type changes

    if (viewType && viewType !== interviewerViewType) {
      setInternalInterviewers([]);
      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setHasManuallyClearedInterviewers(true);
    }

    setInterviewerViewType(viewType);
    setInterviewerGroupName(groupName);
    setInterviewerGroupId(groupId);
    setSelectedInterviewType("Internal");

    // For groups, replace existing selection (only one group can be selected)
    if (viewType === "groups") {
      setInternalInterviewers(interviewers);
    }
    // For individuals, append new interviewers (avoiding duplicates)
    else {
      const uniqueInterviewers = interviewers.filter(
        (newInterviewer) =>
          !internalInterviewers.some((i) => i._id === newInterviewer._id)
      );
      setInternalInterviewers((prev) => [...prev, ...uniqueInterviewers]);
      // setInternalInterviewers([...internalInterviewers, ...uniqueInterviewers]);
    }

    // Extract only contactId values
    // const contactIds = uniqueInterviewers?.map((interviewer) => interviewer.contactId);

    // setInternalInterviewers([...internalInterviewers, ...interviewers]); // Append new interviewers
  };

  const openInternalModal = () => {
    if (externalInterviewers.length > 0) {
      setExternalInterviewers([]);
      setExternalMaxHourlyRate(0);
      setSelectedInterviewType(null);
      setHasManuallyClearedInterviewers(true); // Important: prevent edit data from reloading old external
    }
    setInternalInterviews(true);
  };

  const openExternalModal = () => {
    if (internalInterviewers.length > 0) {
      setInternalInterviewers([]);
      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setInterviewerViewType("individuals");
      setSelectedInterviewType(null);
      setHasManuallyClearedInterviewers(true); // Important: prevent edit data from reloading old internal
    }
    setShowOutsourcePopup(true);
  };

  const handleExternalInterviewerSelect = (interviewers, maxHourlyRate) => {
    // if (selectedInterviewType === "Internal") {
    //   alert(
    //     "You need to clear Internal interviewers before selecting outsourced interviewers."
    //   );
    //   return;
    // }

    // Clear internal interviewers when selecting external
    if (internalInterviewers.length > 0) {
      setInternalInterviewers([]);
      setInterviewerGroupName("");
      setInterviewerGroupId("");
      setInterviewerViewType("individuals");
    }

    setSelectedInterviewType("External");

    // Ensure no duplicates and append new interviewers
    const uniqueInterviewers = interviewers.filter(
      (newInterviewer) =>
        !externalInterviewers.some((i) => i.id === newInterviewer.id)
    );

    setSelectedInterviewType("External");
    setExternalInterviewers([...externalInterviewers, ...uniqueInterviewers]); // Append new interviewers
    setExternalMaxHourlyRate(Number(maxHourlyRate) || 0);
    setHasManuallyClearedInterviewers(false); // Reset flag when adding new interviewers
  };

  const handleRemoveInternalInterviewer = (interviewerId) => {
    setInternalInterviewers((prev) => {
      const updatedInterviewers = prev.filter((i) => i._id !== interviewerId);

      // Reset selectedInterviewType if no interviewers are left
      if (updatedInterviewers.length === 0) {
        setHasManuallyClearedInterviewers(true);
        setSelectedInterviewType(null);
        // setInternalInterviewers("")
        setInterviewerGroupName("");
        setInterviewerGroupId("");
        setInterviewerViewType("individuals");

        // Only reset selectedInterviewType if no external interviewers either
        if (externalInterviewers.length === 0) {
          setSelectedInterviewType(null);
        }
      }

      return updatedInterviewers;
    });
  };

  // const handleRemoveExternalInterviewer = (interviewerId) => {
  //   setExternalInterviewers((prev) => {
  //     const updatedInterviewers = prev.filter((i) => i.id !== interviewerId);

  //     console.log("Updated external interviewers:", updatedInterviewers);

  //     // Reset selectedInterviewType if no interviewers are left
  //     if (
  //       updatedInterviewers.length === 0 &&
  //       internalInterviewers.length === 0
  //     ) {
  //       // Set flag when manually removing all external interviewers
  //       setHasManuallyClearedInterviewers(true);
  //       setSelectedInterviewType(null);
  //     }

  //     return updatedInterviewers;
  //   });
  // };

  const handleRemoveExternalInterviewer = (interviewerId) => {
    setExternalInterviewers((prev) => {
      const updatedInterviewers = prev.filter(
        (i) => i.id !== interviewerId && i._id !== interviewerId
      );

      // Reset selectedInterviewType if no interviewers are left
      if (
        updatedInterviewers.length === 0 &&
        internalInterviewers.length === 0
      ) {
        // Set flag when manually removing all external interviewers
        setHasManuallyClearedInterviewers(true);
        setSelectedInterviewType(null);
        setExternalMaxHourlyRate(0);
      }

      return updatedInterviewers;
    });
  };

  // const handleClearAllInterviewers = () => {
  //   setInternalInterviewers([]);
  //   setExternalInterviewers([]);
  //   setSelectedInterviewType(null);
  //   setInterviewerGroupName("");
  //   setInterviewerGroupId("");
  //   setInterviewerViewType("individuals");

  //   if (isInternalInterviews) {
  //     setInternalInterviews(false); // Close and reopen modal to reset its state
  //   }
  // };

  const handleClearAllInterviewers = () => {
    console.log("Clearing all interviewers...");
    console.log(
      "Before clear - internal:",
      internalInterviewers.length,
      "external:",
      externalInterviewers.length
    );

    setInternalInterviewers([]);
    setExternalInterviewers([]);
    setExternalMaxHourlyRate(0);
    setSelectedInterviewType(null);
    setInterviewerGroupName("");
    setInterviewerGroupId("");
    setInterviewerViewType("individuals");

    // Set the flag to prevent re-initialization
    setHasManuallyClearedInterviewers(true);

    // Also clear any related modal states
    if (isInternalInterviews) {
      setInternalInterviews(false); // Close the internal interviewers modal
    }

    // Force a complete reset by closing any open modals
    setShowOutsourcePopup(false);

    console.log(
      "After clear - internal:",
      internalInterviewers.length,
      "external:",
      externalInterviewers.length
    );
  };

  const selectedInterviewers =
    selectedInterviewType === "Internal"
      ? internalInterviewers
      : externalInterviewers;

  console.log("selectedInterviewers", selectedInterviewers);

  const isInternalSelected = selectedInterviewType === "Internal";
  const isExternalSelected = selectedInterviewType === "External";

  // handling the submit function for round form update and create round
  const handleSubmit = async (e, type) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean interviewers data to remove undefined fields (commented as per original)
      // const cleanInterviewer = (interviewer) => {
      //   const { availability, ...rest } = interviewer;
      //   return rest;
      // };
      // const cleanedInterviewers = selectedInterviewersData.map(cleanInterviewer);

      // Format interviewers data based on view type
      let formattedInterviewers = [];
      if (interviewerViewType === "groups" && internalInterviewers.length > 0) {
        // For groups, we need to handle group data appropriately
        // Assuming internalInterviewers contains group data when in group view
        formattedInterviewers = internalInterviewers.flatMap(
          (group) => group.userIds || []
        );
      } else {
        // For individuals, store their IDs
        formattedInterviewers = internalInterviewers.map((interviewer) =>
          organization ? interviewer._id : interviewer.contactId
        );
      }
      // v1.0.1 <---------------------------------------------------------------------------------

      // If editing and rescheduling, increment rescheduleCount
      let updatedRescheduleCount = roundEditData?.rescheduleCount || 0;
      if (isEditing && isReschedule) {
        updatedRescheduleCount += 1;
      } else if (isEditing) {
        updatedRescheduleCount = roundEditData?.rescheduleCount || 0;
      }

      const interviewDateTime = new Date(combinedDateTime);
      const expiryDateTime = calculateExpiryDate(interviewDateTime);

      const roundData = {
        roundTitle: roundTitle === "Other" ? customRoundTitle : roundTitle,
        interviewMode,
        // interviewerGroupName,
        interviewerGroupId:
          interviewerViewType === "groups" && roundTitle !== "Assessment"
            ? interviewerGroupId
            : "", // added newly
        // interviewerViewType,
        rescheduleCount: updatedRescheduleCount,
        sequence,

        ...(roundTitle === "Assessment" && assessmentTemplate.assessmentId
          ? { assessmentId: assessmentTemplate.assessmentId }
          : {}),
        instructions,
        duration,
        status: isReschedule
          ? "Rescheduled"
          : roundTitle === "Assessment"
          ? "Scheduled"
          : status,

        // stateisReschedule  status: roundTitle === "Assessment" ? "Scheduled" :  status,
        ...(roundTitle !== "Assessment" && {
          interviewerType: selectedInterviewType,
          dateTime: combinedDateTime,
          interviewType,
        }),
        // For outsourced rounds, send the maxHourlyRate so backend can create a selection-time hold
        ...(selectedInterviewType === "External" && {
          maxHourlyRate: externalMaxHourlyRate,
        }),
        // ...(selectedInterviewType !== "external" && {
        //   interviewers: formattedInterviewers || [],
        // }),
        // Internal interviewers: send their user IDs
        ...(selectedInterviewType === "Internal" && {
          interviewers: formattedInterviewers || [],
        }),
        // External interviewers: send their _id
        ...(selectedInterviewType === "External" &&
          formattedInterviewers.length === 0 && {
            interviewers: [],
            // externalInterviewers.map((i) => i._id || i.id)
          }),
        // ✅ ADD THESE TWO LINES (VERY IMPORTANT) - KEPT EXACTLY AS REQUESTED
        selectedInterviewers, // ← backend uses this to create requests
        expiryDateTime, // ← backend uses frontend expiry
        selectedAssessmentData,
        // ✅ ALWAYS send meeting platform
        meetPlatform:
          interviewMode !== "Face to Face" ? selectedMeetingPlatform : null,
      };

      const validationErrors = validateInterviewRoundData(roundData);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        scrollToFirstError(validationErrors, fieldRefs);
        return;
      }

      console.log("roundData", roundData);

      // v1.0.1 --------------------------------------------------------------------------------->

      const payload = isEditing
        ? {
            interviewId,
            round: roundData,
            roundId,
            questions: interviewQuestionsList,
          }
        : {
            interviewId,
            round: roundData,
            questions:
              interviewQuestionsList.map((q) => ({
                questionId: q.questionId,
                snapshot: {
                  ...q.snapshot,
                  mandatory: q.snapshot.mandatory || "false",
                },
              })) || [],
          };

      console.log("payload", payload);

      const shouldGenerateMeeting =
        !isEditing && // 🧩 Skip in edit mode
        payload?.round?.interviewMode !== "Face to Face" &&
        Array.isArray(selectedInterviewers) &&
        selectedInterviewers.length > 0;

      // meeting gerating google or zoom etc......
      let meetingLink = null;
      if (payload.round.roundTitle !== "Assessment") {
        try {
          // v1.0.3 <-----------------------------------------------------------
          setMeetingCreationProgress("Creating links...");
          // v1.0.3 ----------------------------------------------------------->
          // Import the meeting platform utility
          const { createMeeting } = await import(
            "../../../../../utils/meetingPlatforms.js"
          );

          if (shouldGenerateMeeting) {
            setIsMeetingCreationLoading(true);
            // ========================================
            // Google Meet creation
            // ========================================
            if (selectedMeetingPlatform === "google-meet") {
              meetingLink = await createMeeting(
                "googlemeet",
                {
                  roundTitle,
                  instructions,
                  combinedDateTime,
                  duration,
                  selectedInterviewers,
                },
                (progress) => {
                  setMeetingCreationProgress(progress);
                }
              );

              // ========================================
              // Zoom meeting creation
              // ========================================
            } else if (selectedMeetingPlatform === "zoom") {
              // Format helper
              function formatStartTimeForZoom(input) {
                if (!input || typeof input !== "string") return undefined;

                // Expected: "20-12-2025 07:36 PM - 08:36 PM"
                const match = input.match(
                  /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\s+(AM|PM)/
                );

                if (!match) return undefined;

                let [, day, month, year, hh, mm, meridiem] = match;

                day = Number(day);
                month = Number(month);
                year = Number(year);

                let hours = Number(hh);
                const minutes = Number(mm);

                if (meridiem === "PM" && hours !== 12) hours += 12;
                if (meridiem === "AM" && hours === 12) hours = 0;

                const localDate = new Date(
                  year,
                  month - 1,
                  day,
                  hours,
                  minutes,
                  0
                );

                if (isNaN(localDate.getTime())) return undefined;

                // Zoom expects LOCAL time when timezone is provided
                return (
                  `${localDate.getFullYear()}-` +
                  `${String(localDate.getMonth() + 1).padStart(2, "0")}-` +
                  `${String(localDate.getDate()).padStart(2, "0")}T` +
                  `${String(localDate.getHours()).padStart(2, "0")}:` +
                  `${String(localDate.getMinutes()).padStart(2, "0")}:00`
                );
              }

              const formattedStartTime =
                formatStartTimeForZoom(combinedDateTime);
              if (!formattedStartTime)
                throw new Error("Invalid start time format");

              const payloads = {
                topic: roundTitle,
                duration: Number(duration),
                userId: undefined,
                ...(interviewType === "scheduled" &&
                  formattedStartTime && {
                    start_time: formattedStartTime,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  }),
                settings: {
                  join_before_host: true,
                  host_video: false,
                  participant_video: false,
                },
              };

              meetingLink = await createMeeting(
                "zoommeet",
                { payload: payloads },
                (progress) => {
                  setMeetingCreationProgress(progress);
                }
              );
            } else if (selectedMeetingPlatform === "platform") {
              meetingLink = await createMeeting(
                "videosdk",
                {
                  roundTitle,
                  instructions,
                  combinedDateTime,
                  duration,
                  selectedInterviewers,
                },
                (progress) => {
                  setMeetingCreationProgress(progress);
                }
              );
            }

            // Fixed: was using undefined 'data'
            if (meetingLink) {
              // Correct way to add meetingId and meetPlatform to payload.round
              if (payload.round) {
                payload.round.meetingId = meetingLink?.start_url
                  ? meetingLink?.start_url
                  : meetingLink;
              }

              // payload?.round?.meetingId = meetingLink?.start_url
              //   ? meetingLink?.start_url
              //   : meetingLink
              // payload?.round?.meetPlatform = selectedMeetingPlatform
            }
          }
        } catch (err) {
          console.error("Error in meeting creation:", err);
          setErrors({
            meetingCreation: err.message || "Failed to create meeting",
          });
        } finally {
          setIsMeetingCreationLoading(false);
          setMeetingCreationProgress("");
        }
      }
      // Check internal interview usage before scheduling
      if (selectedInterviewType === "Internal" && status === "Scheduled") {
        // Check if this is a new scheduling (not already scheduled)
        const isNewScheduling =
          !isEditing || (isEditing && roundEditData?.status !== "Scheduled");

        if (isNewScheduling) {
          const usageCheck = await checkInternalInterviewUsage(
            orgId,
            !organization ? userId : null
          );

          if (!usageCheck.canSchedule) {
            // Show detailed error with usage stats
            const usageInfo = usageCheck.usageStats || usageCheck.usage || {};
            notify.error(
              `Cannot schedule: ${usageCheck.message}. ` +
                `Used: ${usageInfo.utilized || 0}/${
                  usageInfo.entitled || 0
                } interviews.`,
              { duration: 5000 }
            );
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Use saveInterviewRound mutation from useInterviews hook
      let response;

      if (isEditing) {
        response = await updateInterviewRound(payload);
        console.log("response response", response);
      } else {
        response = await saveInterviewRound(payload);
      }

      // Trust backend's returned status
      const newStatus =
        response?.savedRound?.status || response?.updatedRound?.status;
      if (newStatus) {
        setStatus(newStatus);
      }

      // ✅ Collect success messages instead of showing immediately
      // successMessages.push("Interview round created successfully!");

      const targetRoundId = response?.savedRound?._id || roundId;

      // console.log("assessment reespone", response);

      if (payload.round.roundTitle === "Assessment") {
        if (response.status === "ok") {
          navigate(`/interviews/${interviewId}`);
        }
      }

      if (payload.round.roundTitle !== "Assessment") {
        if (response.status === "ok") {
          if (type === "changes-confirmed") {
            // Close confirmation popup only if changes were confirmed
            setShowDateChangeConfirmation(false);
            setPendingDateChange(null);
          } else {
            // ✅ Navigate only once, after toasts
            setTimeout(() => {
              navigate(`/interviews/${interviewId}`);
            });
          }
        }
        // successMessages.length * 1000 + 500
        // changes-confirmed
      }

      // if (payload.round.roundTitle !== "Assessment") {
      //   // don't remove this code related to agora video room
      //   // if (response.status === 'ok'){
      //   //   const video_call_res = await axios.post(`${config.REACT_APP_API_URL}/api/agora/create-video-room`,
      //   //     {
      //   //       title: roundTitle,
      //   //       enablePSTN: false
      //   //     }
      //   //   )

      //   // }

      //   // internal  interview  email sent
      //   // Meeting platform link creation
      //   if (response.status === "ok") {
      //     // Handle Face to Face (no meeting link)
      //     // need to ask with ranjith why we use this code -ashraf
      //     // if (!shouldGenerateMeeting && selectedInterviewers?.length > 0) {
      //     //   const faceToFaceRoundData = {
      //     //     ...roundData,
      //     //     status: isReschedule ? "Rescheduled" : "Scheduled",
      //     //   };

      //     //   const updatePayload = {
      //     //     interviewId,
      //     //     roundId: targetRoundId,
      //     //     round: faceToFaceRoundData,
      //     //     ...(isEditing ? { questions: interviewQuestionsList } : {}),
      //     //   };

      //     //   await updateInterviewRound(updatePayload);
      //     // }

      //     // ✅ Email sending logic (internal interviewers)
      //     // try {
      //     //   // const isInternal = selectedInterviewType === "Internal";

      //     //   // const shouldSendEmails =
      //     //   //   selectedInterviewType === "Internal" &&
      //     //   //   Array.isArray(selectedInterviewers) &&
      //     //   //   selectedInterviewers.length > 0;

      //     //   // if (shouldSendEmails && isInternal) {
      //     //   //   const emailResponse = await axios.post(
      //     //   //     `${config.REACT_APP_API_URL}/emails/interview/round-emails`,
      //     //   //     {
      //     //   //       interviewId: interviewId,
      //     //   //       roundId: targetRoundId,
      //     //   //       sendEmails: true,
      //     //   //     },
      //     //   //     {
      //     //   //       headers: {
      //     //   //         "Content-Type": "application/json",
      //     //   //         Authorization: `Bearer ${Cookies.get("authToken")}`,
      //     //   //       },
      //     //   //     }
      //     //   //   );

      //     //   //   if (emailResponse.data.success) {
      //     //   //     successMessages.push(
      //     //   //       "Interview round created and emails sent successfully!"
      //     //   //     );
      //     //   //     if (emailResponse.data.data.emailsSent > 0) {
      //     //   //       successMessages.push(
      //     //   //         `Emails sent to ${emailResponse.data.data.emailsSent} recipients`
      //     //   //       );
      //     //   //     }
      //     //   //   } else {
      //     //   //     notify.error("Round created but email sending failed");
      //     //   //   }
      //     //   // }
      //     // } catch (emailError) {
      //     //   console.error("Error sending emails:", emailError);
      //     //   notify.error("Round created but email sending failed");
      //     // }

      //     // ✅ Show all collected success messages sequentially
      //     for (const [i, msg] of successMessages.entries()) {
      //       setTimeout(() => {
      //         notify.success(msg);
      //       }, i * 1000);
      //     }

      //     // ✅ Navigate only once, after toasts
      //     setTimeout(() => {
      //       navigate(`/interviews/${interviewId}`);
      //     }, successMessages.length * 1000 + 500);

      //     // Removed duplicate navigate here to prevent double navigation
      //     // navigate(`/interviews/${interviewId}`);
      //   }
      // }
    } catch (err) {
      console.error("=== Form Submission Error ===");
      console.error("Error submitting the form:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });

      const backendMessage = err?.response?.data?.message;
      const requiredTopupAmount = err?.response?.data?.requiredTopupAmount;
      const numericTopup =
        typeof requiredTopupAmount === "number"
          ? requiredTopupAmount
          : Number(requiredTopupAmount);

      if (numericTopup && !Number.isNaN(numericTopup) && numericTopup > 0) {
        notify.error(
          `${
            backendMessage ||
            "Insufficient available wallet balance to send outsourced interview requests."
          } Please add at least ₹${numericTopup.toFixed(2)} to your wallet.`,
        );
      } else if (backendMessage) {
        notify.error(backendMessage);
      } else {
        notify.error("Failed to create interview round. Please try again.");
      }

      setErrors({
        submit:
          backendMessage ||
          (err instanceof Error ? err.message : "An unknown error occurred"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // v1.0.2 <-----------------------------------------
  // useEffect(() => {
  //   const date = new Date();
  //   date.setMinutes(date.getMinutes() + 15);
  //   setScheduledDate(date.toISOString().slice(0, 16));
  //   setDuration(30);
  // }, []);

  //   useEffect(() => {
  //   const date = new Date();
  //   date.setMinutes(date.getMinutes() + 15);
  //   const newScheduledDate = date.toISOString().slice(0, 16);

  //   if (scheduledDate !== newScheduledDate) {
  //     setScheduledDate(newScheduledDate);
  //   }
  //   setDuration(30);
  // }, []); // Empty dependency array to run only once

  useEffect(() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);
    const newScheduledDate = date.toISOString().slice(0, 16);

    if (scheduledDate !== newScheduledDate) {
      setScheduledDate(newScheduledDate);
    }
    if (duration !== 60) {
      setDuration(60);
    }
  }, []);

  const breadcrumbItems = [
    {
      label: "Interviews",
      path: "/interviews",
    },
    {
      label: candidate?.LastName || "Interview",
      path: `/interviews/${interviewId}`,
      status: rounds?.status,
    },
  ];

  if (isEditing && roundEditData) {
    breadcrumbItems.push({
      label: `Edit ${roundEditData.roundTitle || "Round"}`,
      path: `/interviews/${interviewId}`,
      status: roundEditData.status,
    });
  } else {
    breadcrumbItems.push({
      label: "Add New Round",
      path: "",
    });
  }

  const handlePopupToggle = (index) => {
    setIsInterviewQuestionPopup(!isInterviewQuestionPopup);
  };

  const handleAssessmentSelect = (assessment) => {
    const assessmentData = {
      assessmentId: assessment._id,
      assessmentName: assessment.AssessmentTitle,
    };
    setAssessmentTemplate(assessmentData);
    setSelectedAssessmentData(assessment);

    setDuration(parseInt(assessment.Duration.replace(" minutes", "")));
    setInstructions(assessment.Instructions);
    setExpandedSections({});
    setSectionQuestions({});
    setInternalInterviewers([]);
    setExternalInterviewers([]);
    setSelectedInterviewType(null);
    setInterviewerGroupName("");
    setInterviewerGroupId("");
    setInterviewerViewType("individuals");
    // setInterviewQuestionsList([]);

    // v1.0.1 <----------------------------------------------------------------
    // Clear the assessmentTemplate validation error
    setErrors((prev) => ({
      ...prev,
      assessmentTemplate: "",
    }));
    // v1.0.1 ---------------------------------------------------------------->

    if (assessment._id) {
      setQuestionsLoading(true);
      fetchAssessmentQuestions(assessment._id).then(({ data, error }) => {
        if (data) {
          setQuestionsLoading(false);
          setSectionQuestions(data?.sections);
        } else {
          console.error("Error fetching assessment questions:", error);
          setQuestionsLoading(false);
        }
      });
    }

    // fetchQuestionsForAssessment(assessment._id);
    setShowDropdown(false);
  };

  const toggleSection = async (sectionId, e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation();

    // Close all questions in this section when collapsing
    if (expandedSections[sectionId]) {
      const newExpandedQuestions = { ...expandedQuestions };
      sectionQuestions[sectionId]?.questions?.forEach((question) => {
        newExpandedQuestions[question._id] = false;
      });
      setExpandedQuestions(newExpandedQuestions);
    }

    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));

    // Fetch questions if the section is being expanded and questions are not already loaded
    // if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
    //   await fetchQuestionsForAssessment(assessmentTemplate.assessmentId);
    // }
  };

  return (
    <div className="h-[calc(100vh-4rem)] mt-2 overflow-y-auto bg-gray-50">
      {/* v1.0.5 <------------------------------------------------------------- */}
      <main className="max-w-7xl overflow-y-auto mx-auto py-6 sm:px-4 px-8">
        {/* v1.0.5 -------------------------------------------------------------> */}
        {/* v1.0.5 <---------------------------------- */}
        <div className="px-4 sm:px-0">
          {/* v1.0.5 ----------------------------------> */}
          <div className="sm:mb-0 mb-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Info Guide for Round Form */}
          <InfoGuide
            className="mt-4"
            title="Interview Round Guidelines"
            items={[
              <>
                <span className="font-medium">Round Types:</span> Choose from
                predefined round types (Assessment, Technical, Final, HR
                Interview) or create custom rounds
              </>,
              <>
                <span className="font-medium">Assessment Rounds:</span> Select
                assessment templates with pre-configured questions and scoring
              </>,
              <>
                <span className="font-medium">Interview Rounds:</span> Build
                custom interview rounds with specific questions and evaluation
                criteria
              </>,
              <>
                <span className="font-medium">Interviewer Selection:</span>{" "}
                Choose between internal team members or outsourced interviewers
              </>,
              <>
                <span className="font-medium">Question Management:</span> Add
                questions from your question bank or create new ones on the fly
              </>,
              <>
                <span className="font-medium">Custom Instructions:</span>{" "}
                Provide detailed instructions for each round (minimum 50
                characters)
              </>,
              <>
                <span className="font-medium">Sequence Control:</span> Set the
                order of rounds in your interview process
              </>,
              <>
                <span className="font-medium">Duration Settings:</span> Define
                time allocation for each interview round (30-120 minutes)
              </>,
              <>
                <span className="font-medium">Interview Scheduling:</span>{" "}
                Schedule interviews in advance or start them instantly
              </>,
              <>
                <span className="font-medium">Real-time Validation:</span> Form
                validation ensures all required fields are completed before
                submission
              </>,
            ]}
          />

          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? "Edit Interview Round" : "Add New Interview Round"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isEditing
                  ? "Update the round details below"
                  : "Fill in the details to add a new interview round"}
              </p>
            </div>
            {/* v1.0.5 <------------------------------------------------ */}
            <div className="border-t border-gray-200 px-4 py-5">
              {/* v1.0.5 ------------------------------------------------> */}
              <form>
                {/* {error && (
                  <div className="mb-4 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )} */}

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    {/* Round Title */}
                    <div>
                      <DropdownWithSearchField
                        containerRef={fieldRefs.roundTitle}
                        label="Round Title"
                        required
                        name="roundTitle"
                        value={
                          isCustomRoundTitle ? customRoundTitle : roundTitle
                        }
                        disabled={isEditing || isReschedule}
                        options={ROUND_TITLES}
                        // options={[
                        //   { value: "Assessment", label: "Assessment" },
                        //   { value: "Technical", label: "Technical" },
                        //   { value: "Final", label: "Final" },
                        //   { value: "HR Interview", label: "HR Interview" },
                        //   { value: "__other__", label: "Other" },
                        // ]}
                        isCustomName={isCustomRoundTitle}
                        setIsCustomName={setIsCustomRoundTitle}
                        onChange={handleRoundTitleUnifiedChange}
                        error={errors.roundTitle}
                      />
                    </div>

                    {/* Interview Mode */}
                    <div>
                      <div
                        className={
                          roundTitle === "Assessment"
                            ? "pointer-events-none opacity-60"
                            : undefined
                        }
                      >
                        <DropdownWithSearchField
                          containerRef={fieldRefs.interviewMode}
                          label="Interview Mode"
                          required
                          disabled={
                            roundTitle === "Assessment" ||
                            isEditing ||
                            isReschedule
                          }
                          name="interviewMode"
                          value={interviewMode}
                          options={[
                            { value: "Face to Face", label: "Face to Face" },
                            { value: "Virtual", label: "Virtual" },
                          ]}
                          // onChange={(e) => {
                          //   setInterviewMode(e.target.value);
                          //   setErrors({ ...errors, interviewMode: "" });
                          // }}
                          onChange={(e) => {
                            const newMode = e.target.value;

                            // Clear external interviewers when switching from Virtual to Face to Face
                            if (
                              newMode === "Face to Face" &&
                              externalInterviewers.length > 0
                            ) {
                              setExternalInterviewers([]);
                              if (
                                selectedInterviewType === "External" &&
                                internalInterviewers.length === 0
                              ) {
                                setSelectedInterviewType(null);
                              }
                              // Optional: Show notification to user
                              // notify.warn("Interview mode changed to Face to Face - external interviewers have been cleared.");
                            }

                            setInterviewMode(newMode);
                            setErrors({ ...errors, interviewMode: "" });
                          }}
                          error={errors.interviewMode}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    {/* Sequence */}
                    <div>
                      {/* v1.0.1 <------------------------------------------------------------------------------------- */}
                      <InputField
                        label="Sequence"
                        type="number"
                        id="sequence"
                        name="sequence"
                        min={1}
                        inputRef={fieldRefs.sequence}
                        value={sequence}
                        onChange={(e) => {
                          setSequence(parseInt(e.target.value));
                          setErrors({ ...errors, sequence: "" }); // Clear error on change
                        }}
                        // className={`mt-1 block w-full border ${
                        //   errors.sequence ? "border-red-500" : "border-gray-300"
                        // } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        error={errors.sequence}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The order in which this round appears in the interview
                        process
                      </p>

                      {/* v1.0.1 ---------------------------------------------------------------------------------------> */}
                    </div>

                    <div>
                      <DropdownWithSearchField
                        label="Duration (Minutes)"
                        name="duration"
                        value={duration}
                        options={[
                          { value: 30, label: "30 min" },
                          { value: 45, label: "45 min" },
                          { value: 60, label: "60 min" },
                          { value: 90, label: "90 min" },
                          { value: 120, label: "120 min" },
                        ]}
                        disabled={
                          roundTitle === "Assessment" ||
                          isEditing ||
                          isReschedule
                        }
                        onChange={(e) => {
                          setDuration(parseInt(e.target.value));
                          //clearError("duration")
                        }}
                        error={errors.duration}
                      />
                    </div>

                    {roundTitle === "Assessment" && (
                      <>
                        <div>
                          <DropdownWithSearchField
                            containerRef={fieldRefs.assessmentTemplate}
                            label="Assessment Template"
                            required
                            name="assessmentTemplate"
                            value={assessmentTemplate.assessmentId || ""}
                            options={assessmentOptions}
                            loading={isAssessmentQueryLoading}
                            onInputChange={(inputValue, { action }) => {
                              if (action === "input-change") {
                                setAssessmentSearch(inputValue || "");
                              }
                            }}
                            onMenuScrollToBottom={
                              handleAssessmentMenuScrollToBottom
                            }
                            onChange={(e) => {
                              const id = e.target.value;
                              const selected = (assessmentData || []).find(
                                (a) => a._id === id
                              );
                              if (selected) {
                                handleAssessmentSelect(selected);
                              } else {
                                // cleared
                                setAssessmentTemplate({
                                  assessmentId: "",
                                  assessmentName: "",
                                });
                                setSelectedAssessmentData(null);
                                setSectionQuestions({});
                                setInterviewQuestionsList([]);
                                setInternalInterviewers([]);
                                setExternalInterviewers([]);
                                setSelectedInterviewType(null);
                                setInterviewerGroupName("");
                                setInterviewerGroupId("");
                                setInterviewerViewType("individuals");
                              }
                              setErrors((prev) => ({
                                ...prev,
                                assessmentTemplate: "",
                              }));
                            }}
                            error={errors.assessmentTemplate}
                          />
                        </div>

                        {/* assessment questions */}
                        {assessmentTemplate.assessmentName && (
                          <div className="col-span-2">
                            {assessmentTemplate.assessmentName && (
                              <div>
                                <label
                                  htmlFor="assessmentQuestions"
                                  className="block text-sm font-medium text-gray-700 mb-1 mt-1"
                                >
                                  Assessment Questions
                                </label>
                                {errors.assessmentQuestions && (
                                  <p className="text-red-500 text-sm">
                                    {errors.assessmentQuestions}
                                  </p>
                                )}

                                {/* {errors.assessmentQuestions && <p className="text-red-500 text-xs">{errors.assessmentQuestions}</p>} */}
                                {questionsLoading ? (
                                  <p className="text-gray-500">
                                    Loading assessment data...
                                  </p>
                                ) : (
                                  <div className="space-y-4">
                                    {!sectionQuestions ||
                                    sectionQuestions.noQuestions ? (
                                      <div className="text-center py-4 text-gray-500">
                                        No Sections available for this
                                        Assessment
                                      </div>
                                    ) : //  <div className="space-y-4">
                                    Object.keys(sectionQuestions).length > 0 ? (
                                      Object.entries(sectionQuestions).map(
                                        ([sectionId, sectionData]) => {
                                          // Find section details from assessmentData
                                          // const selectedAssessment = assessmentData.find(
                                          //   a => a._id === formData.assessmentTemplate[0].assessmentId
                                          // );

                                          // const section = selectedAssessment?.Sections?.find(s => s._id === sectionId);

                                          if (
                                            !sectionData ||
                                            !Array.isArray(
                                              sectionData.questions
                                            )
                                          ) {
                                            return (
                                              <div
                                                key={sectionId}
                                                className="border rounded-md shadow-sm p-4"
                                              >
                                                <div className="text-center py-4 text-gray-500">
                                                  No Valid data for this section
                                                </div>
                                              </div>
                                            );
                                          }

                                          return (
                                            <div
                                              key={sectionId}
                                              className="border rounded-md shadow-sm p-4"
                                            >
                                              <button
                                                onClick={(e) =>
                                                  toggleSection(sectionId, e)
                                                }
                                                className="flex justify-between items-center w-full"
                                              >
                                                <span className="font-medium">
                                                  {sectionData?.sectionName
                                                    ? sectionData?.sectionName
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                      sectionData?.sectionName.slice(
                                                        1
                                                      )
                                                    : "Unnamed Section"}
                                                </span>
                                                <ChevronUp
                                                  className={`transform transition-transform ${
                                                    expandedSections[sectionId]
                                                      ? ""
                                                      : "rotate-180"
                                                  }`}
                                                />
                                              </button>

                                              {expandedSections[sectionId] && (
                                                <div className="mt-4 space-y-3">
                                                  {sectionData?.questions
                                                    .length > 0 ? (
                                                    sectionData?.questions.map(
                                                      (question, idx) => (
                                                        <div
                                                          key={
                                                            question._id || idx
                                                          }
                                                          className="border rounded-md shadow-sm overflow-hidden"
                                                        >
                                                          <div
                                                            onClick={() =>
                                                              setExpandedQuestions(
                                                                (prev) => ({
                                                                  ...prev,
                                                                  [question._id]:
                                                                    !prev[
                                                                      question
                                                                        ._id
                                                                    ],
                                                                })
                                                              )
                                                            }
                                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                          >
                                                            <div className="flex items-center gap-2">
                                                              <span className="font-medium text-gray-600">
                                                                {idx + 1}.
                                                              </span>
                                                              <p className="text-sm text-gray-700">
                                                                {question
                                                                  .snapshot
                                                                  ?.questionText ||
                                                                  "No question text"}
                                                              </p>
                                                            </div>
                                                            <ChevronDown
                                                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                                                expandedQuestions[
                                                                  question._id
                                                                ]
                                                                  ? "transform rotate-180"
                                                                  : ""
                                                              }`}
                                                            />
                                                          </div>

                                                          {expandedQuestions[
                                                            question._id
                                                          ] && (
                                                            <div className="px-4 py-3">
                                                              <div className="flex justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                  <span className="text-sm font-medium text-gray-500">
                                                                    Type:
                                                                  </span>
                                                                  <span className="text-sm text-gray-700">
                                                                    {question
                                                                      .snapshot
                                                                      ?.questionType ||
                                                                      "Not specified"}
                                                                  </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                  <span className="text-sm font-medium text-gray-500">
                                                                    Score:
                                                                  </span>
                                                                  <span className="text-sm text-gray-700">
                                                                    {question
                                                                      .snapshot
                                                                      ?.score ||
                                                                      "0"}
                                                                  </span>
                                                                </div>
                                                              </div>

                                                              {/* Display question options if MCQ */}
                                                              {question.snapshot
                                                                ?.questionType ===
                                                                "MCQ" && (
                                                                <div className="mt-2">
                                                                  <span className="text-sm font-medium text-gray-500">
                                                                    Options:
                                                                  </span>
                                                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                                                    {question.snapshot?.options?.map(
                                                                      (
                                                                        option,
                                                                        optIdx
                                                                      ) => (
                                                                        <div
                                                                          key={
                                                                            optIdx
                                                                          }
                                                                          //  className="text-sm text-gray-700 px-3 py-1.5 bg-white rounded border"
                                                                          className={`text-sm p-2 rounded border ${
                                                                            option ===
                                                                            question
                                                                              .snapshot
                                                                              .correctAnswer
                                                                              ? "bg-green-50 border-green-200 text-green-800"
                                                                              : "bg-gray-50 border-gray-200"
                                                                          }`}
                                                                        >
                                                                          {
                                                                            option
                                                                          }
                                                                          {option ===
                                                                            question
                                                                              .snapshot
                                                                              .correctAnswer && (
                                                                            <span className="ml-2 text-green-600">
                                                                              ✓
                                                                            </span>
                                                                          )}
                                                                        </div>
                                                                      )
                                                                    )}
                                                                  </div>
                                                                </div>
                                                              )}

                                                              {/* Display correct answer */}
                                                              {/* <div className="mt-2">
                                                                                              <span className="text-sm font-medium text-gray-500">
                                                                                                Correct Answer:
                                                                                              </span>
                                                                                              <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                                                                                {question.snapshot?.correctAnswer || 'Not specified'}
                                                                                              </div>
                                                                                            </div> */}

                                                              {/* Additional question metadata */}
                                                              <div className="grid grid-cols-2 gap-4 mt-3">
                                                                <div>
                                                                  <span className="text-xs font-medium text-gray-500">
                                                                    Difficulty:
                                                                  </span>
                                                                  <span className="text-xs text-gray-700 ml-1">
                                                                    {question
                                                                      .snapshot
                                                                      ?.difficultyLevel ||
                                                                      "Not specified"}
                                                                  </span>
                                                                </div>
                                                                <div>
                                                                  <span className="text-xs font-medium text-gray-500">
                                                                    Skills:
                                                                  </span>
                                                                  <span className="text-xs text-gray-700 ml-1">
                                                                    {question.snapshot?.skill?.join(
                                                                      ", "
                                                                    ) || "None"}
                                                                  </span>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )
                                                    )
                                                  ) : (
                                                    <div className="text-center py-4 text-gray-500">
                                                      No Questions found in this
                                                      section
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                      )
                                    ) : (
                                      <div className="text-center py-4 text-gray-500">
                                        No Assessment data available
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {roundTitle !== "Assessment" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interview Scheduling
                        </label>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                          <button
                            type="button"
                            // onClick={() => setInterviewType("instant")}
                            onClick={() => handleInterviewTypeChange("instant")}
                            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${
                              interviewType === "instant"
                                ? "border-custom-blue bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            key="instant-btn"
                            // disabled={status === "RequestSent"}
                          >
                            <Clock
                              className={`h-6 w-6 ${
                                interviewType === "instant"
                                  ? "text-custom-blue/70"
                                  : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`mt-2 font-medium ${
                                interviewType === "instant"
                                  ? "text-custom-blue"
                                  : "text-gray-900"
                              }`}
                            >
                              Instant Interview
                            </span>
                            <span className="mt-1 text-sm text-gray-500">
                              Starts in 15 minutes
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleInterviewTypeChange("scheduled")
                            } // Use new handler
                            // onClick={() => setInterviewType("scheduled")}
                            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${
                              interviewType === "scheduled"
                                ? "border-custom-blue bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            // disabled={status === "RequestSent"}
                            key="scheduled-btn"
                          >
                            <Calendar
                              className={`h-6 w-6 ${
                                interviewType === "scheduled"
                                  ? "text-custom-blue/70"
                                  : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`mt-2 font-medium ${
                                interviewType === "scheduled"
                                  ? "text-custom-blue"
                                  : "text-gray-900"
                              }`}
                            >
                              Schedule for Later
                            </span>
                            <span className="mt-1 text-sm text-gray-500">
                              Pick date & time
                            </span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-2">
                          {interviewType === "scheduled" && (
                            <div className="mt-4">
                              <label
                                htmlFor="scheduledDate"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Scheduled Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                id="scheduledDate"
                                name="scheduledDate"
                                //lang="en-US"
                                // value={scheduledDate}
                                value={
                                  interviewType === "scheduled"
                                    ? scheduledDate
                                    : ""
                                }
                                // disabled={status === "RequestSent"}
                                onChange={handleScheduledDateChange} // Use the new handler
                                //<-----v1.0.4----
                                // onChange={(e) => {
                                //   const val = e.target.value;
                                //   const minVal = twoHoursFromNowLocal();
                                //   // Prevent selecting past/less than 2 hours from now
                                //   setScheduledDate(
                                //     val && val < minVal ? minVal : val
                                //   );
                                // }}
                                min={twoHoursFromNowLocal()}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {interviewType === "instant" && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-custom-blue mr-2" />
                              <p className="text-sm text-custom-blue">
                                Interview will start at{" "}
                                <span className="font-medium">
                                  {new Date(startTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {/* {" "}
                                and end at{" "}
                                <span className="font-medium">
                                  {new Date(endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span> */}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Add this note when instant interview and outsourced interviewers are selected */}
                        {interviewType === "instant" &&
                          externalInterviewers.length > 0 && (
                            <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg
                                    className="h-5 w-5 text-yellow-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-yellow-700">
                                    <span className="font-medium">
                                      Instant Interview Note:
                                    </span>
                                    <br />
                                    • 15 minute interview schedule
                                    <br />
                                    • If interview is not accepted within 15
                                    minutes, the round will be cancelled and
                                    request will be automatically cancelled
                                    <br />• Ensure interviewers are available
                                    immediately
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {interviewType === "scheduled" && scheduledDate && (
                          <div className="mt-4 p-4 bg-green-50 rounded-md">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 text-green-500 mr-2" />
                              <p className="text-sm text-green-700">
                                Scheduled from{" "}
                                <span className="font-medium">
                                  {new Date(startTime).toLocaleString([], {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </span>{" "}
                                {/* to{" "}
                                <span className="font-medium">
                                  {new Date(endTime).toLocaleString([], {
                                    timeStyle: "short", // ✅ only show time
                                  })}
                                </span> */}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Select Interviewers */}
                      {/* v1.0.5 <-------------------------------------------------------- */}
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Interviewers
                        </label>
                        <div className="flex space-x-2">
                          {/* Select Internal Button */}
                          {organization === false ? (
                            <Button
                              type="button"
                              onClick={() => {
                                handleInternalInterviewerSelect([ownerData]);
                              }}
                              variant="outline"
                              size="sm"
                              className={
                                // Disable if:
                                // - Editing/rescheduling and original type was External
                                // - Or currently External is selected (in create mode)
                                (isEditing || isReschedule) &&
                                roundEditData?.interviewerType === "External"
                                  ? "opacity-50 cursor-not-allowed"
                                  : isExternalSelected
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                              disabled={
                                ((isEditing || isReschedule) &&
                                  roundEditData?.interviewerType ===
                                    "External") ||
                                isExternalSelected ||
                                status === "RequestSent"
                              }
                              // disabled={
                              //   ((isEditing || isReschedule) &&
                              //     roundEditData?.interviewerType ===
                              //       "External") ||
                              //   isExternalSelected
                              // }
                              title={
                                (isEditing || isReschedule) &&
                                roundEditData?.interviewerType === "External"
                                  ? "Cannot change from Outsourced to Internal interviewers in edit/reschedule"
                                  : isExternalSelected
                                  ? "Clear outsourced interviewers first"
                                  : ""
                              }
                            >
                              <User className="h-4 w-4 sm:mr-0 mr-1 text-custom-blue" />
                              <span className="sm:hidden inline">
                                Select Internal
                              </span>
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={openInternalModal}
                              // onClick={() => setInternalInterviews(true)}
                              variant="outline"
                              size="sm"
                              className={
                                (isEditing || isReschedule) &&
                                roundEditData?.interviewerType === "External"
                                  ? "opacity-50 cursor-not-allowed"
                                  : isExternalSelected
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                              disabled={
                                ((isEditing || isReschedule) &&
                                  roundEditData?.interviewerType ===
                                    "External") ||
                                isInternalSelected ||
                                interviewMode === "Face to Face" ||
                                // status === "RequestSent" ||
                                // status === "Scheduled" ||
                                // status === "Rescheduled"
                                shouldDisable("internalInterviewersBtn")
                              }
                              // disabled={
                              //   ((isEditing || isReschedule) &&
                              //     roundEditData?.interviewerType ===
                              //       "External") ||
                              //   isExternalSelected
                              // }
                              title={
                                (isEditing || isReschedule) &&
                                roundEditData?.interviewerType === "External"
                                  ? "Cannot change from Outsourced to Internal interviewers in edit/reschedule"
                                  : isExternalSelected
                                  ? "Clear outsourced interviewers first"
                                  : ""
                              }
                            >
                              <User className="h-4 w-4 sm:mr-0 mr-1 text-custom-blue" />
                              <span className="sm:hidden inline">
                                Select Internal
                              </span>
                            </Button>
                          )}

                          {/* Select Outsourced Button */}
                          <Button
                            type="button"
                            onClick={openExternalModal}
                            // onClick={() => setShowOutsourcePopup(true)}
                            variant="outline"
                            size="sm"
                            className={
                              (isEditing || isReschedule) &&
                              roundEditData?.interviewerType === "Internal"
                                ? "opacity-50 cursor-not-allowed"
                                : isInternalSelected ||
                                  interviewMode === "Face to Face"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                            disabled={
                              ((isEditing || isReschedule) &&
                                roundEditData?.interviewerType ===
                                  "Internal") ||
                              isInternalSelected ||
                              interviewMode === "Face to Face" ||
                              shouldDisable("externalInterviewersBtn")
                              // status === "RequestSent" ||
                              // status === "Rescheduled" ||
                              // // (
                              // status === "Scheduled"
                              // && internalInterviewers.length > 0)
                            }
                            title={
                              (isEditing || isReschedule) &&
                              roundEditData?.interviewerType === "Internal"
                                ? "Cannot change from Internal to Outsourced interviewers in edit/reschedule"
                                : isInternalSelected
                                ? "Clear internal interviewers first"
                                : interviewMode === "Face to Face"
                                ? "Outsourced interviewers not allowed for Face-to-Face"
                                : ""
                            }
                          >
                            <Users className="h-4 w-4 sm:mr-0 mr-1 text-orange-600" />
                            <span className="sm:hidden inline">
                              Select Outsourced
                            </span>
                          </Button>
                        </div>
                      </div>
                      {/* v1.0.5 --------------------------------------------------------> */}

                      {/* Internal Interview Usage Display */}
                      {/* {isInternalSelected && (
                        <InternalInterviewUsageDisplay
                          className="mt-3 mb-3"
                          showOnlyWarning={false}
                        />
                      )} */}

                      {/* Selected Interviewers Summary */}
                      {/* v1.0.5 <------------------------------------------------------------ */}
                      <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                        {selectedInterviewers.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center">
                            No Interviewers
                            <span className="sm:hidden inline ml-1">
                              Selected
                            </span>
                          </p>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {selectedInterviewers.length} Interviewer
                                    {selectedInterviewers.length > 1
                                      ? "s "
                                      : " "}
                                    <span className="sm:hidden inline ml-1">
                                      Selected
                                    </span>
                                    {isInternalSelected && (
                                      <span className="ml-1 px-2 py-0.5 bg-blue-100 text-custom-blue rounded-full text-xs">
                                        Internal
                                      </span>
                                    )}
                                    {isExternalSelected && (
                                      <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                                        Outsourced
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {/* === ADD THIS NEW SECTION HERE === */}
                                {/* Pending Request Status Badge */}
                                {isExternalSelected &&
                                  status === "RequestSent" &&
                                  externalInterviewers.length > 0 && (
                                    <div className="ml-3 inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1.5 rounded-full">
                                      <Clock className="h-3 w-3 mr-1.5" />
                                      <span>
                                        {externalInterviewers.length} Pending
                                      </span>
                                      <span className="ml-1.5 text-yellow-600 text-xs">
                                        (not accepted)
                                      </span>
                                    </div>
                                  )}
                                {/* === END OF NEW SECTION === */}
                              </div>
                              {selectedInterviewers.length > 0 && (
                                <button
                                  type="button"
                                  onClick={handleClearAllInterviewers}
                                  disabled={
                                    shouldDisable("clearInterviewersBtn")
                                    // status === "RequestSent" ||
                                    // status === "Scheduled" ||
                                    // status === "ReScheduled"
                                  }
                                  title={
                                    // status === "RequestSent"
                                    //   ? "Cannot clear interviewers after request is sent"
                                    //   :
                                    "Clear All"
                                  }
                                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  <span className="sm:hidden inline">
                                    Clear All
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* Internal Interviewers */}
                            {isInternalSelected && (
                              <section className="mb-4 mt-2 w-full">
                                <h4 className="text-sm font-semibold text-gray-600 mb-3">
                                  {interviewerViewType === "groups" ||
                                  interviewerGroupId
                                    ? "Interviewer Groups "
                                    : "Internal Interviewers "}
                                  <span className="text-xs text-custom-blue">
                                    (
                                    {selectedInterviewers.length ||
                                      "Not Provided"}{" "}
                                    {selectedInterviewers.length > 1
                                      ? "Members"
                                      : "Member"}
                                    )
                                  </span>
                                </h4>
                                <div className="grid grid-cols-4 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 w-full gap-4">
                                  {/* Render group card if group exists */}
                                  {interviewerGroupId && (
                                    <div
                                      key={`group-${interviewerGroupId}`}
                                      className="rounded-xl border w-[80%] border-blue-200 bg-blue-50 p-3 shadow-sm flex flex-col justify-between"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div>
                                          <span className="font-medium text-blue-900 block">
                                            {interviewerGroupName ||
                                              "Not Provided"}
                                          </span>
                                          <span className="text-xs text-blue-700">
                                            (Group)
                                          </span>
                                        </div>
                                        <button
                                          onClick={handleClearAllInterviewers}
                                          className="text-red-400 rounded-full p-1 hover:bg-blue-100 transition"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                      <div>
                                        <ul className="list-disc list-inside text-xs text-blue-800 ml-1">
                                          {/* Check if we have a group with usersNames */}
                                          {interviewerGroupId &&
                                          selectedInterviewers[0]?.usersNames
                                            ? // Render group members from usersNames
                                              selectedInterviewers[0].usersNames.map(
                                                (name, i) => (
                                                  <li
                                                    key={`${selectedInterviewers[0]._id}-user-${i}`}
                                                  >
                                                    {name}
                                                  </li>
                                                )
                                              )
                                            : interviewerGroupId &&
                                              selectedInterviewers[0]?.userIds
                                            ? // Fallback: if we have group but no usersNames, show placeholder
                                              selectedInterviewers[0].userIds.map(
                                                (userId, i) => (
                                                  <li
                                                    key={`${selectedInterviewers[0]._id}-user-${i}`}
                                                  >
                                                    User ID: {userId}
                                                  </li>
                                                )
                                              )
                                            : // Render individual interviewers
                                              selectedInterviewers.map(
                                                (interviewer, index) => (
                                                  <li
                                                    key={`${interviewer._id}-${index}`}
                                                  >
                                                    {`${
                                                      interviewer.firstName ||
                                                      ""
                                                    } ${
                                                      interviewer.lastName || ""
                                                    }`.trim() ||
                                                      interviewer.email}
                                                  </li>
                                                )
                                              )}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {/* Render individual interviewers if no group */}
                                  {!interviewerGroupId &&
                                    selectedInterviewers.map(
                                      (interviewer, index) => (
                                        <div
                                          key={`${interviewer._id}-${index}`}
                                          className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm w-full md:w-auto"
                                        >
                                          <div className="flex items-center">
                                            <User className="h-4 w-4 text-blue-600 mr-2" />
                                            <span className="text-sm font-medium text-blue-900 truncate">
                                              {`${
                                                interviewer?.firstName || ""
                                              } ${
                                                interviewer?.lastName || ""
                                              }`.trim() || interviewer?.email}
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveInternalInterviewer(
                                                interviewer._id
                                              )
                                            }
                                            // disabled={status === "RequestSent"}
                                            disabled={
                                              // status === "RequestSent" ||
                                              // status === "Scheduled" ||
                                              // status === "ReScheduled"
                                              shouldDisable(
                                                "removeInterviewerBtn"
                                              )
                                            }
                                            className={`text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100 ${
                                              // status === "RequestSent" ||
                                              // status === "Scheduled" ||
                                              // status === "ReScheduled"
                                              shouldDisable(
                                                "removeInterviewerBtn"
                                              )
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                            // className="text-red-400 rounded-full p-1 hover:bg-blue-100 transition"
                                            title="Remove interviewer"
                                          >
                                            <X className="h-4 w-4" />
                                          </button>
                                        </div>
                                      )
                                    )}
                                </div>
                              </section>
                              // <div className="mb-3">
                              //   <h4 className="text-xs font-medium text-gray-500 mb-2">Internal Interviewers</h4>
                              //   <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">

                              //     {internalInterviewers?.map((interviewer) => (
                              //       <div key={interviewer._id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2">
                              //         <div className="flex items-center">
                              //           <span className="ml-2 text-sm text-custom-blue truncate">{interviewer.firstName} {interviewer.lastName}</span>
                              //         </div>
                              //         <button
                              //           type="button"
                              //           onClick={() => handleRemoveInternalInterviewer(interviewer._id)}
                              //           className="text-custom-blue hover:text-custom-blue/80 p-1 rounded-full hover:bg-blue-100"
                              //           title="Remove interviewer"
                              //         >
                              //           <X className="h-4 w-4" />
                              //         </button>
                              //       </div>
                              //     ))}
                              //   </div>
                              // </div>
                            )}

                            {/* External Interviewers */}
                            {isExternalSelected && (
                              <>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">
                                  Outsourced Interviewers
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3">
                                  {externalInterviewers?.map((interviewer) => (
                                    <div
                                      key={interviewer._id || interviewer?.id}
                                      className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 min-w-0"

                                      // className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2"
                                    >
                                      <div className="flex items-center min-w-0 flex-1">
                                        <span className="ml-2 text-sm text-orange-800 truncate">
                                          {/* FIX: Safely access nested contact fields */}
                                          {interviewer?.contact?.firstName ||
                                            interviewer?.firstName ||
                                            "Unknown"}{" "}
                                          {interviewer?.contact?.lastName ||
                                            interviewer?.lastName ||
                                            ""}{" "}
                                          (Outsourced)
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveExternalInterviewer(
                                            interviewer.id || interviewer._id
                                          )
                                        }
                                        className={`text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100 ${
                                          shouldDisable("removeInterviewerBtn")
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }`}
                                        title={
                                          // status === "RequestSent"
                                          //   ? "Cannot remove interviewers after request is sent"
                                          //   :
                                          "Remove interviewer"
                                        }
                                        disabled={
                                          shouldDisable("removeInterviewerBtn")
                                          // status === "RequestSent" ||
                                          // status === "Scheduled" ||
                                          // status === "ReScheduled"
                                        }
                                        // className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100"
                                        // title="Remove interviewer"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {/* v1.0.5 ------------------------------------------------------------> */}
                      {errors.interviewers && (
                        <p className="text-red-500 text-sm -mt-5">
                          {errors.interviewers}
                        </p>
                      )}

                      {/* questions */}
                      <div className="mt-4">
                        <div className="py-3 mx-auto rounded-md">
                          {/* Header with Title and Add Button */}
                          <div className="flex items-center justify-end mb-2">
                            <button
                              className="text-custom-blue font-semibold hover:underline"
                              onClick={handlePopupToggle}
                              type="button"
                            >
                              + Add Question
                            </button>
                          </div>
                          <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                            {/* Display Added Questions */}
                            {interviewQuestionsList.length > 0 ? (
                              <ul className="mt-2 space-y-2">
                                {interviewQuestionsList.map(
                                  (question, qIndex) => {
                                    // const isMandatory = question?.mandatory === "true";
                                    const isMandatory =
                                      question?.snapshot?.mandatory === "true";
                                    return (
                                      <li
                                        key={qIndex}
                                        className={`flex justify-between items-center p-3 border rounded-md ${
                                          isMandatory
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        <span className="text-gray-900 font-medium">
                                          {qIndex + 1}.{" "}
                                          {question?.snapshot?.questionText ||
                                            "No Question Text"}
                                        </span>
                                        <button
                                          onClick={(e) =>
                                            handleRemoveQuestion(
                                              question.questionId,
                                              e
                                            )
                                          }
                                        >
                                          <span className="text-red-500 text-xl font-bold">
                                            &times;
                                          </span>
                                        </button>
                                      </li>
                                    );
                                  }
                                )}
                              </ul>
                            ) : (
                              <p className="mt-2 text-gray-500 flex justify-center">
                                No Questions added yet.
                              </p>
                            )}
                          </div>

                          {/* Question Popup */}
                          {/* v1.0.5 <--------------------------------------------------------------------- */}
                          {isInterviewQuestionPopup && (
                            <div
                              className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50 min-h-screen sm:px-1"
                              onClick={() => setIsInterviewQuestionPopup(false)}
                            >
                              <div
                                className="bg-white rounded-md w-[98%] max-h-[90vh] overflow-y-auto sm:px-2  px-4 py-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="py-3 px-4  flex items-center justify-between">
                                  <h2 className="text-xl text-custom-blue font-semibold">
                                    Add Interview Question
                                  </h2>
                                  <button>
                                    <X
                                      className="text-2xl text-red-500"
                                      onClick={() => handlePopupToggle()}
                                    />
                                  </button>
                                </div>

                                {isInterviewQuestionPopup && (
                                  <QuestionBank
                                    interviewQuestionsLists={
                                      interviewQuestionsList
                                    }
                                    type="interviewerSection"
                                    fromScheduleLater={true}
                                    onAddQuestion={handleAddQuestionToRound}
                                    handleRemoveQuestion={handleRemoveQuestion}
                                    handleToggleMandatory={
                                      handleToggleMandatory
                                    }
                                    removedQuestionIds={removedQuestionIds}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                          {/* v1.0.5 ---------------------------------------------------------------------> */}
                        </div>
                      </div>
                    </>
                  )}

                  {/* instructions */}
                  <div>
                    <DescriptionField
                      inputRef={fieldRefs.instructions}
                      name="instructions"
                      label="Instructions"
                      id="instructions"
                      rows="10"
                      minLength={50}
                      maxLength={1000}
                      placeholder="Provide detailed instructions for interviewers including evaluation criteria, scoring guidelines (e.g., 1-10 scale), key focus areas, time allocation, and specific protocols to follow during the interview session."
                      value={instructions}
                      readOnly={roundTitle === "Assessment"}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Add Instructions after the interview round is completed
                    </p>
                  </div>
                  {/* footer */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/interviews/${interviewId}`)}
                      className="mr-3 inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    {/* v1.0.2 <----------------------------------------- */}

                    <LoadingButton
                      onClick={handleSubmit}
                      isLoading={
                        isMutationLoading ||
                        isMeetingCreationLoading ||
                        isSubmitting
                      }
                      loadingText={
                        isMeetingCreationLoading
                          ? meetingCreationProgress || "Creating meeting..."
                          : isSubmitting
                          ? "Submitting..."
                          : isEditing
                          ? "Updating..."
                          : "Saving..."
                      }
                      disabled={isSubmitting}
                    >
                      {isEditing ? "Update Round" : "Add Round"}
                    </LoadingButton>
                    {/* v1.0.2 <----------------------------------------- */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* External Interviews Modal */}
      {showOutsourcePopup && (
        <OutsourcedInterviewerModal
          key={`outsource-modal-${externalInterviewers.length}`}
          onClose={() => setShowOutsourcePopup(false)}
          dateTime={combinedDateTime}
          skills={position?.skills}
          candidateExperience={candidate?.CurrentExperience}
          currentRole={candidate?.CurrentRole}
          onProceed={handleExternalInterviewerSelect}
          previousSelectedInterviewers={externalInterviewers}
          navigatedfrom="interviewRound"
        />
      )}

      {isInternalInterviews && (
        <InternalInterviews
          key={`internal-modal-${internalInterviewers.length}-${interviewerGroupId}`}
          isOpen={isInternalInterviews}
          // onClose={() => setInternalInterviews(false)}
          onClose={() => {
            setInternalInterviews(false);
            // If no interviewers were selected during this session, reset view type
            // if (internalInterviewers.length === 0) {
            //   setInterviewerViewType('individuals');
            //   setInterviewerGroupName('');
            // }
          }}
          onSelectCandidates={handleInternalInterviewerSelect}
          selectedInterviewers={internalInterviewers}
          // defaultViewType={interviewerViewType}
          selectedGroupName={interviewerGroupName}
          selectedGroupId={interviewerGroupId}
          // key={`${internalInterviewers.length}-${interviewerGroupId}`}
          //  clearOnViewTypeChange={true}
        />
      )}

      {showDateChangeConfirmation &&
        shouldDisable("dateChangeConfirmation") && (
          <DateChangeConfirmationModal
            isOpen={showDateChangeConfirmation}
            onClose={() => {
              setShowDateChangeConfirmation(false);
              setPendingDateChange(null);
            }}
            onConfirm={handleConfirmDateChange}
            selectedInterviewType={selectedInterviewType}
            status={status}
            combinedDateTime={combinedDateTime} // your formatted date string
          />
        )}
    </div>
  );
};

export default RoundFormInterviews;
