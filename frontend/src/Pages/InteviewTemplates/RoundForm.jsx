import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button';
import Breadcrumb from '../Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb';
import { ChevronDown, User, X, Users, Trash2, ChevronUp, Search } from 'lucide-react';
import { useCustomContext } from '../../Context/Contextfetch';
import InternalInterviews from '../Dashboard-Part/Tabs/Interview-New/pages/Internal-Or-Outsource/InternalInterviewers';
import { ReactComponent as MdOutlineCancel } from '../../icons/MdOutlineCancel.svg';
import Cookies from 'js-cookie';
import { useInterviewerDetails } from '../../utils/CommonFunctionRoundTemplates.js';
import { decodeJwt } from '../../utils/AuthCookieManager/jwtDecode.js';
import { config } from '../../config.js';
import Loading from '../../Components/Loading.js';
import QuestionBank from '../Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx';
// import OutsourceOption from '../Dashboard-Part/Tabs/Interview-New/pages/Internal-Or-Outsource/OutsourceInterviewer.jsx'; // Assuming this is available

function RoundFormTemplates() {
  const {
    assessmentData,
    loading,
    sectionQuestions,
    questionsLoading,
    fetchQuestionsForAssessment,
    setSectionQuestions,
    templates,
  } = useCustomContext();
  const { resolveInterviewerDetails } = useInterviewerDetails();
  const { id } = useParams();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roundId = searchParams.get('roundId');
  const [isInternalInterviews, setInternalInterviews] = useState(false);
  // const [showOutsourcePopup, setShowOutsourcePopup] = useState(false);
  const [template, setTemplate] = useState(null);

  const [formData, setFormData] = useState({
    roundTitle: '',
    interviewMode: '',
    sequence: 1,
    duration: 30,
    selectedInterviewType: null,
    internalInterviewers: [],
    externalInterviewers: [], // Added for external interviewers
    instructions: '',
    assessmentTemplate: { assessmentId: '', assessmentName: '' },
    interviewQuestionsList: [],
  });

  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const isInternalSelected = formData.selectedInterviewType === "internal";

  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const tenantId = tokenPayload?.tenantId;

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

  useEffect(() => {
    const fetchData = async () => {
      try {

        // templates
        const response = templates.find(
          (template) => template._id === id
        );

        if (response && response) {


          const rounds_res = response

          setTemplate(response);

          if (roundId) {
            const round = rounds_res.rounds.find(r => r._id === roundId);

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


  const handleInternalInterviewerSelect = (interviewers) => {
    if (formData.selectedInterviewType === 'external') {
      alert('You need to clear external interviewers before selecting internal interviewers.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      selectedInterviewType: 'internal',
      internalInterviewers: interviewers,
      externalInterviewers: [],
    }));
    setErrors((prev) => ({ ...prev, interviewerType: '', interviewers: '' }));
  };

  const handleExternalInterviewerSelect = () => {
    if (formData.selectedInterviewType === 'internal') {
      alert('You need to clear internal interviewers before selecting outsourced interviewers.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      selectedInterviewType: 'external',
      internalInterviewers: [],
      externalInterviewers: ['Outsourced'], // Mock external interviewer
    }));
    setErrors((prev) => ({ ...prev, interviewerType: '', interviewers: '' }));
  };

  const handleRemoveInternalInterviewer = (interviewerId) => {
    setFormData((prev) => ({
      ...prev,
      internalInterviewers: prev.internalInterviewers.filter((interviewer) => interviewer._id !== interviewerId),
      selectedInterviewType: prev.internalInterviewers.length === 1 ? null : prev.selectedInterviewType,
    }));
  };

  const handleRemoveExternalInterviewer = () => {
    setFormData((prev) => ({
      ...prev,
      externalInterviewers: [],
      selectedInterviewType: null,
    }));
  };

  const handleClearAllInterviewers = () => {
    setFormData((prev) => ({
      ...prev,
      internalInterviewers: [],
      externalInterviewers: [],
      selectedInterviewType: null,
    }));
  };

  const clearError = (fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const handleAddQuestionToRound = (question) => {
    if (question && question.questionId && question.snapshot) {
      setFormData((prev) => ({
        ...prev,
        interviewQuestionsList: prev.interviewQuestionsList.some((q) => q.questionId === question.questionId)
          ? prev.interviewQuestionsList
          : [...prev.interviewQuestionsList, question],
      }));
      setErrors((prev) => ({ ...prev, questions: undefined }));
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.filter((question) => question.questionId !== questionId),
    }));
  };

  const handleToggleMandatory = (questionId, mandatory) => {
    setFormData((prev) => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.map((question) =>
        question.questionId === questionId ? { ...question, mandatory: mandatory ? 'true' : 'false' } : question
      ),
    }));
  };

  const toggleSection = async (sectionId) => {
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

    if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
      await fetchQuestionsForAssessment(formData.assessmentTemplate?.assessmentId);
    }
  };

  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      roundTitle: selectedTitle,
      customRoundTitle: selectedTitle === "Other" ? "" : prev.customRoundTitle,
      interviewMode: selectedTitle === "Assessment" ? "Virtual" : selectedTitle === "Other" ? "" : prev.interviewMode,
      duration: 30,
      selectedInterviewType: null,
      internalInterviewers: [],
      externalInterviewers: [],
      instructions: '',
      interviewQuestionsList: [],
      assessmentTemplate: { assessmentId: '', assessmentName: '' },
      // sequence: prev.sequence, // <-- REMOVE this line if present, just don't touch sequence!
    }));
    setSectionQuestions({});
    setExpandedSections({});
    setExpandedQuestions({});
    setErrors({});
    setShowDropdown(false);
  };

  const handleAssessmentSelect = (assessment) => {
    const assessmentData = {
      assessmentId: assessment._id,
      assessmentName: assessment.AssessmentTitle,
    };
    setFormData((prev) => ({
      ...prev,
      assessmentTemplate: assessmentData,
      duration: parseInt(assessment.Duration.replace(' minutes', '')),
      instructions: assessment.Instructions,
      interviewQuestionsList: [],
    }));
    setExpandedSections({});
    setSectionQuestions({});
    fetchQuestionsForAssessment(assessment._id);
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, assessmentTemplate: '', assessmentQuestions: '' }));
  };

  const validateForm = () => {
    // const newErrors = {};
    const newErrors = {};

    // Round title validation
    if (!formData.roundTitle?.trim()) {
      newErrors.roundTitle = 'Round title is required';
    }
    if (formData.roundTitle === 'Other' && !formData.customRoundTitle?.trim()) {
      newErrors.roundTitle = 'Custom round title is required';
    }

    // Interview mode validation (skip for Assessment)
    if (!formData.interviewMode && formData.roundTitle !== 'Assessment') {
      newErrors.interviewMode = 'Interview mode is required';
    }

    if (!formData.sequence || formData.sequence < 1) {
      newErrors.sequence = 'Sequence must be at least 1';
    }

    if (formData.roundTitle === 'Assessment') {
      if (!formData.assessmentTemplate?.assessmentId) {
        newErrors.assessmentTemplate = 'Assessment template is required';
      }
    }

    if (formData.roundTitle === 'Technical') {
      if (!formData.duration) {
        newErrors.duration = 'Duration is required';
      }
      if (!formData.instructions?.trim()) {
        newErrors.instructions = 'Instructions are required';
      } else if (formData.instructions.length < 50) {
        newErrors.instructions = 'Instructions must be at least 50 characters';
      } else if (formData.instructions.length > 1000) {
        newErrors.instructions = 'Instructions cannot exceed 1000 characters';
      }
      if (!formData.selectedInterviewType) {
        newErrors.interviewerType = 'Interviewer type is required';
      }
      if (formData.selectedInterviewType === 'internal' && formData.internalInterviewers.length === 0) {
        newErrors.interviewers = 'At least one internal interviewer is required';
      }
      if (formData.interviewQuestionsList.length === 0) {
        newErrors.questions = 'At least one question is required';
      }
    }

    if (formData.roundTitle === 'Final' || formData.roundTitle === 'HR Interview') {
      if (!formData.duration) {
        newErrors.duration = 'Duration is required';
      }
      if (!formData.instructions?.trim()) {
        newErrors.instructions = 'Instructions are required';
      } else if (formData.instructions.length < 50) {
        newErrors.instructions = 'Instructions must be at least 50 characters';
      } else if (formData.instructions.length > 1000) {
        newErrors.instructions = 'Instructions cannot exceed 1000 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting round form...");
    if (!validateForm()) {
      console.log("Validation failed:", errors);
      return;
    }

    try {
      const roundData = {
        tenantId,
        roundTitle: formData.roundTitle === 'Other' ? formData.customRoundTitle : formData.roundTitle,
        interviewMode: formData.interviewMode,
        sequence: formData.sequence,
        interviewDuration: formData.duration,
        instructions: formData.instructions,
        interviewerType: formData.selectedInterviewType,
        interviewers:
          formData.selectedInterviewType === 'internal'
            ? formData.internalInterviewers.map((interviewer) => interviewer._id).filter(Boolean)
            : [],
        questions: formData.roundTitle === 'Assessment' ? [] : formData.interviewQuestionsList,
        ...(formData.roundTitle === 'Assessment' && {
          assessmentId: formData.assessmentTemplate.assessmentId,
        }),
      };

      console.log("Prepared roundData:", roundData);

      if (roundId) {
        console.log("Editing existing round with roundId:", roundId);
        const updatedRounds = template.rounds.map((round) =>
          round._id === roundId ? { ...round, ...roundData } : round
        );
        console.log("Updated rounds array for PATCH:", updatedRounds);

        const patchRes = await axios.patch(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`, {
          tenantId,
          rounds: updatedRounds,
        });
        console.log("PATCH response for edit:", patchRes.data);
      } else {
        console.log("Adding new round...");
        const updatedRounds = [...(template.rounds || []), roundData];
        console.log("Updated rounds array for PATCH:", updatedRounds);

        const patchRes = await axios.patch(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`, {
          tenantId,
          rounds: updatedRounds,
        });
        console.log("PATCH response for add:", patchRes.data);
      }

      console.log("Navigation to template detail page...");
      navigate(`/interview-templates/${id}`);
    } catch (error) {
      console.error('Error saving round:', error);
      alert('Failed to save round. Please try again.');
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);

  const breadcrumbItems = [
    { label: 'Interview Templates', path: '/interview-templates' },
    {
      label: template?.templateName || 'Template',
      path: `/interview-templates/${id}`,
      status: template?.status,
    },
    { label: roundId ? 'Edit Round' : 'Add New Round', path: null },
  ];

  const handlePopupToggle = () => {
    setIsInterviewQuestionPopup(!isInterviewQuestionPopup);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 md:px-8 xl:px-8 2xl:px-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white rounded-lg shadow mt-4">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{roundId ? 'Edit Round' : 'Add New Round'}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-6 mb-6">
              <div>
                <label htmlFor="roundTitle" className="block text-sm font-medium text-gray-700">
                  Round Name <span className="text-red-500">*</span>
                </label>
                {formData.roundTitle === "Other" ? (
                        <input
                          type="text"
                          id="roundTitle"
                          name="roundTitle"
                          value={formData.customRoundTitle}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              customRoundTitle: e.target.value
                              // DO NOT update roundTitle here!
                            }));
                            clearError('roundTitle');
                          }}
                          onBlur={() => {
                            if (!formData.customRoundTitle.trim()) {
                              setFormData(prev => ({ ...prev, customRoundTitle: "" }));
                            }
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
                {errors.roundTitle && <p className="text-red-500 text-sm mt-1">{errors.roundTitle}</p>}
              </div>

              <div>
                <label htmlFor="interviewMode" className="block text-sm font-medium text-gray-700">
                  Interview Mode <span className="text-red-500">*</span>
                </label>
                <select
                  id="interviewMode"
                  name="interviewMode"
                  value={formData.interviewMode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, interviewMode: e.target.value }))
                  }
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${errors.interviewMode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                  disabled={formData.roundTitle === 'Assessment'}
                >
                  <option value="">Select Interview Mode</option>
                  <option value="Face to Face">Face to Face</option>
                  <option value="Virtual">Virtual</option>
                </select>
                {errors.interviewMode && <p className="text-red-500 text-sm mt-1">{errors.interviewMode}</p>}
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

              {formData.roundTitle !== 'Assessment' && (
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) }))
                    }
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${errors.duration ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                  {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                </div>
              )}

              {formData.roundTitle === 'Assessment' && (
                <div>
                  <label htmlFor="assessmentTemplate" className="block text-sm font-medium text-gray-700">
                    Assessment Template <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex-1" ref={dropdownRef}>
                    <input
                      type="text"
                      name="assessmentTemplate"
                      id="assessmentTemplate"
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm ${errors.assessmentTemplate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter assessment template name"
                      value={formData.assessmentTemplate?.assessmentName || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          assessmentTemplate: { ...prev.assessmentTemplate, assessmentName: e.target.value },
                        }))
                      }
                      onClick={() => setShowDropdown(!showDropdown)}
                      readOnly
                    />
                    <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                      <Search className="text-gray-600 text-lg" />
                    </div>
                    {showDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {loading ? (
                          <div className="px-3 py-2 text-gray-500">
                            <Loading />
                          </div>
                        ) : assessmentData.length > 0 ? (
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
                        )}
                      </div>
                    )}
                  </div>
                  {errors.assessmentTemplate && (
                    <p className="text-red-500 text-sm mt-1">{errors.assessmentTemplate}</p>
                  )}
                </div>
              )}
            </div>

            {formData.roundTitle === 'Assessment' && formData.assessmentTemplate.assessmentName && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="assessmentQuestions" className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                    Assessment
                  </label>
                  {errors.assessmentQuestions && (
                    <p className="text-red-500 text-sm">{errors.assessmentQuestions}</p>
                  )}
                  {questionsLoading ? (
                    <p className="text-gray-500">Loading assessment data...</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(sectionQuestions).length > 0 ? (
                        Object.entries(sectionQuestions).map(([sectionId, sectionData]) => (
                          <div key={sectionId} className="border rounded-md shadow-sm p-4">
                            <button
                              onClick={() => toggleSection(sectionId)}
                              className="flex justify-between items-center w-full"
                            >
                              <span className="font-medium">{sectionData?.sectionName || 'Unnamed Section'}</span>
                              <ChevronUp
                                className={`transform transition-transform ${expandedSections[sectionId] ? '' : 'rotate-180'
                                  }`}
                              />
                            </button>

                            {expandedSections[sectionId] && (
                              <div className="mt-4 space-y-3">
                                {Array.isArray(sectionData.questions) && sectionData.questions.length > 0 ? (
                                  sectionData.questions.map((question, idx) => (
                                    <div key={question._id || idx} className="border rounded-md shadow-sm overflow-hidden">
                                      <div
                                        onClick={() =>
                                          setExpandedQuestions((prev) => ({
                                            ...prev,
                                            [question._id]: !prev[question._id],
                                          }))
                                        }
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-600">{idx + 1}.</span>
                                          <p className="text-sm text-gray-700">
                                            {question.snapshot?.questionText || 'No question text'}
                                          </p>
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

                                          {question.snapshot?.questionType === 'MCQ' && (
                                            <div className="mt-2">
                                              <span className="text-sm font-medium text-gray-500">Options:</span>
                                              <div className="grid grid-cols-2 gap-2 mt-1">
                                                {question.snapshot?.options?.map((option, optIdx) => (
                                                  <div
                                                    key={optIdx}
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

                                          <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                              <span className="text-xs font-medium text-gray-500">Difficulty:</span>
                                              <span className="text-xs text-gray-700 ml-1">
                                                {question.snapshot?.difficultyLevel || 'Not specified'}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-xs font-medium text-gray-500">Skills:</span>
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
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No sections available for this assessment
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.roundTitle !== 'Assessment' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Interviewers</label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setInternalInterviews(true);
                        setErrors((prev) => ({ ...prev, interviewerType: '', interviewers: '' }));
                      }}
                      variant="outline"
                      size="sm"
                      className={`${formData.selectedInterviewType === 'external' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={formData.selectedInterviewType === 'external'}
                      title={formData.selectedInterviewType === 'external' ? 'Clear external interviewers first' : ''}
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
                      className={`${formData.selectedInterviewType === 'internal' ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={formData.selectedInterviewType === 'internal'}
                      title={formData.selectedInterviewType === 'internal' ? "Clear internal interviewers first" : ""}
                    >
                      <User className="h-4 w-4 mr-1 text-orange-600" />
                      Select Outsourced
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  {!formData.selectedInterviewType ? (
                    <p className="text-sm text-gray-500 text-center">No interviewers selected</p>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">
                            {formData.selectedInterviewType === 'internal'
                              ? `${formData.internalInterviewers.length} interviewer${formData.internalInterviewers.length !== 1 ? 's' : ''
                              }`
                              : 'Outsourced interviewers'}{' '}
                            selected
                            {formData.selectedInterviewType === 'internal' && (
                              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Internal
                              </span>
                            )}
                            {formData.selectedInterviewType === 'external' && (
                              <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                                Outsourced
                              </span>
                            )}
                          </span>
                        </div>
                        {(formData.internalInterviewers.length > 0 || formData.externalInterviewers.length > 0) && (
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

                      {formData.selectedInterviewType === 'internal' && (
                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-500 mb-2">Internal Interviewers</h4>
                          <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                            {formData.internalInterviewers.map((interviewer) => (
                              <div
                                key={interviewer._id}
                                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-2"
                              >
                                <div className="flex items-center">
                                  <span className="ml-2 text-sm text-blue-800 truncate">
                                    {interviewer.firstName} {interviewer.lastName}
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
                      )}

                      {formData.selectedInterviewType === 'external' && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-2">Outsourced Interviewers</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {formData.externalInterviewers.map((interviewer, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-md p-2"
                              >
                                <div className="flex items-center">
                                  <span className="ml-2 text-sm text-orange-800 truncate">
                                    Outsourced will be selected at interview schedule time.
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleRemoveExternalInterviewer}
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
                  {errors.interviewerType && (
                    <p className="text-red-500 text-sm mt-1">{errors.interviewerType}</p>
                  )}
                  {errors.interviewers && (
                    <p className="text-red-500 text-sm mt-1">{errors.interviewers}</p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="py-3 mx-auto rounded-md">
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
                      {formData.interviewQuestionsList.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {formData.interviewQuestionsList.map((question, qIndex) => {
                            const isMandatory = question?.mandatory === 'true';
                            const questionText = question?.snapshot?.questionText || 'No Question Texts Available';
                            return (
                              <li
                                key={qIndex}
                                className={`flex justify-between items-center p-3 border rounded-md ${isMandatory ? 'border-red-500' : 'border-gray-300'
                                  }`}
                              >
                                <span className="text-gray-900 font-medium">
                                  {qIndex + 1}. {questionText}
                                </span>
                                <button onClick={() => handleRemoveQuestion(question.questionId)}>
                                  <span className="text-red-500 text-xl font-bold">×</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-2 text-gray-500 flex justify-center">No questions added yet.</p>
                      )}
                    </div>
                    {errors.questions && <p className="text-red-500 text-sm mt-1">{errors.questions}</p>}
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
                          <QuestionBank
                            interviewQuestionsLists={formData.interviewQuestionsList}
                            type="interviewerSection"
                            fromScheduleLater={true}
                            onAddQuestion={handleAddQuestionToRound}
                            handleRemoveQuestion={handleRemoveQuestion}
                            handleToggleMandatory={handleToggleMandatory}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.instructions}
                id="instructions"
                name="instructions"
                onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 sm:text-sm h-64 ${errors.instructions ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter round instructions..."
                rows="10"
                minLength={50}
                maxLength={1000}
                readOnly={formData.roundTitle === 'Assessment'}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.instructions ? (
                  <p className="text-red-500 text-sm">{errors.instructions}</p>
                ) : (
                  formData.instructions.length < 50 && (
                    <p className="text-gray-500 text-sm">
                      Minimum {50 - formData.instructions.length} more characters needed
                    </p>
                  )
                )}
                <span className="text-sm text-gray-500">{formData.instructions?.length || 0}/1000</span>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-6 bg-gray-50 rounded-b-lg">
              <Button variant="outline" onClick={() => navigate(`/interview-templates/${id}`)}>
                Cancel
              </Button>
              <button
                onClick={handleSubmit}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              >
                {roundId ? 'Update Round' : 'Save Round'}
              </button>
            </div>
            {errors.submit && <p className="text-red-500 text-sm mt-4 text-center">{errors.submit}</p>}
          </div>
        </div>
      </div>

      {/* {showOutsourcePopup && (
        <OutsourceOption
          onClose={() => setShowOutsourcePopup(false)}
          onProceed={handleExternalInterviewerSelect}
        />
      )} */}

      {isInternalInterviews && (
        <InternalInterviews
          isOpen={isInternalInterviews}
          onClose={() => setInternalInterviews(false)}
          onSelectCandidates={handleInternalInterviewerSelect}
          selectedInterviewers={formData.internalInterviewers}
        />
      )}
    </div>
  );
}

export default RoundFormTemplates;