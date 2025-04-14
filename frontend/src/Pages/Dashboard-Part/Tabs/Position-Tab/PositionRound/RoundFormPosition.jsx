import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../CommonCode-AllTabs/ui/button.jsx';
import StatusBadge from '../../CommonCode-AllTabs/StatusBadge.jsx';
import Breadcrumb from '../../CommonCode-AllTabs/Breadcrumb.jsx';

import { ChevronDown, X, User, Users, Trash2,  } from 'lucide-react';
// import { Button } from '../../CommonCode-AllTabs/ui/button.jsx';
import axios from "axios";
// import OutsourceOption from "../../Interviews/OutsourceOption.jsx";
// import OutsourceOption from "./Internal-Or-Outsource/OutsourceInterviewer.jsx";
import { ReactComponent as MdOutlineCancel } from "../../../../../icons/MdOutlineCancel.svg";
import MyQuestionListMain from "../../QuestionBank-Tab/MyQuestionsList.jsx";
import Cookies from "js-cookie";
import { FaChevronUp, FaSearch } from 'react-icons/fa';
import { useCustomContext } from '../../../../../Context/Contextfetch.js';
import SuggesstedQuestions from '../../QuestionBank-Tab/SuggesstedQuestionsMain.jsx'
import InternalInterviews from '../../Interview-New/pages/Internal-Or-Outsource/InternalInterviewers.jsx';


