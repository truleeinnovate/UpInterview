import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../CommonCode-AllTabs/Breadcrumb';
import StatusBadge from '../../CommonCode-AllTabs/StatusBadge.jsx';
import { ChevronDown, X, User, Users, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from '../../CommonCode-AllTabs/ui/button.jsx';
import axios from "axios";
import InternalInterviews from "./Internal-Or-Outsource/InternalInterviewers.jsx";
// import OutsourceOption from "../../Interviews/OutsourceOption.jsx";
import OutsourceOption from "./Internal-Or-Outsource/OutsourceInterviewer.jsx";
import { ReactComponent as MdOutlineCancel } from "../../../../../icons/MdOutlineCancel.svg";
import MyQuestionListMain from "../../QuestionBank-Tab/MyQuestionsList.jsx";
import SuggesstedQuestions from "../../QuestionBank-Tab/SuggesstedQuestionsMain.jsx";
import Cookies from "js-cookie";
import { useCustomContext } from "../../../../../Context/Contextfetch.js";
import { validateInterviewRoundData } from '../../../../../utils/interviewRoundValidation.js';
import { Search, ChevronUp } from 'lucide-react';
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";

function RoundForm() {
  const {
    assessmentData,
    interviewData,
    loading
  } = useCustomContext();
  const { interviewId, roundId } = useParams();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload.userId;
  const [errors, setErrors] = useState({});
  console.log("errors", errors);


  const interview = interviewData?.find(interview => interview._id === interviewId);
  const [assessmentTemplate, setAssessmentTemplate] = useState({ assessmentId: '', assessmentName: '' });
  console.log("assessmentTemplate",assessmentTemplate);
  


  const [candidate, setCandidate] = useState(null);
  const [position, setPosition] = useState(null);
  const [rounds, setRounds] = useState(null);
  console.log("rounds", rounds);


  const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);
  const [isInternalInterviews, setInternalInterviews] = useState(false);
  console.log("isInternalInterviews", isInternalInterviews);



  const [template, setTemplate] = useState(null);

  useEffect(() => {
    if (interviewData) {
      setCandidate(interview?.candidateId || null);
      setPosition(interview?.positionId || null);
      setRounds(interview?.rounds || []);
      setTemplate(interview?.templateId || null)
    }
  }, [interview]);

  const navigate = useNavigate();
  const [roundTitle, setRoundTitle] = useState('');
  const [customRoundTitle, setCustomRoundTitle] = useState("");
  const [interviewMode, setInterviewMode] = useState('');
  const [status, setStatus] = useState('Pending');
  const [instructions, setInstructions] = useState('');
  const [sequence, setSequence] = useState(1);
  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [interviewQuestionsList, setInterviewQuestionsList] = useState([]);


  const [interviewType, setInterviewType] = useState("instant"); // "instant" or "scheduled"
  const [scheduledDate, setScheduledDate] = useState(""); // Start Date & Time
  const [duration, setDuration] = useState(30); // Duration in minutes
  const [startTime, setStartTime] = useState(""); // Final Start Time
  const [endTime, setEndTime] = useState(""); // Calculated End Time
  const [combinedDateTime, setCombinedDateTime] = useState("")
  const [sectionQuestions, setSectionQuestions] = useState({});
  console.log("sectionQuestions", sectionQuestions);

  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});


  console.log("combinedDateTime", combinedDateTime)
  // Function to update start and end time
  const formatDateTime = (date, showDate = true) => {
    if (!date) return "";

    const d = new Date(date);

    // Format date if required
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = d.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Format time
    const formattedTime = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return showDate ? `${formattedDate} ${formattedTime}` : formattedTime;
  };

  const updateTimes = (newDuration) => {
    let start = null;
    let end = null;

    if (interviewType === "instant") {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15); // Start after 15 min
      start = now;

      const endTime = new Date(now);
      endTime.setMinutes(endTime.getMinutes() + newDuration);
      end = endTime;
    } else if (interviewType === "scheduled" && scheduledDate) {
      start = new Date(scheduledDate);

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
      const combinedDateTime = `${formattedStart} - ${formattedEnd}`;

      console.log("Combined DateTime:", combinedDateTime);
      setCombinedDateTime(combinedDateTime);
    }
  };


  // Update times when mode, date, or duration changes
  useEffect(() => {
    updateTimes(duration);
  }, [interviewType, scheduledDate, duration]);


  // const handleAddQuestionToRound = async (question) => {
  //   console.log("question:", question);

  //   if (question && question.snapshot) {
  //     console.log("question _id:", question._id);

  //     setInterviewQuestionsList((prevList) => [...prevList, question]);

  //     // Ensure _id is added only once (to prevent duplicates)
  //     // setSelectedQuestionIds((prevIds) =>
  //     //   prevIds.includes(question._id) ? prevIds : [...prevIds, question._id]
  //     // );
  //   }
  // }
  const handleAddQuestionToRound = (question) => {
    console.log("question:", question);

    if (question && question.snapshot) {
      console.log("question _id:", question.questionId);

      setInterviewQuestionsList((prevList) => {
        // Check if the questionId already exists in the list
        if (prevList.some((q) => q.questionId === question.questionId)) {
          return prevList; // Return previous list if duplicate
        }
        return [...prevList, question]; // Add new question
      });
    }
  };
  const handleRemoveQuestion = (index) => {
    setInterviewQuestionsList((prevList) =>
      prevList.filter((_, qIndex) => qIndex !== index)
    );
  };
  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;

    if (selectedTitle === "Other") {
      setRoundTitle("Other");
      setCustomRoundTitle(""); // Reset custom input field when "Other" is selected
    } else {
      setRoundTitle(selectedTitle);
      setCustomRoundTitle(""); // Reset custom field when switching back to dropdown options
    }

    if (selectedTitle === "Other") {
      setCustomRoundTitle("");
    } else if (selectedTitle === "Assessment") {
      setInterviewMode("Virtual"); // Set interview type to Virtual and disable editing
    } else {
      setInterviewMode(""); // Allow user to select type for other rounds
    }
  };
  const handleSuggestedTabClick = (questionType) => {
    setActiveTab("SuggesstedQuestions");
  };

  const handleFavoriteTabClick = (questionType) => {
    setActiveTab("MyQuestionsList");
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);





  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null);
  const [internalInterviewers, setInternalInterviewers] = useState([]);
  const [externalInterviewers, setExternalInterviewers] = useState([]);

  const handleInternalInterviewerSelect = (interviewers) => {
    console.log("Interviewers passed to parent:", interviewers[0].contactId); // Debugging

    if (selectedInterviewType === "external") {
      alert("You need to clear external interviewers before selecting internal interviewers.");
      return;
    }

    const uniqueInterviewers = interviewers?.filter((newInterviewer) =>
      !internalInterviewers.some((i) => i?._id === newInterviewer?._id)
    );

    // Extract only contactId values
    const contactIds = uniqueInterviewers?.map((interviewer) => interviewer.contactId);

    setSelectedInterviewType("internal");
    setInternalInterviewers([...internalInterviewers, ...contactIds]); // Append new interviewers
  };

  const handleExternalInterviewerSelect = (interviewers) => {
    if (selectedInterviewType === "internal") {
      alert("You need to clear internal interviewers before selecting outsourced interviewers.");
      return;
    }
    console.log("interviewersselcetd:", interviewers);

    // Ensure no duplicates and append new interviewers
    const uniqueInterviewers = interviewers.filter(
      (newInterviewer) => !externalInterviewers.some((i) => i.id === newInterviewer.id)
    );

    setSelectedInterviewType("external");
    setExternalInterviewers([...externalInterviewers, ...uniqueInterviewers]); // Append new interviewers
  };
  const handleRemoveInternalInterviewer = (interviewerId) => {
    setInternalInterviewers((prev) => {
      const updatedInterviewers = prev.filter((i) => i._id !== interviewerId);

      // Reset selectedInterviewType if no interviewers are left
      if (updatedInterviewers.length === 0 && externalInterviewers.length === 0) {
        setSelectedInterviewType(null);
      }

      return updatedInterviewers;
    });
  };

  const handleRemoveExternalInterviewer = (interviewerId) => {
    setExternalInterviewers((prev) => {
      const updatedInterviewers = prev.filter((i) => i.id !== interviewerId);

      // Reset selectedInterviewType if no interviewers are left
      if (updatedInterviewers.length === 0 && internalInterviewers.length === 0) {
        setSelectedInterviewType(null);
      }

      return updatedInterviewers;
    });
  };
  const handleClearAllInterviewers = () => {
    setInternalInterviewers([]);
    setExternalInterviewers([]);
    setSelectedInterviewType(null);
  };


  const selectedInterviewers = selectedInterviewType === "internal" ? internalInterviewers : externalInterviewers;
  const isInternalSelected = selectedInterviewType === "internal";
  const isExternalSelected = selectedInterviewType === "external";

  const selectedInterviewersData = selectedInterviewers.map((interviewer) => {
    // if (isInternalSelected) {
    //   // For internal interviewers, access `contactId._id`
    //   return interviewer; // Use optional chaining to avoid errors
    // } else if (isExternalSelected) {
    //   // For external interviewers, access `id` directly
    //   return interviewer._id;
    // }
    return interviewer; // Fallback for unexpected cases
  }).filter(Boolean);
  console.log("selectedInterviewersData", selectedInterviewersData);

  // while editing
  const isEditing = !!roundId && roundId !== 'new';
  const roundEditData = isEditing && rounds?.find(r => r._id === roundId);


  console.log("roundEditData", roundEditData);

  const fetchSectionsAndQuestions = async (assessmentId) => {
    try {
      // Fetch the assessment data once
      const response = assessmentData.find(pos => pos._id === assessmentId);
      // const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentId}`);
      const assessment = response;

      // Get all section IDs and prepare section questions
      const newSectionQuestions = {};
      const newExpandedSections = {};

      assessment.Sections.forEach(section => {
        newExpandedSections[section._id] = false; // Expand all sections by default
        newSectionQuestions[section._id] = section.Questions || []; // Set questions for each section
      });

      // Update states with the fetched data
      setExpandedSections(newExpandedSections);
      setSectionQuestions(newSectionQuestions);
    } catch (error) {
      console.error('Error fetching sections and questions:', error);
      // Optionally set an error state for each section
      setSectionQuestions(prev => ({
        ...prev,
        // Since we don't have access to section IDs, set a generic error state
        error: 'Failed to load questions'
      }));
    }
  };

  useEffect(() => {
    if (isEditing && roundEditData) {
      setAssessmentTemplate(
        roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId
          ? {
            assessmentId: roundEditData.assessmentId,
            assessmentName: assessmentData.find((a) => a._id === roundEditData.assessmentId)?.AssessmentTitle || '',
          }
          : { assessmentId: '', assessmentName: '' }
      );
      setRoundTitle(roundEditData.roundTitle);
      setInterviewType(roundEditData.interviewType);
      setInterviewMode(roundEditData.interviewMode);
      setSelectedInterviewType(roundEditData.interviewerType);
      setInterviewQuestionsList(roundEditData.questions);
      setStatus(roundEditData.status);
      setInstructions(roundEditData.instructions || '');
      setSequence(roundEditData.sequence);
      setDuration(roundEditData.duration || 60);




      if (roundEditData.interviewers && roundEditData.interviewers.length > 0) {
        const normalizedInterviewers = roundEditData.interviewers.map((interviewer) => ({
          _id: interviewer._id, // Directly use _id as contactId
          name: interviewer.name,
          email: interviewer.email,
        }));

        if (roundEditData.interviewerType === "internal") {
          setInternalInterviewers(normalizedInterviewers);
        } else if (roundEditData.interviewerType === "external") {
          setExternalInterviewers(normalizedInterviewers); // Reuse the same structure
        }
      }

      if (roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId) {
        setAssessmentTemplate({
          assessmentId: roundEditData.assessmentId,
          assessmentName: assessmentData.find((a) => a._id === roundEditData.assessmentId)?.AssessmentTitle || '',
        });
        fetchSectionsAndQuestions(roundEditData.assessmentId);
      }

    } else {
      // For new round, set the sequence to be after the last round
      const maxSequence = rounds?.length > 0
        ? Math.max(...rounds.map(r => r.sequence))
        : 0;
      setSequence(maxSequence + 1);
    }
  }, [rounds, isEditing, roundEditData, navigate, assessmentData]);

  const orgId = Cookies.get("organizationId");
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     // if (!name || !type || !mode || selectedInterviewers.length === 0) {
  //     //   throw new Error('Please fill in all required fields');
  //     // }

  //     const roundData = {
  //       roundTitle,
  //       interviewMode,
  //       sequence,
  //       interviewers: selectedInterviewersData || [],
  //       ...(roundTitle === "Assessment" && assessmentTemplate
  //         ? { assessmentId: assessmentTemplate._id }
  //         : {}),
  //       instructions,
  //       status,
  //       ...(roundTitle !== "Assessment" && {
  //         duration,
  //         interviewerType: selectedInterviewType, // internal or external
  //         dateTime: combinedDateTime,
  //         interviewType,
  //       }),
  //     };

  //     const validationErrors = validateInterviewRoundData(roundData);
  //     setErrors(validationErrors);

  //     console.log("roundData1", roundData);
  //     if (Object.keys(validationErrors).length === 0) {
  //       // Include roundId only if editing
  //       const payload = isEditing ? { interviewId, round: roundData, roundId, questions: interviewQuestionsList } : { interviewId, round: roundData, questions: interviewQuestionsList };

  //       const response = await axios.post(
  //         `${process.env.REACT_APP_API_URL}/interview/save-round`,
  //         payload
  //       );
  //       console.log("response", response.data);


  //       // const preparingTeamRequestBody = {
  //       //   name: `Interview with ${candidate}-${candidate._id.slice(-5, -1)} for the position of ${position._id}`,
  //       //   description: "description",
  //       //   owner: userId,
  //       //   createdBy: userId,
  //       // };

  //       // const teamResponse = await axios.post(`${process.env.REACT_APP_API_URL}/createTeam`, preparingTeamRequestBody);

  //       if (selectedInterviewers && selectedInterviewers.length > 0) {
  //         const interviewerObjects = selectedInterviewers.map(id => ({
  //           id: id._id,
  //           status: "inprogress"
  //         }));
  //         const outsourceRequestData = {
  //           tenantId: orgId,
  //           ownerId: userId,
  //           scheduledInterviewId: interviewId,
  //           interviewerType: selectedInterviewType,
  //           interviewerIds: interviewerObjects, // Fixed mapping here
  //           dateTime: combinedDateTime,
  //           duration,
  //           candidateId: candidate?._id,
  //           positionId: position?._id,
  //           status: "inprogress",
  //           roundNumber: sequence,
  //           requestMessage: "Outsource interview request",
  //           expiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  //         };

  //         await axios.post(
  //           `${process.env.REACT_APP_API_URL}/interviewrequest`,
  //           outsourceRequestData
  //         );
  //       }
  //     }
  //     navigate(`/interviews/${interviewId}`);

  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "An unknown error occurred");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare round data for validation
      const roundData = {
        roundTitle,
        interviewMode,
        sequence,
        ...(roundTitle === "Assessment" && assessmentTemplate.assessmentId
          ? { assessmentId: assessmentTemplate.assessmentId }
          : {}),
        
        instructions,
        status,
        ...(roundTitle !== "Assessment" && {
          duration,
          interviewerType: selectedInterviewType, // internal or external
          dateTime: combinedDateTime,
          interviewType,
        }),
        ...(selectedInterviewType !== "external" && { interviewers: selectedInterviewersData || [] }), // Only pass interviewers if not external
      };


      // Validate the round data
      const validationErrors = validateInterviewRoundData(roundData);
      setErrors(validationErrors);

      // If there are validation errors, stop submission
      if (Object.keys(validationErrors).length > 0) {
        console.log("Validation errors:", validationErrors);
        return; // Stop further execution
      }

      console.log("roundData1", roundData);

      // Include roundId only if editing
      const payload = isEditing
        ? { interviewId, round: roundData, roundId, questions: interviewQuestionsList }
        : { interviewId, round: roundData, questions: interviewQuestionsList };

      // Submit the form data
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/interview/save-round`,
        payload
      );
      console.log("response", response.data);

      //       // const preparingTeamRequestBody = {
      //       //   name: `Interview with ${candidate}-${candidate._id.slice(-5, -1)} for the position of ${position._id}`,
      //       //   description: "description",
      //       //   owner: userId,
      //       //   createdBy: userId,
      //       // };

      //       // const teamResponse = await axios.post(`${process.env.REACT_APP_API_URL}/createTeam`, preparingTeamRequestBody);

      // Handle outsource request if interviewers are selected
      if (selectedInterviewers && selectedInterviewers.length > 0) {
        const isInternal = selectedInterviewType === "internal";

        for (const interviewer of selectedInterviewers) {
          const outsourceRequestData = {
            tenantId: orgId,
            ownerId: userId,
            scheduledInterviewId: interviewId,
            interviewerType: selectedInterviewType,
            id: interviewer._id, // Directly passing the interviewer ID
            // status: isInternal ? "accepted" : "inprogress", // Status is already in the main schema
            dateTime: combinedDateTime,
            duration,
            candidateId: candidate?._id,
            positionId: position?._id,
            roundId: response.data.savedRound._id,
            requestMessage: isInternal
              ? "Internal interview request"
              : "Outsource interview request",
            expiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };

          console.log("Sending outsource request:", outsourceRequestData);

          await axios.post(
            `${process.env.REACT_APP_API_URL}/interviewrequest`,
            outsourceRequestData
          );
        }
      }



      // Navigate to the interview details page
      navigate(`/interviews/${interviewId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // if (isInstantInterview) {
    // Set interview time to 15 minutes from now
    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);
    setScheduledDate(date.toISOString().slice(0, 16));
    setDuration(30); // Set default duration for instant interviews
    // }
  }, []);

  if (!rounds) {
    return <div>Loading...</div>;
  }


  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: 'Interviews',
      path: '/'
    },
    {
      label: candidate?.LastName || 'Interview',
      path: `/interviews/${interviewId}`,
      status: rounds?.status
    }
  ];

  if (isEditing && roundEditData) {
    breadcrumbItems.push({
      label: `Edit ${roundEditData.roundTitle || 'Round'}`,
      path: `/interviews/${interviewId}`,
      status: roundEditData.status
    });
  } else {
    breadcrumbItems.push({
      label: 'Add New Round',
      path: ''
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
    setDuration(parseInt(assessment.Duration.replace(' minutes', '')));
    setInstructions(assessment.Instructions);
    setExpandedSections({});
    setSectionQuestions({});
    setShowDropdown(false);
  };
  const toggleSection = async (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    // Fetch questions if the section is being expanded and questions are not already loaded
    if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
      await fetchQuestionsForSection(sectionId);
    }
  };

  const fetchQuestionsForSection = async (sectionId) => {
    try {
      const response = assessmentData.find(pos => pos._id === assessmentTemplate.assessmentId)
      // const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentTemplate.assessmentId}`);
      const assessment = response;

      const section = assessment.Sections.find(s => s._id === sectionId);
      if (!section) {
        throw new Error('Section not found');
      }

      setSectionQuestions(prev => ({
        ...prev,
        [sectionId]: section.Questions
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      setSectionQuestions(prev => ({
        ...prev,
        [sectionId]: 'error'
      }));
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 md:px-8 xl:px-8 2xl:px-8">
        <div className="px-4 sm:px-0">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isEditing ? 'Edit Interview Round' : 'Add New Interview Round'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {isEditing
                  ? 'Update the round details below'
                  : 'Fill in the details to add a new interview round'}
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <form>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    {/* Round Title */}
                    <div>
                      <label htmlFor="roundTitle" className="block text-sm font-medium text-gray-700">
                        Round Title *
                      </label>
                      {roundTitle === "Other" ? (
                        <input
                          type="text"
                          id="roundTitle"
                          name="roundTitle"
                          value={customRoundTitle}
                          onChange={(e) => {
                            setCustomRoundTitle(e.target.value);
                            setErrors({ ...errors, roundTitle: '' }); // Clear error on change
                          }}
                          onBlur={() => {
                            if (!customRoundTitle.trim()) {
                              setRoundTitle(""); // Reset if the input is left empty
                            }
                          }}
                          className={`mt-1 block w-full border ${errors.roundTitle ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          required
                          placeholder="Enter custom round title"
                        />
                      ) : (
                        <select
                          id="roundTitle"
                          name="roundTitle"
                          value={roundTitle}
                          onChange={(e) => {
                            handleRoundTitleChange(e);
                            setErrors({ ...errors, roundTitle: '' }); // Clear error on change
                          }}
                          className={`mt-1 block w-full border ${errors.roundTitle ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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
                        <p className="mt-1 text-sm text-red-500">{errors.roundTitle}</p>
                      )}
                    </div>

                    {/* Interview Mode */}
                    <div>
                      <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                        Interview Mode *
                      </label>
                      <select
                        id="interviewMode"
                        name="interviewMode"
                        value={interviewMode}
                        onChange={(e) => {
                          setInterviewMode(e.target.value);
                          setErrors({ ...errors, interviewMode: '' }); // Clear error on change
                        }}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${errors.interviewMode ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
                        required
                        disabled={roundTitle === "Assessment"}
                      >
                        <option value="">Select Interview Mode</option>
                        <option value="Face to Face">Face to Face</option>
                        <option value="Virtual">Virtual</option>
                      </select>
                      {errors.interviewMode && (
                        <p className="mt-1 text-sm text-red-500">{errors.interviewMode}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    {/* Sequence */}
                    <div>
                      <label htmlFor="sequence" className="block text-sm font-medium text-gray-700">
                        Sequence *
                      </label>
                      <input
                        type="number"
                        id="sequence"
                        name="sequence"
                        min="1"
                        value={sequence}
                        onChange={(e) => {
                          setSequence(parseInt(e.target.value));
                          setErrors({ ...errors, sequence: '' }); // Clear error on change
                        }}
                        className={`mt-1 block w-full border ${errors.sequence ? 'border-red-500' : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The order in which this round appears in the interview process
                      </p>
                      {errors.sequence && (
                        <p className="mt-1 text-sm text-red-500">{errors.sequence}</p>
                      )}
                    </div>

                    {/* Status */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-700 block w-full pl-3 pr-10 py-2 text-base border sm:text-sm rounded-md" disabled>{status}</span> {/* Display current status */}
                        <div className="ml-2">
                          <StatusBadge status={status} size="sm" />
                        </div>
                      </div>
                    </div>
                    {roundTitle === "Assessment" && (
                      <>


                        <div>
                          <label htmlFor="assessmentTemplate" className="block text-sm font-medium text-gray-700">Assessment Template <span className="text-red-500">*</span></label>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              name="assessmentTemplate"
                              id="assessmentTemplate"
                              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                              placeholder="Enter assessment template name"
                              value={assessmentTemplate.assessmentName || ''}
                              onChange={(e) => {
                                setAssessmentTemplate(prev => ({
                                  ...prev,
                                  assessmentId: prev.assessmentId, // Keep the existing assessmentId
                                  assessmentName: e.target.value // Update assessmentName
                                }));
                                setErrors(prev => ({ ...prev, assessmentTemplate: '' })); // Clear only this error
                              }}
                              
                              
                              
                              onClick={() => setShowDropdown(!showDropdown)}

                            />
                            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                              <Search className="text-gray-600 text-lg" />
                            </div>
                            {showDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {loading ? (
                                  <div className="px-3 py-2 text-gray-500">Loading...</div>
                                ) : (
                                  assessmentData.length > 0 ? (
                                    assessmentData.map((user, index) => (
                                      <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleAssessmentSelect(user)}
                                      >
                                        {user.AssessmentTitle}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-gray-500">No assessments found</div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                          {errors.assessmentTemplate && (
                        <p className="mt-1 text-sm text-red-500">{errors.assessmentTemplate}</p>
                      )}

                        </div>

                        {/* assessment questions */}
                        {assessmentTemplate.assessmentName && (
                          <div className='col-span-2'>
                            <label htmlFor="assessmentQuestions" className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
                            {/* {errors.assessmentQuestions && <p className="text-red-500">{errors.assessmentQuestions}</p>} */}
                            <div className="space-y-4">
                              {
                                sectionQuestions.error ? (
                                  <div className="pl-4 py-2">
                                    <p className="text-sm text-red-500">{sectionQuestions.error}</p>
                                    <button
                                      type="button"
                                      onClick={() => fetchSectionsAndQuestions(assessmentTemplate.assessmentId)} // CHANGED: Use assessmentId
                                      className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                                    >
                                      Retry Loading
                                    </button>
                                  </div>
                                ) :

                                  assessmentData.find(a => a._id === assessmentTemplate.assessmentId)?.Sections.map((section) => (
                                    <div key={section._id} id="assessmentQuestions" className="border rounded-md shadow-sm p-4">
                                      <button
                                        type="button"
                                        onClick={() => toggleSection(section._id)}
                                        className="flex justify-between items-center w-full"
                                      >
                                        <span className="font-medium">{section.SectionName}</span>
                                        <ChevronUp className={`transform transition-transform ${expandedSections[section._id] ? '' : 'rotate-180'}`} />
                                      </button>

                                      {expandedSections[section._id] && (
                                        <div className="mt-4 space-y-3">
                                          {sectionQuestions[section._id] === 'error' ? (
                                            <div className="pl-4 py-2">
                                              <p className="text-sm text-red-500">Failed to load questions. Please try again.</p>
                                              <button
                                                type="button"
                                                onClick={() => fetchQuestionsForSection(section._id)}
                                                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                                              >
                                                Retry Loading
                                              </button>
                                            </div>
                                          ) : sectionQuestions[section._id] ? (
                                            sectionQuestions[section._id].map((question, idx) => (
                                              <div
                                                key={question._id || idx}
                                                className="border rounded-md shadow-sm overflow-hidden"
                                              >
                                                <div
                                                  onClick={() => setExpandedQuestions(prev => ({
                                                    ...prev,
                                                    [question._id]: !prev[question._id]
                                                  }))}
                                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-600">{idx + 1}.</span>
                                                    <p className="text-sm text-gray-700">{question.snapshot?.questionText}</p>
                                                  </div>
                                                  <ChevronDown
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[question._id] ? 'transform rotate-180' : ''
                                                      }`}
                                                  />
                                                </div>

                                                {expandedQuestions[question._id] && (
                                                  <div className="px-4 py-3">
                                                    <div className="flex justify-between mb-2">
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-500">Type:</span>
                                                        <span className="text-sm text-gray-700">
                                                          {question.snapshot?.questionType || 'Not specified'}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-500">Score:</span>
                                                        <span className="text-sm text-gray-700">
                                                          {question.snapshot?.score || '0'}
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                      {/* Options */}
                                                      {question.snapshot?.options?.length > 0 && (
                                                        <div className="flex items-center gap-2">
                                                          <span className="text-sm font-medium text-gray-500">Options:</span>
                                                          <div className="grid grid-cols-4 gap-2">
                                                            {question.snapshot.options.map((option, optionIdx) => (
                                                              <div
                                                                key={optionIdx}
                                                                className="text-sm text-gray-700 px-3 py-1.5 bg-white rounded border"
                                                              >
                                                                {option}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2">
                                                      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Correct Answer:</span>
                                                      <span className="text-sm text-gray-700">
                                                        {question.snapshot?.correctAnswer || 'Not specified'}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))
                                          ) : (
                                            <div className="pl-4 py-2">
                                              <p className="text-sm text-gray-500">Loading questions...</p>
                                              <div className="mt-2 w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                            </div>
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
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                              }`}
                          >
                            <Clock className={`h-6 w-6 ${interviewType === "instant" ? "text-blue-500" : "text-gray-400"}`} />
                            <span className={`mt-2 font-medium ${interviewType === "instant" ? "text-blue-700" : "text-gray-900"}`}>
                              Instant Interview
                            </span>
                            <span className="mt-1 text-sm text-gray-500">Starts in 15 minutes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInterviewType("scheduled")}
                            className={`relative border rounded-lg p-4 flex flex-col items-center justify-center ${interviewType === "scheduled"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                              }`}
                          >
                            <Calendar className={`h-6 w-6 ${interviewType === "scheduled" ? "text-blue-500" : "text-gray-400"}`} />
                            <span className={`mt-2 font-medium ${interviewType === "scheduled" ? "text-blue-700" : "text-gray-900"}`}>
                              Schedule for Later
                            </span>
                            <span className="mt-1 text-sm text-gray-500">Pick date & time</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-2">
                          {interviewType === "scheduled" && (
                            <div className="mt-4">
                              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                                Scheduled Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                id="scheduledDate"
                                name="scheduledDate"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          )}

                          <div className="mt-4">
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                              Duration (minutes)
                            </label>
                            <select
                              id="duration"
                              name="duration"
                              value={duration}
                              onChange={(e) => setDuration(parseInt(e.target.value))}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">60 min</option>
                              <option value="90">90 min</option>
                              <option value="120">120 min</option>
                            </select>
                          </div>
                        </div>

                        {interviewType === "instant" && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-blue-500 mr-2" />
                              <p className="text-sm text-blue-700">
                                Interview will start at{" "}
                                <span className="font-medium">
                                  {new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>{" "}
                                and end at{" "}
                                <span className="font-medium">
                                  {new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                                  {new Date(startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                  {new Date(endTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Select Interviewers */}
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Interviewers</label>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            onClick={() => setInternalInterviews(true)}
                            variant="outline"
                            size="sm"
                            className={`${isExternalSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={isExternalSelected}
                            title={isExternalSelected ? "Clear external interviewers first" : ""}
                          >
                            <User className="h-4 w-4 mr-1 text-blue-600" />
                            Select Internal
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowOutsourcePopup(true)}
                            variant="outline"
                            size="sm"
                            className={`${isInternalSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={isInternalSelected}
                            title={isInternalSelected ? "Clear internal interviewers first" : ""}
                          >
                            <User className="h-4 w-4 mr-1 text-orange-600" />
                            Select Outsourced
                          </Button>
                        </div>
                      </div>

                      {/* Selected Interviewers Summary */}
                      <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                        {selectedInterviewers.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center">No interviewers selected</p>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-700">
                                  {selectedInterviewers.length} interviewer{selectedInterviewers.length !== 1 ? "s" : ""} selected
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
                              <div className="mb-3">
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Internal Interviewers</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                                  {internalInterviewers.map((interviewer) => (
                                    <div key={interviewer._id} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2">
                                      <div className="flex items-center">
                                        <span className="ml-2 text-sm text-blue-800 truncate">{interviewer.name}</span>
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
                            )}

                            {/* External Interviewers */}
                            {isExternalSelected && (
                              <div>
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Outsourced Interviewers</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {externalInterviewers.map((interviewer) => (
                                    <div key={interviewer.id} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2">
                                      <div className="flex items-center">
                                        <span className="ml-2 text-sm text-orange-800 truncate">{interviewer.name} (Outsourced)</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExternalInterviewer(interviewer.id)}
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
                      {errors.interviewers && <p className="text-red-500 text-sm -mt-5">{errors.interviewers}</p>}
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
                                {interviewQuestionsList.map((question, qIndex) => {
                                  const isMandatory = question?.mandatory === "true";

                                  return (
                                    <li
                                      key={qIndex}
                                      className={`flex justify-between items-center p-3 border rounded-md ${isMandatory ? "border-red-500" : "border-gray-300"
                                        }`}
                                    >
                                      <span className="text-gray-900 font-medium">
                                        {qIndex + 1}. {question?.snapshot?.questionText || "No Question Text"}
                                      </span>
                                      <button onClick={() => handleRemoveQuestion(qIndex)}>
                                        <span className="text-red-500 text-xl font-bold">&times;</span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="mt-2 text-gray-500 flex justify-center">No questions added yet.</p>
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
                                <div className="py-3 px-4 bg-custom-blue flex items-center justify-between">
                                  <h2 className="text-xl text-white font-semibold">Add Interview Question</h2>
                                  <button>
                                    <MdOutlineCancel
                                      className="text-2xl text-white"
                                      onClick={() => handlePopupToggle()}
                                    />
                                  </button>
                                </div>
                                <div className="z-10 top-28 sm:top-32 md:top-36 left-0 right-0">
                                  <div className="flex gap-10 p-4">
                                    <div className="relative inline-block">
                                      <span className="flex items-center cursor-pointer">
                                        <span
                                          className={`pb-3 ${activeTab === "SuggesstedQuestions"
                                            ? "text-black font-semibold border-b-2 border-custom-blue"
                                            : "text-gray-500"
                                            }`}
                                          onClick={() => handleSuggestedTabClick()}
                                        >
                                          Suggested Questions
                                        </span>
                                      </span>
                                    </div>
                                    <div className="relative inline-block">
                                      <span className="flex items-center cursor-pointer">
                                        <span
                                          className={`pb-3 ${activeTab === "MyQuestionsList"
                                            ? "text-black font-semibold border-b-2 border-custom-blue"
                                            : "text-gray-500"
                                            }`}
                                          onClick={() => handleFavoriteTabClick()}
                                        >
                                          My Questions List
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {activeTab === "SuggesstedQuestions" && (
                                  <SuggesstedQuestions fromScheduleLater={true} onAddQuestion={handleAddQuestionToRound} />
                                )}
                                {activeTab === "MyQuestionsList" && (
                                  <MyQuestionListMain fromScheduleLater={true} onAddQuestion={handleAddQuestionToRound} />
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
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                      Instructions
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      rows={3}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : isEditing ? 'Update Round' : 'Add Round'}
                    </button>
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
          candidateData1={candidate}
          onProceed={handleExternalInterviewerSelect}
        />
      )}

      {isInternalInterviews && (
        <InternalInterviews
          isOpen={isInternalInterviews}
          onClose={() => setInternalInterviews(false)}
          onSelectCandidates={handleInternalInterviewerSelect}
        />
      )}
    </div>
  );
}

export default RoundForm;