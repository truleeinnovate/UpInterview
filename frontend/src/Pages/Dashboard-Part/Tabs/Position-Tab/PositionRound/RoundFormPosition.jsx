import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../CommonCode-AllTabs/ui/button.jsx';
import StatusBadge from '../../CommonCode-AllTabs/StatusBadge.jsx';
import Breadcrumb from '../../CommonCode-AllTabs/Breadcrumb.jsx';

import { ChevronDown, X, User, Users, Trash2, ChevronUp } from 'lucide-react';
// import { Button } from '../../CommonCode-AllTabs/ui/button.jsx';
import axios from "axios";
// import OutsourceOption from "../../Interviews/OutsourceOption.jsx";
// import OutsourceOption from "./Internal-Or-Outsource/OutsourceInterviewer.jsx";
import { ReactComponent as MdOutlineCancel } from "../../../../../icons/MdOutlineCancel.svg";
import MyQuestionListMain from "../../QuestionBank-Tab/MyQuestionsList.jsx";
import Cookies from "js-cookie";
// import { FaChevronUp, FaSearch } from 'react-icons/fa';
import { useCustomContext } from '../../../../../Context/Contextfetch.js';
import SuggesstedQuestions from '../../QuestionBank-Tab/SuggesstedQuestionsMain.jsx'
import InternalInterviews from '../../Interview-New/pages/Internal-Or-Outsource/InternalInterviewers.jsx';
import { useInterviewerDetails } from '../../../../../utils/CommonFunctionRoundTemplates.js';
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";

