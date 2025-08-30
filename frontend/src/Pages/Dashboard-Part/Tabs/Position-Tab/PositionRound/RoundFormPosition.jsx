// v1.0.0 - Ashok - Added scroll to first error

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../CommonCode-AllTabs/ui/button.jsx";
import Breadcrumb from "../../CommonCode-AllTabs/Breadcrumb.jsx";
import Loading from "../../../../../Components/Loading.js";
import { ChevronDown, X, User, Users, Trash2, ChevronUp } from "lucide-react";
import Cookies from "js-cookie";
import InternalInterviews from "../../Interview-New/pages/Internal-Or-Outsource/InternalInterviewers.jsx";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
import QuestionBank from "../../QuestionBank-Tab/QuestionBank.jsx";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import { usePositions } from "../../../../../apiHooks/usePositions";
import LoadingButton from "../../../../../Components/LoadingButton";
import axios from "axios";
import { config } from "../../../../../config.js";
import { useCustomContext } from "../../../../../Context/Contextfetch.js";
// v1.0.0 <------------------------------------------------------------------------
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import { notify } from "../../../../../services/toastService.js";
// v1.0.0 ------------------------------------------------------------------------>

function RoundFormPosition() {
  const { userProfile } = useCustomContext();
  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const firstName = formatName(userProfile?.firstName);
  const lastName = formatName(userProfile?.lastName);

  const { assessmentData, fetchAssessmentQuestions } = useAssessments();
  const { positionData, isMutationLoading, addRounds } = usePositions();

  const { roundId, id } = useParams();
  const positionId = id;

  // Get user token information
  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;

  const isPositionContext = !!positionId;
  const contextId = isPositionContext && positionId;

  const [position, setPosition] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [isLoadinground, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInternalInterviews, setInternalInterviews] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assessmentTemplate: { assessmentId: "", assessmentName: "" },
    roundTitle: "",
    customRoundTitle: "",
    interviewMode: "",
    selectedQuestions: [],
    instructions: "",
    sequence: 1,
    interviewQuestionsList: [],
    interviewerViewType: "individuals",
    interviewerGroupName: "",
    interviewers: [],
    // internalInterviewers: [],
    interviewerType: "",
    scheduledDate: "",
    duration: 30,
  });
  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] =
    useState(false);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [errors, setErrors] = useState({ roundTitle: "", interviewMode: "" });
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [assessmentQuestionsLoading, setAssessmentQuestionsLoading] =
    useState(false);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const clearError = (fieldName) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  // v1.0.2 <------------------------------------------------------------
  const fieldRefs = {
    roundTitle: useRef(null),
    interviewMode: useRef(null),
    assessmentTemplate: useRef(null),
    interviewerType: useRef(null),
    questions: useRef(null),
    instructions: useRef(null),
  };
  // v1.0.2 ------------------------------------------------------------>

  const handleToggleMandatory = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.map((question) =>
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
      ),
    }));
  };

  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      setFormData((prev) => ({
        ...prev,
        interviewQuestionsList: prev.interviewQuestionsList.some(
          (q) => q.questionId === question.questionId
        )
          ? prev.interviewQuestionsList
          : [
              ...prev.interviewQuestionsList,
              {
                ...question,
                mandatory: "false",
              },
            ],
      }));

      setErrors((prev) => ({
        ...prev,
        questions: undefined,
      }));
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.filter(
        (question) => question.questionId !== questionId
      ),
    }));
    setRemovedQuestionIds((prev) => [...prev, questionId]);
  };

  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;
    const isAssessment = selectedTitle === "Assessment";
    const wasAssessment = formData.roundTitle === "Assessment";

    setFormData((prev) => ({
      ...prev,
      roundTitle: selectedTitle,
      customRoundTitle: selectedTitle === "Other" ? "" : prev.customRoundTitle,
      // Reset fields that don't apply to Assessment
      ...(isAssessment
        ? {
            interviewMode: "Virtual", // Assessment is always virtual
            interviewerType: null,
            interviewers: [],
            instructions: "", // Clear instructions for Assessment
            interviewQuestionsList: [],
          }
        : {
            // When switching FROM Assessment to other types, clear assessment-related fields
            ...(wasAssessment
              ? {
                  assessmentTemplate: { assessmentId: "", assessmentName: "" },
                  instructions: "", // Clear instructions when switching from Assessment
                }
              : {}),
            // For other transitions, keep existing instructions unless switching to Other
            instructions:
              selectedTitle === "Other"
                ? ""
                : wasAssessment
                ? ""
                : prev.instructions,
          }),
      // Preserve sequence in all cases
      sequence: prev.sequence,
    }));

    if (isAssessment) {
      setSectionQuestions({});
      setExpandedSections({});
      setExpandedQuestions({});
    }

    // Clear all errors
    setErrors({});
    clearError("roundTitle");
    setShowDropdown(false);
  };

  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);

  // while editing
  const isEditing = !!roundId && roundId !== "new";
  const roundEditData = isEditing && rounds?.find((r) => r._id === roundId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchPositionData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (isPositionContext && positionId) {
          const foundPosition = positionData.find(
            (pos) => pos._id === positionId
          );

          if (!foundPosition) {
            throw new Error("Position not found");
          }

          // Only update rounds if they're different to prevent unnecessary re-renders
          setPosition(foundPosition || []);
          setRounds(foundPosition.rounds || []);

          if (isEditing) {
            // Add safety check for foundPosition.rounds
            const roundEditData = foundPosition.rounds?.find(
              (r) => r._id === roundId
            );
            if (!roundEditData) {
              throw new Error("Round not found");
            }

            console.log("roundEditData", roundEditData);

            // Add fallback empty array for interviewers
            const interviewers = roundEditData.interviewers || [];
            const internalInterviewers = interviewers;

            setFormData((prev) => ({
              ...prev,
              assessmentTemplate:
                roundEditData.roundTitle === "Assessment" &&
                roundEditData.assessmentId
                  ? {
                      assessmentId: roundEditData.assessmentId,
                      assessmentName:
                        assessmentData.find(
                          (a) => a._id === roundEditData.assessmentId
                        )?.AssessmentTitle || "",
                    }
                  : { assessmentId: "", assessmentName: "" },
              // roundTitle: roundEditData.roundTitle || '',
              // customRoundTitle: '',
              roundTitle: [
                "Assessment",
                "Technical",
                "Final",
                "HR Interview",
              ].includes(roundEditData.roundTitle)
                ? roundEditData.roundTitle
                : "Other",
              customRoundTitle: ![
                "Assessment",
                "Technical",
                "Final",
                "HR Interview",
              ].includes(roundEditData.roundTitle)
                ? roundEditData.roundTitle.trim("")
                : "",
              interviewMode: roundEditData.interviewMode || "",
              selectedQuestions: [],
              instructions: roundEditData.instructions || "",
              sequence: roundEditData.sequence || 1,
              interviewQuestionsList: roundEditData.questions || [],
              // selectedInterviewType: roundEditData.interviewerType || null,
              interviewers: internalInterviewers || [],
              // internalInterviewers:internalInterviewers || [],
              interviewerType: roundEditData.interviewerType || "",
              scheduledDate: "",
              duration: roundEditData.duration || 30,
              interviewerViewType:
                roundEditData.interviewerType === "Internal"
                  ? roundEditData.interviewerViewType
                  : "individuals",
              interviewerGroupName: roundEditData?.interviewerGroupName,
              // if ( && roundEditData.viewType) {
              // setInterviewerViewType(roundEditData.viewType);
              // }
            }));

            if (
              roundEditData.roundTitle === "Assessment" &&
              roundEditData.assessmentId
            ) {
              const assessmentDataForTemplate = {
                assessmentId: roundEditData.assessmentId,
                assessmentName:
                  assessmentData.find(
                    (a) => a._id === roundEditData.assessmentId
                  )?.AssessmentTitle || "",
              };
              // setAssessmentTemplate(assessmentDataForTemplate);
              // fetchQuestionsForAssessment(roundEditData.assessmentId);
              if (roundEditData?.assessmentId) {
                setAssessmentQuestionsLoading(true);
                fetchAssessmentQuestions(roundEditData?.assessmentId).then(
                  ({ data, error }) => {
                    if (data) {
                      setAssessmentQuestionsLoading(false);
                      setSectionQuestions(data?.sections);
                    } else {
                      setAssessmentQuestionsLoading(false);
                      console.error(
                        "Error fetching assessment questions:",
                        error
                      );
                    }
                  }
                );
              }
            }
          } else {
            // For new round, set the sequence to be after the last round
            const maxSequence =
              foundPosition.rounds?.length > 0
                ? Math.max(...foundPosition.rounds.map((r) => r.sequence))
                : 0;
            setFormData((prev) => ({ ...prev, sequence: maxSequence + 1 }));
          }
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching position data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we're in position context and have an ID
    // if (isPositionContext && positionId) {
    fetchPositionData();
    // }
  }, [positionData, positionId, isEditing, roundId, assessmentData]); // Removed problematic dependencies

  useEffect(() => {
    const filterAssessmentsWithQuestions = async () => {
      if (hasFiltered || !position) return;

      const results = await Promise.all(
        assessmentData.map(async (assessment) => {
          if (!assessment?._id) return null;

          const { data } = await fetchAssessmentQuestions(assessment._id);

          if (Array.isArray(data?.sections) && data.sections.length > 0) {
            return assessment;
          }

          return null;
        })
      );

      setFilteredAssessments(results.filter(Boolean));
      setHasFiltered(true);
    };

    if (position && assessmentData?.length) {
      filterAssessmentsWithQuestions();
    }
  }, [position, assessmentData, fetchAssessmentQuestions]);

  const toggleSection = async (sectionId) => {
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
    //   await fetchQuestionsForAssessment(formData.assessmentTemplate[0].assessmentId);
    // }
  };

  const handleInternalInterviewerSelect = (
    interviewers,
    viewType,
    groupName
  ) => {
    if (formData.interviewerType === "External") {
      alert(
        "You need to clear external interviewers before selecting Internal interviewers."
      );
      return;
    }
    console.log("interviewers", interviewers);
    if (viewType === "groups") {
      setFormData((prev) => ({
        ...prev,
        interviewerGroupName: groupName,
      }));
    }

    if (organization === false) {
      // For non-organization users, set the current user as the interviewer
      const currentUser = {
        _id: ownerId,
        firstName: firstName,
        lastName: lastName,
        email: tokenPayload?.email || "",
        name: `${firstName || ""} ${lastName || ""}`.trim(),
      };

      setFormData((prev) => ({
        ...prev,
        interviewerType: "Internal",
        interviewers: [currentUser],
        interviewerViewType: "individuals",
      }));
      setInternalInterviews(false);
    } else {
      // For organization users, show the internal interviews popup
      if (interviewers) {
        // const interviewersWithFullName = interviewers.map(interviewer => ({
        //   ...interviewer,
        //   name: `${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim()
        // }));

        setFormData((prev) => ({
          ...prev,
          interviewerType: "Internal",
          interviewers: interviewers || [],
          interviewerViewType: viewType || "individuals",
          interviewerGroupName: groupName || "",
        }));
        if (viewType) {
          setFormData((prev) => ({
            ...prev,
            interviewerViewType: viewType || "individuals",
          }));
        }
      } else {
        setInternalInterviews(true);
      }
    }
  };

  const handleExternalInterviewerSelect = () => {
    if (formData.interviewerType === "Internal") {
      alert(
        "You need to clear internal interviewers before selecting outsourced interviewers."
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      interviewerType: "External",
    }));
  };

  // const handleRemoveInternalInterviewer = (interviewerId) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     interviewers: prev.interviewers.filter(
  //       interviewer => interviewer._id !== interviewerId
  //     ),

  //     interviewerType: prev.interviewers.length === 1 ? '' : prev.interviewerType
  //   }));

  // };

  const handleRemoveInternalInterviewer = (interviewerId) => {
    setFormData((prev) => ({
      ...prev,
      interviewers: prev.interviewers.filter(
        (interviewer) =>
          // Handle both individual interviewers and groups
          interviewer._id !== interviewerId &&
          (typeof interviewer !== "string" || interviewer !== "groups")
      ),
      interviewerGroupName:
        prev.interviewers.length === 1 ? "" : prev.interviewerGroupName,
      interviewerType:
        prev.interviewers.length === 1 ? "" : prev.interviewerType,
      // interviewerType: prev.interviewers.length === 1 ? '' : prev.interviewerType
    }));
  };

  const handleClearAllInterviewers = () => {
    setFormData((prev) => ({
      ...prev,
      interviewers: [],
      interviewerType: "",
      interviewerViewType: "individuals",
      interviewerGroupName: "",
    }));
  };

  const selectedInterviewers =
    formData.interviewerType === "Internal"
      ? formData.interviewers
      : formData.interviewerType === "External" && [];
  const isInternalSelected = formData.interviewerType === "Internal";
  const isExternalSelected = formData.interviewerType === "External";
  const selectedInterviewersData =
    isInternalSelected && Array.isArray(selectedInterviewers)
      ? selectedInterviewers
          .map((interviewer) => interviewer?._id)
          .filter(Boolean)
      : [];

  // Validate form
  const validateForm = () => {
    // v1.0.0 <------------------------------------------------------
    // const newErrors = {
    //   roundTitle: "",
    //   interviewMode: "",
    //   sequence: "",
    //   assessmentTemplate: "",
    //   duration: "",
    //   instructions: "",
    //   interviewerType: "",
    //   questions: "",
    // };
    const newErrors = {};
    // v1.0.0 ------------------------------------------------------>

    // Round title validation
    if (!formData.roundTitle?.trim()) {
      newErrors.roundTitle = "Round title is required";
    }
    if (formData.roundTitle === "Other" && !formData.customRoundTitle?.trim()) {
      newErrors.roundTitle = "Custom round title is required";
    }

    // Interview mode validation (skip for Assessment)
    if (!formData.interviewMode && formData.roundTitle !== "Assessment") {
      newErrors.interviewMode = "Interview mode is required";
    }

    // Sequence validation
    if (!formData.sequence || formData.sequence < 1) {
      newErrors.sequence = "Sequence must be at least 1";
    }

    // Assessment-specific validations
    if (formData.roundTitle === "Assessment") {
      if (!formData.assessmentTemplate?.assessmentId) {
        newErrors.assessmentTemplate = "Assessment template is required";
      }
    }

    // Technical round validations
    if (formData.roundTitle !== "Assessment") {
      if (!formData.duration) {
        newErrors.duration = "Duration is required";
      }
      if (!formData.instructions?.trim()) {
        newErrors.instructions = "Instructions are required";
      } else if (formData.instructions.length < 50) {
        newErrors.instructions = "Instructions must be at least 50 characters";
      } else if (formData.instructions.length > 1000) {
        newErrors.instructions = "Instructions cannot exceed 1000 characters";
      }
      if (!formData.interviewerType) {
        newErrors.interviewerType = "Interviewer type is required";
      }
      if (formData.interviewQuestionsList.length === 0) {
        newErrors.questions = "At least one question is required";
      }
    }

    // Final, HR Interview, etc. (minimal validation)
    if (
      formData.roundTitle === "Final" ||
      formData.roundTitle === "HR Interview"
      // add more round types here if needed
    ) {
      if (!formData.duration) {
        newErrors.duration = "Duration is required";
      }
      if (!formData.instructions?.trim()) {
        newErrors.instructions = "Instructions are required";
      } else if (formData.instructions.length < 50) {
        newErrors.instructions = "Instructions must be at least 50 characters";
      } else if (formData.instructions.length > 1000) {
        newErrors.instructions = "Instructions cannot exceed 1000 characters";
      }
      // Remove interviewerType and questions errors for these rounds
      newErrors.interviewerType = "";
      newErrors.questions = "";
    }

    setErrors(newErrors);

    // v1.0.0 <-----------------------------------------------------------------------------------
    // return Object.values(newErrors).every((error) => !error);
    const hasErrors = Object.values(newErrors).some((val) => val); // returns true if any error string is not empty
    return { isValid: !hasErrors, newErrors };
    // v1.0.0 ----------------------------------------------------------------------------------->
  };

  const handleSubmit = async (e) => {
    console.log("click add button");
    e.preventDefault();

    // v1.0.0 <---------------------------------------------------------------------------------
    // Run validation first
    // const isValid = validateForm();

    // if (!isValid) {
    //   return; // Stop submission if there are errors
    // }

    // const { isValid, newErrors } = validateForm();
    // if (!isValid) {
    //   scrollToFirstError(newErrors, fieldRefs); // ✅ Scroll to first error
    //   return;
    // }

    // v1.0.0 --------------------------------------------------------------------------------->
    // console.log('errors after validation', errors);

    // Format interviewers data based on view type
    let formattedInterviewers = [];
    if (
      formData.interviewerViewType === "groups" &&
      formData.interviewers.length > 0
    ) {
      // For groups, we store the group ID and user IDs
      formattedInterviewers = formData.interviewers.flatMap(
        (group) => group.userIds || []
      );
    } else {
      // For individuals, store their contact IDs
      formattedInterviewers = formData.interviewers.map((interviewer) =>
        organization ? interviewer._id : interviewer.contactId
      );
    }

    const roundData = {
      roundTitle:
        formData.roundTitle === "Other"
          ? formData.customRoundTitle
          : formData.roundTitle,
      interviewMode: formData.interviewMode,
      duration: formData.duration,
      // interviewType: formData.interviewType,
      // interviewerType:
        // formData.roundTitle === "Assessment" ? "" : formData.interviewerType.toLowerCase(),
      sequence: formData.sequence,
      // Only include interviewers for non-assessment rounds
      ...(formData.roundTitle !== "Assessment" && {
        interviewers: formattedInterviewers,
        //  formData.roundTitle === "Assessment" ? [] :
        //   formData.interviewerType === "Internal"
        //     ? organization === false ?
        //       formData.interviewers.map((interviewer) => interviewer.contactId) : formData.interviewers.map((interviewer) => interviewer._id)
        //     : [], // If outsource, send empty array
      }),
      interviewerGroupName:
        formData.interviewerViewType === "groups" &&
        formData.roundTitle !== "Assessment"
          ? formData.interviewerGroupName
          : "", // added newly

      ...(formData.roundTitle === "Assessment" &&
      formData.assessmentTemplate.assessmentId
        ? {
            assessmentId: formData.assessmentTemplate.assessmentId,
            questions: [],
          }
        : // {
          //   questions: formData.interviewQuestionsList.map(q => ({
          //    questionId: q.questionId,
          //    snapshot: {
          //     ...q.snapshot,
          //      mandatory: q.snapshot.mandatory || "false"
          //   }
          // })) || []
          {
            assessmentId: null,
            questions: formData.interviewQuestionsList || [],
          }),
      instructions: formData.instructions,
      interviewerType:
      formData.roundTitle === "Assessment" ? undefined : formData.interviewerType || undefined,
    
      // interviewerViewType:
      //   formData.roundTitle === "Assessment"
      //     ? ""
      //     : formData.interviewerViewType,
    };
    // console.log("formData.duration", formData.duration);

    console.log("round data", roundData);

    try {
      // Include roundId only if editing
      const payload = isEditing
        ? { positionId, round: roundData, roundId }
        : { positionId, round: roundData };

      console.log("roundData after roundData", payload);
      const response  = await addRounds(payload);

         console.log("response", response);
            if (response.status === "Created Round successfully") {
              notify.success("Round added successfully");
            } else if (response.status === "no_changes" || response.status === "Updated Round successfully") {
              notify.success("Round Updated successfully");
            }

      navigate(`/position/view-details/${positionId}`);
    } catch (err) {
    
      if (err.response?.data?.errors) {
        // Backend returns { errors: { field: "message" } }
        setErrors(err.response.data.errors);
        scrollToFirstError(err.response.data.errors, fieldRefs);
      } else {
        alert("Something went wrong. Please try again.");
      }
  
    
      // console.log("err ", err);
      // console.error("Error submitting round:", err);
    }
  };

  // if (!rounds) {
  //   return <div><Loading /></div>;
  // }

  // Create breadcrumb items with status
  const breadcrumbItems = isPositionContext && [
    { label: "Positions", path: "/position" },
    {
      label: position?.title || "Position",
      path: `/position/view-details/${contextId}`,
    },
    // { label: isEditing ? `Edit ${roundEditData?.roundTitle || 'Round'}` : 'Add New Round', path: '' }
  ];

  if (isEditing && roundEditData) {
    breadcrumbItems.push({
      label: `Edit ${roundEditData.roundTitle || "Round"}`,
      path: "",
      // status: 'pending'
      // status: roundEditData.status
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
    // Set as an object, not an array
    const assessmentData = {
      assessmentId: assessment._id,
      assessmentName: assessment.AssessmentTitle,
    };
    // setAssessmentTemplate(assessmentData); // Update state directly

    console.log("duration", assessment);

    setFormData((prev) => ({
      ...prev,
      assessmentTemplate: assessmentData,
      duration: parseInt(assessment.Duration.replace(" minutes", "")),
      instructions: assessment.Instructions,
      interviewQuestionsList: [],
    }));

    clearError("assessmentTemplate");
    clearError("assessmentQuestions");
    setExpandedSections({});
    setSectionQuestions({});
    // fetchQuestionsForAssessment(assessment._id);
    if (assessment._id) {
      setAssessmentQuestionsLoading(true);
      fetchAssessmentQuestions(assessment._id).then(({ data, error }) => {
        if (data) {
          setAssessmentQuestionsLoading(false);
          setSectionQuestions(data?.sections);
        } else {
          console.error("Error fetching assessment questions:", error);
          setAssessmentQuestionsLoading(false);
        }
      });
    }
    setShowDropdown(false);
  };

  const title = isEditing
    ? isPositionContext
      ? "Edit Position Round"
      : "Edit Interview Round"
    : isPositionContext
    ? "Add New Position Round"
    : "Add New Interview Round";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 md:px-8 xl:px-8 2xl:px-8">
        <div className="px-4 sm:px-0">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>

              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isEditing
                  ? "Update the round details below"
                  : "Fill in the details to add a new interview round"}
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    {/* round title */}
                    <div>
                      <label
                        htmlFor="roundTitle"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Round Title <span className="text-red-500">*</span>
                      </label>
                      {/* v1.0.0 <------------------------------------------------------------- */}
                      {formData.roundTitle === "Other" ? (
                        <input
                          ref={fieldRefs.roundTitle}
                          type="text"
                          id="roundTitle"
                          name="roundTitle"
                          value={formData.customRoundTitle}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              customRoundTitle: e.target.value,
                              // DO NOT update roundTitle here!
                            }));
                            clearError("roundTitle");
                          }}
                          onBlur={() => {
                            if (!formData.customRoundTitle.trim()) {
                              setFormData((prev) => ({
                                ...prev,
                                roundTitle: "", // 👈 Show dropdown again
                                customRoundTitle: "", // 👈 Clear the input
                              }));
                              clearError("roundTitle");
                            }
                          }}
                          // className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm"
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                          border ${
                            errors.roundTitle
                              ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                              : "border-gray-300 focus:ring-red-300"
                          }
                          focus:outline-gray-300
                        `}
                          required
                          placeholder="Enter custom round title"
                        />
                      ) : (
                        <select
                          ref={fieldRefs.roundTitle}
                          id="roundTitle"
                          name="roundTitle"
                          value={formData.roundTitle}
                          onChange={handleRoundTitleChange}
                          // className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.maxexperience ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}`}

                          // className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3
                          //   ${
                          //     errors.roundTitle
                          //       ? "border-red-500 focus:ring-red-500"
                          //       : "border-gray-300"
                          //   }
                          //   focus:outline-none  sm:text-sm`}
                          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                            border ${
                              errors.roundTitle
                                ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                : "border-gray-300 focus:ring-red-300"
                            }
                            focus:outline-gray-300
                          `}
                          required
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
                        <p className="mt-1 text-xs text-red-500">
                          {errors.roundTitle}
                        </p>
                      )}
                      {/* v1.0.0 ---------------------------------------------------------------> */}
                    </div>

                    <div>
                      <label
                        htmlFor="mode"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Interview Mode <span className="text-red-500">*</span>
                      </label>
                      {/* v1.0.0 <---------------------------------------------------------- */}
                      <select
                        ref={fieldRefs.interviewMode}
                        id="interviewMode"
                        name="interviewMode"
                        value={formData.interviewMode}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            interviewMode: e.target.value,
                          }));
                          clearError("interviewMode");
                        }}
                        // className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none
                        // sm:text-sm rounded-md ${
                        //   errors.interviewMode
                        //     ? "border-red-500 focus:ring-red-500"
                        //     : "border-gray-300"
                        // }`}
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                          border ${
                            errors.interviewMode
                              ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                              : "border-gray-300 focus:ring-red-300"
                          }
                          focus:outline-gray-300
                        `}
                        required
                        disabled={formData.roundTitle === "Assessment"}
                      >
                        <option value="">Select Interview Mode</option>
                        <option value="Face to Face">Face to Face</option>
                        <option value="Virtual">Virtual</option>
                      </select>
                      {errors.interviewMode && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.interviewMode}
                        </p>
                      )}
                      {/* v1.0.0 -----------------------------------------------------------------------> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    <div>
                      <label
                        htmlFor="sequence"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Sequence
                      </label>
                      <input
                        type="number"
                        id="sequence"
                        name="sequence"
                        min="1"
                        value={formData.sequence}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            sequence: parseInt(e.target.value),
                          }));
                          clearError("sequence");
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The order in which this round appears in the interview
                        process
                      </p>
                    </div>

                    {formData.roundTitle !== "Assessment" && (
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
                          value={formData.duration}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              duration: parseInt(e.target.value),
                            }));
                            clearError("duration");
                          }}
                          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm
                            ${
                              errors.duration
                                ? "border-red-500 focus:ring-red-500 "
                                : "border-gray-300"
                            }
                            `}
                        >
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">60 min</option>
                          <option value="90">90 min</option>
                          <option value="120">120 min</option>
                        </select>
                        {errors.duration && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.duration}
                          </p>
                        )}
                      </div>
                    )}

                    {formData.roundTitle === "Assessment" && (
                      <>
                        <div>
                          <label
                            htmlFor="assessmentTemplate"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Assessment Template{" "}
                            <span className="text-red-500">*</span>{" "}
                          </label>
                          <div className="relative flex-1">
                            {/* v1.0.0 <----------------------------------------------------- */}
                            <input
                              ref={fieldRefs.assessmentTemplate}
                              type="text"
                              name="assessmentTemplate"
                              id="assessmentTemplate"
                              //   className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm
                              // ${
                              //   errors.assessmentTemplate
                              //     ? "border-red-500 focus:ring-red-500 "
                              //     : "border-gray-300"
                              // }
                              //     `}
                              className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                                border ${
                                  errors.assessmentTemplate
                                    ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                                    : "border-gray-300 focus:ring-red-300"
                                }
                                focus:outline-gray-300
                              `}
                              placeholder="Enter assessment template name"
                              value={
                                formData.assessmentTemplate?.assessmentName ||
                                ""
                              }
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  assessmentTemplate: {
                                    ...prev.assessmentTemplate,
                                    assessmentName: e.target.value,
                                  },
                                }));
                                // CHANGE: Clear assessmentTemplate error when user types
                                clearError("assessmentTemplate");
                                // clearError("assessmentQuestions");
                              }}
                              onClick={() => setShowDropdown(!showDropdown)}
                              readOnly
                            />
                            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                              {/* <FaSearch className="text-gray-600 text-lg" /> */}
                            </div>
                            {showDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredAssessments.length > 0 ? (
                                  filteredAssessments.map(
                                    (assessment, index) => (
                                      <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                          handleAssessmentSelect(assessment);
                                          clearError("assessmentTemplate");
                                          clearError("assessmentQuestions");
                                        }}
                                      >
                                        {assessment.AssessmentTitle}
                                      </div>
                                    )
                                  )
                                ) : (
                                  <div className="px-3 py-2 text-gray-500">
                                    No Assessments Found
                                  </div>
                                )}
                              </div>
                            )}
                            {errors.assessmentTemplate && (
                              <p className="mt-1 text-xs text-red-500">
                                {errors.assessmentTemplate}
                              </p>
                            )}
                            {/* v1.0.0 <----------------------------------------------------- */}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Assessment Type Fields */}
                  {formData.roundTitle === "Assessment" && (
                    <div className="space-y-6">
                      {formData.assessmentTemplate.assessmentName && (
                        <div>
                          <h4
                            htmlFor="assessmentQuestions"
                            className="block text-sm font-medium text-gray-700 mb-1 mt-1"
                          >
                            Assessment Questions
                          </h4>

                          {/* {errors.assessmentQuestions && <p className="text-red-500 text-xs">{errors.assessmentQuestions}</p>} */}
                          {assessmentQuestionsLoading ? (
                            <div className="border rounded-md shadow-sm p-4 skeleton-animation"></div>
                          ) : (
                            <div className="space-y-4">
                              {!sectionQuestions ||
                              sectionQuestions.noQuestions ? (
                                <div className="text-center py-4 text-gray-500">
                                  No Sections Available for this Assessment
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
                                      !Array.isArray(sectionData.questions)
                                    ) {
                                      return (
                                        <div
                                          key={sectionId}
                                          className="border rounded-md shadow-sm p-4"
                                        >
                                          <div className="text-center py-4 text-gray-500">
                                            No valid data for this section
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
                                          onClick={() =>
                                            toggleSection(sectionId)
                                          }
                                          className="flex justify-between items-center w-full"
                                        >
                                          <span className="font-medium">
                                            {sectionData?.sectionName ||
                                              "Unnamed Section"}
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
                                            {sectionData?.questions.length >
                                            0 ? (
                                              sectionData?.questions.map(
                                                (question, idx) => (
                                                  <div
                                                    key={question._id || idx}
                                                    className="border rounded-md shadow-sm overflow-hidden"
                                                  >
                                                    <div
                                                      onClick={() =>
                                                        setExpandedQuestions(
                                                          (prev) => ({
                                                            ...prev,
                                                            [question._id]:
                                                              !prev[
                                                                question._id
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
                                                          {question.snapshot
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
                                                              {question.snapshot
                                                                ?.questionType ||
                                                                "Not specified"}
                                                            </span>
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-500">
                                                              Score:
                                                            </span>
                                                            <span className="text-sm text-gray-700">
                                                              {question.snapshot
                                                                ?.score || "0"}
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
                                                                    key={optIdx}
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
                                                                    {option}
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
                                                              {question.snapshot
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

                  {formData.roundTitle !== "Assessment" && (
                    <>
                      {/* Select Interviewers */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Interviewers
                          </label>
                          <div className="flex space-x-2">
                            {organization === false ? (
                              <Button
                                type="button"
                                onClick={() => {
                                  handleInternalInterviewerSelect();
                                  clearError("interviewerType");
                                }}
                                variant="outline"
                                size="sm"
                                className={`${
                                  isExternalSelected
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
                                onClick={() => {
                                  setInternalInterviews(true);
                                  clearError("interviewerType");
                                }}
                                variant="outline"
                                size="sm"
                                className={`${
                                  isExternalSelected
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
                              // onClick={handleExternalInterviewerSelect}
                              onClick={() => {
                                handleExternalInterviewerSelect();
                                clearError("interviewerType");
                              }}
                              variant="outline"
                              size="sm"
                              className={`${
                                isInternalSelected
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isInternalSelected}
                              title={
                                isInternalSelected
                                  ? "Clear Internal interviewers first"
                                  : ""
                              }
                            >
                              <User className="h-4 w-4 mr-1 text-orange-600" />
                              Select Outsourced
                            </Button>
                          </div>
                        </div>

                        {/* Selected Interviewers Summary */}
                        {/* v1.0.0 <----------------------------------------------------------------------- */}
                        <div
                          className=" p-4 bg-gray-50 rounded-md border border-gray-200"
                          ref={fieldRefs.interviewerType}
                        >
                          {/* v1.0.0 ----------------------------------------------------------------------> */}

                          {!formData.interviewerType ? (
                            <p className="text-sm text-gray-500 text-center">
                              No Interviewers Selected
                            </p>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between ">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {isInternalSelected
                                      ? `${
                                          formData.interviewers.length
                                        } Interviewer${
                                          formData.interviewers.length !== 1
                                            ? "s"
                                            : ""
                                        }`
                                      : "Outsourced Interviewers"}{" "}
                                    Selected
                                    {isInternalSelected && (
                                      <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
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
                                {(isExternalSelected || isInternalSelected) && (
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
                              {isInternalSelected &&
                                formData.interviewers.length > 0 && (
                                  <section className="mb-4 w-full">
                                    <h4 className="text-sm font-semibold text-gray-600 mb-3">
                                      {formData.interviewerViewType === "groups"
                                        ? "Interviewer Groups "
                                        : "Internal Interviewers "}
                                      <span className="text-xs text-custom-blue">
                                        (
                                        {formData.interviewers.length ||
                                          "Not Provided"}{" "}
                                        {formData.interviewers.length > 1
                                          ? "Members"
                                          : "Member"}
                                        )
                                      </span>
                                      {/* {formData.interviewerViewType === 'groups' && formData.interviewerGroupName && (
                                      <span className="ml-2 text-sm font-normal">(Group: {formData.interviewerGroupName})</span>
                                    )} */}
                                    </h4>
                                    <div className="grid grid-cols-4 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1  w-full gap-4">
                                      {formData.interviewers.map(
                                        (interviewer, index) => {
                                          // Render group card
                                          if (
                                            formData.interviewerViewType ===
                                              "groups" &&
                                            formData.interviewerGroupName
                                          ) {
                                            return (
                                              <div
                                                key={`group-${index}`}
                                                className="rounded-xl border w-[80%]   border-blue-200 bg-blue-50 p-3 shadow-sm flex flex-col justify-between"
                                              >
                                                <div className="flex justify-between items-start mb-2">
                                                  <div>
                                                    <span className="font-medium text-blue-900 block">
                                                      {formData?.interviewerGroupName ||
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
                                                  <ul className="list-disc list-inside text-xs text-blue-800 ml-1">
                                                    {interviewer.usersNames
                                                      ? interviewer.usersNames.map(
                                                          (name, i) => (
                                                            <li
                                                              key={`${interviewer._id}-user-${i}`}
                                                            >
                                                              {name}
                                                            </li>
                                                          )
                                                        )
                                                      : `${
                                                          interviewer.firstName ||
                                                          ""
                                                        } ${
                                                          interviewer.lastName ||
                                                          ""
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
                                                <User className="h-4 w-4 text-blue-600 mr-2" />
                                                <span className="text-sm font-medium text-blue-900 truncate">
                                                  {`${
                                                    interviewer.firstName || ""
                                                  } ${
                                                    interviewer.lastName || ""
                                                  }`.trim() ||
                                                    interviewer.email}
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
                                )}

                              {/* {isInternalSelected && formData.interviewers.length > 0 && (
                                <section className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Internal Interviewers</h4>
                                  <div className="flex  w-full gap-4">
                                    {formData.interviewers.map((interviewer, index) => {
                                      // Skip if view type is individuals but this is a group
                                      if (formData.interviewerViewType === 'individuals' && interviewer.userIds) return null;

                                      // Skip if view type is groups but this is an individual
                                      if (formData.interviewerViewType === 'groups' && !interviewer.userIds) return null;

                                      // Handle group display
                                      if (interviewer.userIds) {
                                        return (
                                          <div
                                            key={`group-${interviewer._id}`}
                                            className="rounded-xl border w-[30%] border-blue-200 bg-blue-50 p-3 shadow-sm flex flex-col justify-between sm:w-auto"
                                          >
                                            <div className="flex justify-between items-start mb-2">
                                              <div>
                                                <span className="font-medium text-blue-900 block">{interviewer.name}</span>
                                                <span className="text-xs text-blue-700">(Group)</span>
                                              </div>
                                              <button
                                                onClick={() => handleRemoveInternalInterviewer(interviewer._id)}
                                                className="text-red-400 rounded-full p-1 hover:bg-blue-100 transition"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                            </div>

                                            <ul className="list-disc list-inside text-xs text-blue-800 ml-1">
                                              {interviewer.usersNames.map((name, i) => (
                                                <li key={`${interviewer._id}-user-${i}`}>{name}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        );
                                      }

                                      // Handle individual interviewer display
                                      return (
                                        <div
                                          key={`${interviewer._id}-${index}`}
                                          className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm w-full sm:w-auto"
                                        >
                                          <span className="text-sm font-medium text-blue-900 truncate">
                                            {`${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim()}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveInternalInterviewer(interviewer._id)}
                                            className="text-red-400 rounded-full p-1 hover:bg-blue-100 transition"
                                            title="Remove interviewer"
                                          >
                                            <X className="h-4 w-4" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </section>
                              )} */}

                              {/* {isInternalSelected && (
                                <div className="mb-1">
                                  <h4 className="text-xs font-medium text-gray-500 mb-2">Internal Interviewers</h4>
                                  <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                                    {formData.interviewers.map((interviewer, index) => (
                                      <div key={`${interviewer._id}-${index}`} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2">
                                        <div className="flex items-center">
                                          <span className="ml-2 text-sm text-blue-800 truncate">
                                            {`${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim()}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveInternalInterviewer(interviewer._id)}
                                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                                          title="Remove interviewer"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )} */}

                              {/* External Interviewers */}
                              {isExternalSelected && (
                                <div>
                                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                                    Outsourced Interviewers
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* {externalInterviewers.map((interviewer) => ( */}
                                    <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2">
                                      <div className="flex items-center">
                                        <span className="ml-2 text-sm text-orange-800 truncate">
                                          Outsourced will be selected at
                                          interview schdedule time. (Outsourced)
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={handleClearAllInterviewers}
                                        className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-100"
                                        title="Remove interviewer"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                    {/* ))} */}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {errors.interviewerType && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.interviewerType}
                          </p>
                        )}
                      </div>

                      {/* interview Questions List */}
                      {/* v1.0.0 <----------------------------------------------------------- */}
                      <div className="mt-4" ref={fieldRefs.questions}>
                        {/* v1.0.0 -----------------------------------------------------------> */}
                        <div className="py-3 mx-auto rounded-md">
                          {/* Header with Title and Add Button */}
                          <div className="flex items-center justify-end mb-2">
                            <button
                              className="text-custom-blue font-semibold hover:underline"
                              onClick={() => {
                                handlePopupToggle();
                                clearError("questions");
                              }}
                              type="button"
                            >
                              + Add Question
                            </button>
                          </div>
                          <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                            {/* Display Added Questions */}
                            {formData.interviewQuestionsList.length > 0 ? (
                              <ul className="mt-2 space-y-2">
                                {formData.interviewQuestionsList.map(
                                  (question, qIndex) => {
                                    // const isMandatory = question?.mandatory === "true";
                                    const isMandatory =
                                      question?.snapshot?.mandatory === "true";
                                    const questionText =
                                      question?.snapshot?.questionText ||
                                      "No Question Text Available";
                                    return (
                                      <li
                                        key={qIndex}
                                        className={`flex justify-between items-center p-3 border rounded-md
                                        ${
                                          isMandatory
                                            ? "border-red-500"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        <span className="text-gray-900 font-medium">
                                          {qIndex + 1}. {questionText}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleRemoveQuestion(
                                              question.questionId
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
                          {errors.questions && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.questions}
                            </p>
                          )}
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
                                  <h2 className="text-xl text-custom-blue  font-semibold">
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
                                    type="interviewerSection"
                                    interviewQuestionsLists={
                                      formData.interviewQuestionsList
                                    }
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

                  <div>
                    <label
                      htmlFor="instructions"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Instructions <span className="text-red-500">*</span>
                    </label>
                    {/* v1.0.0 <--------------------------------------------------------------- */}
                    <textarea
                      ref={fieldRefs.instructions}
                      value={formData.instructions}
                      id="instructions"
                      name="instructions"
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          instructions: e.target.value,
                        }));
                        clearError("instructions");
                      }}
                      // className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm h-64
                      //   ${
                      //     errors.instructions
                      //       ? "border-red-500 focus:ring-red-500"
                      //       : "border-gray-300"
                      //   }
                      // `}

                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm
                        border ${
                          errors.instructions
                            ? "border-red-500 focus:ring-red-500 focus:outline-red-300"
                            : "border-gray-300 focus:ring-red-300"
                        }
                        focus:outline-gray-300
                      `}
                      placeholder="Enter round instructions..."
                      rows="10"
                      minLength={50}
                      maxLength={1000}
                      readOnly={formData.roundTitle === "Assessment"}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-500">
                        {errors.instructions ? (
                          <p className="text-red-500 text-xs pt-1">
                            {errors.instructions}
                          </p>
                        ) : formData.instructions.length > 0 &&
                          formData.instructions.length < 50 ? (
                          <p className="text-gray-500 text-xs">
                            Minimum {50 - formData.instructions.length} more
                            characters needed
                          </p>
                        ) : null}
                      </span>
                      <p className="text-sm text-gray-500">
                        {formData.instructions.length}/1000
                      </p>
                    </div>

                    {/* <div className="flex justify-between items-center mt-1">
                      {errors.instructions && (
                        <p className="mt-1 text-xs text-red-500">{errors.instructions}</p>
                      )}
                      <span>
                        <span className="text-sm text-gray-500">
                          {formData.instructions.length < 250 && `Minimum ${250 - formData.instructions.length} more characters needed`}
                        </span>
                        <span className="text-sm text-gray-500"> {formData.instructions?.length || 0}/1000</span>
                      </span>
                    </div> */}
                  </div>
                  {/* footer */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/position/view-details/${contextId}`)
                      }
                      className="mr-3 inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 "
                    >
                      Cancel
                    </button>

                    <LoadingButton
                      onClick={handleSubmit}
                      isLoading={isMutationLoading}
                      loadingText={id ? "Updating..." : "Saving..."}
                    >
                      {isEditing ? "Update Round" : "Add Round"}
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* External Interviews Modal */}
      {/* {showOutsourcePopup && (
        <OutsourceOption
          onClose={() => setShowOutsourcePopup(false)}
          dateTime={combinedDateTime}
          candidateData1={candidate}
          onProceed={handleExternalInterviewerSelect}
        />
      )} */}

      {isInternalInterviews && (
        <InternalInterviews
          isOpen={isInternalInterviews}
          onClose={() => setInternalInterviews(false)}
          onSelectCandidates={handleInternalInterviewerSelect}
          selectedInterviewers={formData.interviewers}
          defaultViewType={formData.interviewerViewType}
          selectedGroupName={formData.interviewerGroupName} // Add this new prop
        />
      )}
    </div>
  );
}

export default RoundFormPosition;