function RoundFormPosition() {
  const {
    assessmentData,
    positions,
    groups,
    loading
  } = useCustomContext();
  const { roundId,id } = useParams();

  const positionId = id; 

  const userId = Cookies.get("userId");
const tenantId = Cookies.get("organizationId");

// const orgId = Cookies.get("organizationId");

console.log("tenantId tenantId", tenantId);

  
  // Determine context (interview or position) based on params
  const isPositionContext = !!positionId;
  const contextId = isPositionContext && positionId  ;
  const entityData = isPositionContext
    && positions?.find(pos => pos._id === positionId)
    
  const [assessmentTemplate, setAssessmentTemplate] = useState({ assessmentId: '', assessmentName: '' });
  const [position, setPosition] = useState(null);
  const [rounds, setRounds] = useState([]);

  const [isInternalInterviews, setInternalInterviews] = useState(false);




  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assessmentTemplate: { assessmentId: '', assessmentName: '' },
    roundTitle: '',
    customRoundTitle: '',
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

  // console.log("interviewQuestionsList", interviewQuestionsList);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);


  const [sectionQuestions, setSectionQuestions] = useState({});
  // console.log("sectionQuestions", sectionQuestions);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [errors, setErrors] = useState({ roundTitle: '', interviewMode: '' });

  // Load entity data based on context
useEffect(() => {
  if (entityData) {
    setPosition(isPositionContext ? entityData : entityData.positionId || null);
    setRounds(entityData.rounds || []);
   
  }
  else {
    setRounds([]); // Default to empty array if entityData is not available
  }
}, [entityData, isPositionContext]);



  const handleAddQuestionToRound = async (question) => {
    // console.log("question _id:", question);
    if (question && question.questionId &&  question.snapshot) {      
     
      // console.log("question _id:", question.questionId);
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
      interviewMode: selectedTitle === "Assessment" ? "Virtual" : selectedTitle === "Other" ? "" : prev.interviewMode
    }));

 
  };


  const handleSuggestedTabClick = () => setActiveTab("SuggesstedQuestions");
  const handleFavoriteTabClick = () => setActiveTab("MyQuestionsList");

    // while editing
    const isEditing = !!roundId && roundId !== 'new';
    const roundEditData = isEditing && rounds?.find(r => r._id === roundId);

    console.log("roundEditData roundEditData ", roundEditData );


    const fetchSectionsAndQuestions = async (assessmentId) => {
      try {
        // Fetch the assessment data once
        const response  = assessmentData.find(pos => pos._id === assessmentId);
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

      // console.log("roundEditData", roundEditData);
      

      setFormData({
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
        // status: roundEditData.status || 'Pending',
        instructions: roundEditData.instructions || '',
        sequence: roundEditData.sequence || 1,
        // isInstantInterview: false,
        interviewQuestionsList: roundEditData.questions || [],
        selectedInterviewType: roundEditData.interviewerType || null,
        internalInterviewers: roundEditData.interviewerType === "internal" && Array.isArray(roundEditData.interviewers)
          ? roundEditData.interviewers.map(interviewer => ({
              _id: interviewer._id || '',
              name: interviewer.name || 'Unknown',
              email: interviewer.email || ''
            }))
          : [],
        externalInterviewers: roundEditData.interviewerType === "external" 
          ? "Outsourced will be selected at interview schdedule time." 
          : '',
        interviewType: roundEditData.interviewType || 'instant',
        scheduledDate: '',
        duration: roundEditData.duration || 30
      });
      
      console.log("roundEditData.interviewers", roundEditData.interviewers);

  

    if (roundEditData.roundTitle === "Assessment" && roundEditData.assessmentId) {
      const assessmentDataForTemplate = {
        assessmentId: roundEditData.assessmentId,
        assessmentName: assessmentData.find(a => a._id === roundEditData.assessmentId)?.AssessmentTitle || ''
      };
      setAssessmentTemplate(assessmentDataForTemplate);

      fetchSectionsAndQuestions(roundEditData.assessmentId);
    }
  }
    
    else {
      // For new round, set the sequence to be after the last round
      const maxSequence = rounds?.length > 0
        ? Math.max(...rounds.map(r => r.sequence))
        : 0;
      // setSequence(maxSequence + 1);
      setFormData(prev => ({ ...prev, sequence: maxSequence + 1 }));
    }
  }, [rounds, isEditing, roundEditData, navigate,assessmentData]);



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
      const response  = assessmentData.find(pos => pos._id === assessmentTemplate.assessmentId)
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





  // console.log("internalInterviewers", internalInterviewers);

  const handleInternalInterviewerSelect = (interviewers) => {
    // console.log("Interviewers passed to parent:", interviewers); // Debugging

    if (formData.selectedInterviewType === "external") {
      alert("You need to clear external interviewers before selecting internal interviewers.");
      return;
    }

    const uniqueInterviewers = interviewers.filter(
      newInterviewer => !formData.internalInterviewers.some(i => i._id === newInterviewer._id)
    ).map(interviewer => ({
      _id: interviewer.contactId?._id || interviewer._id || '', // Use contactId._id if available
      name: interviewer.contactId?.name || interviewer.name || 'Unknown', // Use contactId.name if available
      email: interviewer.contactId?.email || interviewer.email || '' // Use contactId.email if available
    }));

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
      internalInterviewers: prev.internalInterviewers.filter(interviewer => interviewer._id !== interviewerId),
      selectedInterviewType: prev.internalInterviewers.length === 1 ? null : prev.selectedInterviewType
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


// const validateForm = () => {
//   const newErrors = {};

//   // Basic validations
//   if (!roundTitle?.trim()) {
//     newErrors.roundTitle = 'Round name is required';
//   }

//   if (!formData.interviewType) {
//     newErrors.interviewType = 'Interview type is required';
//   }
//  // Inside validateForm function in RoundForm.jsx
// if (formData.interviewType === 'assessment') {
// if (!formData.assessmentTemplate[0]?.assessmentName) {
//   newErrors.assessmentTemplate = 'Assessment template is required';
// }

// // Get the selected assessment
// const selectedAssessment = assessmentData.find(a => a._id === formData.assessmentTemplate[0].assessmentId);

// // Get all section IDs from the selected assessment
// const allSectionIds = selectedAssessment?.Sections?.map(section => section._id) || [];

// // Get all expanded section IDs
// const expandedSectionIds = Object.keys(expandedSections).filter(id => expandedSections[id]);

// // Check if any sections are not expanded
// const unexpandedSections = allSectionIds.filter(id => !expandedSectionIds.includes(id));
// if (unexpandedSections.length > 0) {
//   newErrors.assessmentQuestions = 'Please expand all sections to view and select questions';
// }

// // Check if any expanded sections are missing their questions
// const missingSections = expandedSectionIds.filter(sectionId => {
//   // Section is missing if:
//   // 1. It's not in sectionQuestions object, or
//   // 2. Its questions array is empty/undefined, or
//   // 3. It has an error state
//   return !sectionQuestions[sectionId] || 
//          !Array.isArray(sectionQuestions[sectionId]) ||
//          sectionQuestions[sectionId].length === 0 ||
//          sectionQuestions[sectionId] === 'error';
// });

// if (missingSections.length > 0) {
//   newErrors.assessmentQuestions = 'Please wait for all expanded sections to load their questions before submitting';
// }
// }

//   // Technical type validations
//   if (formData.interviewType === 'technical') {
//     if (!formData.interviewMode) {
//       newErrors.interviewMode = 'Interview mode is required';
//     }
  
//     if (!formData.interviewDuration) {
//       newErrors.interviewDuration = 'Duration is required';
//     }
  
//     if (!formData.instructions?.trim()) {
//       newErrors.instructions = 'Instructions are required';
//     } else if (formData.instructions.length < 250) {
//       newErrors.instructions = 'Instructions must be at least 250 characters';
//     } else if (formData.instructions.length > 1000) {
//       newErrors.instructions = 'Instructions cannot exceed 1000 characters';
//     }

//     if (!formData.interviewerType) {
//       newErrors.interviewerType = 'Interviewer type is required';
//     }
//     // if (!formData.questions || formData.questions.length === 0) {
//     //   newErrors.questions = 'At least one question is required';
//     // }
//     if (formData.interviewerType === 'Internal')
//     if (!formData.interviewers || formData.interviewers.length === 0) {
//       newErrors.interviewers = 'At least one interviewer is required';
//     }
//   }

//   setErrors(newErrors);
//   return newErrors;
// };

const validateForm = () => {
  const newErrors = { roundTitle: '', interviewMode: '' };


  if (!formData.roundTitle || formData.roundTitle.trim() === '') {
    newErrors.roundTitle = 'Round Title is required';
  } else if (formData.roundTitle === 'Other' && (!formData.customRoundTitle || formData.customRoundTitle.trim() === '')) {
    newErrors.roundTitle = 'Custom Round Title is required when "Other" is selected';
  }


  const validInterviewModes = ['Face to Face', 'Virtual'];
  if (!formData.interviewMode || formData.interviewMode.trim() === '') {
    newErrors.interviewMode = 'Interview Mode is required';
  } 

  setErrors(newErrors);
  return Object.values(newErrors).every(error => error === '');
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

    // e.preventDefault();
    
    // Run validation first
    // const errors = validateForm();
    // if (Object.keys(errors).length > 0) {
    // setErrors(errors);
    // return; // Stop submission if there are errors
    //  }


    const roundData = {
      roundTitle: formData.roundTitle,
      interviewMode: formData.interviewMode,
      duration: formData.duration,
      interviewType: formData.interviewType,
      interviewerType: formData.selectedInterviewType,
      sequence: formData.sequence,
      interviewers: selectedInterviewersData || [],
      ...(formData.roundTitle === "Assessment" && formData.assessmentTemplate.assessmentId
        ? { assessmentId: formData.assessmentTemplate.assessmentId }
        : {}),
      instructions: formData.instructions,
      // status: formData.status,
      questions: formData.interviewQuestionsList || []
    };

    // console.log("formData formData", formData);
    

    // console.log("roundData roundData" , roundData);
    

    try {
      // if (!name || !type || !mode || selectedInterviewers.length === 0) {
      //   throw new Error('Please fill in all required fields');
      // }

      // Include roundId only if editing
      const payload = isEditing ? { positionId, round: roundData, roundId} : { positionId, round: roundData  }

      // console.log("payload roundData1", payload);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/position/add-rounds`,
        payload
      );
      // console.log("response", response.data);

      if (response.status === 201 || response.status === 200){
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
      instructions: assessment.Instructions
    }));
    setExpandedSections({});
    setSectionQuestions({});
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
              <form>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
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
                          onChange={(e) => setFormData(prev => ({ ...prev, customRoundTitle: e.target.value }))}
                          onBlur={() => {
                            if (!formData.customRoundTitle.trim()) setFormData(prev => ({ ...prev, roundTitle: "" }));
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                          placeholder="Enter custom round title"
                        />
                      ) : (
                        <select
                          id="roundTitle"
                          name="roundTitle"
                          value={formData.roundTitle}
                          onChange={handleRoundTitleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      {errors.roundTitle && <p className="mt-1 text-sm text-red-500">{errors.roundTitle}</p>}
                    </div>

                    <div>
                      <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                        Interview Mode *
                      </label>
                      <select
                        id="interviewMode"
                        name="interviewMode"
                        value={formData.interviewMode}
                        onChange={(e) => setFormData(prev => ({ ...prev, interviewMode: e.target.value }))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        required
                        disabled={formData.roundTitle === "Assessment"}
                      >
                        <option value="">Select Interview Mode</option>
                        <option value="Face to Face">Face to Face</option>
                        <option value="Virtual">Virtual</option>
                      </select>
                      {errors.interviewMode && <p className="mt-1 text-sm text-red-500">{errors.interviewMode}</p>}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                       onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                       className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     >
                       <option value="30">30 min</option>
                       <option value="45">45 min</option>
                       <option value="60">60 min</option>
                       <option value="90">90 min</option>
                       <option value="120">120 min</option>
                     </select>
                   </div>
           
                    }
                    {/* <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status *
                      </label>
                      <div className="mt-1 flex items-center">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          required
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Pending">Pending</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <div className="ml-2">
                          <StatusBadge status={formData.status} size="sm" />
                        </div>
                      </div>
                    </div> */}
                    {formData.roundTitle === "Assessment" && (
                      <>
                        {/* <div>
                          <label htmlFor="Assessment" className="block text-sm font-medium text-gray-700">
                            Assessment Template
                          </label>
                          <select
                            id="assessmentTemplate"
                            name="assessmentTemplate"
                            value={formData.assessmentTemplate.assessmentName}
                            // value={selectAssessmentTemplate ? JSON.stringify(selectAssessmentTemplate) : ""}
                            onChange={(e) => handleInputChange("assessmentTemplate", e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select Assessment Template</option>
                            {assessmentData?.map((assessment) => (
                              <option key={assessment._id} value={JSON.stringify(assessment)}>
                                {assessment.AssessmentTitle}
                              </option>
                            ))}
                          </select>
                        </div> */}

                        <div>
                          <label htmlFor="assessmentTemplate" className="block text-sm font-medium text-gray-700">Assessment Template </label>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              name="assessmentTemplate"
                              id="assessmentTemplate"
                              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                              placeholder="Enter assessment template name"
                              value={formData.assessmentTemplate.assessmentName || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                assessmentTemplate: { ...prev.assessmentTemplate, assessmentName: e.target.value }
                              }))}
                              onClick={() => setShowDropdown(!showDropdown)}

                            />
                            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                              <FaSearch className="text-gray-600 text-lg" />
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
                   
                        </div>

                        {/* //  neeed here  */}
                      </>

                    )}
                  </div>


                  {formData.roundTitle !== "Assessment" && (
                    <>
                      <div className="mb-4">
                        {/* <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        </div> */}
</div>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-2">
                          {/* {interviewType === "scheduled" && (
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
                          )} */}

                         

                        {/* {interviewType === "instant" && (
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
                        )} */}

                        {/* {interviewType === "scheduled" && scheduledDate && (
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
                        )} */}
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
                            onClick={handleExternalInterviewerSelect}
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
                        {!formData.selectedInterviewType ? (
                          <p className="text-sm text-gray-500 text-center">No interviewers selected</p>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
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
                              <div className="mb-3">
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Internal Interviewers</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                                  {formData.internalInterviewers.map((interviewer,index) => (
                                    <div key={`${interviewer._id} - ${index}`} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2">
                                      <div className="flex items-center">
                                        <span className="ml-2 text-sm text-blue-800 truncate">{interviewer.name || 'Unnamed Interviewer'}</span>
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
                                  {/* {externalInterviewers.map((interviewer) => ( */}
                                    <div  className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2">
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




                    {/* assessment questions */}
                        {formData.assessmentTemplate.assessmentName && (
                          <div>
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
                              
                              assessmentData.find(a => a._id === formData.assessmentTemplate.assessmentId)?.Sections.map((section) => (
                                <div key={section._id} id="assessmentQuestions" className="border rounded-md shadow-sm p-4">
                                  <button
                                  type="button"
                                    onClick={() => toggleSection(section._id)}
                                    className="flex justify-between items-center w-full"
                                  >
                                    <span className="font-medium">{section.SectionName}</span>
                                    <FaChevronUp className={`transform transition-transform ${expandedSections[section._id] ? '' : 'rotate-180'}`} />
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




                      
                  {/* instructions */}
                  <div>
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
                  </div>




                  {/* footer */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/position/view-details/${contextId}` )}
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