function RoundFormPosition() {
  const {
    assessmentData,
    positions,
    groups,
    loading
  } = useCustomContext();
  const { resolveInterviewerDetails } = useInterviewerDetails();
  const { roundId, id } = useParams();

  const positionId = id;

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const userId = tokenPayload.userId;
  const tenantId = tokenPayload.organizationId;

  // const orgId = Cookies.get("organizationId");

  // console.log("tenantId tenantId", tenantId);


  // Determine context (interview or position) based on params
  const isPositionContext = !!positionId;
  const contextId = isPositionContext && positionId;
  // const entityData = isPositionContext
  //   && positions?.find(pos => pos._id === positionId)

  const [assessmentTemplate, setAssessmentTemplate] = useState({ assessmentId: '', assessmentName: '' });
  const [position, setPosition] = useState(null);
  const [rounds, setRounds] = useState([]);

  const [isInternalInterviews, setInternalInterviews] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assessmentTemplate: { assessmentId: '', assessmentName: '' },
    roundTitle: '',
    customRoundTitle: '',
    // interviewerType: '',
    // externalInterviewers: '',
    // selectedInterviewersType: 'Individual',
    interviewMode: '',
    selectedQuestions: [],
    // status: 'Pending',
    instructions: '',
    sequence: 1,
    // isInstantInterview: false,
    interviewQuestionsList: [],
    selectedInterviewType: null,
    internalInterviewers: [],
    externalInterviewers: '',
    interviewType: 'instant',
    scheduledDate: '',
    duration: 30
  });



  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);


  const [sectionQuestions, setSectionQuestions] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [errors, setErrors] = useState({ roundTitle: '', interviewMode: '' });

  const clearError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const handleAddQuestionToRound = async (question) => {
    if (question && question.questionId && question.snapshot) {
      setFormData(prev => ({
        ...prev,
        interviewQuestionsList: prev.interviewQuestionsList.some(q => q.questionId === question.questionId)
          ? prev.interviewQuestionsList
          : [...prev.interviewQuestionsList, question]
      }));
    }
  }

  const handleRemoveQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.filter((_, qIndex) => qIndex !== index)
    }));

  };
  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      roundTitle: selectedTitle,
      customRoundTitle: selectedTitle === "Other" ? "" : prev.customRoundTitle,
      interviewMode: selectedTitle === "Assessment" ? "Virtual" : selectedTitle === "Other" ? "" : prev.interviewMode,
      duration: 30,
      interviewerType: "",
      externalInterviewers: "",
      instructions: "",
      internalInterviewers: [],
      interviewQuestionsList: [],
      assessmentTemplate: [{ assessmentId: '', assessmentName: '' }]
    }));

    // Clear relevant errors
    // Clear relevant errors
    clearError('roundTitle');
    clearError('customRoundTitle');
    clearError('interviewMode');
    clearError('duration');
    clearError('instructions');
    clearError('interviewerType');
    clearError('interviewers');
    clearError('questions');
    clearError('assessmentTemplate');
    clearError('assessmentQuestions');


    // Reset section questions and expanded sections
    setSectionQuestions({});
    setExpandedSections({});
    setExpandedQuestions({});
    setErrors({});
    setShowDropdown(false);

  };


  const handleSuggestedTabClick = () => setActiveTab("SuggesstedQuestions");
  const handleFavoriteTabClick = () => setActiveTab("MyQuestionsList");

  // while editing
  const isEditing = !!roundId && roundId !== 'new';
  const roundEditData = isEditing && rounds?.find(r => r._id === roundId);



  useEffect(() => {
    const fetchPositionData = async () => {
      try {
        if (isPositionContext && positionId) {
          // Fetch position details from API
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/position/details/${positionId}`,
            {
              params: {
                tenantId: tenantId
              }
            }
          );

          const foundPosition = response.data;

          if (!foundPosition) {
            setError('Position not found');
            return;
          }

          // Only update rounds if they're different to prevent unnecessary re-renders
          setPosition(foundPosition || []);
          setRounds(foundPosition.rounds || [])

          if (isEditing && roundId) {
            // Add safety check for foundPosition.rounds
            const roundEditData = foundPosition.rounds?.find(r => r._id === roundId);

            if (!roundEditData) {
              setError('Round not found');
              return;
            }

            console.log("roundEditData", roundEditData);
            // Add fallback empty array for interviewers
            const interviewers = roundEditData.interviewers || [];
            const internalInterviewers = resolveInterviewerDetails(interviewers);

            setFormData(prev => ({
              ...prev,
              assessmentTemplate: roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId
                ? {
                  assessmentId: roundEditData.assessmentId,
                  assessmentName: assessmentData.find(a => a._id === roundEditData.assessmentId)?.AssessmentTitle || ''
                }
                : { assessmentId: '', assessmentName: '' },
              roundTitle: roundEditData.roundTitle || '',
              customRoundTitle: '',
              interviewMode: roundEditData.interviewMode || '',
              selectedQuestions: [],
              instructions: roundEditData.instructions || '',
              sequence: roundEditData.sequence || 1,
              interviewQuestionsList: roundEditData.questions || [],
              selectedInterviewType: roundEditData.interviewerType || null,
              internalInterviewers: internalInterviewers || [],
              externalInterviewers: roundEditData.interviewerType === "External"
                ? "Outsourced will be selected at interview schdedule time."
                : '',
              interviewType: roundEditData.interviewType || 'instant',
              scheduledDate: '',
              duration: roundEditData.duration || 30
            }));

            if (roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId) {
              const assessmentDataForTemplate = {
                assessmentId: roundEditData.assessmentId,
                assessmentName: assessmentData.find(a => a._id === roundEditData.assessmentId)?.AssessmentTitle || ''
              };
              setAssessmentTemplate(assessmentDataForTemplate);
              fetchQuestionsForSection(roundEditData.assessmentId);
            }
          } else {
            // For new round, set the sequence to be after the last round
            const maxSequence = foundPosition.rounds?.length > 0
              ? Math.max(...foundPosition.rounds.map(r => r.sequence))
              : 0;
            setFormData(prev => ({ ...prev, sequence: maxSequence + 1 }));
          }
        }
      } catch (error) {
        console.error('Error fetching position data:', error);
        setError('Failed to load position data');
      }
    };

    // Only fetch if we're in position context and have an ID
    if (isPositionContext && positionId) {
      fetchPositionData();
    }
  }, [isPositionContext, positionId, isEditing, roundId, tenantId, assessmentData]); // Removed problematic dependencies


  const fetchQuestionsForSection = async (assessmentId) => {

    if (!assessmentId) {
      return null;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/assessments/${assessmentId}`);
      const assessmentQuestions = response.data;

      const sections = assessmentQuestions.sections || [];

      // console.log("assessmentQuestions.sections", assessmentQuestions.sections);

      // Check for empty sections or questions
      if (sections.length === 0 || sections.every(section => !section.questions || section.questions.length === 0)) {
        console.warn('No sections or questions found for assessment:', assessmentId);
        setSectionQuestions({ noQuestions: true });
        return;
      }

      // Create section questions mapping with all section data
      const newSectionQuestions = {};

      sections.forEach((section) => {
        if (!section._id) {
          console.warn('Section missing _id:', section);
          return;
        }

        // Store complete section data including sectionName, passScore, totalScore
        newSectionQuestions[section._id] = {
          sectionName: section?.sectionName,
          passScore: Number(section.passScore || 0),
          totalScore: Number(section.totalScore || 0),
          questions: (section.questions || []).map(q => ({
            _id: q._id,
            questionId: q.questionId,
            source: q.source || 'system',
            score: Number(q.score || q.snapshot?.score || 0),
            order: q.order || 0,
            customizations: q.customizations || null,
            snapshot: {
              questionText: q.snapshot?.questionText || '',
              questionType: q.snapshot?.questionType || '',
              score: Number(q.snapshot?.score || q.score || 0),
              options: Array.isArray(q.snapshot?.options) ? q.snapshot.options : [],
              correctAnswer: q.snapshot?.correctAnswer || '',
              difficultyLevel: q.snapshot?.difficultyLevel || '',
              hints: Array.isArray(q.snapshot?.hints) ? q.snapshot.hints : [],
              skill: Array.isArray(q.snapshot?.skill) ? q.snapshot.skill : [],
              tags: Array.isArray(q.snapshot?.tags) ? q.snapshot.tags : [],
              technology: Array.isArray(q.snapshot?.technology) ? q.snapshot.technology : [],
              questionNo: q.snapshot?.questionNo || ''
            }
          }))
        };
      });

      // Verify that at least one section has questions
      const hasQuestions = Object.values(newSectionQuestions).some(section => section.questions.length > 0);
      if (!hasQuestions) {
        console.warn('No sections with questions found for assessment:', assessmentId);
        setSectionQuestions({ noQuestions: true });
        return;
      }

      // Set the section questions state
      setSectionQuestions(newSectionQuestions);
      // console.log('Updated sectionQuestions:', newSectionQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setSectionQuestions({ error: 'Failed to load questions' });
    }
  };



  const toggleSection = async (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    // Fetch questions if the section is being expanded and questions are not already loaded
    if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
      await fetchQuestionsForSection(formData.assessmentTemplate[0].assessmentId);
    }
  };



  const handleInternalInterviewerSelect = (interviewers) => {
    if (formData.selectedInterviewType === "external") {
      alert("You need to clear external interviewers before selecting internal interviewers.");
      return;
    }

    const existingInterviewerIds = new Set(
      formData.internalInterviewers.map(i => i._id)
    );

    // Filter out any interviewers that are already selected
    const uniqueInterviewers = interviewers
      .filter(interviewer => {
        const interviewerId = interviewer.contactId?._id || interviewer._id;
        return !existingInterviewerIds.has(interviewerId);
      })
      .map(interviewer => ({
        _id: interviewer.contactId?._id || interviewer._id || '',
        name: interviewer.contactId?.name || interviewer.name || 'Unknown',
        email: interviewer.contactId?.email || interviewer.email || ''
      }));

    if (uniqueInterviewers.length === 0) {
      alert("All selected interviewers are already added.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      selectedInterviewType: "internal",
      internalInterviewers: [...prev.internalInterviewers, ...uniqueInterviewers]
    }));


  };



  const handleExternalInterviewerSelect = () => {

    if (formData.selectedInterviewType === "internal") {
      alert("You need to clear internal interviewers before selecting outsourced interviewers.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      selectedInterviewType: "external",
      externalInterviewers: "Outsourced will be selected at interview schdedule time."
    }));

  };

  const handleRemoveInternalInterviewer = (interviewerId) => {
    setFormData(prev => ({
      ...prev,
      internalInterviewers: prev.internalInterviewers.filter(
        interviewer => interviewer._id !== interviewerId
      ),

      interviewerType: prev.internalInterviewers.length === 1 ? '' : prev.selectedInterviewType
    }));

  };

  const handleClearAllInterviewers = () => {
    setFormData(prev => ({
      ...prev,
      internalInterviewers: [],
      externalInterviewers: '',
      selectedInterviewType: null
    }));

  };

  const selectedInterviewers = formData.selectedInterviewType === "internal"
    ? formData.internalInterviewers
    : (formData.selectedInterviewType === "external" ? formData.externalInterviewers : []);
  const isInternalSelected = formData.selectedInterviewType === "internal";
  const isExternalSelected = formData.selectedInterviewType === "external";
  const selectedInterviewersData = isInternalSelected && Array.isArray(selectedInterviewers)
    ? selectedInterviewers.map(interviewer => interviewer?._id).filter(Boolean)
    : [];


  // Validate form
  const validateForm = () => {
    const newErrors = {
      roundTitle: '',
      interviewMode: '',
      sequence: '',
      assessmentTemplate: '',
      duration: '',
      instructions: '',
      interviewerType: '',
      // interviewers: '',
      questions: '',
      assessmentQuestions: ''
    };

    // Round title validation
    if (!formData.roundTitle?.trim()) {
      newErrors.roundTitle = 'Round title is required';
    } else if (formData.roundTitle === 'Other' && !formData.customRoundTitle?.trim()) {
      newErrors.roundTitle = 'Custom round title is required';
    }

    // Interview mode validation
    if (!formData.interviewMode && formData.roundTitle !== 'Assessment') {
      newErrors.interviewMode = 'Interview mode is required';
    }

    // Sequence validation
    if (!formData.sequence || formData.sequence < 1) {
      newErrors.sequence = 'Sequence must be at least 1';
    }

    // Assessment-specific validations
    if (formData.roundTitle === 'Assessment') {
      if (!formData.assessmentTemplate?.assessmentId) {
        newErrors.assessmentTemplate = 'Assessment template is required';
      }

      // Check if any sections have errors loading questions
      const hasSectionErrors = Object.values(sectionQuestions).some(
        section => section === null || section.error
      );

      if (hasSectionErrors) {
        newErrors.assessmentQuestions = 'Some sections failed to load questions';
      }
    }

    // Technical round validations
    if (formData.roundTitle === 'Technical') {
      if (!formData.duration) {
        newErrors.duration = 'Duration is required';
      }

      if (!formData.instructions?.trim()) {
        newErrors.instructions = 'Instructions are required';
      } else if (formData.instructions.length < 250) {
        newErrors.instructions = 'Instructions must be at least 250 characters';
      } else if (formData.instructions.length > 1000) {
        newErrors.instructions = 'Instructions cannot exceed 1000 characters';
      }

      if (!formData.selectedInterviewType) {
        newErrors.interviewerType = 'Interviewer type is required';
      }

      // if (formData.selectedInterviewType === 'internal' && formData.internalInterviewers.length === 0) {
      //   newErrors.interviewers = 'At least one interviewer is required';
      // }

      if (formData.interviewQuestionsList.length === 0) {
        newErrors.questions = 'At least one question is required';
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Run validation first
    const isValid = validateForm();
    if (!isValid) {
      setIsLoading(false);
      return; // Stop submission if there are errors
    }
  console.log("isValid", errors);
  

    const roundData = {
      roundTitle: formData.roundTitle,
      interviewMode: formData.interviewMode,
      duration: formData.duration,
      interviewType: formData.interviewType,
      interviewerType: formData.selectedInterviewType,
      sequence: formData.sequence,
      // selectedInterviewersType: formData.roundTitle === 'Technical' ? roundData.selectedInterviewersType : '',
      // interviewers: selectedInterviewersData || [],
      interviewers: formData.selectedInterviewType === "internal"
        ? formData.internalInterviewers.map(interviewer => interviewer._id)
        : formData.selectedInterviewType === "external"
          ? ["Outsourced will be selected at interview schedule time"]
          : [],
      ...(formData.roundTitle === "Assessment" && formData.assessmentTemplate.assessmentId
        ? {
          assessmentId: formData.assessmentTemplate.assessmentId,
          questions: [] // Clear questions for assessment as they come from the template
        }
        : {
          questions: formData.interviewQuestionsList || []
        }),
      instructions: formData.instructions,
      // status: formData.status,
      // questions: formData.interviewQuestionsList || []
    };

    try {
   // Include roundId only if editing
      const payload = isEditing ? { positionId, round: roundData, roundId } : { positionId, round: roundData }

      // console.log("payload roundData1", payload);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/position/add-rounds`,
        payload
      );
      // console.log("response", response.data);

      if (response.status === 201 || response.status === 200) {
        navigate(`/position/view-details/${positionId}`)
      }


      // const preparingTeamRequestBody = {
      //   name: `Interview with ${candidate}-${candidate._id.slice(-5, -1)} for the position of ${position._id}`,
      //   description: "description",
      //   owner: userId,
      //   createdBy: userId,
      // };

      // const teamResponse = await axios.post(`${process.env.REACT_APP_API_URL}/createTeam`, preparingTeamRequestBody);

      // if (selectedInterviewers && selectedInterviewers.length > 0) {
      //   const interviewerObjects = selectedInterviewers.map(id => ({
      //     id: id._id,
      //     status: "inprogress"
      //   }));
      //   const outsourceRequestData = {
      //     tenantId: orgId,
      //     ownerId: userId,
      //     scheduledInterviewId: interviewId,
      //     interviewerType: selectedInterviewType,
      //     interviewerIds: interviewerObjects, // Fixed mapping here
      //     dateTime: combinedDateTime,
      //     duration,
      //     candidateId: candidate?._id,
      //     positionId: position?._id,
      //     status: "inprogress",
      //     roundNumber: sequence,
      //     requestMessage: "Outsource interview request",
      //     expiryDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      //   };

      //   await axios.post(
      //     `${process.env.REACT_APP_API_URL}/interviewrequest`,
      //     outsourceRequestData
      //   );
      // }


      // setStatus((prevStatus) => {
      //   const newStatus = [...prevStatus];
      //   newStatus = "Request Sent";
      //   return newStatus;
      // });

      // navigate(`/interviews/${interviewId}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  if (!rounds) {
    return <div>Loading...</div>;
  }

  // Create breadcrumb items with status
  const breadcrumbItems = isPositionContext
    && [
      { label: 'Positions', path: '/position' },
      { label: position?.title || 'Position', path: `/position/view-details/${contextId}` },
      // { label: isEditing ? `Edit ${roundEditData?.roundTitle || 'Round'}` : 'Add New Round', path: '' }
    ]



  if (isEditing && roundEditData) {
    breadcrumbItems.push({
      label: `Edit ${roundEditData.roundTitle || 'Round'}`,
      path: '',
      // status: 'pending'
      // status: roundEditData.status
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
    // Set as an object, not an array
    const assessmentData = {
      assessmentId: assessment._id,
      assessmentName: assessment.AssessmentTitle
    };
    setAssessmentTemplate(assessmentData); // Update state directly
    setFormData(prev => ({
      ...prev,
      assessmentTemplate: assessmentData,
      duration: parseInt(assessment.Duration.replace(' minutes', '')),
      instructions: assessment.Instructions,
      interviewQuestionsList: []
    }));

    clearError('assessmentTemplate');
    clearError('assessmentQuestions');
    setExpandedSections({});
    setSectionQuestions({});
    fetchQuestionsForSection(assessment._id);
    setShowDropdown(false);
  };


  const title = isEditing
    ? (isPositionContext ? 'Edit Position Round' : 'Edit Interview Round')
    : (isPositionContext ? 'Add New Position Round' : 'Add New Interview Round');


  // console.log("internalInterviewers selectedInterviewType ", formData);

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
                  ? 'Update the round details below'
                  : 'Fill in the details to add a new interview round'}
              </p>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    {/* round title */}
                    <div>
                      <label htmlFor="roundTitle" className="block text-sm font-medium text-gray-700">
                        Round Title *
                      </label>
                      {formData.roundTitle === "Other" ? (
                        <input
                          type="text"
                          id="roundTitle"
                          name="roundTitle"
                          value={formData.customRoundTitle}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, customRoundTitle: e.target.value }));
                            // CHANGE: Clear customRoundTitle error when user types
                            clearError('roundTitle');
                          }}
                          onBlur={() => {
                            if (!formData.customRoundTitle.trim()) setFormData(prev => ({ ...prev, roundTitle: "" }));
                          }}
                          
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm"
                          required
                          placeholder="Enter custom round title"
                        />
                      ) : (
                        <select
                          id="roundTitle"
                          name="roundTitle"
                          value={formData.roundTitle}
                          onChange={handleRoundTitleChange}
                          // className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.maxexperience ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}`}
                             
                          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 
                            ${errors.roundTitle ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}
                            focus:outline-none  sm:text-sm`}
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
                      {errors.roundTitle && <p className="mt-1 text-xs text-red-500">{errors.roundTitle }</p>}
                    </div>

                    <div>
                      <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                        Interview Mode *
                      </label>
                      <select
                        id="interviewMode"
                        name="interviewMode"
                        value={formData.interviewMode}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, interviewMode: e.target.value }));
                          clearError('interviewMode');
                        }}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none  
                        sm:text-sm rounded-md ${errors.interviewMode ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}`}
                        required
                        disabled={formData.roundTitle === "Assessment"}
                      >
                        <option value="">Select Interview Mode</option>
                        <option value="Face to Face">Face to Face</option>
                        <option value="Virtual">Virtual</option>
                      </select>
                      {errors.interviewMode && <p className="mt-1 text-xs text-red-500">{errors.interviewMode}</p>}
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-1">
                    <div>
                      <label htmlFor="sequence" className="block text-sm font-medium text-gray-700">
                        Sequence
                      </label>
                      <input
                        type="number"
                        id="sequence"
                        name="sequence"
                        min="1"
                        value={formData.sequence}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) }));
                          clearError('sequence');
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        The order in which this round appears in the interview process
                      </p>
                    </div>

                    {formData.roundTitle !== "Assessment" &&
                      <div >
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                          Duration (minutes)
                        </label>
                        <select
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }));
                            clearError('duration');
                          }}
                          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm
                            ${errors.duration ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}
                            `}
                        >
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">60 min</option>
                          <option value="90">90 min</option>
                          <option value="120">120 min</option>
                        </select>
                        {errors.duration && <p className="mt-1 text-xs text-red-500">{errors.duration}</p>}
                      </div>
                    }


                    {formData.roundTitle === "Assessment" && (
                      <>

                        <div>
                          <label htmlFor="assessmentTemplate" className="block text-sm font-medium text-gray-700">Assessment Template </label>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              name="assessmentTemplate"
                              id="assessmentTemplate"
                              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm
                            ${errors.assessmentTemplate ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}    
                                `}
                              placeholder="Enter assessment template name"
                              value={formData.assessmentTemplate?.assessmentName || ''}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  assessmentTemplate: { ...prev.assessmentTemplate, assessmentName: e.target.value }
                                }));
                                // CHANGE: Clear assessmentTemplate error when user types
                                clearError('assessmentTemplate');
                                clearError('assessmentQuestions');
                              }}
                              onClick={() => setShowDropdown(!showDropdown)}
                              readOnly
                            />
                            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                              {/* <FaSearch className="text-gray-600 text-lg" /> */}
                            </div>
                            {showDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {loading ? (
                                  <div className="px-3 py-2 text-gray-500">Loading...</div>
                                ) : (
                                  assessmentData.length > 0 ? (
                                    assessmentData.map((assessment, index) => (
                                      <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                          handleAssessmentSelect(assessment)
                                          clearError('assessmentTemplate');
                                          clearError('assessmentQuestions');
                                        }}
                                      >
                                        {assessment.AssessmentTitle}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-gray-500">No assessments found</div>
                                  )
                                )}
                              </div>
                              
                            )}
                             {errors.assessmentTemplate && <p className="mt-1 text-xs text-red-500">{errors.assessmentTemplate}</p>}
                          </div>

                        </div>

                      </>
                    )}
                  </div>

                  {/* Assessment Type Fields */}
                  {formData.roundTitle === 'Assessment' && (
                    <div className="space-y-6">

                      {formData.assessmentTemplate.assessmentName && (
                        <div>
                          <label htmlFor="assessmentQuestions" className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                            Assessment
                          </label>
                          {errors.assessmentQuestions && <p className="text-red-500 text-xs">{errors.assessmentQuestions}</p>}
                          {loading ? (
                            <p className="text-gray-500">Loading assessment data...</p>
                          ) : (
                            <div className="space-y-4">
                              {/* Check if sectionQuestions is properly structured */}
                              {Object.keys(sectionQuestions).length > 0 ? (
                                Object.entries(sectionQuestions).map(([sectionId, sectionData]) => {
                                  // Find section details from assessmentData
                                  // const selectedAssessment = assessmentData.find(
                                  //   a => a._id === formData.assessmentTemplate[0].assessmentId
                                  // );

                                  // const section = selectedAssessment?.Sections?.find(s => s._id === sectionId);

                                  return (
                                    <div key={sectionId} className="border rounded-md shadow-sm p-4">
                                      <button
                                        onClick={() => toggleSection(sectionId)}
                                        className="flex justify-between items-center w-full"
                                      >
                                        <span className="font-medium">
                                          {sectionData?.sectionName || 'Unnamed Section'}
                                        </span>
                                        <ChevronUp
                                          className={`transform transition-transform ${expandedSections[sectionId] ? '' : 'rotate-180'
                                            }`}
                                        />
                                      </button>

                                      {expandedSections[sectionId] && (
                                        <div className="mt-4 space-y-3">
                                          {Array.isArray(sectionData.questions) && sectionData.questions.length > 0 ? (
                                            sectionData.questions.map((question, idx) => (
                                              <div
                                                key={question._id || idx}
                                                className="border rounded-md shadow-sm overflow-hidden"
                                              >
                                                <div
                                                  onClick={() =>
                                                    setExpandedQuestions(prev => ({
                                                      ...prev,
                                                      [question._id]: !prev[question._id]
                                                    }))
                                                  }
                                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-600">
                                                      {idx + 1}.
                                                    </span>
                                                    <p className="text-sm text-gray-700">
                                                      {question.snapshot?.questionText || 'No question text'}
                                                    </p>
                                                  </div>
                                                  <ChevronDown
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions[question._id]
                                                      ? 'transform rotate-180'
                                                      : ''
                                                      }`}
                                                  />
                                                </div>

                                                {expandedQuestions[question._id] && (
                                                  <div className="px-4 py-3">
                                                    <div className="flex justify-between mb-2">
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                          Type:
                                                        </span>
                                                        <span className="text-sm text-gray-700">
                                                          {question.snapshot?.questionType || 'Not specified'}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                          Score:
                                                        </span>
                                                        <span className="text-sm text-gray-700">
                                                          {question.snapshot?.score || '0'}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    {/* Display question options if MCQ */}
                                                    {question.snapshot?.questionType === 'MCQ' && (
                                                      <div className="mt-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                          Options:
                                                        </span>
                                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                                          {question.snapshot?.options?.map((option, optIdx) => (
                                                            <div
                                                              key={optIdx}
                                                              //  className="text-sm text-gray-700 px-3 py-1.5 bg-white rounded border"
                                                              className={`text-sm p-2 rounded border ${option === question.snapshot.correctAnswer
                                                                ? 'bg-green-50 border-green-200 text-green-800'
                                                                : 'bg-gray-50 border-gray-200'
                                                                }`}
                                                            >
                                                              {option}
                                                              {option === question.snapshot.correctAnswer && (
                                                                <span className="ml-2 text-green-600">✓</span>
                                                              )}
                                                            </div>
                                                          ))}
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
                                                          {question.snapshot?.difficultyLevel || 'Not specified'}
                                                        </span>
                                                      </div>
                                                      <div>
                                                        <span className="text-xs font-medium text-gray-500">
                                                          Skills:
                                                        </span>
                                                        <span className="text-xs text-gray-700 ml-1">
                                                          {question.snapshot?.skill?.join(', ') || 'None'}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-center py-4 text-gray-500">
                                              No questions found in this section
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  No sections available for this assessment
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}


                    </div>
                  )}



                  {formData.roundTitle === "Technical" && (
                    <>

                      {/* Select Interviewers */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">Interviewers</label>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              onClick={() => {
                                setInternalInterviews(true);
                                clearError('interviewerType');
                              }}
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
                              // onClick={handleExternalInterviewerSelect}
                              onClick={() => {
                                handleExternalInterviewerSelect();
                                clearError('interviewerType');
                              }}
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
                        <div className=" p-4 bg-gray-50 rounded-md border border-gray-200">
                          {!formData.selectedInterviewType ? (
                            <p className="text-sm text-gray-500 text-center">No interviewers selected</p>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between ">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {isInternalSelected
                                      ? `${formData.internalInterviewers.length} interviewer${formData.internalInterviewers.length !== 1 ? "s" : ""}`
                                      : "Outsourced interviewers"} selected
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
                              {isInternalSelected && (
                                <div className="mb-1">
                                  <h4 className="text-xs font-medium text-gray-500 mb-2">Internal Interviewers</h4>
                                  <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                                    {formData.internalInterviewers.map((interviewer, index) => (
                                      <div key={`${interviewer._id} - ${index}`} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2">
                                        <div className="flex items-center">
                                          <span className="ml-2 text-sm text-blue-800 truncate">{interviewer?.name || 'Unnamed Interviewer'}</span>
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
                                  <h4 className="text-xs font-medium text-gray-500 mb-1">Outsourced Interviewers</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* {externalInterviewers.map((interviewer) => ( */}
                                    <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2">
                                      <div className="flex items-center">
                                        <span className="ml-2 text-sm text-orange-800 truncate">{formData.externalInterviewers} (Outsourced)</span>
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
                          <p className="mt-1 text-xs text-red-500">{errors.interviewerType}</p>
                        )}


                      </div>

                      {/* questions */}
                      <div className="mt-4">
                        <div className="py-3 mx-auto rounded-md">
                          {/* Header with Title and Add Button */}
                          <div className="flex items-center justify-end mb-2">
                            <button
                              className="text-custom-blue font-semibold hover:underline"
                              onClick={() => {
                                handlePopupToggle();
                                clearError('questions');
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
                                {formData.interviewQuestionsList.map((question, qIndex) => {
                                  const isMandatory = question?.mandatory === "true";
                                  const questionText = question?.snapshot?.questionText || 'No Question Text Available';
                                  return (
                                    <li
                                      key={qIndex}
                                      className={`flex justify-between items-center p-3 border rounded-md ${isMandatory ? "border-red-500" : "border-gray-300"
                                        }`}
                                    >
                                      <span className="text-gray-900 font-medium">
                                        {qIndex + 1}. {questionText}
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
                          {errors.questions && (
                            <p className="mt-1 text-xs text-red-500">{errors.questions}</p>
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
                  {/* <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                      Instructions
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      rows={3}
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Add Instructions after the interview round is completed
                    </p>
                  </div> */}

                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                    <textarea
                      value={formData.instructions}
                      id="instructions"
                      name="instructions"
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, instructions: e.target.value }));
                        clearError('instructions');
                      }}
                      
                      className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm h-64
                          ${errors.instructions ? "border-red-500 focus:ring-red-500 " : "border-gray-300"}    
                        `}
                      placeholder="Enter round instructions..."
                      rows="10"
                      minLength={250}
                      maxLength={1000}
                      readOnly={formData.roundTitle === 'Assessment'}
                    />

                    <div className="flex justify-between items-center mt-1">
                      {errors.instructions && (
                        <p className="mt-1 text-xs text-red-500">{errors.instructions}</p>
                      )}
                      <span>
                        <span className="text-sm text-gray-500">
                          {formData.instructions.length < 250 && `Minimum ${250 - formData.instructions.length} more characters needed`}
                        </span>
                        <span className="text-sm text-gray-500"> {formData.instructions?.length || 0}/1000</span>
                      </span>
                    </div>


                  </div>




                  {/* footer */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/position/view-details/${contextId}`)}
                      className="mr-3 inline-flex justify-center py-2 px-4 border border-custom-blue shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 "
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2  disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : isEditing ? 'Update Round' : 'Add Round'}
                    </button>
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
        />
      )}
    </div>
  );
}

export default RoundFormPosition;