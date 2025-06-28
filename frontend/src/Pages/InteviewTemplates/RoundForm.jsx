import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button';
import Breadcrumb from '../Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb';
import { ChevronDown, User, X, Users, Trash2, ChevronUp, Search } from 'lucide-react';
import InternalInterviews from '../Dashboard-Part/Tabs/Interview-New/pages/Internal-Or-Outsource/InternalInterviewers';
import axios from "axios";
import { config } from "../../config.js";
import Cookies from 'js-cookie';
import { decodeJwt } from '../../utils/AuthCookieManager/jwtDecode.js';
import QuestionBank from '../Dashboard-Part/Tabs/QuestionBank-Tab/QuestionBank.jsx';
import { useInterviewTemplates } from '../../apiHooks/useInterviewTemplates';
import { useAssessments } from '../../apiHooks/useAssessments.js';
import LoadingButton from '../../Components/LoadingButton';
import { ReactComponent as FaPlus } from '../../icons/FaPlus.svg';
function RoundFormTemplates() {


  const { templatesData, isMutationLoading, addOrUpdateRound, saveTemplate } = useInterviewTemplates();
  const { assessmentData, fetchAssessmentQuestions } = useAssessments();
  // console.log("assessmentData",assessmentData);


  // const { resolveInterviewerDetails } = useInterviewerDetails();
  const { id } = useParams();
  const dropdownRef = useRef(null);
  const [removedQuestionIds, setRemovedQuestionIds] = useState([]);
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
    interviewers: [],
    interviewerType: '',
    interviewerViewType: 'individuals',
    interviewerGroupName: "",
    // externalInterviewers: [], // Added for external interviewers
    instructions: '',
    assessmentTemplate: { assessmentId: '', assessmentName: '' },
    interviewQuestionsList: [],
  });

  // console.log("formData.interviewQuestionsList", formData.interviewQuestionsList);


  const [isInterviewQuestionPopup, setIsInterviewQuestionPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const isInternalSelected = formData.interviewerType === "Internal";
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  const tenantId = tokenPayload?.tenantId;
  const ownerId = tokenPayload?.userId
  const organization = tokenPayload?.organization;


  const [ownerData, setOwnerData] = useState(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!organization && ownerId) {
        try {
          const response = await axios.get(`${config.REACT_APP_API_URL}/users/owner/${ownerId}`);
          setOwnerData(response.data);
        } catch (error) {
          console.error('Error fetching owner data:', error);
        }
      }
    };
    fetchOwnerData();
  }, [organization, ownerId]);



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
        const response = templatesData.find(
          (template) => template._id === id
        );
        console.log("response", response);


        if (response && response) {
          const rounds_res = response
          setTemplate(response);
          if (roundId) {
            const round = rounds_res.rounds.find(r => r._id === roundId);

            if (round) {

              // Then resolve interviewer details
              //  const interviewers = round?.interviewers  || []
              // const internalInterviewers =  resolveInterviewerDetails(interviewers) || [],

              // console.log("internal Interviewers", round);


              setFormData({
                roundTitle: ['Assessment', 'Technical', 'Final', 'HR Interview'].includes(round.roundTitle)
                  ? round.roundTitle
                  : 'Other',
                customRoundTitle: !['Assessment', 'Technical', 'Final', 'HR Interview'].includes(round.roundTitle)
                  ? round.roundTitle.trim('')
                  : '',
                // roundTitle: round.roundTitle || '',
                sequence: round.sequence || 1,
                interviewMode: round.interviewMode || '',
                duration: round.duration?.toString() || '',
                interviewerType: round.interviewerType || '',
                // selectedInterviewersType: round.selectedInterviewersType || 'Individual',
                instructions: round.instructions || '',
                // minimumInterviewers: round.minimumInterviewers?.toString() || '1',
                questions: round.questions || [],
                interviewers: round?.interviewers || [],
                assessmentTemplate: round?.roundTitle === "Assessment" && round?.assessmentId
                  ? {
                    assessmentId: round.assessmentId,
                    assessmentName: assessmentData?.find(a => a._id === round?.assessmentId)?.AssessmentTitle || ''
                  }
                  : {},


                interviewQuestionsList: round?.questions || [],
                interviewerViewType: round?.interviewerType === "Internal" ? round?.interviewerViewType : 'individual',
                interviewerGroupName: round?.interviewerGroupName || ""

                // externalInterviewers: 'Outsourced will be selected at interview schdedule time.',
              });
              if (round?.assessmentId) {
                setQuestionsLoading(true)
                fetchAssessmentQuestions(round?.assessmentId).then(({ data, error }) => {
                  if (data) {
                    setQuestionsLoading(false)
                    setSectionQuestions(data?.sections);

                  } else {
                    console.error('Error fetching assessment questions:', error);
                    setQuestionsLoading(false)
                  }
                });
              }

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
  }, [id, roundId, templatesData]);

  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  useEffect(() => {
    const filterAssessmentsWithQuestions = async () => {
      if (hasFiltered || !template) return;

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

    if (template && assessmentData?.length) {
      filterAssessmentsWithQuestions();
    }
  }, [template, assessmentData, fetchAssessmentQuestions, id]);


  // console.log("assessmentData",assessmentData);



  const handleInternalInterviewerSelect = (interviewers, viewType, groupName) => {
    if (formData.interviewerType === 'External') {
      alert('You need to clear external interviewers before selecting internal interviewers.');
      return;
    }
    if (viewType === 'groups') {
      setFormData((prev) => ({
        ...prev,
        interviewerGroupName: groupName
      }))
    }

    setFormData((prev) => ({
      ...prev,
      interviewerType: 'Internal',
      interviewers: interviewers || [],
      interviewerViewType: viewType || 'individuals',
      interviewerGroupName: groupName || ''
    }));

    if (viewType) {
      setFormData(prev => ({
        ...prev,
        interviewerViewType: viewType || 'individuals'
      }))
    }

    setErrors((prev) => ({ ...prev, interviewerType: '', interviewers: '' }));
  };



  const handleExternalInterviewerSelect = () => {
    if (formData.interviewerType === 'Internal') {
      alert('You need to clear Internal interviewers before selecting outsourced interviewers.');
      return;
    }


    setFormData((prev) => ({
      ...prev,
      interviewerType: 'External',
      interviewers: [],
    }));
    setErrors((prev) => ({ ...prev, interviewerType: '', interviewers: '' }));
  };

  const handleRemoveInternalInterviewer = (interviewerId) => {
    setFormData((prev) => ({
      ...prev,
      interviewers: prev.interviewers.filter((interviewer) => interviewer._id !== interviewerId),
      interviewerType: prev.interviewers.length === 1 ? null : prev.interviewerType,
    }));
  };

  const handleRemoveExternalInterviewer = () => {
    setFormData((prev) => ({
      ...prev,
      // externalInterviewers: [],
      interviewerType: null,
    }));
  };

  const handleClearAllInterviewers = () => {
    setFormData((prev) => ({

      ...prev,
      interviewers: [],
      // externalInterviewers: [],
      interviewerType: null,
    }));

  };

  const handleToggleMandatory = (questionId) => {
    setFormData(prev => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.map((question) =>
        question.questionId === questionId
          ? {
            ...question,
            snapshot: {
              ...question.snapshot,
              mandatory: question.snapshot.mandatory === "true" ? "false" : "true"
            }
          }


          : question
      )
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

        interviewQuestionsList: prev.interviewQuestionsList.some(q => q.questionId === question.questionId)
          ? prev.interviewQuestionsList
          : [...prev.interviewQuestionsList,
          {
            ...question,
            mandatory: "false" // Default to false when adding a new question
          }

          ]

      }));
      setErrors((prev) => ({ ...prev, questions: undefined }));
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      interviewQuestionsList: prev.interviewQuestionsList.filter((question) => question.questionId !== questionId),
    }));
    setRemovedQuestionIds(prev => [...prev, questionId]);
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

    // if (!expandedSections[sectionId] && !sectionQuestions[sectionId]) {
    //   await fetchQuestionsForAssessment(formData.assessmentTemplate?.assessmentId);
    // }
  };

  // const handleRoundTitleChange = (e) => {
  //   const selectedTitle = e.target.value;
  //   setFormData((prev) => ({
  //     ...prev,
  //     roundTitle: selectedTitle,
  //     customRoundTitle: selectedTitle === "Other" ? "" : prev.customRoundTitle,
  //     interviewMode: selectedTitle === "Assessment" ? "Virtual" : selectedTitle === "Other" ? "" : prev.interviewMode,
  //     duration: 30,
  //     interviewerType: null,
  //     interviewers: [],
  //     // externalInterviewers: [],
  //     instructions: '',
  //     interviewQuestionsList: [],
  //     assessmentTemplate: { assessmentId: '', assessmentName: '' },
  //     // sequence: prev.sequence, // <-- REMOVE this line if present, just don't touch sequence!
  //   }));
  //   setSectionQuestions({});
  //   setExpandedSections({});
  //   setExpandedQuestions({});
  //   setErrors({});
  //   setShowDropdown(false);
  // };

  // Improved handleRoundTitleChange function


  const handleRoundTitleChange = (e) => {
    const selectedTitle = e.target.value;
    const isAssessment = selectedTitle === "Assessment";
    const wasAssessment = formData.roundTitle === "Assessment";

    setFormData((prev) => ({
      ...prev,
      roundTitle: selectedTitle,
      customRoundTitle: selectedTitle === "Other" ? "" : prev.customRoundTitle,
      // Reset fields that don't apply to Assessment
      ...(isAssessment ? {
        interviewMode: "Virtual", // Assessment is always virtual
        interviewerType: null,
        interviewers: [],
        instructions: '',
        interviewQuestionsList: [],
      } : {
        // Reset assessment-related fields when switching from Assessment
        ...(wasAssessment ? {
          assessmentTemplate: { assessmentId: '', assessmentName: '' },
          instructions: '' // Clear instructions when switching from Assessment
        } : {}),
        // For other transitions, keep existing instructions unless switching to Other
        instructions: selectedTitle === "Other" ? "" : wasAssessment ? "" : prev.instructions
      }),
      // Preserve sequence in all cases
      sequence: prev.sequence

    }));

    // Clear related state
    if (isAssessment) {
      setSectionQuestions({});
      setExpandedSections({});
      setExpandedQuestions({});

    }
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

      interviewerType: null, // Clear interviewer selection
      interviewers: [], // Clear interviewers
    }));
    setExpandedSections({});
    setSectionQuestions({});
    if (assessment._id) {
      setQuestionsLoading(true)
      fetchAssessmentQuestions(assessment._id).then(({ data, error }) => {
        if (data) {
          setQuestionsLoading(false)
          setSectionQuestions(data?.sections);

        } else {
          console.error('Error fetching assessment questions:', error);
          setQuestionsLoading(false)
        }
      });
    }

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

    if (formData.roundTitle !== 'Assessment') {
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
      if (!formData.interviewerType) {
        newErrors.interviewerType = 'Interviewer type is required';
      }
      if (formData.interviewerType === 'Internal' && formData.interviewers.length === 0) {
        newErrors.interviewers = 'At least one Internal interviewer is required';
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   console.log("Submitting round form...");
  //   if (!validateForm()) {
  //     console.log("Validation failed:", errors);
  //     return;
  //   }

  //   try {
  //     const roundData = {
  //       tenantId,
  //       roundTitle: formData.roundTitle === 'Other' ? formData.customRoundTitle : formData.roundTitle,
  //       interviewMode: formData.interviewMode,
  //       sequence: formData.sequence,
  //       interviewDuration: formData.duration,
  //       instructions: formData.instructions,
  //       interviewerType: formData.selectedInterviewType,
  //       interviewers:
  //         formData.selectedInterviewType === 'internal'
  //           ? formData.internalInterviewers.map((interviewer) => interviewer._id).filter(Boolean)
  //           : [],
  //       questions: formData.roundTitle === 'Assessment' ? [] : formData.interviewQuestionsList
  //         .map(q => ({
  //           questionId: q.questionId,
  //           snapshot: {
  //             ...q.snapshot,
  //             mandatory: q.snapshot.mandatory || "false"
  //           }
  //         })) || [],
  //       ...(formData.roundTitle === 'Assessment' && {
  //         assessmentId: formData.assessmentTemplate.assessmentId,
  //       }),
  //     };

  //     console.log("Prepared roundData:", roundData);

  //     if (roundId) {
  //       console.log("Editing existing round with roundId:", roundId);
  //       const updatedRounds = template.rounds.map((round) =>
  //         round._id === roundId ? { ...round, ...roundData } : round
  //       );
  //       console.log("Updated rounds array for PATCH:", updatedRounds);

  //       const patchRes = await axios.patch(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`, {
  //         tenantId,
  //         rounds: updatedRounds,
  //       });
  //       console.log("PATCH response for edit:", patchRes.data);
  //     } else {
  //       console.log("Adding new round...");
  //       const updatedRounds = [...(template.rounds || []), roundData];
  //       console.log("Updated rounds array for PATCH:", updatedRounds);

  //       const patchRes = await axios.patch(`${config.REACT_APP_API_URL}/interviewTemplates/${id}`, {
  //         tenantId,
  //         rounds: updatedRounds,
  //       });
  //       console.log("PATCH response for add:", patchRes.data);
  //     }

  //     console.log("Navigation to template detail page...");
  //     navigate(`/interview-templates/${id}`);
  //   } catch (error) {
  //     console.error('Error saving round:', error);
  //     alert('Failed to save round. Please try again.');
  //   }
  // };

  const handleSubmit = async (e, isAddNewRound = false) => {
    e.preventDefault();

    // console.log("Submitting round form...");
    if (!validateForm()) {
      // console.log("Validation failed:", errors);
      return;
    }

    try {

      let formattedInterviewers = [];
      if (formData.interviewerViewType === 'groups' && formData.interviewers.length > 0) {
        // ✅ If 'groups' view type: extract userIds from each group
        formattedInterviewers = formData.interviewers.flatMap(group => group.userIds || []);
      } else {
        // ✅ If 'individuals' view type: use _id (internal) or contactId (external)
        formattedInterviewers = formData.interviewers.map(interviewer =>
          organization ? interviewer._id : interviewer.contactId
        );
      }

      const isAssessment = formData.roundTitle === 'Assessment';

      const roundData = {
        tenantId,
        roundTitle: formData.roundTitle === 'Other' ? formData.customRoundTitle : formData.roundTitle,
        interviewMode: formData.interviewMode,
        sequence: formData.sequence,
        duration: formData.duration,
        instructions: formData.instructions,
        interviewerType: formData.interviewerType,
        interviewers: !isAssessment ? formattedInterviewers.filter(Boolean) : [],
        // interviewers:
        //   formData.interviewerType === 'Internal' || formData.roundTitle !== 'Assessment'
        //     ? organization === false ? formData.interviewers.map((interviewer) => interviewer.contactId) : formData.interviewers.map((interviewer) => interviewer._id).filter(Boolean)
        //     : [],
        questions: isAssessment ? [] : formData.interviewQuestionsList
          .map(q => ({
            questionId: q.questionId,
            snapshot: {
              ...q.snapshot,
              mandatory: q.snapshot.mandatory || "false"
            }
          })) || [],
        interviewerGroupName: formData.interviewerViewType === 'groups'
          && !isAssessment
          ? formData.interviewerGroupName : '', // added newly
        interviewerViewType: isAssessment ? "" : formData.interviewerViewType

      };

      console.log("roundData", roundData);


      // Only add assessmentId for Assessment rounds
      if (isAssessment && formData.assessmentTemplate?.assessmentId) {
        roundData.assessmentId = formData.assessmentTemplate.assessmentId;
      } else {
        // Explicitly set to null/undefined for non-Assessment rounds
        roundData.assessmentId = null;
      }



      const res = await addOrUpdateRound({ id, roundData, roundId, template });

      console.log("Navigation to template detail page...", res);
      if (res.status === 'success') {
        //   if(!isAddRound){


        // navigate(`/interview-templates/${id}`);
        //     }


        const templateData = { status: 'active' };
        const isEditMode = true;
        const UpdatedTemplate = await saveTemplate({
          id,
          templateData,
          isEditMode
        });
        console.log("UpdatedTemplate", UpdatedTemplate);



        if (isAddNewRound) {
          // Reset form for new round with incremented sequence
          const maxSequence = template?.rounds?.length > 0
            ? Math.max(...template.rounds.map(r => r.sequence))
            : 0;

          setFormData({
            roundTitle: '',
            interviewMode: '',
            sequence: maxSequence + 1,
            duration: 30,
            selectedInterviewType: null,
            interviewers: [],
            interviewerType: '',
            instructions: '',
            assessmentTemplate: { assessmentId: '', assessmentName: '' },
            interviewQuestionsList: [],
            interviewerGroupName: '',
            interviewerViewType: ''
          });

          // Reset other states
          setSectionQuestions({});
          setExpandedSections({});
          setExpandedQuestions({});
          setErrors({});
          setRemovedQuestionIds([]);
        } else {
          navigate(`/interview-templates/${id}`);
        }

      }



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
                        setFormData(prev => ({
                          ...prev,
                          roundTitle: "",
                          customRoundTitle: ""
                        }));
                        clearError('roundTitle');
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
                        {filteredAssessments.length > 0 ? (
                          filteredAssessments.map((assessment, index) => (
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
                    Assessment Questions
                  </label>
                  {errors.assessmentQuestions && (
                    <p className="text-red-500 text-sm">{errors.assessmentQuestions}</p>
                  )}
                  {questionsLoading ? (
                    <div className="border rounded-md shadow-sm p-4 animate-pulse">
                    </div>
                    // <p className="text-gray-500">Loading assessment data...</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(sectionQuestions).length > 0 ? (
                        Object.entries(sectionQuestions).map(([sectionId, sectionData]) => (
                          <div key={sectionId} className="border rounded-md shadow-sm p-4 ">
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
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Interviewers</label>
                    <div className="flex space-x-2">
                      {organization === false ? (
                        <Button
                          type="button"
                          onClick={() => {
                            handleInternalInterviewerSelect([ownerData]);
                            clearError('interviewerType');
                          }}
                          variant="outline"
                          size="sm"
                          className={`${formData.interviewerType === 'External' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={formData.interviewerType === 'External'}
                          title={formData.interviewerType === 'External' ? 'Clear External interviewers first' : ''}
                        >
                          <User className="h-4 w-4 mr-1 text-blue-600" />
                          Select Internal
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => {
                            setInternalInterviews(true);
                            setErrors((prev) => ({ ...prev, interviewerType: '', interviewers: '' }));
                          }}
                          variant="outline"
                          size="sm"
                          className={`${formData.interviewerType === 'External' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={formData.interviewerType === 'External'}
                          title={formData.interviewerType === 'External' ? 'Clear External interviewers first' : ''}
                        >
                          <User className="h-4 w-4 mr-1 text-blue-600" />
                          Select Internal
                        </Button>

                      )}

                      <Button
                        type="button"
                        // onClick={handleExternalInterviewerSelect}
                        onClick={() => {
                          handleExternalInterviewerSelect();
                          clearError('interviewerType');
                        }}
                        variant="outline"
                        size="sm"
                        className={`${formData.interviewerType === 'Internal' ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={formData.interviewerType === 'Internal'}
                        title={formData.interviewerType === 'Internal' ? "Clear Internal interviewers first" : ""}
                      >
                        <User className="h-4 w-4 mr-1 text-orange-600" />
                        Select Outsourced
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    {!formData.interviewerType ? (

                      <p className="text-sm text-gray-500 text-center">No interviewers selected</p>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">
                              {formData.interviewerType === 'Internal'
                                ? `${formData.interviewers.length} interviewer${formData.interviewers.length !== 1 ? 's' : ''
                                }`
                                : 'Outsourced interviewers'}{' '}
                              selected
                              {formData.interviewerType === 'Internal' && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  Internal
                                </span>
                              )}
                              {formData.interviewerType === 'External' && (
                                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                                  Outsourced
                                </span>
                              )}
                            </span>
                          </div>
                          {(formData.interviewerType === 'External' || formData.interviewerType === 'Internal') && (
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

                        {formData.interviewerType === 'Internal' && (
                          <section className="mb-4 w-full">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">
                              {formData.interviewerViewType === 'groups' ? 'Interviewer Groups ' : 'Internal Interviewers'}
                              <span className="text-xs text-blue-700">({formData.interviewers.length || "Not Provided"} members)</span>
                              {/* {formData.interviewerViewType === 'groups' && formData.interviewerGroupName && (
                                                             <span className="ml-2 text-sm font-normal">(Group: {formData.interviewerGroupName})</span>
                                                           )} */}
                            </h4>
                            <div className="flex  w-full gap-4">
                              {formData.interviewers.map((interviewer, index) => {
                                // Render group card
                                if (formData.interviewerViewType === 'groups' && formData.interviewerGroupName) {
                                  return (
                                    <div
                                      key={`group-${index}`}
                                      className="rounded-xl border w-[30%] md:w-[30%] border-blue-200 bg-blue-50 p-3 shadow-sm flex flex-col justify-between"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div>

                                          <span className="font-medium text-blue-900 block">{formData?.interviewerGroupName || "Not Provided"}</span>

                                        </div>
                                        <button
                                          onClick={() => handleRemoveInternalInterviewer(interviewer._id)}
                                          className="text-red-400 rounded-full p-1 hover:bg-blue-100 transition"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                      <div>
                                        {/* <p className="text-xs text-gray-600 mb-2">{interviewer.description}</p> */}
                                        <ul className="list-disc list-inside text-xs text-blue-800 ml-1">
                                          {interviewer.usersNames ?
                                            interviewer.usersNames.map((name, i) => (
                                              <li key={`${interviewer._id}-user-${i}`}>{name}</li>
                                            )) : `${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim() || interviewer.email
                                          }

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
                                        {`${interviewer.firstName || ''} ${interviewer.lastName || ''}`.trim() || interviewer.email}
                                      </span>
                                    </div>
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

                        )}

                        {formData.interviewerType === 'External' && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 mb-2">Outsourced Interviewers</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* {formData.interviewers.map((interviewer, index) => ( */}
                              <div
                                // key={index}
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
                              {/* ))} */}

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
                              const isMandatory = question?.snapshot?.mandatory === "true";
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
                            <div className="py-3 px-4  flex items-center justify-between">
                              <h2 className="text-xl text-custom-blue font-semibold">Add Interview Question</h2>
                              <button>
                                <X
                                  className="text-2xl text-red-500"
                                  onClick={() => handlePopupToggle()}
                                />
                              </button>
                            </div>
                            {isInterviewQuestionPopup &&
                              <QuestionBank
                                interviewQuestionsLists={formData.interviewQuestionsList}
                                type="interviewerSection"
                                fromScheduleLater={true}
                                onAddQuestion={handleAddQuestionToRound}
                                handleRemoveQuestion={handleRemoveQuestion}
                                handleToggleMandatory={handleToggleMandatory}
                                removedQuestionIds={removedQuestionIds}
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
              </>
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
                <span className="text-sm text-gray-500">
                  {errors.instructions ? (
                    <p className="text-red-500 text-xs pt-1">{errors.instructions}</p>
                  ) : formData.instructions.length > 0 && formData.instructions.length < 50 ? (
                    <p className="text-gray-500 text-xs">
                      Minimum {50 - formData.instructions.length} more characters needed
                    </p>
                  ) : null}
                </span>
                <p className="text-sm text-gray-500">{formData.instructions.length}/1000</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-6  rounded-b-lg">
              <Button variant="outline" onClick={() => navigate(`/interview-templates/${id}`)}>
                Cancel
              </Button>

              <LoadingButton
                onClick={handleSubmit}
                isLoading={isMutationLoading}
                loadingText={id ? "Updating..." : "Saving..."}
              >
                {roundId ? 'Update Round' : 'Save Round'}
              </LoadingButton>
              {!roundId &&
                <LoadingButton
                  onClick={(e) => handleSubmit(e, true)}
                  isLoading={isMutationLoading}
                  loadingText="Adding..."
                  variant="outline"
                >
                  <FaPlus className="w-5 h-5 mr-1" /> Add new Round
                </LoadingButton>
              }

            </div>
            {errors.submit && <p className="text-red-500 text-sm mt-4 text-center">{errors.submit}</p>}
          </div>
        </div>
      </div>

      {isInternalInterviews && (
        <InternalInterviews
          isOpen={isInternalInterviews}
          onClose={() => setInternalInterviews(false)}
          onSelectCandidates={handleInternalInterviewerSelect}
          selectedInterviewers={formData.interviewers}
          defaultViewType={formData.interviewerViewType}
          selectedGroupName={formData.interviewerGroupName}
        />
      )}
    </div>
  );
}

export default RoundFormTemplates;