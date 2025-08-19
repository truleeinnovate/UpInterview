// v1.0.0 - Ashok - removed extra status text
// v1.0.1 - Ashok - Added scroll to first error functionality
// v1.0.2 - Ashraf - Added sending interview email,creating custom url for each user
// v1.0.3 - Ashok - fixed button text while loading from Creating links to Creating Links
//<-----v1.0.4----Venkatesh-----default and enforce scheduledDate when switching to "scheduled" after 2 hours from now

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../CommonCode-AllTabs/Breadcrumb";

import {
  ChevronDown,
  X,
  User,
  Users,
  Trash2,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "../../CommonCode-AllTabs/ui/button.jsx";
import axios from "axios";
import InternalInterviews from "./Internal-Or-Outsource/InternalInterviewers.jsx";
import OutsourceOption from "./Internal-Or-Outsource/OutsourceInterviewer.jsx";
import Cookies from "js-cookie";
// import { useCustomContext } from "../../../../../Context/Contextfetch.js";
import { validateInterviewRoundData } from "../../../../../utils/interviewRoundValidation.js";
import { Search, ChevronUp } from "lucide-react";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../../config";
import QuestionBank from "../../QuestionBank-Tab/QuestionBank.jsx";
import Loading from "../../../../../Components/Loading.js";
import { useInterviews } from "../../../../../apiHooks/useInterviews.js";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import toast from 'react-hot-toast';
// Test import to see if the file can be imported
// import { processMeetingUrls } from "../../../../../utils/meetingUrlGenerator.js";
import LoadingButton from "../../../../../Components/LoadingButton";
// v1.0.1 <----------------------------------------------------------------------------

import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError.js";

// v1.0.1 ---------------------------------------------------------------------------->
const moment = require("moment-timezone");

// Function to update start and end time
const formatDateTime = (date, showDate = true) => {
  if (!date) return "";

  // Convert UTC date to local timezone for display
  const d = new Date(date);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // const d = new Date(date);

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
  const { interviewData, isMutationLoading, saveInterviewRound, updateRoundWithMeetingLinks } =
    useInterviews();
  const { assessmentData, fetchAssessmentQuestions } = useAssessments();
  // v1.0.2 <-----------------------------------------

  // State for meeting creation loading
  const [isMeetingCreationLoading, setIsMeetingCreationLoading] = useState(false);
  const [meetingCreationProgress, setMeetingCreationProgress] = useState('');
  const [selectedMeetingPlatform, setSelectedMeetingPlatform] = useState('googlemeet'); // Default to Google Meet
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions
  // v1.0.2 <-----------------------------------------

  const { interviewId, roundId } = useParams();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const orgId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;
  const [errors, setErrors] = useState({});

  const interview = interviewData?.find(
    (interview) => interview._id === interviewId
  );
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
    if (interviewData) {
      setCandidate(interview?.candidateId || null);
      setPosition(interview?.positionId || null);
      setRounds(interview?.rounds || []);
      // setTemplate(interview?.templateId || null)
    }
  }, [interviewData, interview]);

  const navigate = useNavigate();
  const [roundTitle, setRoundTitle] = useState("");
  const [customRoundTitle, setCustomRoundTitle] = useState("");
  const [interviewMode, setInterviewMode] = useState("");
  const [status, setStatus] = useState("Pending");
  const [instructions, setInstructions] = useState("");
  const [sequence, setSequence] = useState(1);
  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] =
    useState(false);
  // const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [interviewQuestionsList, setInterviewQuestionsList] = useState([]);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
  // console.log("interviewQuestionsList",interviewQuestionsList);

  const [interviewType, setInterviewType] = useState("instant"); // "instant" or "scheduled"
  const [scheduledDate, setScheduledDate] = useState(""); // Start Date & Time
  const [duration, setDuration] = useState(60); // Duration in minutes
  const [startTime, setStartTime] = useState(""); // Final Start Time
  const [endTime, setEndTime] = useState(""); // Calculated End Time
  const [combinedDateTime, setCombinedDateTime] = useState("");
  const [interviewerViewType, setInterviewerViewType] = useState("individuals"); // group or individuals
  const [interviewerGroupName, setInterviewerGroupName] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [internalInterviewers, setInternalInterviewers] = useState([]);
  // console.log("internalInterviewers selected", internalInterviewers);
  const [externalInterviewers, setExternalInterviewers] = useState([]);


  console.log("externalInterviewers 0000000000000000", externalInterviewers);

  console.log("internalInterviewers", internalInterviewers);
  console.log("interviewerViewType", interviewerViewType);
  console.log("interviewerGroupName", interviewerGroupName);


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
  };
  // v1.0.1 ------------------------------------------------------------------------->

  const updateTimes = useCallback(
    (newDuration) => {
      let start = null;
      let end = null;

      if (interviewType === "instant") {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15); // Start after 15 min
        // start = now;

        // Convert to UTC
        const localTimeStr = moment(now).format("YYYY-MM-DD HH:mm");
        start = moment
          .tz(
            localTimeStr,
            "YYYY-MM-DD HH:mm",
            Intl.DateTimeFormat().resolvedOptions().timeZone
          )
          .utc()
          .toDate();

        const endTime = new Date(start);
        // const endTime = new Date(now);
        endTime.setMinutes(endTime.getMinutes() + newDuration);
        end = endTime;
      } else if (interviewType === "scheduled" && scheduledDate) {
        // start = new Date(scheduledDate);
        // Convert scheduled date from local timezone to UTC
        const localTimeStr = moment(scheduledDate).format("YYYY-MM-DD HH:mm");
        start = moment
          .tz(
            localTimeStr,
            "YYYY-MM-DD HH:mm",
            Intl.DateTimeFormat().resolvedOptions().timeZone
          )
          .utc()
          .toDate();

        const endTime = new Date(start);
        endTime.setMinutes(endTime.getMinutes() + newDuration);
        end = endTime;
      }

      if (start && end) {
        setStartTime(start.toISOString()); // Store in ISO for backend
        setEndTime(end.toISOString()); // Store in ISO for backend

        // ✅ Ensure start shows date & time, but end shows only time
        const formattedStart = formatDateTime(start, true);
        const formattedEnd = formatDateTime(end, false);
        let combinedDateTime = `${formattedStart} - ${formattedEnd}`;

        // console.log("Combined DateTime:", combinedDateTime);
        setCombinedDateTime(combinedDateTime);
      }
    },
    [interviewType, scheduledDate]
  );

  // Replace this useEffect

  // useEffect(() => {
  //   let start = null;
  //   let end = null;

  //   if (interviewType === "instant") {
  //     const now = new Date();
  //     now.setMinutes(now.getMinutes() + 15);
  //     start = now;
  //     end = new Date(now);
  //     end.setMinutes(end.getMinutes() + duration);
  //   } else if (interviewType === "scheduled" && scheduledDate) {
  //     start = new Date(scheduledDate);
  //     end = new Date(start);
  //     end.setMinutes(end.getMinutes() + duration);
  //   }

  //   if (start && end) {
  //     // Only update state if the values have actually changed
  //     if (startTime !== start.toISOString()) {
  //       setStartTime(start.toISOString());
  //     }
  //     if (endTime !== end.toISOString()) {
  //       setEndTime(end.toISOString());
  //     }

  //     const formattedStart = formatDateTime(start, true);
  //     const formattedEnd = formatDateTime(end, false);
  //     const newCombinedDateTime = `${formattedStart} - ${formattedEnd}`;

  //     if (combinedDateTime !== newCombinedDateTime) {
  //       setCombinedDateTime(newCombinedDateTime);
  //     }
  //   }
  // }, [duration, interviewType, scheduledDate]);

  // useEffect(() => {
  //   let start = null;
  //   let end = null;

  //   if (interviewType === "instant") {
  //     const now = new Date();
  //     now.setMinutes(now.getMinutes() + 15);
  //     start = now;
  //     end = new Date(now);
  //     end.setMinutes(end.getMinutes() + duration);
  //   } else if (interviewType === "scheduled" && scheduledDate) {
  //     start = new Date(scheduledDate);
  //     end = new Date(start);
  //     end.setMinutes(end.getMinutes() + duration);
  //   }

  //   if (start && end) {
  //     // Only update state if the values have actually changed
  //     if (startTime !== start.toISOString()) {
  //       setStartTime(start.toISOString());
  //     }
  //     if (endTime !== end.toISOString()) {
  //       setEndTime(end.toISOString());
  //     }

  //     const formattedStart = formatDateTime(start, true);
  //     const formattedEnd = formatDateTime(end, false);
  //     const newCombinedDateTime = `${formattedStart} - ${formattedEnd}`;

  //     if (combinedDateTime !== newCombinedDateTime) {
  //       setCombinedDateTime(newCombinedDateTime);
  //     }
  //   }
  // },
  // [duration, interviewType, scheduledDate]
  // // [duration, interviewType, scheduledDate, startTime, endTime, combinedDateTime]
  // );

  useEffect(() => {
    updateTimes(duration);
  }, [duration, updateTimes]);

  //<-----v1.0.4----
  // Default and enforce scheduledDate when switching to "scheduled"
  useEffect(() => {
    if (interviewType === "scheduled") {
      const minVal = twoHoursFromNowLocal();
      if (!scheduledDate || scheduledDate < minVal) {
        setScheduledDate(minVal);
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

      // console.log("question", question);

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

  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;

    if (selectedTitle === "Other") {
      setRoundTitle("Other");
      setCustomRoundTitle("");
      setInstructions("");
      setInstructions("");
      setInterviewMode("");
      setStatus("Pending");
      setInterviewType("instant");
      setScheduledDate("");
      setDuration(60);
      setStartTime("");
      setEndTime("");
      setInterviewerGroupName("");
      setInterviewerViewType("");
      setAssessmentTemplate({ assessmentId: "", assessmentName: "" });
      setCombinedDateTime("");
    } else {
      setRoundTitle(selectedTitle);
      setCustomRoundTitle("");
      setInstructions("");
      setInterviewMode("");
      setStatus("Pending");
      setInterviewType("instant");
      setScheduledDate("");
      setDuration(60);
      setStartTime("");
      setEndTime("");

      setInterviewerGroupName("");
      setInterviewerViewType("");
      setCombinedDateTime("");
      setAssessmentTemplate({ assessmentId: "", assessmentName: "" });
    }

    if (selectedTitle === "Other") {
      setCustomRoundTitle("");
      setInstructions("");
    } else if (selectedTitle === "Assessment") {
      setInterviewMode("Virtual");
      setInterviewQuestionsList([]);
      setInstructions("");

      setInterviewerGroupName("");
      setInterviewerViewType("");
      setStatus("Pending");
      setInterviewType("instant");
      setScheduledDate("");
      setDuration(60);
      setStartTime("");
      setEndTime("");
      setAssessmentTemplate({ assessmentId: "", assessmentName: "" });
      setCombinedDateTime("");
    } else {
      setInterviewMode("");
      setInstructions("");
      setInstructions("");
      setInterviewMode("");
      setStatus("Pending");
      setInterviewType("instant");
      setScheduledDate("");
      setDuration(60);
      setStartTime("");
      setEndTime("");
      setAssessmentTemplate({ assessmentId: "", assessmentName: "" });
      setCombinedDateTime("");

      setInterviewerGroupName("");
      setInterviewerViewType("");
    }
  };

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
      setInterviewerViewType("individuals");
    }
  }, [selectedInterviewType]);

  // while editing
  const isEditing = !!roundId && roundId !== "new";
  const roundEditData = isEditing && rounds?.find((r) => r._id === roundId);

  useEffect(() => {
    if (isEditing && roundEditData) {
      // Update assessmentTemplate only if different
      const newAssessmentTemplate =
        roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId
          ? {
            assessmentId: roundEditData.assessmentId,
            assessmentName:
              assessmentData.find((a) => a._id === roundEditData.assessmentId)
                ?.AssessmentTitle || "",
          }
          : { assessmentId: "", assessmentName: "" };
      if (
        JSON.stringify(assessmentTemplate) !==
        JSON.stringify(newAssessmentTemplate)
      ) {
        setAssessmentTemplate(newAssessmentTemplate);
      }

      // Update other states only if different
      if (roundTitle !== roundEditData.roundTitle)
        setRoundTitle(roundEditData.roundTitle);
      if (interviewType !== roundEditData.interviewType)
        setInterviewType(roundEditData.interviewType);
      if (interviewMode !== roundEditData.interviewMode)
        setInterviewMode(roundEditData.interviewMode);
      if (selectedInterviewType !== roundEditData.interviewerType)
        setSelectedInterviewType(roundEditData.interviewerType);
      if (
        JSON.stringify(interviewQuestionsList) !==
        JSON.stringify(roundEditData.questions)
      ) {
        setInterviewQuestionsList(roundEditData.questions);
      }
      if (status !== roundEditData.status) setStatus(roundEditData.status);
      if (instructions !== (roundEditData.instructions || ""))
        setInstructions(roundEditData.instructions || "");
      if (sequence !== roundEditData.sequence)
        setSequence(roundEditData.sequence);
      if (duration !== (roundEditData.duration || 60))
        setDuration(roundEditData.duration || 60);
      if (
        interviewerGroupName !== (roundEditData?.interviewerGroupName || "")
      ) {
        setInterviewerGroupName(roundEditData?.interviewerGroupName || "");
      }
      if (interviewerViewType !== (roundEditData?.interviewerViewType || "")) {
        setInterviewerViewType(roundEditData?.interviewerViewType || "");
      }

      // Update interviewers only if different
      if (roundEditData.interviewers && roundEditData.interviewers.length > 0) {
        const normalizedInterviewers = roundEditData.interviewers.map(
          (interviewer) => ({
            _id: interviewer._id,
            firstName: interviewer.firstName,
            lastName: interviewer.lastName,
            email: interviewer.email,
          })
        );
        // =======
        //   const [showDropdown, setShowDropdown] = useState(false);
        //   const [selectedInterviewType, setSelectedInterviewType] = useState(null);
        //   const [internalInterviewers, setInternalInterviewers] = useState([]);
        //   // console.log("internalInterviewers selected", internalInterviewers);
        //   const [externalInterviewers, setExternalInterviewers] = useState([]);
        // >>>>>>> main

        if (roundEditData.interviewerType === "Internal") {
          if (
            JSON.stringify(internalInterviewers) !==
            JSON.stringify(normalizedInterviewers)
          ) {
            setInternalInterviewers(normalizedInterviewers);
            setExternalInterviewers([]);
          }
        } else if (roundEditData.interviewerType === "External") {
          if (
            JSON.stringify(externalInterviewers) !==
            JSON.stringify(normalizedInterviewers)
          ) {
            setExternalInterviewers(normalizedInterviewers);
            setInternalInterviewers([]);
          }
        }
      }

      // Fetch assessment questions if needed
      if (
        roundEditData.roundTitle === "Assessment" &&
        roundEditData.assessmentId
      ) {
        if (assessmentTemplate.assessmentId !== roundEditData.assessmentId) {
          setQuestionsLoading(true);
          fetchAssessmentQuestions(roundEditData.assessmentId).then(
            ({ data, error }) => {
              setQuestionsLoading(false);
              if (data) {
                setSectionQuestions(data?.sections || {});
              } else {
                console.error("Error fetching assessment questions:", error);
              }
            }
          );
        }
      }
    } else {
      const maxSequence =
        rounds?.length > 0 ? Math.max(...rounds.map((r) => r.sequence)) : 0;
      if (sequence !== maxSequence + 1) {
        setSequence(maxSequence + 1);
      }
    }
  }, [rounds, roundId, isEditing, assessmentData, interviewData]);

  const handleInternalInterviewerSelect = (
    interviewers,
    viewType,
    groupName
  ) => {
    // console.log("Interviewers passed to parent:", interviewers); // Debugging

    if (selectedInterviewType === "External") {
      alert(
        "You need to clear external interviewers before selecting Internal interviewers."
      );
      return;
    }


    console.log("interviwers", interviewers, viewType, groupName);


    // Clear existing interviewers when view type changes

    if (viewType && viewType !== interviewerViewType) {
      setInternalInterviewers([]);
      setInterviewerGroupName("");
    }

    setInterviewerViewType(viewType);
    setInterviewerGroupName(groupName);
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

    // console.log("uniqueInterviewers", uniqueInterviewers);

    // Extract only contactId values
    // const contactIds = uniqueInterviewers?.map((interviewer) => interviewer.contactId);
    // console.log("contactIds", contactIds);

    // console.log("internalInterviewers, uniqueInterviewers", internalInterviewers, uniqueInterviewers);
    // setInternalInterviewers([...internalInterviewers, ...interviewers]); // Append new interviewers
  };

  const handleExternalInterviewerSelect = (interviewers) => {
    if (selectedInterviewType === "Internal") {
      alert(
        "You need to clear Internal interviewers before selecting outsourced interviewers."
      );
      return;
    }
    // console.log("interviewersselcetd:", interviewers);

    // Ensure no duplicates and append new interviewers
    const uniqueInterviewers = interviewers.filter(
      (newInterviewer) =>
        !externalInterviewers.some((i) => i.id === newInterviewer.id)
    );

    setSelectedInterviewType("External");
    setExternalInterviewers([...externalInterviewers, ...uniqueInterviewers]); // Append new interviewers
  };

  const handleRemoveInternalInterviewer = (interviewerId) => {
    // console.log("Clearing interviewer");
    setInternalInterviewers((prev) => {
      const updatedInterviewers = prev.filter((i) => i._id !== interviewerId);

      // Reset selectedInterviewType if no interviewers are left
      if (updatedInterviewers.length === 0) {
        //  && externalInterviewers.length === 0
        setSelectedInterviewType(null);
        // setInternalInterviewers("")
        setInterviewerGroupName("");
        setInterviewerViewType("individuals");

        // Only reset selectedInterviewType if no external interviewers either
        if (externalInterviewers.length === 0) {
          setSelectedInterviewType(null);
        }
      }

      return updatedInterviewers;
    });
  };

  const handleRemoveExternalInterviewer = (interviewerId) => {
    setExternalInterviewers((prev) => {
      const updatedInterviewers = prev.filter((i) => i.id !== interviewerId);

      // Reset selectedInterviewType if no interviewers are left
      if (
        updatedInterviewers.length === 0 &&
        internalInterviewers.length === 0
      ) {
        setSelectedInterviewType(null);
      }

      return updatedInterviewers;
    });
  };

  const handleClearAllInterviewers = () => {
    // console.log("not clearing");

    setInternalInterviewers([]);
    setExternalInterviewers([]);
    setSelectedInterviewType(null);
    setInterviewerGroupName("");
    setInterviewerViewType("individuals");
  };

  const selectedInterviewers =
    selectedInterviewType === "Internal"
      ? internalInterviewers
      : externalInterviewers;
  // console.log("selectedInterviewers", selectedInterviewers);
  const isInternalSelected = selectedInterviewType === "Internal";
  const isExternalSelected = selectedInterviewType === "External";

  // const selectedInterviewersData = selectedInterviewers.map((interviewer) => {
  //   // if (isInternalSelected) {
  //   //   // For internal interviewers, access `contactId._id`
  //   //   return interviewer; // Use optional chaining to avoid errors
  //   // } else if (isExternalSelected) {
  //   //   // For external interviewers, access `id` directly
  //   //   return interviewer._id;
  //   // }
  //   console.log("interviewer 3", interviewer);
  //   return interviewer; // Fallback for unexpected cases
  // }).filter(Boolean);

  // console.log("selectedInterviewersData", selectedInterviewersData);

  //   useEffect(() => {
  //     if (isEditing && roundEditData) {
  //       setAssessmentTemplate(
  //         roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId
  //           ? {
  //             assessmentId: roundEditData.assessmentId,
  //             assessmentName: assessmentData.find((a) => a._id === roundEditData.assessmentId)?.AssessmentTitle || '',
  //           }
  //           : { assessmentId: '', assessmentName: '' }
  //       );
  //       setRoundTitle(roundEditData.roundTitle);
  //       setInterviewType(roundEditData.interviewType);
  //       setInterviewMode(roundEditData.interviewMode);
  //       setSelectedInterviewType(roundEditData.interviewerType);
  //       setInterviewQuestionsList(roundEditData.questions);
  //       setStatus(roundEditData.status);
  //       setInstructions(roundEditData.instructions || '');
  //       setSequence(roundEditData.sequence);
  //       setDuration(roundEditData.duration || 60);
  //       setInterviewerGroupName(roundEditData?.interviewerGroupName ||'');
  //       setInterviewerViewType(roundEditData?.interviewerViewType ||'');

  //       if (roundEditData.interviewers && roundEditData.interviewers.length > 0) {
  //         const normalizedInterviewers = roundEditData.interviewers.map((interviewer) => ({
  //           _id: interviewer._id, // Directly use _id as contactId
  //           firstName: interviewer.firstName,
  //           lastName: interviewer.lastName,
  //           email: interviewer.email,
  //         }));

  //         if (roundEditData.interviewerType === "Internal") {
  //           setInternalInterviewers(normalizedInterviewers);
  //         } else if (roundEditData.interviewerType === "External") {
  //           setExternalInterviewers(normalizedInterviewers); // Reuse the same structure
  //         }
  //       }

  //       if (roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId) {
  //         setAssessmentTemplate({
  //           assessmentId: roundEditData.assessmentId,
  //           assessmentName: assessmentData.find((a) => a._id === roundEditData.assessmentId)?.AssessmentTitle || '',
  //         });

  //         if (roundEditData?.assessmentId) {
  //           setQuestionsLoading(true)
  //           fetchAssessmentQuestions(roundEditData?.assessmentId).then(({ data, error }) => {
  //             if (data) {
  //               setQuestionsLoading(false)
  //               setSectionQuestions(data?.sections);

  //             } else {
  //               console.error('Error fetching assessment questions:', error);
  //               setQuestionsLoading(false)
  //             }
  //           });
  //         }

  //         // fetchQuestionsForAssessment(roundEditData.assessmentId);
  //       }

  //     } else {
  //       // For new round, set the sequence to be after the last round
  //       const maxSequence = rounds?.length > 0
  //         ? Math.max(...rounds.map(r => r.sequence))
  //         : 0;
  //       setSequence(maxSequence + 1);const response = await saveInterviewRound(payload);

  //     }
  //   },
  //   [rounds, isEditing, roundEditData, navigate, assessmentData, fetchAssessmentQuestions]
  //   // [rounds, isEditing, roundEditData, navigate, assessmentData, fetchAssessmentQuestions]
  // );

  const handleSubmit = async (e) => {
    // v1.0.2 <-----------------------------------------
    console.log("=== handleSubmit START ===");
    console.log("Form submission started");
    console.log("Current form data:", {
      roundTitle,
      interviewType,
      scheduledDate,
      duration,
      instructions,
      selectedInterviewers: selectedInterviewers?.length || 0,
      selectedMeetingPlatform
    });
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Form is already submitting, ignoring this submission");
      return;
    }

    setIsSubmitting(true);

    // console.log("roundEditData", roundEditData);
    // console.log("interviewId", interviewId);
    // console.log("roundId", roundId);
    // console.log("roundTitle", roundTitle);
    // console.log("interviewMode", interviewMode);
    // console.log("sequence", sequence);
    // console.log("assessmentTemplate", assessmentTemplate);
    // console.log("instructions", instructions);
    // console.log("status", status);
    // console.log("duration", duration);
    // console.log("combinedDateTime", combinedDateTime);
    // console.log("interviewType", interviewType);
    // console.log("selectedInterviewType", selectedInterviewType);
    // // console.log("selectedInterviewersData", selectedInterviewersData);
    // console.log("interviewQuestionsList", interviewQuestionsList);

    try {
      // console.log("Preparing round data for validation");
      // Clean interviewers data to remove undefined fields
      const cleanInterviewer = (interviewer) => {
        const { availability, ...rest } = interviewer;
        return rest;
      };
      // const cleanedInterviewers = selectedInterviewersData.map(cleanInterviewer);
      // console.log("cleanedInterviewers", cleanedInterviewers);

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
      // const roundData = {
      //   roundTitle,
      //   interviewMode,
      //   interviewerGroupName,
      //   interviewerViewType,
      //   sequence,
      //   ...(roundTitle === "Assessment" && assessmentTemplate.assessmentId
      //     ? { assessmentId: assessmentTemplate.assessmentId }
      //     : {}),
      //   instructions,
      //   status,
      //   ...(roundTitle !== "Assessment" && {
      //     duration,
      //     interviewerType: selectedInterviewType,
      //     dateTime: combinedDateTime,
      //     interviewType,
      //   }),
      //   ...(selectedInterviewType !== "external" && {
      //     interviewers: formattedInterviewers || [],
      //   }), // cleanedInterviewers
      // };

      const roundData = {
        roundTitle: roundTitle === "Other" ? customRoundTitle : roundTitle,
        interviewMode,
        interviewerGroupName,
        interviewerViewType,
        sequence,
        ...(roundTitle === "Assessment" && assessmentTemplate.assessmentId
          ? { assessmentId: assessmentTemplate.assessmentId }
          : {}),
        instructions,
        status,
        ...(roundTitle !== "Assessment" && {
          duration,
          interviewerType: selectedInterviewType,
          dateTime: combinedDateTime,
          interviewType,
        }),
        ...(selectedInterviewType !== "external" && {
          interviewers: formattedInterviewers || [],
        }),
      };

      // console.log("Validating the round data");
      const validationErrors = validateInterviewRoundData(roundData);
      setErrors(validationErrors);


      console.log("Validation errors:", validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        console.log("Validation errors found, stopping submission");
        scrollToFirstError(validationErrors, fieldRefs);
        return;
      }

      // v1.0.1 --------------------------------------------------------------------------------->


      // console.log("roundData", roundData);
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

      console.log("=== Round Saving Process ===");
      console.log("Payload for submission:", payload);

      // Use saveInterviewRound mutation from useInterviews hook
      console.log("Calling saveInterviewRound...");
      const response = await saveInterviewRound(payload);
      console.log("Round saved successfully:", response);
      console.log("Saved round ID:", response.savedRound._id);

      // Show success toast for round creation
      toast.success('Interview round created successfully!');


      console.log("Response from selectedInterviewers:", selectedInterviewers);
      console.log(
        "Response from selectedInterviewType:",
        selectedInterviewType
      );
      if (payload.round.roundTitle !== "Assessment") {


        // Handle outsource request if interviewers are selected
        if (selectedInterviewers && selectedInterviewers.length > 0) {
          const isInternal = selectedInterviewType === "Internal";
          console.log(
            `Sending ${selectedInterviewers.length} outsource requests`
          );
          console.log("selectedInterviewers", selectedInterviewers);

          for (const interviewer of selectedInterviewers) {
            // console.log("interviewer", interviewer);
            // console.log("interviewer contactId", interviewer.contact?._id);
            const outsourceRequestData = {
              tenantId: orgId,
              ownerId: userId,
              scheduledInterviewId: interviewId,
              interviewerType: selectedInterviewType,
              interviewerId: interviewer.contact?._id || interviewer._id,
              status: isInternal ? "accepted" : "Request Sent",
              dateTime: combinedDateTime,
              duration,
              candidateId: candidate?._id,
              positionId: position?._id,
              roundId: response.savedRound._id,
              requestMessage: isInternal
                ? "Internal interview request"
                : "Outsource interview request",
              expiryDateTime: new Date(
                Date.now() + 24 * 60 * 60 * 1000
              ).toISOString(),
            };

            // console.log("Sending outsource request:", outsourceRequestData);
            await axios.post(
              `${config.REACT_APP_API_URL}/interviewrequest`,
              outsourceRequestData,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Cookies.get("authToken")}`,
                },
              }
            );
          }

          // Send outsource interview request emails if this is an outsource round
          if (!isInternal && selectedInterviewers && selectedInterviewers.length > 0) {
            try {
              console.log("=== Sending outsource interview request emails ===");
              const interviewerIds = selectedInterviewers.map(interviewer =>
                interviewer.contact?._id || interviewer._id
              );

              const emailResponse = await axios.post(
                `${config.REACT_APP_API_URL}/emails/interview/outsource-request-emails`,
                {
                  interviewId: interviewId,
                  roundId: response.savedRound._id,
                  interviewerIds: interviewerIds,
                  candidateId: candidate?._id,
                  positionId: position?._id,
                  dateTime: combinedDateTime,
                  duration: duration,
                  roundTitle: roundTitle
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get("authToken")}`,
                  },
                }
              );

              console.log("Outsource email sending response:", emailResponse.data);

              if (emailResponse.data.success) {
                // toast.success(`Outsource interview request emails sent to ${emailResponse.data.data.successfulEmails} interviewers`);
                if (emailResponse.data.data.failedEmails > 0) {
                  toast.warning(`${emailResponse.data.data.failedEmails} emails failed to send`);
                }
              } else {
                toast.error('Failed to send outsource interview request emails');
              }
            } catch (emailError) {
              console.error("Error sending outsource interview request emails:", emailError);
              toast.error('Failed to send outsource interview request emails');
            }
          }
        }


        // console.log("response", response);


        // don't remove this code related to agora video room
        // if (response.status === 'ok'){
        //   const video_call_res = await axios.post(`${config.REACT_APP_API_URL}/api/agora/create-video-room`,
        //     {
        //       title: roundTitle,
        //       enablePSTN: false
        //     }
        //   )
        //   console.log("video_call_res",video_call_res.data);

        // }

        // Meeting platform link creation
        if (response.status === 'ok') {
          console.log("Generating meeting link for the interview");

          try {
            setIsMeetingCreationLoading(true);
            // v1.0.3 <-----------------------------------------------------------
            setMeetingCreationProgress('Creating links...');
            // v1.0.3 ----------------------------------------------------------->
            // Import the meeting platform utility
            const { createMeeting } = await import('../../../../../utils/meetingPlatforms.js');

            console.log("Selected interviewers for meeting creation:", selectedInterviewers);

            // Create meeting using the platform utility
            const meetingLink = await createMeeting(selectedMeetingPlatform, {
              roundTitle,
              instructions,
              combinedDateTime,
              duration,
              selectedInterviewers: selectedInterviewers
            }, (progress) => {
              setMeetingCreationProgress(progress);
            });
            // Persist meeting link on the round (avoid reassigning consts)
            if (meetingLink) {
              const updatedRoundData = {
                ...roundData,
                meetingId: meetingLink,
              };
              const targetRoundId = response?.savedRound?._id || roundId;
              const updatePayload = {
                interviewId,
                roundId: targetRoundId,
                round: updatedRoundData,
                ...(isEditing ? { questions: interviewQuestionsList } : {}),
              };
              const updateResponse = await saveInterviewRound(updatePayload);
              console.log("Round updated with meeting link:", updateResponse);
            }

            console.log("Meeting created successfully:", meetingLink);
            console.log("Meeting link type:", typeof meetingLink);
            console.log("Meeting link value:", meetingLink);

            // Use the new utility to generate and save meeting URLs
            try {
              console.log("=== Starting meeting URL processing ===");

              // // Dynamic import to avoid import issues
              // const { processMeetingUrls } = await import("../../../../../utils/meetingUrlGenerator.js");
              // console.log("Dynamic import successful, processMeetingUrls type:", typeof processMeetingUrls);

              // console.log("Calling processMeetingUrls with:", {
              //   meetingLink,
              //   roundId: response.savedRound._id,
              //   interviewId,
              //   roundData,
              //   updateRoundWithMeetingLinks: typeof updateRoundWithMeetingLinks
              // });
              // console.log("updateRoundWithMeetingLinks function:", updateRoundWithMeetingLinks);
              // console.log("roundData details:", roundData);

              // const result = await processMeetingUrls(
              //   meetingLink, // meetingLink
              //   response.savedRound._id, // roundId
              //   interviewId, // interviewId
              //   roundData, // roundData
              //   updateRoundWithMeetingLinks // Function from useInterviews hook
              // );

              // console.log("Meeting URL processing completed successfully:", result);
              const isInternal = selectedInterviewType === "Internal";
              // Send emails after meeting links are generated
              try {
                console.log("=== Sending interview round emails ===");

                if (isInternal) {
                  const emailResponse = await axios.post(
                    `${config.REACT_APP_API_URL}/emails/interview/round-emails`,
                    {
                      interviewId: interviewId,
                      roundId: response.savedRound._id,
                      sendEmails: true
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get("authToken")}`,
                      },
                    }
                  );

                  console.log("Email sending response:", emailResponse.data);

                  // Show success toast for emails
                  if (emailResponse.data.success) {
                    toast.success('Interview round created and emails sent successfully!');
                    if (emailResponse.data.data.emailsSent > 0) {
                      toast.success(`Emails sent to ${emailResponse.data.data.emailsSent} recipients`);
                    }
                  } else {
                    toast.error('Round created but email sending failed');
                  }

                }


              } catch (emailError) {
                console.error("Error sending emails:", emailError);
                toast.error('Round created but email sending failed');
              }
            } catch (urlError) {
              console.error("Error processing meeting URLs:", urlError);
              console.error("URL Error details:", {
                message: urlError.message,
                stack: urlError.stack,
                response: urlError.response?.data
              });
            }

            // Navigate to interview page after successful creation
            console.log("Navigating to interview page:", `/interviews/${interviewId}`);
            console.log("Navigation function type:", typeof navigate);
            navigate(`/interviews/${interviewId}`);
            console.log("Navigation called successfully");

          } catch (err) {
            console.error("Error in meeting creation:", err);
            setErrors({
              meetingCreation: err.message || "Failed to create meeting"
            });
          } finally {
            console.log("Meeting creation process finished");
            setIsMeetingCreationLoading(false);
            setMeetingCreationProgress('');
          }
        }
      }
    } catch (err) {
      console.error("=== Form Submission Error ===");
      console.error("Error submitting the form:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });

      // Show error toast
      toast.error('Failed to create interview round. Please try again.');

      setErrors({
        submit:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      console.log("=== handleSubmit END ===");
      console.log("Form submission process completed");
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
      path: "/interviewList",
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
    setDuration(parseInt(assessment.Duration.replace(" minutes", "")));
    setInstructions(assessment.Instructions);
    setExpandedSections({});
    setSectionQuestions({});

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

  // const fetchQuestionsForSection = async (sectionId) => {
  //   try {
  //     const response = assessmentData.find(pos => pos._id === assessmentTemplate.assessmentId)
  //     // const response = await axios.get(`${config.REACT_APP_API_URL}/assessments/${assessmentTemplate.assessmentId}`);
  //     const assessment = response;

  //     const section = assessment.Sections.find(s => s._id === sectionId);
  //     if (!section) {
  //       throw new Error('Section not found');
  //     }

  //     setSectionQuestions(prev => ({
  //       ...prev,
  //       [sectionId]: section.Questions
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching questions:', error);
  //     setSectionQuestions(prev => ({
  //       ...prev,
  //       [sectionId]: 'error'
  //     }));
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 md:px-8 xl:px-8 2xl:px-8">
        <div className="px-4 sm:px-0">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? "Edit Interview Round" : "Add New Interview Round"}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isEditing
                  ? "Update the round details below"
                  : "Fill in the details to add a new interview round"}
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
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
                      <label
                        htmlFor="roundTitle"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Round Title <span className="text-red-500">*</span>
                      </label>
                      {/* v1.0.1 <------------------------------------------------------------------------ */}
                      {roundTitle === "Other" ? (
                        <input
                          ref={fieldRefs.roundTitle}
                          type="text"
                          id="roundTitle"
                          name="roundTitle"
                          value={customRoundTitle}
                          onChange={(e) => {
                            setCustomRoundTitle(e.target.value);
                            setErrors({ ...errors, roundTitle: "" }); // Clear error on change
                          }}
                          onBlur={() => {
                            if (!customRoundTitle.trim()) {
                              setRoundTitle(""); // Reset if the input is left empty
                            }
                          }}
                          // className={`mt-1 block w-full border ${
                          //   errors.roundTitle
                          //     ? "border-red-500"
                          //     : "border-gray-300"
                          // } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                            border ${errors.roundTitle
                              ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                              : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                          `}
                          // required
                          placeholder="Enter Custom Round Title"
                        />
                      ) : (
                        <select
                          ref={fieldRefs.roundTitle}
                          id="roundTitle"
                          name="roundTitle"
                          value={roundTitle}
                          onChange={(e) => {
                            handleRoundTitleChange(e);
                            setErrors({
                              ...errors,
                              roundTitle: "",
                              interviewMode: "",
                            }); // Clear error on change
                          }}
                          // className={`mt-1 block w-full border ${
                          //   errors.roundTitle
                          //     ? "border-red-500"
                          //     : "border-gray-300"
                          // } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                            border ${errors.roundTitle
                              ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                              : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                          `}
                        // required
                        >
                          <option value="">Select Round Title</option>
                          <option value="Assessment">Assessment</option>
                          <option value="Technical">Technical</option>
                          <option value="Final">Final</option>
                          <option value="HR Interview">HR Interview</option>
                          <option value="Other">Other</option>
                        </select>
                      )}
                      {errors.roundTitle && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.roundTitle}
                        </p>
                      )}
                      {/* v1.0.1 ------------------------------------------------------------------------> */}
                    </div>

                    {/* Interview Mode */}
                    <div>
                      <label
                        htmlFor="mode"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Interview Mode <span className="text-red-500">*</span>
                      </label>
                      {/* v1.0.1 <-------------------------------------------------------------------------------- */}
                      <select
                        ref={fieldRefs.interviewMode}
                        id="interviewMode"
                        name="interviewMode"
                        value={interviewMode}
                        onChange={(e) => {
                          setInterviewMode(e.target.value);
                          setErrors({ ...errors, interviewMode: "" }); // Clear error on change
                        }}
                        // className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                        //   errors.interviewMode
                        //     ? "border-red-500"
                        //     : "border-gray-300"
                        // } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                          border ${errors.interviewMode
                            ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                            : "border-gray-300 focus:ring-red-300"
                          }
                          focus:outline-gray-300
                        `}
                        // required
                        disabled={roundTitle === "Assessment"}
                      >
                        <option value="">Select Interview Mode</option>
                        <option value="Face to Face">Face to Face</option>
                        <option value="Virtual">Virtual</option>
                      </select>
                      {errors.interviewMode && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.interviewMode}
                        </p>
                      )}
                      {/* v1.0.1 --------------------------------------------------------------------------------> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    {/* Sequence */}
                    <div>
                      <label
                        htmlFor="sequence"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Sequence <span className="text-red-500">*</span>
                      </label>
                      {/* v1.0.1 <------------------------------------------------------------------------------------- */}
                      <input
                        ref={fieldRefs.sequence}
                        type="number"
                        id="sequence"
                        name="sequence"
                        min="1"
                        value={sequence}
                        onChange={(e) => {
                          setSequence(parseInt(e.target.value));
                          setErrors({ ...errors, sequence: "" }); // Clear error on change
                        }}
                        // className={`mt-1 block w-full border ${
                        //   errors.sequence ? "border-red-500" : "border-gray-300"
                        // } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                          border ${errors.sequence
                            ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                            : "border-gray-300 focus:ring-red-300"
                          }
                          focus:outline-gray-300
                        `}
                      // required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The order in which this round appears in the interview
                        process
                      </p>
                      {errors.sequence && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.sequence}
                        </p>
                      )}
                      {/* v1.0.1 ---------------------------------------------------------------------------------------> */}
                    </div>

                    {/* Status */}

                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1 flex items-center">
                        <span
                          className="text-gray-700 block w-full pl-3 pr-10 py-2 text-base border sm:text-sm rounded-md"
                          disabled
                        >
                          {status}
                        </span>{" "}
                      </div>
                    </div> */}

                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Duration (Minutes)
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        value={duration}
                        onChange={(e) =>
                          setDuration(parseInt(e.target.value))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                      >
                        <option value="30">30 min</option>
                        <option value="60">60 min</option>
                        <option value="90">90 min</option>
                        <option value="120">120 min</option>
                      </select>
                    </div>

                    {roundTitle === "Assessment" && (
                      <>
                        <div>
                          <label
                            htmlFor="assessmentTemplate"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Assessment Template{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {/* v1.0.1 <--------------------------------------------------------------------- */}
                          <div className="relative flex-1">
                            <input
                              ref={fieldRefs.assessmentTemplate}
                              type="text"
                              name="assessmentTemplate"
                              id="assessmentTemplate"
                              // className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                                border ${errors.assessmentTemplate
                                  ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                  : "border-gray-300 focus:ring-red-300"
                                }
                                focus:outline-gray-300
                              `}
                              placeholder="Enter Assessment Template Name"
                              value={assessmentTemplate.assessmentName || ""}
                              onChange={(e) => {
                                setAssessmentTemplate((prev) => ({
                                  ...prev,
                                  assessmentId: prev.assessmentId, // Keep the existing assessmentId
                                  assessmentName: e.target.value, // Update assessmentName
                                }));
                                setErrors((prev) => ({
                                  ...prev,
                                  assessmentTemplate: "",
                                })); // Clear only this error
                              }}
                              onClick={() => setShowDropdown(!showDropdown)}
                            />
                            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                              <Search className="text-gray-600 text-lg" />
                            </div>
                            {showDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {assessmentData.length > 0 ? (
                                  assessmentData.map((user, index) => (
                                    <div
                                      key={index}
                                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() =>
                                        handleAssessmentSelect(user)
                                      }
                                    >
                                      {user.AssessmentTitle}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-gray-500">
                                    No Assessments Found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {errors.assessmentTemplate && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.assessmentTemplate}
                            </p>
                          )}
                          {/* v1.0.1 ---------------------------------------------------------------------> */}
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
                                                    className={`transform transition-transform ${expandedSections[sectionId]
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
                                                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[
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
                                                                                className={`text-sm p-2 rounded border ${option ===
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
                            onClick={() => setInterviewType("instant")}
                            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "instant"
                              ? "border-custom-blue bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                              }`}
                          >
                            <Clock
                              className={`h-6 w-6 ${interviewType === "instant"
                                ? "text-custom-blue/70"
                                : "text-gray-400"
                                }`}
                            />
                            <span
                              className={`mt-2 font-medium ${interviewType === "instant"
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
                            onClick={() => setInterviewType("scheduled")}
                            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "scheduled"
                              ? "border-custom-blue bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                              }`}
                          >
                            <Calendar
                              className={`h-6 w-6 ${interviewType === "scheduled"
                                ? "text-custom-blue/70"
                                : "text-gray-400"
                                }`}
                            />
                            <span
                              className={`mt-2 font-medium ${interviewType === "scheduled"
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
                                value={scheduledDate}
                                //<-----v1.0.4----
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const minVal = twoHoursFromNowLocal();
                                  // Prevent selecting past/less than 2 hours from now
                                  setScheduledDate(val && val < minVal ? minVal : val);
                                }}
                                min={twoHoursFromNowLocal()}
                                //-----v1.0.4---->
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                              />
                            </div>
                          )}

                          {/* <div className="mt-4">
                            <label
                              htmlFor="duration"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Duration (Minutes)
                            </label>
                            <select
                              id="duration"
                              name="duration"
                              value={duration}
                              onChange={(e) =>
                                setDuration(parseInt(e.target.value))
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                            >
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">60 min</option>
                              <option value="90">90 min</option>
                              <option value="120">120 min</option>
                            </select>
                          </div> */}
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
                                </span>{" "}
                                and end at{" "}
                                <span className="font-medium">
                                  {new Date(endTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </p>
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
                                to{" "}
                                <span className="font-medium">
                                  {new Date(endTime).toLocaleString([], {
                                    timeStyle: "short", // ✅ only show time
                                  })}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Select Interviewers */}
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Interviewers
                        </label>
                        <div className="flex space-x-2">
                          {organization === false ? (
                            <Button
                              type="button"
                              onClick={() => {
                                handleInternalInterviewerSelect([ownerData]);
                                // clearError('interviewerType');
                              }}
                              variant="outline"
                              size="sm"
                              className={`${isExternalSelected
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                              disabled={isExternalSelected}
                              title={
                                isExternalSelected
                                  ? "Clear external interviewers first"
                                  : ""
                              }
                            >
                              <User className="h-4 w-4 mr-1 text-custom-blue" />
                              Select Internal
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => setInternalInterviews(true)}
                              variant="outline"
                              size="sm"
                              className={`${isExternalSelected
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                                }`}
                              disabled={isExternalSelected}
                              title={
                                isExternalSelected
                                  ? "Clear external interviewers first"
                                  : ""
                              }
                            >
                              <User className="h-4 w-4 mr-1 text-custom-blue" />
                              Select Internal
                            </Button>
                          )}

                          <Button
                            type="button"
                            onClick={() => setShowOutsourcePopup(true)}
                            variant="outline"
                            size="sm"
                            className={`${isInternalSelected
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                              }`}
                            disabled={isInternalSelected}
                            title={
                              isInternalSelected
                                ? "Clear internal interviewers first"
                                : ""
                            }
                          >
                            <User className="h-4 w-4 mr-1 text-orange-600" />
                            Select Outsourced
                          </Button>
                        </div>
                      </div>

                      {/* Selected Interviewers Summary */}
                      <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                        {selectedInterviewers.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center">
                            No Interviewers Selected
                          </p>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700">
                                  {selectedInterviewers.length} Interviewer
                                  {selectedInterviewers.length > 1 ? "s " : " "}
                                  Selected
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
                              {selectedInterviewers.length > 0 && (
                                <button
                                  type="button"
                                  onClick={handleClearAllInterviewers}
                                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Clear All
                                </button>
                              )}
                            </div>

                            {/* Internal Interviewers */}
                            {isInternalSelected && (
                              <section className="mb-4 w-full">
                                <h4 className="text-sm font-semibold text-gray-600 mb-3">
                                  {interviewerViewType === "groups"
                                    ? "Interviewer Groups "
                                    : "Internal Interviewers "}
                                  <span className="text-xs text-custom-blue">
                                    (
                                    {internalInterviewers.length ||
                                      "Not Provided"}
                                    {internalInterviewers.length > 1
                                      ? " members"
                                      : " member"}
                                    )
                                  </span>
                                  {/* {formData.interviewerViewType === 'groups' && formData.interviewerGroupName && (
                                                    <span className="ml-2 text-sm font-normal">(Group: {formData.interviewerGroupName})</span>
                                                                  )} */}
                                </h4>
                                <div className="grid grid-cols-4 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 w-full gap-4">
                                  {internalInterviewers.map(
                                    (interviewer, index) => {
                                      // Render group card
                                      if (
                                        interviewerViewType === "groups" &&
                                        interviewerGroupName
                                      ) {
                                        return (
                                          <div
                                            key={`group-${index}`}
                                            className="rounded-xl border w-[80%] md:w-[30%] border-blue-200 bg-blue-50 p-3 shadow-sm flex flex-col justify-between"
                                          >
                                            <div className="flex justify-between items-start mb-2">
                                              <div>
                                                <span className="font-medium text-custom-blue block">
                                                  {interviewerGroupName ||
                                                    "Not Provided"}
                                                </span>
                                              </div>
                                              <button
                                                onClick={() =>
                                                  handleRemoveInternalInterviewer(
                                                    interviewer._id
                                                  )
                                                }
                                                className="text-red-400 rounded-full p-1 hover:bg-blue-100 transition"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                            </div>
                                            <div>
                                              {/* <p className="text-xs text-gray-600 mb-2">{interviewer.description}</p> */}
                                              <ul className="list-disc list-inside text-xs text-custom-blue ml-1">
                                                {interviewer.usersNames &&
                                                  interviewer.usersNames.length >
                                                  0
                                                  ? interviewer.usersNames.map(
                                                    (name, i) => (
                                                      <li
                                                        key={`${interviewer._id}-user-${i}`}
                                                      >
                                                        {name}
                                                      </li>
                                                    )
                                                  )
                                                  : `${interviewer.firstName ||
                                                    ""
                                                    } ${interviewer.lastName || ""
                                                    }`.trim() ||
                                                  interviewer.email}

                                                {/* {interviewer.usersNames.map((name, i) => (
                                                                                <li key={`${interviewer._id}-user-${i}`}>{name}</li>
                                                                              ))} */}
                                              </ul>
                                            </div>

                                          </div>
                                        );
                                      }

                                      // Render individual interviewer card
                                      return (
                                        <div
                                          key={`${interviewer._id}-${index}`}
                                          className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm w-full md:w-auto"
                                        >
                                          <div className="flex items-center">
                                            <User className="h-4 w-4 text-custom-blue mr-2" />
                                            <span className="text-sm font-medium text-custom-blue truncate">
                                              {`${interviewer.firstName || ""
                                                } ${interviewer.lastName || ""
                                                }`.trim() || interviewer.email}
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveInternalInterviewer(
                                                interviewer._id
                                              )
                                            }
                                            className="text-red-400 rounded-full p-1 hover:bg-blue-100 transition"
                                            title="Remove interviewer"
                                          >
                                            <X className="h-4 w-4" />
                                          </button>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </section>
                              // <div className="mb-3">
                              //   <h4 className="text-xs font-medium text-gray-500 mb-2">Internal Interviewers</h4>
                              //   <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                              //     {/* {console.log("internalInterviewers near shoing place :", internalInterviewers)} */}
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
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">
                                  Outsourced Interviewers
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {/* {console.log("externalInterviewers near shoing place :", externalInterviewers)} */}
                                  {externalInterviewers?.map((interviewer) => (
                                    <div
                                      key={interviewer.id}
                                      className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2"
                                    >
                                      <div className="flex items-center">
                                        <span className="ml-2 text-sm text-orange-800 truncate">
                                          {interviewer?.contact?.firstName}{" "}
                                          {interviewer?.contact?.lastName}{" "}
                                          (Outsourced)
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveExternalInterviewer(
                                            interviewer.id
                                          )
                                        }
                                        className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100"
                                        title="Remove interviewer"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                                        className={`flex justify-between items-center p-3 border rounded-md ${isMandatory
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
                          {isInterviewQuestionPopup && (
                            <div
                              className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50"
                              onClick={() => setIsInterviewQuestionPopup(false)}
                            >
                              <div
                                className="bg-white rounded-md w-[95%] h-[90%]"
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
                        </div>
                      </div>
                    </>
                  )}

                  {/* instructions */}
                  <div>
                    <label
                      htmlFor="feedback"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Instructions
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      rows="10"
                      minLength={50}
                      maxLength={1000}
                      placeholder="Add Instructions after the interview round is completed"
                      value={instructions}
                      readOnly={roundTitle === "Assessment"}
                      onChange={(e) => setInstructions(e.target.value)}
                      className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3   sm:text-sm h-64
                  ${errors.instructions ? "border-red-400" : ""}
                  `}
                    // className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">
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
                      isLoading={isMutationLoading || isMeetingCreationLoading || isSubmitting}
                      loadingText={
                        isMeetingCreationLoading
                          ? meetingCreationProgress || "Creating meeting..."
                          : isSubmitting
                            ? "Submitting..."
                            : isEditing ? "Updating..." : "Saving..."
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
        <OutsourceOption
          onClose={() => setShowOutsourcePopup(false)}
          dateTime={combinedDateTime}
          positionData={position}
          onProceed={handleExternalInterviewerSelect}
        />
      )}

      {isInternalInterviews && (
        <InternalInterviews
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
          defaultViewType={interviewerViewType}
          selectedGroupName={interviewerGroupName}
        //  clearOnViewTypeChange={true}
        />
      )}
    </div>
  );
};

export default RoundFormInterviews;
