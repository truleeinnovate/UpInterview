import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import { Button } from '../Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button';
import InterviewerSelectionModal from './InterviewerSelectionModal';
import Breadcrumb from '../Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb';
import { ChevronDown, User, X, Users, Trash2, ChevronUp, Search, } from 'lucide-react';
import { useCustomContext } from "../../Context/Contextfetch";
import InternalInterviews from '../Dashboard-Part/Tabs/Interview-New/pages/Internal-Or-Outsource/InternalInterviewers';
import { ReactComponent as MdOutlineCancel } from "../../icons/MdOutlineCancel.svg";
import SuggesstedQuestions from '../Dashboard-Part/Tabs/QuestionBank-Tab/SuggesstedQuestionsMain.jsx'
import MyQuestionListMain from "../Dashboard-Part/Tabs/QuestionBank-Tab/MyQuestionsList.jsx";
import Cookies from "js-cookie";
import { useInterviewerDetails } from '../../utils/CommonFunctionRoundTemplates.js';
import { decodeJwt } from '../../utils/AuthCookieManager/jwtDecode.js';
import { config } from '../../config.js';
import QuestionBank from '../Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx';

function RoundForm() {
  const {
    assessmentData,
    loading,
    sectionQuestions,
    questionsLoading,
    questionsError,
    fetchQuestionsForAssessment,
    setSectionQuestions,
    templates
  } = useCustomContext();
  const { resolveInterviewerDetails } = useInterviewerDetails();

  const { id } = useParams();
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roundId = searchParams.get('roundId');
  const interviewType = searchParams.get('type');
  const [isInternalInterviews, setInternalInterviews] = useState(false);
  const [template, setTemplate] = useState(null);

  const [users, setUsers] = useState([]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    roundTitle: '',
    interviewMode: '',
    sequence: 1,
    duration: 30,
    interviewerType: '',
    externalInterviewers: '',
    selectedInterviewersType: 'Individual',
    instructions: '',
    // minimumInterviewers: '1',
    internalInterviewers: [],
    assessmentTemplate: { assessmentId: '', assessmentName: '' },
    interviewQuestionsList: [],
  });

  const [activeTab, setActiveTab] = useState("SuggesstedQuestions");
  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] = useState(false);

  const handleSuggestedTabClick = () => setActiveTab("SuggesstedQuestions");
  const handleFavoriteTabClick = () => setActiveTab("MyQuestionsList");

  const [errors, setErrors] = useState({});
  const selectedInterviewers = formData.interviewerType === "Internal"
    ? formData.interviewerType
    : (formData.interviewerType === "External" ? formData.externalInterviewers : []);
  const isInternalSelected = formData.interviewerType === "Internal";
  const isExternalSelected = formData.interviewerType === "External";
  const selectedInterviewersData = isInternalSelected && Array.isArray(selectedInterviewers)
    ? selectedInterviewers.map(interviewer => interviewer?._id).filter(Boolean)
    : [];

  // const [sectionQuestions, setSectionQuestions] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const userId = tokenPayload?.userId;
  // const userName = tokenPayload?.userName;
  const tenantId = tokenPayload?.tenantId;

  // const tenantId = Cookies.get("organizationId");
  // const ownerId = Cookies.get("userId");


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // const resolveInterviewerDetails = (interviewerIds) => {
  //   if (!interviewerIds || !Array.isArray(interviewerIds)) return [];

  //   return interviewerIds.map(id => {
  //     // Check teamsData first (individual interviewers)
  //     const teamMember = teamsData.find(t => t?.contactId?._id === id);
  //     if (teamMember) {
  //       return {
  //         _id: teamMember.contactId._id,
  //         name: teamMember.contactId.name || 'Unknown Interviewer',
  //         email: teamMember.contactId.email || '',
  //         type: 'individual'
  //       };
  //     }

  //     // Check groups (interviewer groups)
  //     const group = groups.find(g => g._id === id);
  //     if (group) {
  //       return {
  //         _id: group._id,
  //         name: group.name || 'Unnamed Group',
  //         type: 'group',
  //         numberOfUsers: group.numberOfUsers || 0
  //       };
  //     }

  //     // Fallback for unknown IDs
  //     return {
  //       _id: id,
  //       name: 'Unknown Interviewer',
  //       type: 'unknown'
  //     };
  //   });
  // };


  // Fetch template and round data


  useEffect(() => {
    const fetchData = async () => {
      try {

        // templates
        const response = templates.find(
          (template) => template._id === id
        );
        // const response = await axios.get(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`,
        //   {
        //     params: {
        //       tenantId: tenantId
        //     }
        //   }
        // );

        // console.log("template response", response);

        if (response && response) {


          const rounds_res = response

          setTemplate(response);
          // console.log("rounds", rounds_res);

          if (roundId) {
            const round = rounds_res.rounds.find(r => r._id === roundId);
            // console.log("round round", round);

            if (round) {

              // Then resolve interviewer details
              // const internalInterviewers = resolveInterviewerDetails(round.interviewers || []);
              const internalInterviewers = resolveInterviewerDetails(round?.internalInterviewers || []);

              // console.log("internal Interviewers", internalInterviewers);


              setFormData({
                roundTitle: round.roundTitle || '',
                sequence: round.sequence || 1,
                interviewMode: round.interviewMode || '',
                duration: round.interviewDuration?.toString() || '',
                interviewerType: round.interviewerType || '',
                selectedInterviewersType: round.selectedInterviewersType || 'Individual',
                instructions: round.instructions || '',
                // minimumInterviewers: round.minimumInterviewers?.toString() || '1',
                questions: round.questions || [],
                internalInterviewers: internalInterviewers || [],
                assessmentTemplate: round?.roundTitle === "Assessment" && round?.assessmentId
                  ? {
                    assessmentId: round.assessmentId,
                    assessmentName: assessmentData?.find(a => a._id === round?.assessmentId)?.AssessmentTitle || ''
                  }
                  : {},


                interviewQuestionsList: round?.questions || [],
                externalInterviewers: 'Outsourced will be selected at interview schdedule time.',
              });
              await fetchQuestionsForAssessment(round?.assessmentId)
            }
          } else {

            const maxSequence = rounds_res.rounds?.length > 0
              ? Math.max(...rounds_res.rounds.map(r => r.sequence))
              : 0;
            // setSequence(maxSequence + 1);
            setFormData(prev => ({ ...prev, sequence: maxSequence + 1 }));
          }

        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id, roundId]);

  // console.log("template response", template);


  // const fetchQuestionsForAssessment = async (assessmentId) => {

  //   if (!assessmentId) {
  //     return null;
  //   }
  //   try {
  //     const response = await axios.get(`${config.REACT_APP_API_URL}/assessments/${assessmentId}`);
  //     const assessmentQuestions = response.data;

  //     // console.log('Full assessment questions structure:', assessmentQuestions);

  //     // Extract sections directly from the response
  //     const sections = assessmentQuestions.sections || [];

  //     // Check for empty sections or questions
  //     if (sections.length === 0 || sections.every(section => !section.questions || section.questions.length === 0)) {
  //       console.warn('No sections or questions found for assessment:', assessmentId);
  //       setSectionQuestions({ noQuestions: true });
  //       return;
  //     }

  //     // Create section questions mapping with all section data
  //     const newSectionQuestions = {};

  //     sections.forEach((section) => {
  //       if (!section._id) {
  //         console.warn('Section missing _id:', section);
  //         return;
  //       }

  //       // Store complete section data including sectionName, passScore, totalScore
  //       newSectionQuestions[section._id] = {
  //         sectionName: section?.sectionName,
  //         passScore: Number(section.passScore || 0),
  //         totalScore: Number(section.totalScore || 0),
  //         questions: (section.questions || []).map(q => ({
  //           _id: q._id,
  //           questionId: q.questionId,
  //           source: q.source || 'system',
  //           score: Number(q.score || q.snapshot?.score || 0),
  //           order: q.order || 0,
  //           customizations: q.customizations || null,
  //           snapshot: {
  //             questionText: q.snapshot?.questionText || '',
  //             questionType: q.snapshot?.questionType || '',
  //             score: Number(q.snapshot?.score || q.score || 0),
  //             options: Array.isArray(q.snapshot?.options) ? q.snapshot.options : [],
  //             correctAnswer: q.snapshot?.correctAnswer || '',
  //             difficultyLevel: q.snapshot?.difficultyLevel || '',
  //             hints: Array.isArray(q.snapshot?.hints) ? q.snapshot.hints : [],
  //             skill: Array.isArray(q.snapshot?.skill) ? q.snapshot.skill : [],
  //             tags: Array.isArray(q.snapshot?.tags) ? q.snapshot.tags : [],
  //             technology: Array.isArray(q.snapshot?.technology) ? q.snapshot.technology : [],
  //             questionNo: q.snapshot?.questionNo || ''
  //           }
  //         }))
  //       };
  //     });

  //     // Verify that at least one section has questions
  //     const hasQuestions = Object.values(newSectionQuestions).some(section => section.questions.length > 0);
  //     if (!hasQuestions) {
  //       console.warn('No sections with questions found for assessment:', assessmentId);
  //       setSectionQuestions({ noQuestions: true });
  //       return;
  //     }

  //     // Set the section questions state
  //     setSectionQuestions(newSectionQuestions);
  //     console.log('Updated sectionQuestions:', newSectionQuestions);
  //   } catch (error) {
  //     console.error('Error fetching questions:', error);
  //     setSectionQuestions({ error: 'Failed to load questions' });
  //   }
  // };


  const handleInternalInterviewerSelect = (interviewers) => {
    // console.log("Interviewers passed to parent:", interviewers); // Debugging

    if (formData.interviewerType === "External") {
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
      interviewerType: "Internal",
      internalInterviewers: [...prev.internalInterviewers, ...uniqueInterviewers],
    }));

    setErrors(prev => ({
      ...prev,
      interviewers: undefined,
      interviewerType: undefined
    }));

  };

  const handleRemoveInternalInterviewer = (interviewerId) => {
    setFormData(prev => ({
      ...prev,
      internalInterviewers: prev.internalInterviewers.filter(
        interviewer => interviewer._id !== interviewerId
      ),

      interviewerType: prev.internalInterviewers.length === 1 ? '' : prev.interviewerType
    }));

  };

  // console.log("internalInterviewers", formData.internalInterviewers);


  const handleClearAllInterviewers = () => {
    setFormData(prev => ({
      ...prev,
      internalInterviewers: [],
      // selectedInterviewerIds: [],
      externalInterviewers: '',
      interviewerType: ''
    }));

  };

  // question list functionality  
  const handleRemoveQuestion = (questionId,) => {

    // console.log("questionId", questionId);


    setFormData(prev => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.filter((question) => question.questionId !== questionId)
    }));
  };

  // Change by Shashank on [02/06/2025]: Added handleToggleMandatory to update mandatory status of a question
  const handleToggleMandatory = (questionId, mandatory) => {
    setFormData(prev => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.map((question) =>
        question.questionId === questionId
          ? { ...question, mandatory: mandatory ? "true" : "false" }
          : question
      )
    }));
  };


  const handleAddQuestionToRound = (question) => {
    // console.log("question _id:", question);
    if (question && question.questionId && question.snapshot) {

      // console.log("question _id:", question.questionId);
      setFormData(prev => ({
        ...prev,
        interviewQuestionsList: prev.interviewQuestionsList.some(q => q.questionId === question.questionId)
          ? prev.interviewQuestionsList
          : [...prev.interviewQuestionsList, question]
      }));

      console.log("question", question);


      setErrors(prev => ({
        ...prev,
        questions: undefined
      }));

    }
  }




  const updateQuestionsInAddedSectionFromQuestionBank = (questions) => {
    questions.forEach((question) => handleAddQuestionToRound(question));
  };



  const handleExternalInterviewerSelect = () => {

    if (formData.interviewerType === "Internal") {
      alert("You need to clear internal interviewers before selecting outsourced interviewers.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      interviewerType: "External",
      externalInterviewers: "Outsourced will be selected at interview schdedule time."
    }));

    setErrors(prev => ({
      ...prev,
      interviewers: undefined,
      interviewerType: undefined
    }));

  };


  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/api/users`);
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error('Invalid users data format:', response.data);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);




  const toggleSection = async (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
      await fetchQuestionsForAssessment(formData.assessmentTemplate?.assessmentId);
    }
  };


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'interviewType' && value === 'assessment' ? {
        interviewMode: 'virtual',
        assessmentTemplate: { assessmentId: '', assessmentName: '' }
      } : {})
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

  };

  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;


    // Reset all relevant fields when the title changes
    setFormData(prev => ({
      ...prev,
      roundTitle: selectedTitle,
      interviewMode: selectedTitle === "Assessment" ? "Virtual" : "",
      duration: 30,
      interviewerType: "",
      externalInterviewers: "",
      instructions: "",
      internalInterviewers: [],
      interviewQuestionsList: [],
      assessmentTemplate: { assessmentId: '', assessmentName: '' }
    }));

    // Reset section questions and expanded sections
    setSectionQuestions({});
    setExpandedSections({});
    setExpandedQuestions({});
    setErrors({});
    setShowDropdown(false);
  };


  const handleAssessmentSelect = (assessment) => {

    const assessmentData = {
      assessmentId: assessment._id,
      assessmentName: assessment.AssessmentTitle
    };

    // Update assessment template name
    handleInputChange('assessmentTemplate', assessmentData);

    // Extract duration (remove " minutes" from the string)
    const durationValue = assessment.Duration.replace(' minutes', '');
    handleInputChange('interviewDuration', durationValue);

    // Update instructions
    handleInputChange('instructions', assessment.Instructions);

    // Reset sections state
    setExpandedSections({});
    setSectionQuestions({});


    // Fetch questions for all sections
    fetchQuestionsForAssessment(assessment._id);
    // fetchAssessmentData(assessment._id)
    setShowDropdown(false);

    if (errors.assessmentTemplate) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.assessmentTemplate;
        return newErrors;
      });
    }

  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Round title validation
    if (!formData.roundTitle?.trim()) {
      newErrors.roundTitle = 'Round name is required';
    }

    // Interview mode validation
    if (!formData.interviewMode) {
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

      // Check if any sections are not expanded
      const selectedAssessment = assessmentData.find(a => a._id === formData.assessmentTemplate?.assessmentId);
      const allSectionIds = selectedAssessment?.Sections?.map(section => section._id) || [];
      const expandedSectionIds = Object.keys(expandedSections).filter(id => expandedSections[id]);
      const unexpandedSections = allSectionIds.filter(id => !expandedSectionIds.includes(id));

      if (unexpandedSections.length > 0) {
        newErrors.assessmentQuestions = 'Please expand all sections to view and select questions';
      }

      if (!sectionQuestions.noSections) {
        const missingSections = expandedSectionIds.filter(sectionId => {
          return sectionQuestions.error || !sectionQuestions[sectionId];
        });

        if (missingSections.length > 0) {
          newErrors.assessmentQuestions = 'Please wait for all expanded sections to load their questions before submitting';
        }
      }
    }

    // Technical round validations
    if (formData.roundTitle === 'Technical') {
      // if (!formData.interviewDuration) {
      //   newErrors.interviewDuration = 'Duration is required';
      // }

      if (!formData.duration || formData.duration === '') {
        newErrors.duration = 'Duration is required';
      }

      if (!formData.instructions?.trim()) {
        newErrors.instructions = 'Instructions are required';
      } else if (formData.instructions.length < 250) {
        newErrors.instructions = 'Instructions must be at least 250 characters';
      } else if (formData.instructions.length > 1000) {
        newErrors.instructions = 'Instructions cannot exceed 1000 characters';
      }

      if (!formData.interviewerType) {
        newErrors.interviewerType = 'Interviewer type is required';
      }

      if (formData.interviewerType === 'Internal' && formData.internalInterviewers.length === 0) {
        newErrors.interviewers = 'At least one interviewer is required';
      }

      if (formData.interviewQuestionsList.length === 0) {
        newErrors.questions = 'At least one question is required';
      }
    }

    setErrors(newErrors);
    return newErrors;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation first
    const errors = validateForm();

    console.log("errors", errors);

    // console.log('Form Data on Submit:', formData);

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return; // Stop submission if there are errors
    }

    try {
      // Prepare round data based on interview type
      const roundData = {};

      roundData.tenantId = tenantId;

      if (formData.roundTitle === 'Assessment') {

        roundData.roundTitle = formData.roundTitle;
        roundData.instructions = formData.instructions || '';
        roundData.interviewerType = "";
        roundData.selectedInterviewersType = '';
        roundData.assessmentId = formData.assessmentTemplate?.assessmentId;
        roundData.interviewMode = formData.interviewMode || '';
        roundData.interviewDuration = 60;
      }
      else if (formData.roundTitle === 'Technical') {
        roundData.roundTitle = formData.roundTitle;
        roundData.interviewDuration = formData.duration;
        roundData.sequence = formData.sequence;
        // roundData.interviewerType = formData.interviewerType;
        roundData.instructions = formData.instructions || '';
        roundData.interviewMode = formData.interviewMode || '';
        roundData.interviewerType = formData.interviewerType || '';
        roundData.selectedInterviewersType = formData.selectedInterviewersType || 'Individual';
        // roundData.selectedInterviewerIds = formData.selectedInterviewerIds.map(id => 
        //   id.interviewerId);

        // roundData.selectedInterviewers = formData.selectedInterviewers || [];

        // Ensure interviewers array is properly populated
        if (formData.internalInterviewers && formData.internalInterviewers.length > 0) {
          roundData.internalInterviewers = formData.internalInterviewers.map(interviewer =>
            interviewer._id
            // name: interviewer.name
          );
        } else {
          roundData.interviewers = [];
        }

        // roundData.selectedInterviewerIds = formData.selectedInterviewerIds;
        // roundData.interviewerGroupId = formData.interviewerGroupId || null;
        // roundData.minimumInterviewers = formData.selectedInterviewerIds.length|| '1';
        // roundData.questions = formData.questions || [];
        roundData.questions = formData.interviewQuestionsList || [];

      } else {
        // Default case for other interview types (hr, culture-fit, system-design)
        roundData.roundTitle = formData.roundTitle;
        roundData.sequence = formData.sequence;

        roundData.interviewerType = formData.interviewerType;
        roundData.instructions = formData.instructions || '';
        roundData.interviewMode = formData.interviewMode || '';
        roundData.interviewerType = formData.interviewerType || '';
        roundData.interviewDuration = formData.duration;
        roundData.selectedInterviewersType = formData.selectedInterviewersType || 'Individual';
        if (formData.internalInterviewers && formData.internalInterviewers.length > 0) {
          roundData.internalInterviewers = formData.internalInterviewers.map(interviewer =>
            interviewer._id
            // name: interviewer.name
          );
        } else {
          roundData.interviewers = [];
        }

      }
      console.log("roundData", roundData);
      console.log(" id", roundId);


      if (roundId) {
        // Update existing round
        const updatedRounds = template.rounds.map(round =>
          round._id === roundId ? { ...round, ...roundData } : round
        );

        await axios.patch(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`, {
          tenantId,
          rounds: updatedRounds,

        });
      } else {
        // Add new round
        const updatedRounds = [...(template.rounds || []), roundData];

        await axios.patch(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`, {
          tenantId,
          rounds: updatedRounds,

        });
      }

      navigate(`/interview-templates/${id}`);
    } catch (error) {
      console.log(error);

      // console.error('Error saving round:', error);
      alert('Failed to save round. Please try again.');
    }
  };

  const breadcrumbItems = [
    {
      label: 'Interview Templates',
      path: '/interview-templates'
    },
    {
      label: template?.templateName,
      path: `/interview-templates/${id}`,
      status: template?.status
    },

    {
      label: roundId ? 'Edit Round' : 'Add New Round',
      path: null
    }
  ];


  const handlePopupToggle = (index) => {
    setIsInterviewQuestionPopup(!isInterviewQuestionPopup);
  };


  // console.log("slection questions", sectionQuestions);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 md:px-8 xl:px-8 2xl:px-8">
        {/* <div className="mb-2">
          <button
            onClick={() => navigate(`/interview-templates/${id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronUp className="h-5 w-5 mr-2 rotate-90" />
            Back to Template
          </button>
        </div> */}

        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white rounded-lg shadow mt-4">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{roundId ? 'Edit Round' : 'Add New Round'}</h2>

            {/* Basic Round Info */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6 mb-6">
              <div>
                <label htmlFor="roundTitle" className="block text-sm font-medium text-gray-700">Round Name <span className="text-red-500">*</span></label>

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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm"
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
                  <p className="text-red-500 text-sm mt-1">{errors.roundTitle}</p>
                )}
              </div>

              <div>
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                  Interview Mode <span className='text-red-400'>*</span>
                </label>
                <select
                  id="interviewMode"
                  name="interviewMode"
                  value={formData.interviewMode}
                  onChange={(e) => setFormData(prev => ({ ...prev, interviewMode: e.target.value }))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none  sm:text-sm rounded-md"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>

              }

              {formData.roundTitle === "Assessment" && (
                <>
                  <div>
                    <label htmlFor="assessmentTemplate" className="block text-sm font-medium text-gray-700">Assessment Template </label>
                    <div className="relative flex-1 " ref={dropdownRef}>
                      <input
                        type="text"
                        name="assessmentTemplate"
                        id="assessmentTemplate"
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none  sm:text-sm`}
                        placeholder="Enter assessment template name"
                        value={formData.assessmentTemplate?.assessmentName || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          assessmentTemplate: { ...prev.assessmentTemplate, assessmentName: e.target.value }
                        }))}
                        onClick={() => setShowDropdown(!showDropdown)}
                        readOnly

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
                              assessmentData.map((assessment, index) => (
                                <div
                                  key={index}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleAssessmentSelect(assessment)}
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
                    </div>
                    {errors.assessmentTemplate && (
                      <p className="text-red-500 text-sm mt-1">{errors.assessmentTemplate}</p>
                    )}
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
                    {errors.assessmentQuestions && <p className="text-red-500">{errors.assessmentQuestions}</p>}
                    {questionsLoading ? (
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

            {/* Technical Round Specific Fields */}
            {formData.roundTitle === 'Technical' && (
              <div className="space-y-4">


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


                <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                  {!formData.interviewerType ? (
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
                            {formData.internalInterviewers.map((interviewer, index) => (
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
                  <p className="text-red-500 text-sm">{errors.interviewerType}</p>
                )}






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
                          {(formData.interviewQuestionsList ?? []).map((question, qIndex) => {
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
                                <button onClick={() => handleRemoveQuestion(question.questionId)}>
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
                                className="text-2xl fill-white"
                                onClick={() => handlePopupToggle()}
                              />
                            </button>
                          </div>
                          {/* <div className="z-10 top-28 sm:top-32 md:top-36 left-0 right-0">
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
                          </div> */}
                          {isInterviewQuestionPopup &&
                            <QuestionBank
                              // assessmentId={formData.assessmentTemplate?.assessmentId || ''}
                              // sectionName=""
                              // updateQuestionsInAddedSectionFromQuestionBank={updateQuestionsInAddedSectionFromQuestionBank}
                              section="interviewerSection"
                              // closeQuestionBank={handlePopupToggle}
                              // questionBankPopupVisibility={isInterviewQuestionPopup}
                              // setQuestionBankPopupVisibility={setIsInterviewQuestionPopup}
                              // addedSections={[]}
                              // questionsLimit={0}
                              // checkedCount={formData.interviewQuestionsList.length}
                              // interviewQuestionsList={formData.interviewQuestionsList}
                              // setInterviewQuestionsList={(questions) =>
                              //   setFormData((prev) => ({ ...prev, interviewQuestionsList: questions }))
                              // }
                              fromScheduleLater={true}
                              interviewQuestionsList={formData.interviewQuestionsList}
                              onAddQuestion={handleAddQuestionToRound}
                              // setInterviewQuestionsList={(question) =>
                              //   setFormData((prev) => ({
                              //     ...prev,
                              //     interviewQuestionsList: prev.interviewQuestionsList.some(q => q.questionId === question.questionId)
                              //       ? prev.interviewQuestionsList
                              //       : [...prev.interviewQuestionsList, question]
                              //   }))
                              // }

                              handleRemoveQuestion={handleRemoveQuestion}
                              handleToggleMandatory={handleToggleMandatory}

                            />

                          }



                        </div>
                      </div>
                    )}
                  </div>
                  {errors.questions && (
                    <p className="text-red-500 text-sm">{errors.questions}</p>
                  )}

                </div>



              </div>
            )}



            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions <span className='text-red-400'>*</span> </label>
              <textarea
                value={formData.instructions}
                id="instructions"
                name="instructions"
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3   sm:text-sm h-64
                  ${errors.instructions ? "border-red-400" : ""}
                  `}
                placeholder="Enter round instructions..."
                rows="10"
                minLength={250}
                maxLength={1000}
                readOnly={formData.roundTitle === 'Assessment'}
              />
              {errors.instructions && (
                <p className="text-red-500 text-sm">{errors.instructions}</p>
              )}
              <div className="flex justify-end items-center mt-1">
                <span className="text-sm text-gray-500">
                  {formData.instructions.length < 250 && `Minimum ${250 - formData.instructions.length} more characters needed`}
                </span>
                <span className="text-sm text-gray-500">{formData.instructions?.length || 0}/1000</span>
              </div>
            </div>


          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 p-6 bg-gray-50 rounded-b-lg">
            <Button
              variant="outline"
              onClick={() => navigate(`/interview-templates/${id}`)}
            >
              Cancel
            </Button>
            <button onClick={handleSubmit}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2  disabled:opacity-50"
            >
              {roundId ? 'Update Round' : 'Save Round'}
            </button>
          </div>
          {errors.submit && (
            <p className="text-red-500 text-sm mt-4 text-center">{errors.submit}</p>
          )}
        </div>
      </div>

      {/* Interviewer Selection Modal */}
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