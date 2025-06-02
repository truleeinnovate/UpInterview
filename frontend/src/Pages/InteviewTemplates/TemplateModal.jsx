/* eslint-disable react/prop-types */
import { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaSearch, FaRegUser } from 'react-icons/fa';
import { config } from '../../config';
import Loading from '../../Components/Loading';


const AssessmentType = ({ roundDetails, onCancel, onSave, roundNumber, onSaveAndAddRound, onUpdate, onValidityChange, isEditMode, isViewMode, rounds }) => {
  const [formData, setFormData] = useState({
    roundName:  '',
    interviewType:  '',
    assessmentTemplate: '',
    interviewMode: '',
    interviewDuration: '',
    instructions: ''
  });

  // Update form data when roundDetails changes
  useEffect(() => {
    if (roundDetails) {
      setFormData(prev => ({
        ...prev,
        ...roundDetails,
        roundName: roundDetails.roundName || '',
        interviewType: roundDetails.interviewType || '',
        assessmentTemplate: roundDetails.assessmentTemplate || '',
        interviewMode: roundDetails.interviewMode || '',
        interviewDuration: roundDetails.interviewDuration || '',
        instructions: roundDetails.instructions || ''
      }));
    }
  }, [roundDetails]);

  // Memoize input change handler
  const handleInputChange = useCallback((field, value) => {
    if (field === 'instructions') {
      if (value.length <= 1000) {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  // Add validation check
  const isFormValid = useMemo(() => {
    return Boolean(
      formData.roundName &&
      formData.interviewType &&
      formData.assessmentTemplate &&
      formData.interviewMode &&
      formData.interviewDuration &&
      formData.instructions
    );
  }, [formData]);

  // Update parent about validation state
  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  // Debounced update to parent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate?.(formData);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [formData, onUpdate]);

  const handlePrevious = () => {
    if (roundNumber > 1) {
      onCancel('round' + (roundNumber - 1));
    } else {
      onCancel('basic');
    }
  };

  const handleEditPrevious = () => {
    if (roundNumber > 1) {
      onCancel('round' + (roundNumber - 1));
    } else {
      onCancel('basic');
    }
  };
  
  const handleNextClick = () => {
    if (roundNumber < rounds.length) {
      onCancel('round' + (roundNumber + 1));
    }
  };

   
  const handleSave = () => {
    if (isEditMode) {
      onUpdate(formData);
      onSave(); // Call onSave to trigger the PATCH request and close the form
    } else {
      onSave(formData);
    }
  };

  const handleSaveAndAddRound = () => {
    onSaveAndAddRound(formData);
  };

  return (
    <>
    {isViewMode ? (
      <>
    <div className="w-full border rounded-lg px-8 sm:px-6 py-9">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Round Details:</h2>
      </div>

      <div className="space-y-6">
        <div className="grid px-2 sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Round Title </h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.roundName}</h2>
          </div>

          <div className="flex px-2 flex-col">
          <h1 className="text-gray-400 text-md pb-4">Interview Type </h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.interviewType}</h2>
          </div>
        </div>
        <h3 className="text-base font-medium mb-4">Assessment Templates:</h3>
       
        <div className="grid px-2 sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
            <div className="flex flex-col">
            <h1 className="text-gray-400 text-md pb-4">Select Template </h1>
            <h2 className="w-full text-md text-gray-600 font-semibold">{formData.assessmentTemplate}</h2>
            </div>
        </div>
      

        <div className="grid px-2 sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Interview Mode </h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.interviewMode}</h2>
          </div>

          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Duration (in minutes) </h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.interviewDuration}</h2>
          </div>
        </div>

        <div className="flex flex-col px-2">
        <h1 className="text-gray-400 text-md pb-4">Instructions</h1>
        <h2 className="w-full text-md text-gray-600 font-semibold">{formData.instructions}</h2>
        </div>
      </div>
      
    </div>
    
      <div className="flex sm:flex-col justify-end gap-2 mt-6 mb-4">
        <div className="flex-1 flex justify-start">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Previous
          </button>
        </div>
        <button
          onClick={handleNextClick}
          className={`px-4 py-2 text-white rounded ${
            roundNumber >= rounds.length
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700' 
          }`}
          disabled={roundNumber >= rounds.length}
        >
          Next
        </button>
      </div>
    </>

    ) : (
      <>
    <div className="w-full border rounded-lg">
      <div className='px-8 py-3 sm:px-6'>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Round Details:</h2>
      </div>

      <div className="space-y-6">
        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Round Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roundName}
              onChange={(e) => handleInputChange('roundName', e.target.value)}
              className='w-full p-2 border rounded'
              placeholder="Enter round title"
              readOnly={!isEditMode}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.interviewType}
              onChange={(e) => handleInputChange('interviewType', e.target.value)}
              className='w-full p-2 border rounded'
              placeholder="Enter round title"
              readOnly={!isEditMode}
            />
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium mb-4">Assessment Templates:</h3>
          <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
            <div className="flex flex-col">
              <label className="text-sm mb-2">
                Select Template <span className="text-red-500">*</span>
              </label>
              <div className="relative">
              <div className='border rounded px-2'>
                <select
                  value={formData.assessmentTemplate}
                  onChange={(e) => handleInputChange('assessmentTemplate', e.target.value)}
                  className='w-full py-1.5'
                >
                  <option value="" hidden>Select</option>
                  <option value="Template 1">Template 1</option>
                  <option value="Template 2">Template 2</option>
                </select>
                </div>
                {/* <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Interview Mode <span className="text-red-500">*</span>
            </label>
            <div className='border rounded px-2'>
            <select
              name="interviewMode"
              value={formData.interviewMode}
              onChange={(e) => handleInputChange('interviewMode', e.target.value)}
              className={`w-full py-1.5 focus:outline-none focus:border-teal-500 bg-white ${isViewMode ? 'bg-gray-100' : ''}`}
            >
              <option value="" hidden>Select</option>
              <option value="Virtual">Virtual</option>
              <option value="Offline">Offline</option>
            </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Duration (in minutes) <span className="text-red-500">*</span>
            </label>
            <div className='border rounded px-2'>
            <select
              name="duration"
              value={formData.interviewDuration}
              onChange={(e) => handleInputChange('interviewDuration', e.target.value)}
              className={`w-full py-1.5 focus:outline-none focus:border-teal-500 bg-white ${isViewMode ? 'bg-gray-100' : ''}`}
            >
              <option value="" hidden>Select</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2">
            <label className="text-sm">
              Instructions <span className="text-red-500">*</span>
            </label>
          </div>
          <textarea
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="This technical interview is designed to assess the candidate's programming skills... (Minimum 250 characters required)"
            rows="4"
            minLength={250}
            maxLength={1000}
            className={`w-full h-60 border rounded px-2 py-2 focus:outline-none ${
              formData.instructions.length < 250 ? 'border-gray-300' : 'focus:border-teal-500'
            }`}
          />
          {/* {formData.instructions.length > 0 && formData.instructions.length < 250 && (
            <div className="flex justify-start items-center">
              <span className="text-sm text-red-500">Minimum {250 - formData.instructions.length} more characters needed</span>
            </div>
          )} */}
          <div className="flex justify-end items-center">
          <span className="text-sm text-gray-500">{formData.instructions.length}/1000</span>
          </div>
        </div>
      </div>
      </div>
    </div>
    
      <div className="flex sm:flex-col justify-end gap-2 mt-6 mb-4">
        <div className="flex-1 flex justify-start">
          {isEditMode ? (
            <button
            onClick={handleEditPrevious}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Previous
          </button>
          ) : (
            <button
            onClick={handlePrevious}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Previous
          </button>

          )}
          
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
             onClick={handleSave}
             disabled={!isFormValid}
             className={`w-auto px-6 py-2 rounded text-sm ${
               isFormValid 
                 ? 'bg-teal-600 text-white hover:bg-teal-700' 
                 : 'bg-gray-400 cursor-not-allowed'
             }`}
           >
             Save
           </button>
           {rounds.length > roundNumber ? (
            <button
            onClick={handleNextClick}
            disabled={!isFormValid}
            className={`w-auto px-6 py-2 rounded text-sm ${
                        isFormValid 
                        ? 'bg-teal-600 text-white hover:bg-teal-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                      }`}
              >
              Next
            </button>
            ) : (
            <button
            onClick={handleSaveAndAddRound}
            disabled={!isFormValid}
            className={`w-auto px-6 py-2 rounded text-sm ${
                          isFormValid 
                          ? 'bg-teal-600 text-white hover:bg-teal-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
             >
              Save & Add Round
            </button>
            )}
      </div>
    </>

    )}
    </>
  );
};


const TechnicalType = ({ roundDetails, onCancel, onSave, roundNumber, onSaveAndAddRound, onUpdate, onValidityChange, isViewMode, isEditMode, rounds }) => {
  // State declarations first
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [questions, setQuestions] = useState([
    'What is the difference between synchronous and asynchronous programming?',
    'Explain the concept of RESTful API.',
    'What are the key differences between SQL and NoSQL databases?',
    'How does garbage collection work in programming languages like Java or Python?',
    'What is the time complexity of a binary search algorithm?'
  ]);

  const [formData, setFormData] = useState({
    roundName: '',
    interviewType: '',
    interviewMode: '',
    interviewDuration: '',
    interviewerType: '',
    selectedInterviewersType: '',
    instructions: '',
    minimumInterviewers: '',
    questions: [],
    selectedInterviewers: [], // Ensure this is initialized as an empty array
    selectedInterviewerIds: [], 
    interviewerGroupId: null
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/users`)
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.REACT_APP_API_URL}/groups`);
        console.log('Fetched groups:', response.data); // Debug log
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups()
  }, []);

  // Initialize form data when roundDetails changes
  useEffect(() => {
    if (roundDetails) {
      const initialData = {
        roundName: roundDetails.roundName || '',
        interviewType: roundDetails.interviewType || '',
        interviewMode: roundDetails.interviewMode || '',
        interviewDuration: roundDetails.interviewDuration || '',
        interviewerType: roundDetails.interviewerType || '',
        selectedInterviewersType: roundDetails.selectedInterviewersType || '',
        instructions: roundDetails.instructions || '',
        minimumInterviewers: roundDetails.minimumInterviewers || '1',
        questions: roundDetails.questions || [],
        selectedInterviewers: roundDetails.selectedInterviewers || [], // Ensure this is initialized as an empty array
        selectedInterviewerIds: roundDetails.interviewers?.map(interviewer => ({
          interviewerId: interviewer.interviewerId,
          interviewerName: interviewer.interviewerName
        })) || [],
        interviewerGroupId: roundDetails.interviewerGroupId || null
      };
      setFormData(initialData);
    }
  }, [roundDetails]);

  // Memoize input change handler
  const handleInputChange = useCallback((field, value) => {
    if (field === 'instructions') {
      if (value.length <= 1000) {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return Boolean(
      formData.roundName &&
      formData.interviewType &&
      formData.interviewMode &&
      formData.interviewDuration &&
      formData.interviewerType &&
      formData.instructions && //.length >= 250 &&
      formData.minimumInterviewers
    );
  }, [formData]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  // Debounce form updates to parent
  const updateParent = useMemo(() => {
    const debounced = (data) => {
      onUpdate?.(data);
    };
    return debounced;
  }, [onUpdate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => updateParent(formData), 100);
    return () => clearTimeout(timeoutId);
  }, [formData, updateParent]);

  const removeInterviewer = (index) => {
    const newInterviewers = formData.selectedInterviewers.filter((_, i) => i !== index);
    const newInterviewerIds = formData.selectedInterviewerIds.filter((_, i) => i !== index);
    setFormData(prev => ({ 
      ...prev, 
      selectedInterviewers: newInterviewers, 
      selectedInterviewerIds: newInterviewerIds,
      interviewers: newInterviewerIds, // Update interviewers array when removing
      interviewerGroupId: formData.selectedInterviewersType === 'Groups' ? null : prev.interviewerGroupId
    }));
    if (formData.selectedInterviewersType === 'Groups') {
      setSelectedValue('');
    }
  };

  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleInterviewerSelect = (item) => {
    console.log('Selected item:', item); // Debug log
    if (formData.selectedInterviewersType === 'Individual') {
      const newInterviewer = {
        interviewerId: item._id,
        interviewerName: item.UserName
      };
      
      setFormData(prev => ({ 
        ...prev, 
        selectedInterviewers: [...prev.selectedInterviewers, item.UserName],
        selectedInterviewerIds: [...prev.selectedInterviewerIds, newInterviewer],
        interviewers: [...(prev.interviewers || []), newInterviewer], // Add to interviewers array
        interviewerGroupId: null
      }));
      setSelectedValue('');
    } else if (formData.selectedInterviewersType === 'Groups') {
      // For groups, we get users from the usersNames field
      const usernames = item.usersNames.split(',').map(name => name.trim()).slice(0, 5);
      const userIds = item.userIds.split(',').map(id => id.trim()).slice(0, 5);
      
      // Create the interviewers array directly here
      const interviewersList = userIds.map((id, index) => ({
        interviewerId: id,
        interviewerName: usernames[index]
      }));

      setFormData(prev => ({ 
        ...prev, 
        selectedInterviewers: usernames,
        selectedInterviewerIds: interviewersList,
        interviewers: interviewersList, // Add this to ensure it's set
        interviewerGroupId: item._id
      }));
      setSelectedValue(item.name);
    }
    setShowDropdown(false);
  };

  const handleInterviewerTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      // interviewerType: value,
      selectedInterviewersType: value,
      selectedInterviewers: [], // Initialize as empty array
      selectedInterviewerIds: [], 
      interviewerGroupId: null 
    }));
    setSelectedValue('');
    if (!value) {
    setShowDropdown(false);
    } else {
      setShowDropdown(true);
    }
  };

  const handlePrevious = () => {
    if (roundNumber > 1) {
      onCancel('round' + (roundNumber - 1));
    } else {
      onCancel('basic');
    }
  };

  const handleEditPrevious = () => {
    if (roundNumber > 1) {
      onCancel('round' + (roundNumber - 1));
    } else {
      onCancel('basic');
    }
  };

  const handleNextClick = () => {
    if (roundNumber < rounds.length) {
      onCancel('round' + (roundNumber + 1));
    }
  };

  const handleSave = () => {
    // Prepare data for backend
    const dataForBackend = {
      ...formData,
      interviewers: formData.selectedInterviewerIds?.map(interviewer => ({
        interviewerId: interviewer.interviewerId,
        interviewerName: interviewer.interviewerName
      })) || [],
      interviewerGroupId: formData.interviewerGroupId || null
    };

    if (isEditMode) {
      onUpdate(dataForBackend);
      onSave(); // Call onSave to trigger the PATCH request and close the form
    } else {
      onSave(dataForBackend);
    }
  };

  const handleSaveAndAddRound = () => {
    // Prepare data for backend
    const dataForBackend = {
      ...formData,
      interviewers: formData.selectedInterviewerIds?.map(interviewer => ({
        interviewerId: interviewer.interviewerId,
        interviewerName: interviewer.interviewerName
      })) || [],
      interviewerGroupId: formData.interviewerGroupId || null
    };

    onSaveAndAddRound(dataForBackend);
  };

  return (
    <>
    {isViewMode ? (
       <>
       <div className="w-full border rounded-lg px-8 sm:px-6 py-9">
      {/* Round Details Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-medium">Round Details:</h2>
      </div>

      <div className="space-y-6 px-2">
        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Round Title</h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.roundName}</h2>
          </div>

          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4"> Interview Type </h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.interviewType}</h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Interview Mode</h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.interviewMode}</h2>
          </div>

          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Duration</h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.interviewDuration}</h2>
          </div>
        </div>

        <div className='pb-4'>
        <h1 className="text-gray-400 text-md pb-4">Instructions</h1>
        <h2 className="w-full text-md text-gray-600 font-semibold">{formData.instructions}</h2>
        </div>
      </div>

      {/* Interviewer Details Section */}
      <h2 className="text-base font-medium mb-6">Interviewer Details:</h2>
      <div className="space-y-6 px-2">
        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Interviewer Type</h1>
          <h2 className="w-full text-md text-gray-600 font-semibold">{formData.interviewerType}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1">
        <h1 className="text-gray-400 text-md " hidden={formData.interviewerType === 'Outsourced Interviewer'}>Interviewers</h1>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 grid-cols-4 gap-4">
          {formData.selectedInterviewers.map((interviewer, index) => (
            <div key={index} className="border rounded px-2 py-2 relative">
              <div className="flex items-center gap-2">
                <FaRegUser className="text-gray-600 text-xl" />
                <span className="text-sm">{interviewer}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
          <h1 className="text-gray-400 text-md pb-4">Minimum Interviewers Required</h1>
          <h2 className="w-full text-md text-gray-600 font-semibold px-3">{formData.minimumInterviewers}</h2>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <h2 className="text-base font-medium mt-4 mb-4">Questions:</h2>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="flex-grow border bg-white rounded">
              <div className="">
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-start flex-1">
                    <span className="mr-4">{index + 1}.</span>
                    <p className="text-sm">{question}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>

    {/* Footer Buttons */}

    <div className="flex sm:flex-col justify-end gap-2 mt-6 mb-4">
        <div className="flex-1 flex justify-start">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Previous
          </button>
        </div>
        <button
          onClick={handleNextClick}
          className={`px-4 py-2 text-white rounded ${
            roundNumber >= rounds.length
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700' 
          }`}
          disabled={roundNumber >= rounds.length}
        >
          Next
        </button>
      </div>
       </>
    ) : (
       <>
       <div className="w-full border rounded-lg">
      <div className="px-8 py-3 sm:px-6">
      {/* Round Details Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-medium">Round Details:</h2>
      </div>

      <div className="space-y-6">
        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Round Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.roundName}
              readOnly={!isEditMode}
              onChange={(e) => handleInputChange('roundName', e.target.value)}
              placeholder="Software Engineer - Technical"
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.interviewType}
              onChange={(e) => handleInputChange('interviewType', e.target.value)}
              readOnly={!isEditMode}
              className="w-full border rounded px-2 py-1.5 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Interview Mode <span className="text-red-500">*</span>
            </label>
            <div className='border rounded px-2'>
            <select
              name="interviewMode"
              value={formData.interviewMode}
              onChange={(e) => handleInputChange('interviewMode', e.target.value)}
              className="w-full py-1.5 focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="" hidden>Select</option>
              <option value="Virtual">Virtual</option>
              <option value="Offline">Offline</option>
            </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Duration <span className="text-red-500">*</span>
            </label>
            <div className="flex px-2 border rounded">
            <select
              name="duration"
              value={formData.interviewDuration}
              onChange={(e) => handleInputChange('interviewDuration', e.target.value)}
              className="w-full py-1.5 focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="" hidden>Select</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2">
            <label className="text-sm">
              Instructions <span className="text-red-500">*</span>
            </label>
          </div>
          <textarea
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="This technical interview is designed to assess the candidate's programming skills... (Minimum 250 characters required)"
            rows="4"
            minLength={250}
            maxLength={1000}
            className={`w-full h-60 border rounded px-2 py-2 focus:outline-none ${
              formData.instructions.length < 250 ? 'border-gray-300' : 'focus:border-teal-500'
            }`}
          />
          {/* {formData.instructions.length > 0 && formData.instructions.length < 250 && (
            <div className="flex justify-start items-center">
              <span className="text-sm text-red-500">Minimum {250 - formData.instructions.length} more characters needed</span>
            </div>
          )} */}
          <div className="flex justify-end items-center">
          <span className="text-sm text-gray-500">{formData.instructions.length}/1000</span>
          </div>
        </div>
      </div>

      {/* Interviewer Details Section */}
      <div className="space-y-6">
        <h2 className="text-base font-medium">Interviewer Details:</h2>
        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
          <div className="flex flex-col">
            <label className="text-sm mb-2">
              Interviewer Type <span className="text-red-500">*</span>
            </label>
            <div className='border rounded px-2'>
            <select
              name="interviewerType"
              value={formData.interviewerType}
              onChange={(e) => handleInputChange('interviewerType', e.target.value)}
              className="w-full rounded py-1.5 focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="" hidden>Select Option</option>
              <option value="Internal Interviewer">Internal Interviewer</option>
              <option value="Outsourced Interviewer">Outsourced Interviewer</option>
            </select>
            </div>
          </div>

          
        </div>
        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
        <div className="flex flex-col">
            <label className="text-sm mb-2">
              Interviewers
            </label>
            <div className="flex gap-2">
            <div className={`border w-28 rounded px-2 ${formData.interviewerType === 'Outsourced Interviewer' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
              <select
                value={formData.selectedInterviewersType}
                onChange={(e) => {
                  if (formData.interviewerType !== 'Outsourced Interviewer') {
                    handleInterviewerTypeChange(e);
                  }
                }}
                disabled={formData.interviewerType === 'Outsourced Interviewer'}
                className={`w-full py-1.5 focus:outline-none focus:border-teal-500 ${formData.interviewerType === 'Outsourced Interviewer' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value="" hidden>Select</option>
                <option value="Individual">Individual</option>
                <option value="Groups">Groups</option>
              </select>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Select interviewer"
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  className={`w-full border rounded px-3 py-1.5 focus:outline-none focus:border-teal-500 ${formData.interviewerType === 'Outsourced Interviewer' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  onClick={() => {
                    if (formData.interviewerType !== 'Outsourced Interviewer') {
                      setShowDropdown(!showDropdown);
                    }
                  }}
                  readOnly={formData.interviewerType === 'Outsourced Interviewer'}
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
                  <FaSearch className="text-gray-600 text-lg" />
                </div>
                {showDropdown && formData.selectedInterviewersType && formData.interviewerType !== 'Outsourced Interviewer' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {loading ? (
                      <div className="px-3 py-2 text-gray-500"><Loading /></div>
                    ) : formData.selectedInterviewersType === 'Individual' ? (
                      users.length > 0 ? (
                        users.map((user, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleInterviewerSelect(user)}
                          >
                            {user.UserName}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">No users found</div>
                      )
                    ) : formData.selectedInterviewersType === 'Groups' ? (
                      groups.length > 0 ? (
                        groups.map((group, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => handleInterviewerSelect(group)}
                          >
                            <span>{group.name}</span>
                            <span className="text-gray-500 text-sm">({group.numberOfUsers} users)</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">No groups found</div>
                      )
                    ) : (
                      <div className="px-3 py-2 text-gray-500">Please select an interviewer type</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 grid-cols-4 gap-4 mt-4">
          {formData.selectedInterviewers.map((interviewer, index) => (
            <div key={index} className="border rounded px-2 py-2 relative">
              <div className="flex items-center gap-2">
                <FaRegUser className="text-gray-600 text-xl" />
                <span className="text-sm">{interviewer}</span>
              </div>
              <button
                onClick={() => removeInterviewer(index)}
                className="text-gray-400 hover:text-gray-600 absolute top-1/2 -translate-y-1/2 right-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4 sm:gap-8">
        <div className="flex flex-col">
            <label className="text-sm mb-2">
              Minimum Interviewers Required <span className="text-red-500">*</span>
            </label>
            <div className="flex border rounded">
              <input
                type="number"
                name="minimumInterviewers"
                value={formData.minimumInterviewers}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 5) {
                    handleInputChange('minimumInterviewers', e.target.value);
                  }
                }}
                min={formData.selectedInterviewers.length === 0 ? 1 : formData.selectedInterviewers.length}
                max="5"
                className="w-full px-2 py-1.5 focus:outline-none focus:border-teal-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium">Questions:</h2>
          <button className="text-teal-600 hover:text-teal-700 flex items-center gap-1">
            <span className="text-xl font-medium">+</span>
            Add Questions
          </button>
        </div>

        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={index} className="flex gap-3 w-full p-4 bg-gray-50 rounded-md">
              <div className="flex-grow border bg-white rounded-md">
              <div className="flex items-start justify-between p-4">
                <div className="flex items-start flex-1">
                  <span className="mr-4">{index + 1}.</span>
                  <p className="text-sm">{question}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              </div>
              <button
                onClick={() => removeQuestion(index)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
    
      <div className="flex sm:flex-col justify-end gap-2 mt-6 mb-4">
        <div className="flex-1 flex justify-start">
          {isEditMode ? (
            <button
            onClick={handleEditPrevious}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Previous
          </button>
          ) : (
            <button
            onClick={handlePrevious}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
          >
            Previous
          </button>

          )}
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
             onClick={handleSave}
             disabled={!isFormValid}
             className={`w-auto px-6 py-2 rounded text-sm ${
               isFormValid 
                 ? 'bg-teal-600 text-white hover:bg-teal-700' 
                 : 'bg-gray-400 cursor-not-allowed'
             }`}
           >
             Save
           </button>
           {rounds.length > roundNumber ? (
            <button
            onClick={handleNextClick}
            disabled={!isFormValid}
            className={`w-auto px-6 py-2 rounded text-sm ${
                        isFormValid 
                        ? 'bg-teal-600 text-white hover:bg-teal-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                      }`}
              >
              Next
            </button>
            ) : (
            <button
            onClick={handleSaveAndAddRound}
            disabled={!isFormValid}
            className={`w-auto px-6 py-2 rounded text-sm ${
                          isFormValid 
                          ? 'bg-teal-600 text-white hover:bg-teal-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
             >
              Save & Add Round
            </button>
            )}
      </div>
       </>
    )}
   
  </>
  );
};



const TemplateModal = ({ isOpen, onClose, isEditMode, isViewMode, setEditMode, setViewMode, initialData, onSuccess }) => {
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState(-1);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentStage, setCurrentStage] = useState('basic');
  const [selectedInterviewType, setSelectedInterviewType] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(-1);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, roundIndex: -1 });
  const [hoveredRound, setHoveredRound] = useState(-1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [roundFormData, setRoundFormData] = useState({
    roundName: '',
    interviewType: ''
  });

  // Initialize form data when modal opens or when editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setTemplateTitle(initialData.templateName || '');
      setLabel(initialData.label || '');
      setDescription(initialData.description || '');
      setRounds(initialData.rounds || []);
    } else if(isViewMode && initialData) {
      setTemplateTitle(initialData.templateName || '');
      setLabel(initialData.label || '');
      setDescription(initialData.description || '');
      setRounds(initialData.rounds || []);
    }
    else {
      // Reset form when opening for new template
      setTemplateTitle('');
      setLabel('');
      setDescription('');
      setRounds([]);
      setCurrentStage('basic');
      setShowAssessment(false);
      setSelectedInterviewType('');
      setCurrentRoundIndex(-1);
    }
  }, [isEditMode, isViewMode, initialData]);

  useEffect(() => {
    const isValid = templateTitle.trim() !== '' &&
           label.trim() !== ''
    setIsFormValid(isValid);
  }, [templateTitle, label, isFormValid, isRoundModalOpen]);

  const handleValidityChange = useCallback((isValid) => {
    setIsFormValid(isValid);
  }, []);

  const isModalValid = useMemo(() => {
    if (isRoundModalOpen) {
      return templateTitle.trim() !== '' && 
             label.trim() !== '' && 
             isFormValid;
    }
    return templateTitle.trim() !== '' && 
           label.trim() !== ''
  }, [templateTitle, label, isFormValid, isRoundModalOpen]);

  if (!isOpen) return null;

  const maxRounds = 5;

  const handleTitleChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9_ ]/g, "");
    setTemplateTitle(sanitizedValue);
    setLabel(sanitizedValue.replace(/\s+/g, "_"));
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length >= 20 && value.length <= 300) {
      setDescription(value);
    } else if (value.length < 20) {
      setDescription(value);
    }
  };

  const handleSaveAndAddRound = (formDataOrEvent) => {
    // If it's an event (from basic details), prevent default
    if (formDataOrEvent && formDataOrEvent.preventDefault) {
      formDataOrEvent.preventDefault();
    }
    
    // If it's form data from Assessment/Technical type, update the current round
    if (formDataOrEvent && !formDataOrEvent.preventDefault) {
      handleRoundUpdate(formDataOrEvent);
    }

    if (!isModalValid) return;
    
    // Set insertIndex to the length of rounds array since we're adding a new round
    const newIndex = rounds.length;
    setInsertIndex(newIndex);
    // Set the initial round name based on the new index
    setRoundFormData(prev => ({
      ...prev,
      roundName: ''
    }));
    setIsRoundModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!isModalValid) return;
    
    const templateData = {
      tenantId: "670286b86ebcb318dab2f676",
      templateName: templateTitle,
      label: label,
      description: description,
      rounds: rounds.map(round => {
        const roundData = {};

        if (round.interviewType === 'Technical') {
          roundData.roundName = round.roundName;
          roundData.interviewType = round.interviewType;
          roundData.instructions = round.instructions || '';
          roundData.interviewMode = round.interviewMode || '';
          roundData.interviewerType = round.interviewerType || '';
          roundData.selectedInterviewersType = round.selectedInterviewersType || '';
          roundData.selectedInterviewers = round.selectedInterviewers || [];
          roundData.interviewDuration = round.interviewDuration;
          // Ensure interviewers array is properly populated
          if (round.selectedInterviewerIds && round.selectedInterviewerIds.length > 0) {
            roundData.interviewers = round.selectedInterviewerIds.map(interviewer => ({
              interviewerId: interviewer.interviewerId,
              interviewerName: interviewer.interviewerName
            }));
          } else {
            roundData.interviewers = [];
          }
          roundData.interviewerGroupId = round.interviewerGroupId || null;
          roundData.minimumInterviewers = round.minimumInterviewers || '1';
          roundData.questions = round.questions || [];
        } else if (round.interviewType === 'Assessment') {
          roundData.roundName = round.roundName;
          roundData.interviewType = round.interviewType;
          roundData.instructions = round.instructions || ''
          roundData.assessmentTemplate = round.assessmentTemplate || '';
          roundData.interviewMode = round.interviewMode || '';
          roundData.interviewDuration = round.interviewDuration;
        }

        return roundData;
      })
    };

    try {
      const url = isEditMode 
        ? `${config.REACT_APP_API_URL}/interviewTemplates/${initialData._id}`
        : `${config.REACT_APP_API_URL}/interviewTemplates`;
      
      const response = await axios[isEditMode ? 'patch' : 'post'](url, templateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        onSuccess(); 
      }
    } catch (error) {
      console.error('Error saving template:', error.response?.data || error);
      alert(error.response?.data?.message || 'Failed to save template. Please try again.');
    }
  };

  const handleRoundNext = (interviewType, roundData) => {
    setSelectedInterviewType(interviewType);
    
    const updatedRounds = [...rounds];
    if (insertIndex !== -1) {
      // Ensure interviewers and interviewerGroupId are properly set
      const processedRoundData = {
        ...roundData,
        interviewers: roundData.selectedInterviewerIds?.map(interviewer => ({
          interviewerId: interviewer.interviewerId,
          interviewerName: interviewer.interviewerName
        })) || [],
        interviewerGroupId: roundData.interviewerGroupId || null
      };
      updatedRounds.splice(insertIndex, 0, processedRoundData);
    } else {
      // Ensure interviewers and interviewerGroupId are properly set
      const processedRoundData = {
        ...roundData,
        interviewers: roundData.selectedInterviewerIds?.map(interviewer => ({
          interviewerId: interviewer.interviewerId,
          interviewerName: interviewer.interviewerName
        })) || [],
        interviewerGroupId: roundData.interviewerGroupId || null
      };
      updatedRounds.push(processedRoundData);
    }
    
    updatedRounds.forEach((round, idx) => {
      round.roundName = round.roundName.replace(/Round \d+/, `Round ${idx + 1}`);
    });
    
    setRounds(updatedRounds);
    setCurrentRoundIndex(insertIndex !== -1 ? insertIndex : updatedRounds.length - 1);
    setShowAssessment(true);
    setIsRoundModalOpen(false);
    setCurrentStage(`round${insertIndex !== -1 ? insertIndex + 1 : updatedRounds.length}`);
    setInsertIndex(-1);
    setRoundFormData({
      roundName: '',
      interviewType: ''
    });
  };

  const handleRoundUpdate = (updatedRoundData) => {
    if (currentRoundIndex !== -1) {
      setRounds(prev => {
        const newRounds = [...prev];
        newRounds[currentRoundIndex] = {
          ...newRounds[currentRoundIndex],
          ...updatedRoundData
        };
        return newRounds;
      });
    }
  };

  const handleAddRoundAtIndex = (index) => {
    setInsertIndex(index);
    setIsRoundModalOpen(true);
  };

  const handleRoundDelete = (index) => {
    setDeleteConfirmation({ isOpen: true, roundIndex: index });
  };

  const confirmDelete = () => {
    const index = deleteConfirmation.roundIndex;
    const newRounds = [...rounds];
    newRounds.splice(index, 1);

    newRounds.forEach((round, idx) => {
      round.roundName = round.roundName.replace(/Round \d+/, `Round ${idx + 1}`);
    });

    setRounds(newRounds);

    if (newRounds.length === 0) {
      setCurrentStage('basic');
      setShowAssessment(false);
      setSelectedInterviewType('');
      setCurrentRoundIndex(-1);
    } else {
      let newIndex;
      if (index >= newRounds.length) {
        newIndex = newRounds.length - 1;
      } else {
        newIndex = index;
      }

      setCurrentStage(`round${newIndex + 1}`);
      setCurrentRoundIndex(newIndex);
      setSelectedInterviewType(newRounds[newIndex].interviewType || '');
      setShowAssessment(true);
    }

    setDeleteConfirmation({ isOpen: false, roundIndex: -1 });
  };

  const handleRoundClick = (index) => {
    // First save the current round data before switching
    if (currentRoundIndex !== -1) {
      handleRoundUpdate(initialData);
    }
    setCurrentRoundIndex(index);
    setSelectedInterviewType(rounds[index].interviewType);
    setShowAssessment(true);
    setCurrentStage('round' + (index + 1));
  };

  const handlePreviousNavigation = (stage) => {
    // First save the current round data before navigating
    if (currentRoundIndex !== -1) {
      handleRoundUpdate(initialData);
    }

    if (stage === 'basic') {
      setCurrentStage('basic');
      setShowAssessment(false);
      setSelectedInterviewType('');
      setCurrentRoundIndex(-1);
    } else {
      const roundNum = parseInt(stage.replace('round', ''));
      const prevIndex = roundNum - 1;
      setCurrentRoundIndex(prevIndex);
      setCurrentStage(`round${roundNum}`);
      setSelectedInterviewType(rounds[prevIndex].interviewType);
      setShowAssessment(true);
    }
  };

  const handleNextRoundClick = () => {
    const nextIndex = currentRoundIndex + 1;
    setCurrentRoundIndex(nextIndex);
    setShowAssessment(true);
    setSelectedInterviewType(rounds[nextIndex].interviewType);
    setCurrentStage(`round${nextIndex + 1}`);
  }


  const renderStageIndicator = () => {
    const isBasicStage = currentStage === 'basic';
    const currentRoundNumber = currentStage.startsWith('round') ? parseInt(currentStage.slice(5)) : 0;

    return (
      <div className="flex items-center justify-center mb-6 w-full overflow-x-auto py-2">
        <div className="flex items-center min-w-fit px-2">
          {/* Basic Details */}
          <div className="flex items-center">
            <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium ${
              isBasicStage 
                ? 'bg-orange-500 text-white' 
                : 'bg-teal-600 text-white'
            }`}>
              Basic Details
            </span>
          </div>

          {/* Rounds Section */}
          {isViewMode ? (
            <>
            {rounds.map((_, index) => (
                     <div key={index} className="flex items-center">
                    <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                   </div>

                    {/* Round Button with Hover Delete */}
                   <div 
                    className="relative group"
                   onMouseEnter={() => setHoveredRound(index)}
                    onMouseLeave={() => setHoveredRound(-1)}
                   >
                   <div 
                    onClick={() => handleRoundClick(index)}
                    className="cursor-pointer"
                   >
                  <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium ${
                     currentStage === 'round'+(index+1)
                       ? 'bg-orange-500 text-white'
                      : currentStage.startsWith('round') && parseInt(currentStage.slice(5)) > index+1
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-50 text-teal-600 border border-teal-100'
                   }`}>
                     Round {index + 1}
                 </span>
                 </div>
   
              </div>
           </div>
          ))}  
          </>
          ) : isEditMode ? (
            // Edit Mode: Show all rounds without plus icons
            <>
              {rounds.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                  </div>

                  {/* Round Button with Hover Delete */}
                  <div 
                    className="relative group"
                    onMouseEnter={() => setHoveredRound(index)}
                    onMouseLeave={() => setHoveredRound(-1)}
                  >
                    <div 
                      onClick={() => handleRoundClick(index)}
                      className="cursor-pointer"
                    >
                      <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium ${
                        currentStage === 'round'+(index+1)
                          ? 'bg-orange-500 text-white'
                          : currentStage.startsWith('round') && parseInt(currentStage.slice(5)) > index+1
                            ? 'bg-teal-600 text-white'
                            : 'bg-teal-50 text-teal-600 border border-teal-100'
                      }`}>
                        Round {index + 1}
                      </span>
                    </div>
                    {hoveredRound === index && (
                      <button
                        onClick={() => handleRoundDelete(index)}
                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                      >
                        <FaTrash className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Plus icon to add round after current round */}
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
                <div 
                  onClick={() => handleAddRoundAtIndex(rounds.length)}
                  className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center cursor-pointer hover:border-teal-600"
                >
                  <FaPlus className="h-3 w-3 text-teal-600" />
                </div>
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>

              {/* Next Future Round */}
              {rounds.length < maxRounds && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-gray-50 text-gray-400 border border-gray-200">
                      Round {rounds.length + 1}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : isBasicStage ? (
            // When in Basic Details: Show just Round 1
            <>
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>
              <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-teal-50 text-teal-600 border border-teal-100">
                Rounds
              </span>
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>
            </>
          ) : (
            // When in Rounds: Show all rounds with plus icons
            <>
              {rounds.map((_, index) => (
                <div key={index} className="flex items-center">
                  {/* Connector to Round with Plus Icon */}
                  <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div 
                      onClick={() => handleAddRoundAtIndex(index)}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                        index < currentRoundNumber
                          ? 'border-teal-600 bg-teal-600 hover:bg-teal-700'
                          : 'border-teal-200 bg-teal-50 hover:border-teal-600'
                      }`}
                    >
                      <FaPlus className={`h-3 w-3 ${
                        index < currentRoundNumber ? 'text-white' : 'text-teal-600'
                      }`} />
                    </div>
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                  </div>

                  {/* Round Button with Hover Delete */}
                  <div 
                    className="relative group"
                    onMouseEnter={() => setHoveredRound(index)}
                    onMouseLeave={() => setHoveredRound(-1)}
                  >
                    <div 
                      onClick={() => handleRoundClick(index)}
                      className="cursor-pointer"
                    >
                      <span className={`whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium ${
                        currentStage === 'round'+(index+1)
                          ? 'bg-orange-500 text-white'
                          : currentStage.startsWith('round') && parseInt(currentStage.slice(5)) > index+1
                            ? 'bg-teal-600 text-white'
                            : 'bg-teal-50 text-teal-600 border border-teal-100'
                      }`}>
                        Round {index + 1}
                      </span>
                    </div>
                    {hoveredRound === index && (
                      <button
                        onClick={() => handleRoundDelete(index)}
                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                      >
                        <FaTrash className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Plus icon to add round after current round */}
              <div className="flex items-center">
                <div className="h-[1px] w-10 bg-teal-200"></div>
                <div 
                  onClick={() => handleAddRoundAtIndex(rounds.length)}
                  className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center cursor-pointer hover:border-teal-600"
                >
                  <FaPlus className="h-3 w-3 text-teal-600" />
                </div>
                <div className="h-[1px] w-10 bg-teal-200"></div>
              </div>

              {/* Next Future Round */}
              {rounds.length < maxRounds && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="whitespace-nowrap px-3 py-1.5 rounded text-sm font-medium bg-gray-50 text-gray-400 border border-gray-200">
                      Round {rounds.length + 1}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-[1px] w-10 bg-teal-200"></div>
                    <div className="h-6 w-6 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center">
                      <FaPlus className="h-3 w-3 text-teal-600" />
                    </div>
                    <div className="h-[1px] w-12 bg-teal-200"></div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {!isEditMode && !isViewMode && (
            <div className="flex items-center">
              <div 
                className="h-8 w-8 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center"
              >
                <div className="h-5 w-5 rounded-full border-2 border-teal-200"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInterviewComponent = () => {
    const roundDetails = rounds[currentRoundIndex];
    if (selectedInterviewType === 'Technical') {
      return (
        <TechnicalType 
          roundDetails={roundDetails} 
          onCancel={(stage) => {
            if (stage) {
              handlePreviousNavigation(stage);
            } else {
              onClose();
            }
          }}
          onSave={handleSave} 
          onSaveAndAddRound={handleSaveAndAddRound}
          roundNumber={currentRoundIndex + 1}
          onUpdate={handleRoundUpdate}
          onValidityChange={handleValidityChange}
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          rounds={rounds}
        />
      );
    } else if (selectedInterviewType === 'Assessment') {
      return (
        <AssessmentType 
          roundDetails={roundDetails} 
          onCancel={(stage) => {
            if (stage) {
              handlePreviousNavigation(stage);
            } else {
              onClose();
            }
          }}
          onSave={handleSave} 
          onSaveAndAddRound={handleSaveAndAddRound}
          roundNumber={currentRoundIndex + 1}
          onUpdate={handleRoundUpdate}
          onValidityChange={handleValidityChange}
          isEditMode={isEditMode}
          isViewMode={isViewMode}
          rounds={rounds}
        />
      );
    }
    return null;
  };

  return (
    <>
    {isViewMode ? (
        <div className="py-3 flex items-center justify-center ">
        <div className="container mx-auto max-w-full sm:px-6 md:px-20 px-40 sm:py-3 py-6 bg-white rounded-lg">
          {/* Modal Header */}
          <div className="">
            <div className="flex justify-between">
              <div className="flex items-center">
              <h2 onClick={onClose} className="text-2xl font-semibold text-gray-800 cursor-pointer"> Interview Template&nbsp;</h2>
              <span className="text-2xl font-semibold text-gray-500"> /&nbsp;{templateTitle}</span>
              </div>
              <div>
                <button onClick={() => {setEditMode(true); setViewMode(false);}} className='text-custom-blue text-xl font-semibold'>Edit</button>
              </div>
            </div>
            
            {/* Progress Steps */}
            {renderStageIndicator()}
          </div>
  
          {showAssessment ? (
            <div className="flex-grow">
              {renderInterviewComponent()}
            </div>
          ) : (
            <>
              {/* Modal Body */}
              <div className="">
                <div className="space-y-6 sm:px-6 sm:py-2 md:px-8 md:py-3 px-8 py-9 rounded-lg border">
                <h2 className='text-lg font-semibold'>Round Details:</h2>
                  <div className="grid px-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 sm:grid-cols-1 sm:gap-2 md:gap-3 gap-4">
                    <div className="flex flex-col flex-grow">
                      <h1 className="text-gray-400 text-md pb-4">Template Title </h1>
                      <h2 className="w-full text-md text-gray-600 font-semibold">{templateTitle}</h2>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                    <h1 className="text-gray-400 text-md pb-4">Label</h1>
                    <h2 className="w-full text-md text-gray-600 font-semibold">{label}</h2>
                    </div>
                  </div>
                  
                  <div className="flex px-2 flex-col  flex-grow sm:mt-2">
                  <h1 className="text-gray-400 text-md pb-4">Description </h1>
                  <h2 className="w-full text-md text-gray-600 font-semibold">{description}</h2>
                  </div>
                  
                </div>
  
                {/* Modal Footer */}
                <div className="bg-white pt-4">
                  <div className="flex justify-end ">
                  <button
                   onClick={() => handleNextRoundClick(currentRoundIndex + 1)}
                  className={`px-4 py-2 text-white rounded ${
                    currentRoundIndex === rounds.length - 1
                          ?  'bg-gray-400 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700' 
                  }`}
                  disabled={currentRoundIndex === rounds.length - 1}
                >
                  Next
                </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    ) : (
      <div className="py-3 flex items-center justify-center ">
      <div className="container mx-auto max-w-full sm:px-6 sm:py-3  md:px-20 px-40  bg-white rounded-lg">
        {/* Modal Header */}
        <div className="">
          <div className="mb-8">
            <h2 onClick={onClose} className="text-2xl font-semibold cursor-pointer">{isEditMode ? 'Edit Interview Template' : 'Interview Template' }</h2>
          </div>
          
          {/* Progress Steps */}
          {renderStageIndicator()}
        </div>

        {showAssessment ? (
          <div className="flex-grow">
            {renderInterviewComponent()}
          </div>
        ) : (
          <>
            {/* Modal Body */}
            <div className="">
              <div className="space-y-6 sm:px-6 sm:py-2 md:px-8 md:py-3 px-8 py-3 rounded-lg border">
                
                <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 sm:grid-cols-1 sm:gap-2 md:gap-3 gap-4">
                  <div className="flex flex-col flex-grow">
                    <label className="text-sm whitespace-nowrap mb-2">Template Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="templateTitle"
                      placeholder="e.g., Senior Front end Developer"
                      value={templateTitle}
                      onChange={handleTitleChange}
                      className="w-full border rounded px-2 py-1.5 border-gray-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <label className="text-sm whitespace-nowrap mb-2">Label <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="label"
                      placeholder="e.g., Senior_Front_End_Developer"
                      value={label}
                      readOnly
                      className="w-full border rounded px-2 py-1.5 border-gray-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col  flex-grow sm:mt-2">
                  <div className="flex mb-2">
                    <label className="text-sm whitespace-nowrap">Description</label>
                  </div>
                  <textarea
                    name="description"
                    placeholder="Describe the purpose and structure of this interview template. (Minimum 20 characters required)"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="4"
                    minLength={20}
                    maxLength={3000}
                    className={`w-full h-60 border rounded px-2 py-2 focus:outline-none ${
                      description.length < 20 ? 'border-gray-300' : 'focus:border-teal-500'
                    }`}
                  />
                  {/* {description.length < 20 && description.length > 0 && (
                    <p className="text-red-500 text-sm mt-1">Minimum 20 characters required ({20 - description.length} more needed)</p>
                  )} */}
                  <div className="flex justify-end items-center">
                  <span className="text-sm text-gray-500">{description.length}/300</span>
                  </div>
                </div>
                
              </div>

              {/* Modal Footer */}
              <div className="bg-white pt-4">
                <div className="flex sm:flex-col gap-2 md:flex-row justify-end ">
                  <button
                    onClick={onClose}
                    className="w-auto px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {isEditMode ? (
                    <>
                    <button
                      onClick={handleSave}
                      disabled={!isModalValid}
                      className={`w-auto px-6 py-2 rounded text-sm ${
                        isModalValid 
                          ? 'bg-teal-600 text-white hover:bg-teal-700' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                    <button
                    onClick={() => handleNextRoundClick(currentRoundIndex + 1)}
                    disabled={!isModalValid}
                    className={`w-auto px-6 py-2 rounded text-sm ${
                      isModalValid 
                        ? 'bg-teal-600 text-white hover:bg-teal-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                  </>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={!isModalValid}
                        className={`w-auto px-6 py-2 border border-gray-300 rounded text-sm ${
                          isModalValid 
                            ? 'text-gray-600 hover:bg-gray-100' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Save
                      </button>
                      {rounds.length > 0 ? (
                        <button
                          onClick={() => handleNextRoundClick(currentRoundIndex + 1)}
                          disabled={!isModalValid}
                          className={`w-auto px-6 py-2 rounded text-sm ${
                            isModalValid 
                              ? 'bg-teal-600 text-white hover:bg-teal-700' 
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveAndAddRound}
                          disabled={!isModalValid}
                          className={`w-auto px-6 py-2 rounded text-sm ${
                            isModalValid 
                              ? 'bg-teal-600 text-white hover:bg-teal-700' 
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Save & Add Round
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Round Modal */}
        {isRoundModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg sm:w-[300px] md:w-[400px] w-[500px] border-2">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-lg font-semibold">Add Round {insertIndex + 1}</h2>
                <button 
                  onClick={() => {
                    setIsRoundModalOpen(false);
                    setInsertIndex(-1);
                  }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter round title"
                    value={roundFormData.roundName}
                    onChange={(e) => setRoundFormData(prev => ({ ...prev, roundName: e.target.value }))}
                    className="w-full border rounded px-2 py-1.5 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type
                  </label>
                  <select
                    value={roundFormData.interviewType}
                    onChange={(e) => setRoundFormData(prev => ({ ...prev, interviewType: e.target.value }))}
                    className="w-full px-2 py-1.5 border rounded focus:outline-none"
                  >
                    <option value="" hidden>Select Type</option>
                    <option value="Technical">Technical</option>
                    <option value="Assessment">Assessment</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4">
                <button
                  onClick={() => {
                    setIsRoundModalOpen(false);
                    setInsertIndex(-1);
                  }}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (roundFormData.roundName && roundFormData.interviewType) {
                      handleRoundNext(roundFormData.interviewType, {
                        ...roundFormData,
                        roundName: roundFormData.roundName.replace(/Round \d+/, `Round ${insertIndex + 1}`)
                      });
                    }
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                  disabled={!roundFormData.roundName || !roundFormData.interviewType}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border p-6 w-[400px]">
              <h3 className="text-lg font-semibold">Delete Round {deleteConfirmation.roundIndex + 1}?</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this round? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, roundIndex: -1 })}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    confirmDelete();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    )}
    </>
  );
};

export default TemplateModal;